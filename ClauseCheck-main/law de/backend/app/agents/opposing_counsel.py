import google.generativeai as genai
import os
from typing import List, Dict, Optional
import logging
from dotenv import load_dotenv

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

class OpposingCounselAgent:
    def __init__(self):
        self.gemini_model = None
        self.openrouter_client: Optional["OpenAI"] = None
        self.openrouter_model: Optional[str] = None

        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("Opposing Counsel: Gemini (gemini-2.5-flash) available")
        else:
            logger.warning("GEMINI_API_KEY not set; opposing counsel will use OpenRouter only")

        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            from openai import OpenAI
            if openai_key.startswith("sk-or-"):
                self.openrouter_client = OpenAI(api_key=openai_key, base_url="https://openrouter.ai/api/v1")
                self.openrouter_model = os.getenv("OPPONENT_MODEL_NAME") or "openai/gpt-4o-mini"
                logger.info("Opposing Counsel: OpenRouter fallback (%s) available", self.openrouter_model)
            else:
                self.openrouter_client = OpenAI(api_key=openai_key)
                self.openrouter_model = os.getenv("OPPONENT_MODEL_NAME") or "gpt-4o-mini"
                logger.info("Opposing Counsel: OpenAI fallback (%s) available", self.openrouter_model)

        self.use_ollama = os.getenv("USE_OLLAMA", "true").lower() == "true" and _get_ollama() is not None
        if self.use_ollama:
            logger.info("Opposing Counsel: Ollama enabled (llama3.1:8b)")
        
    def _format_instructions(self) -> str:
        return """
RESPONSE FORMAT (MANDATORY – judges expect structured legal submissions):
1. Open with "Your Honor," or "May it please the Court,"
2. Use clear labels and structure:
   - "Under Section X of the [IPC/CrPC/Evidence Act/Constitution Art. Y]: ..." when citing law
   - "In [Case Name], (Year) [Citation], it was held that ..." when citing precedent
   - "I submit that ..." or "The prosecution/defence submits that ..." for main arguments
   - Use bullet points (- or •) when making 2+ distinct submissions
3. Follow IRAC where helpful: Issue → Rule (section/case) → Application → Conclusion
4. End with a brief conclusion: "In light of the above, ..." or "Therefore, the defence/prosecution submits that ..."
5. Keep Indian legal context: cite IPC, CrPC, Evidence Act, Constitution, and Indian Supreme Court/High Court precedents where relevant.
6. Be adversarial but respectful. Challenge the other side's logic, evidence, or interpretation of law—do not give plain generic text.
"""

    def get_system_prompt(self, case_details: Dict) -> str:
        return f"""You are an experienced opposing counsel in a courtroom simulation. You must argue like a real advocate: structured, precise, and citation-heavy.

Case Details:
- Type: {case_details.get('case_type')}
- Facts: {case_details.get('facts')}
- Charges: {case_details.get('charges')}
- Evidence: {case_details.get('evidence', 'None provided')}

Your role:
- Argue AGAINST the lawyer. Challenge their arguments on law and facts.
- Cite specific sections (e.g., Section 420 IPC, Article 21, Section 65B Evidence Act) and case law (e.g., Kesavananda Bharati, Vishaka) where relevant.
- Use structured submissions: headings, bullets, "Under Section X", "In [Case]", "I submit that".
- Be realistic, legally sound, and professional. Judges expect proper legal format—no plain paragraphs.
- Keep each reply focused but complete: typically 4–8 lines with clear structure.

{self._format_instructions()}
"""

    async def respond(self, case_details: Dict, conversation_history: List[Dict], lawyer_message: str) -> str:
        """Generate opposing counsel response"""
        
        # Build conversation context
        context = self.get_system_prompt(case_details)
        context += "\n\nConversation so far:\n"
        
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            role = "Lawyer" if msg['role'] == 'lawyer' else "You (Opposing Counsel)"
            context += f"{role}: {msg['content']}\n"
        
        context += f"Lawyer: {lawyer_message}\n\nYou (Opposing Counsel): Reply as opposing counsel. Use the structured legal format: 'Your Honor,'; 'Under Section X...'; 'In [Case]...'; 'I submit that...'; bullets for multiple submissions. Cite IPC/CrPC/Evidence Act/Constitution and Indian precedents where relevant. No plain paragraphs.\n\n"
        
        ollama_mod = _get_ollama()
        if self.use_ollama and ollama_mod:
            try:
                logger.info("Attempting Ollama generation for opposing counsel...")
                ollama_response = ollama_mod.generate(model="llama3.1:8b", prompt=context)
                result = ollama_response.get('response') or ollama_response.get('output')
                if result:
                    logger.info("Ollama response generated successfully")
                    return result.strip()
            except Exception as ollama_err:
                logger.warning("Ollama generation failed (%s); trying next backend", str(ollama_err))

        # Try Gemini first (if available)
        if self.gemini_model:
            try:
                logger.info("Generating opposing counsel response via Gemini...")
                response = self.gemini_model.generate_content(context)
                logger.info("Gemini response generated successfully")
                return response.text.strip()
            except Exception as e:
                err_msg = str(e)
                is_429 = "429" in err_msg or "quota" in err_msg.lower() or "ResourceExhausted" in type(e).__name__
                if is_429:
                    logger.warning("Gemini quota exceeded (429); falling back to OpenRouter")
                else:
                    logger.warning("Gemini error (%s); falling back to OpenRouter", err_msg)

        # Fallback to OpenRouter / OpenAI
        if self.openrouter_client and self.openrouter_model:
            try:
                logger.info("Generating opposing counsel response via OpenRouter...")
                sys_prompt = self.get_system_prompt(case_details)
                user_content = "Conversation so far:\n"
                for msg in conversation_history[-5:]:
                    role = "Lawyer" if msg['role'] == 'lawyer' else "You (Opposing Counsel)"
                    user_content += f"{role}: {msg['content']}\n"
                user_content += f"Lawyer: {lawyer_message}\n\nYou (Opposing Counsel): Reply as opposing counsel using the structured legal format. Use 'Your Honor,'; 'Under Section X [IPC/CrPC/Evidence Act/Constitution]...'; 'In [Case Name] (Year)...'; 'I submit that...'; bullets (-) for multiple submissions. Cite Indian law and precedents where relevant. No plain paragraphs—judges expect proper legal structure."
                completion = self.openrouter_client.chat.completions.create(
                    model=self.openrouter_model,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_content},
                    ],
                )
                out = (completion.choices[0].message.content or "").strip()
                logger.info("OpenRouter opposing counsel response generated successfully")
                return out
            except Exception as e:
                logger.error("OpenRouter fallback failed: %s", str(e))
                raise

        raise RuntimeError(
            "No opposing counsel backend available. Set GEMINI_API_KEY and/or OPENAI_API_KEY (OpenRouter sk-or-...)."
        )
