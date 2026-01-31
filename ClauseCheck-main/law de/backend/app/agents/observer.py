import os
from typing import List, Dict
import logging
from dotenv import load_dotenv

from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

_ollama = None
def _get_ollama():
    global _ollama
    if _ollama is None:
        try:
            import ollama as o
            _ollama = o
        except ImportError:
            _ollama = False
    return _ollama if _ollama is not False else None


class ObserverAgent:
    def __init__(self):
        """Mentor/observer agent powered by OpenAI (or OpenRouter via OpenAI client).

        Uses:
        - OPENAI_API_KEY from environment
        - Optional MENTOR_MODEL_NAME to override default model
        """
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        # Support both direct OpenAI and OpenRouter keys (sk-or-...)
        if api_key.startswith("sk-or-"):
            self.client = OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
            self.model = os.getenv("MENTOR_MODEL_NAME") or "openai/gpt-4o-mini"
            logger.info("Observer Agent initialized with OpenRouter (%s)", self.model)
        else:
            self.client = OpenAI(api_key=api_key)
            self.model = os.getenv("MENTOR_MODEL_NAME") or "gpt-4o-mini"
            logger.info("Observer Agent initialized with OpenAI (%s)", self.model)
        self.use_ollama = os.getenv("USE_OLLAMA", "false").lower() == "true" and _get_ollama() is not None
        logger.info("Observer Agent USE_OLLAMA=%s", self.use_ollama)

    def get_system_prompt(self, case_details: Dict) -> str:
        return f"""You are a legal mentor and assistant monitoring a courtroom simulation.

Case Details:
- Type: {case_details.get('case_type')}
- Facts: {case_details.get('facts')}
- Charges: {case_details.get('charges')}
- Evidence: {case_details.get('evidence', 'None provided')}

Your role:
- Monitor the conversation between the lawyer and opposing counsel.
- "Help me understand": Explain what opposing counsel said, which sections/citations they used, and how to rebut. Give a READY_RESPONSE that is a structured legal submission (Your Honor,; Under Section X...; In [Case]...; I submit that...; bullets). Judges expect proper format—no plain paragraphs.
- Custom queries: Answer specific legal questions with sections and case law (e.g., hit-and-run: Section 304A IPC; relevant precedents).
- Be helpful, clear, and educational. Always cite IPC/CrPC/Evidence Act/Constitution and Indian precedents where relevant.

You are a supportive mentor, not a judge.
"""

    async def provide_help(
        self,
        case_details: Dict,
        conversation_history: List[Dict],
        help_type: str,
        custom_query: str = None,
    ) -> str:
        """Provide assistance to the lawyer using OpenAI or Ollama (LLaVA)"""

        # Build recent conversation context (last 10 messages)
        conversation_text_lines: List[str] = []
        for msg in conversation_history[-10:]:
            role_map = {"lawyer": "Lawyer", "opponent": "Opposing Counsel"}
            conversation_text_lines.append(
                f"{role_map.get(msg['role'], msg['role'])}: {msg['content']}"
            )
        conversation_text = "\n".join(conversation_text_lines)

        # Add help request instruction
        if help_type == "understand":
            user_instruction = (
                "The lawyer needs help understanding what the opposing counsel just said. "
                "Provide TWO things:\n"
                "1. EXPLANATION: What the opposing counsel said and how to respond effectively (sections/citations they raised, weaknesses to attack).\n"
                "2. READY_RESPONSE: A ready-to-paste courtroom reply the lawyer can send. It MUST be structured like a real legal submission:\n"
                "   - Start with 'Your Honor,' or 'May it please the Court,'\n"
                "   - Use 'Under Section X [IPC/CrPC/Evidence Act/Constitution]...', 'In [Case Name]...', 'I submit that...'\n"
                "   - Use bullet points (-) for multiple submissions. Cite Indian law and precedents where relevant.\n"
                "   - No plain paragraphs—judges expect proper legal structure.\n\n"
                "Format your response EXACTLY as:\n"
                "EXPLANATION: [your explanation here]\n"
                "READY_RESPONSE: [structured legal reply with sections, citations, bullets]"
            )
        else:
            user_instruction = f"The lawyer asks: {custom_query}"

        user_content = (
            "Conversation so far:\n" + conversation_text + "\n\n" + user_instruction
        )

        ollama_mod = _get_ollama()
        if self.use_ollama and ollama_mod:
            try:
                logger.info("Attempting Ollama generation for observer help...")
                ollama_response = ollama_mod.generate(model="llava:7b", prompt=user_content)
                result = ollama_response.get('response') or ollama_response.get('output')
                if result:
                    logger.info("Ollama help response generated successfully")
                    # If it's "understand" type, ensure structured format
                    if help_type == "understand" and "EXPLANATION:" not in result:
                        # Fallback: format the response properly
                        return f"EXPLANATION: {result.strip()}\nREADY_RESPONSE: I acknowledge your point, Your Honor. Let me address the substance of the case directly."
                    return result.strip()
            except Exception as ollama_err:
                logger.warning("Ollama generation failed (%s); falling back to OpenAI", str(ollama_err))
        # Fallback to OpenAI
        try:
            logger.info(f"Generating help response for type: {help_type} using OpenAI")
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.get_system_prompt(case_details)},
                    {"role": "user", "content": user_content},
                ],
            )
            logger.info("Help response generated successfully")
            return (completion.choices[0].message.content or "").strip()
        except Exception as e:
            logger.error(f"Error providing help: {str(e)}")
            # Graceful fallback when OpenAI also fails
            last_opp = next((m for m in reversed(conversation_history) if m.get('role') == 'opponent'), None)
            if help_type == "understand":
                base = "Mentor temporarily unavailable. Here's a quick assist based on context:\n"
                if last_opp:
                    base += f"- Opposing counsel's last point: \"{last_opp.get('content','')}\"\n"
                base += "- Suggested approach: Identify claims, concede uncontested facts, cite relevant sections, and attack weak causation or intent.\n- Keep it concise and structured (Issue → Rule → Application → Conclusion)."
                return base
            else:
                q = custom_query or "your question"
                return f"Mentor temporarily unavailable to query AI. For now, cross-check statutes (Bare Acts) and recent case law regarding: {q}."
