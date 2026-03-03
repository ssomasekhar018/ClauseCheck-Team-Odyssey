import google.generativeai as genai
import os
from typing import List, Dict, Tuple, Optional
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class AnalyzerAgent:
    def __init__(self):
        self.gemini_model = None
        self.openrouter_client: Optional["OpenAI"] = None
        self.openrouter_model: Optional[str] = None

        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("Analyzer: Gemini (gemini-2.5-flash) available")
        else:
            logger.warning("GEMINI_API_KEY not set; analyzer will use OpenRouter only")

        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            from openai import OpenAI
            if openai_key.startswith("sk-or-"):
                self.openrouter_client = OpenAI(api_key=openai_key, base_url="https://openrouter.ai/api/v1")
                self.openrouter_model = os.getenv("ANALYZER_MODEL_NAME") or "openai/gpt-4o-mini"
                logger.info("Analyzer: OpenRouter fallback (%s) available", self.openrouter_model)
            else:
                self.openrouter_client = OpenAI(api_key=openai_key)
                self.openrouter_model = os.getenv("ANALYZER_MODEL_NAME") or "gpt-4o-mini"
                logger.info("Analyzer: OpenAI fallback (%s) available", self.openrouter_model)
        
    async def analyze_case(
        self, 
        case_details: Dict, 
        conversation_history: List[Dict]
    ) -> Tuple[float, List[str]]:
        """Analyze the case and return win probability and cons"""
        
        try:
            logger.info("Starting case analysis...")
            # Build analysis prompt
            conversation_text = "\n".join([
                f"{msg['role'].title()}: {msg['content']}" 
                for msg in conversation_history
            ])
            
            prompt = f"""You are an expert legal analyst providing objective case assessments for JUDGES. Your analysis will be displayed to judges evaluating the lawyer's performance. Be professional, specific, and actionable.

Analyze this courtroom simulation.

Case Details:
- Type: {case_details.get('case_type')}
- Facts: {case_details.get('facts')}
- Charges: {case_details.get('charges')}
- Evidence: {case_details.get('evidence', 'None provided')}

Conversation:
{conversation_text}

Evaluate the lawyer's performance on:
1. Use of legal sections (IPC, CrPC, Evidence Act, Constitution) - did they cite specific sections?
2. Citation of case law and precedents - did they reference relevant judgments?
3. Argument structure - did they use "Your Honor,", "Under Section X", "I submit that", bullets?
4. Quality of rebuttals - did they effectively counter opposing counsel's points?
5. Case strength - how strong is the case based on facts, evidence, and charges?

Provide:
1. Win probability (0-100%) based on the lawyer's performance and case strength. 
   - If lawyer used sections, citations, structured arguments: 60-85%
   - If lawyer used some structure but weak arguments: 40-60%
   - If lawyer gave plain text, no sections/citations: 20-40%
   - IMPORTANT: Analyze the conversation quality and provide a realistic, varied probability. DO NOT default to 50% or 60%.

2. Areas to Focus (3-5 points) - MUST be specific and actionable:
   - ALWAYS include at least ONE specific section (e.g., "Section 420 IPC - focus on proving dishonest intention element")
   - ALWAYS include at least ONE turning point (e.g., "Turning point: When opposing counsel challenged the evidence - strengthen rebuttal using Section 65B Evidence Act")
   - Include specific case law if relevant (e.g., "Cite State of Maharashtra v. Indian Hotel (2013) - applies because...")
   - Be specific about what the lawyer should do, not generic advice

CRITICAL: Do NOT give generic responses like "Opposition raised challenges" or "Need to cite sections". 
Instead, give SPECIFIC sections, SPECIFIC turning points, and SPECIFIC actions.

Format your response EXACTLY as:
WIN_PROBABILITY: [number between 0-100, no % sign]
AREAS_TO_FOCUS:
- Section [X] [IPC/CrPC/Evidence Act/Constitution Art. Y] - [specific reason why this section matters for this case]
- Turning point: [specific moment in conversation/argument] - [what to do: cite Section X, reference Case Y, emphasize Z]
- [Case law: "In [Case Name] v. [Party] (Year), it was held that..."] - [how it applies to this case]
- [Legal strategy: specific actionable step, e.g., "Emphasize Section 300 IPC Exception 4 for sudden provocation defense"]
...

Example of GOOD format:
WIN_PROBABILITY: 45
AREAS_TO_FOCUS:
- Section 300 IPC Exception 4 - Focus on proving "sudden provocation" element to reduce murder to culpable homicide
- Turning point: When opposing counsel questioned the evidence chain - Rebut using Section 65B Evidence Act for electronic evidence admissibility
- In State of Punjab v. Jagir Singh (1973), the court held that... - Apply this precedent to establish...
- Emphasize the mens rea element under Section 420 IPC - Show lack of dishonest intention at the time of transaction

Example of BAD format (DO NOT USE):
- Opposition raised challenges
- Need to cite sections
- Improve arguments
"""

            # Try Gemini first
            result = None
            if self.gemini_model:
                try:
                    logger.info("Generating analysis via Gemini...")
                    response = self.gemini_model.generate_content(prompt)
                    result = response.text.strip()
                    logger.info("Gemini analysis generated successfully")
                except Exception as e:
                    err_msg = str(e)
                    is_429 = "429" in err_msg or "quota" in err_msg.lower() or "ResourceExhausted" in type(e).__name__
                    if is_429:
                        logger.warning("Gemini quota exceeded (429); falling back to OpenRouter")
                    else:
                        logger.warning("Gemini error (%s); falling back to OpenRouter", err_msg)
            
            # Fallback to OpenRouter
            if not result and self.openrouter_client and self.openrouter_model:
                try:
                    logger.info("Generating analysis via OpenRouter...")
                    completion = self.openrouter_client.chat.completions.create(
                        model=self.openrouter_model,
                        messages=[
                            {"role": "system", "content": "You are an expert legal analyst providing objective case assessments. Always respond in the exact format specified."},
                            {"role": "user", "content": prompt},
                        ],
                    )
                    result = (completion.choices[0].message.content or "").strip()
                    logger.info("OpenRouter analysis generated successfully")
                except Exception as e:
                    logger.error("OpenRouter fallback failed: %s", str(e))
                    result = None
            
            if not result:
                raise RuntimeError("No analyzer backend available. Set GEMINI_API_KEY and/or OPENAI_API_KEY (OpenRouter sk-or-...).")
            
            # Parse response
            logger.info("Analysis complete, parsing results...")
            
            # Extract win probability
            win_prob = None
            if "WIN_PROBABILITY:" in result:
                try:
                    prob_str = result.split("WIN_PROBABILITY:")[1].split("\n")[0].strip()
                    win_prob = float(prob_str.replace("%", "").strip())
                    # Clamp to valid range
                    win_prob = max(0.0, min(100.0, win_prob))
                    logger.info(f"Parsed win probability: {win_prob}%")
                except Exception as e:
                    logger.error(f"Error parsing win probability: {str(e)}")
                    win_prob = None
            
            # If parsing failed, try to extract from text
            if win_prob is None:
                import re
                prob_match = re.search(r'(\d+(?:\.\d+)?)\s*%', result)
                if prob_match:
                    try:
                        win_prob = float(prob_match.group(1))
                        win_prob = max(0.0, min(100.0, win_prob))
                        logger.info(f"Extracted win probability from text: {win_prob}%")
                    except:
                        pass
            
            # Final fallback: analyze conversation quality heuristically
            if win_prob is None:
                logger.warning("Could not parse win probability, using heuristic")
                # Count structured elements in lawyer messages
                lawyer_msgs = [m for m in conversation_history if m.get('role') == 'lawyer']
                has_sections = any('section' in m.get('content', '').lower() or 's.' in m.get('content', '').lower() or 'article' in m.get('content', '').lower() for m in lawyer_msgs)
                has_citations = any('case' in m.get('content', '').lower() or 'held' in m.get('content', '').lower() or 'v.' in m.get('content', '').lower() for m in lawyer_msgs)
                has_structure = any('your honor' in m.get('content', '').lower() or 'i submit' in m.get('content', '').lower() or 'under section' in m.get('content', '').lower() for m in lawyer_msgs)
                
                if has_sections and has_citations and has_structure:
                    win_prob = 70.0
                elif has_sections or has_citations:
                    win_prob = 50.0
                else:
                    win_prob = 35.0
                logger.info(f"Heuristic win probability: {win_prob}%")
            
            # Extract areas to focus
            focus_areas = []
            if "AREAS_TO_FOCUS:" in result:
                focus_section = result.split("AREAS_TO_FOCUS:")[1].strip()
                focus_areas = [
                    line.strip().lstrip("-").lstrip("•").strip() 
                    for line in focus_section.split("\n") 
                    if line.strip() and (line.strip().startswith("-") or line.strip().startswith("•"))
                ]
            elif "CONS:" in result:  # Fallback for old format
                cons_section = result.split("CONS:")[1].strip()
                focus_areas = [
                    line.strip().lstrip("-").strip() 
                    for line in cons_section.split("\n") 
                    if line.strip() and line.strip().startswith("-")
                ]
            
            # Validate and enhance focus areas - ensure they're specific
            if focus_areas:
                enhanced_areas = []
                has_section = False
                has_turning_point = False
                
                for area in focus_areas:
                    area_lower = area.lower()
                    # Check if it mentions a specific section
                    if any(keyword in area_lower for keyword in ['section', 's.', 'article', 'art.', 'ipc', 'crpc', 'evidence act']):
                        has_section = True
                    # Check if it mentions turning point
                    if 'turning point' in area_lower or 'moment' in area_lower or 'when opposing' in area_lower:
                        has_turning_point = True
                    enhanced_areas.append(area)
                
                # If missing sections, add one based on case
                if not has_section:
                    charges = case_details.get('charges', '').lower()
                    if 'fraud' in charges or 'cheating' in charges:
                        enhanced_areas.insert(0, f"Section 420 IPC - Focus on proving dishonest intention and deception. Essential ingredients: (1) dishonest/fraudulent intention, (2) inducement to deliver property, (3) delivery of property.")
                    elif 'murder' in charges:
                        enhanced_areas.insert(0, f"Section 300/302 IPC - Analyze which exception applies. Distinguish between murder (302) and culpable homicide not amounting to murder (304).")
                    elif 'assault' in charges:
                        enhanced_areas.insert(0, f"Section 323/325 IPC - Distinguish simple hurt (323) from grievous hurt (325). Section 320 IPC defines grievous hurt.")
                    else:
                        enhanced_areas.insert(0, f"Section [Identify relevant IPC/CrPC section] - Build arguments around the specific section applicable to the charges. Cite essential ingredients.")
                
                # If missing turning point, add one
                if not has_turning_point:
                    opp_msgs = [m for m in conversation_history if m.get('role') == 'opponent']
                    if opp_msgs:
                        last_opp_content = opp_msgs[-1].get('content', '')[:80]
                        enhanced_areas.append(f"Turning point: Opposing counsel's challenge - '{last_opp_content}...' - Strengthen rebuttal with specific sections (e.g., Section 65B Evidence Act for evidence challenges) and case law.")
                    else:
                        enhanced_areas.append(f"Turning point: Opening arguments - Establish strong foundation from the start with Section citations and precedent. Use structured format: 'Your Honor, Under Section X...'")
                
                focus_areas = enhanced_areas
            
            logger.info(f"Analysis result: {win_prob}% win probability, {len(focus_areas)} focus areas")
            return win_prob, focus_areas
        except Exception as e:
            logger.error(f"Error analyzing case: {str(e)}")
            # Fallback heuristic to keep app usable without external API
            focus_areas: List[str] = []
            facts = (case_details or {}).get('facts', '')
            charges = (case_details or {}).get('charges', '')
            if not conversation_history:
                focus_areas.append("No argumentation yet. Start with: Section 299 IPC (or relevant section) - Establish essential ingredients. Use 'Your Honor,' and structured format.")
            if len(facts) < 50:
                focus_areas.append("Facts brief. Turning point: Opening statement - Cite Section 65B Evidence Act for documentary evidence. Strengthen factual foundation with specific dates, witnesses, documents.")
            if not charges:
                charges_lower = charges.lower() if charges else ""
                if 'fraud' in charges_lower:
                    focus_areas.append("Charges: Fraud case. Section 420 IPC - Focus on proving: (1) dishonest intention, (2) deception, (3) delivery of property. Cite State of Gujarat v. Jaswantlal (2018).")
                elif 'murder' in charges_lower:
                    focus_areas.append("Charges: Murder case. Section 300/302 IPC - Analyze exceptions (Exception 1-5). Turning point: Establish whether it's murder (302) or culpable homicide (304).")
                else:
                    focus_areas.append("Charges unclear. Identify specific IPC section (e.g., Section 420 for fraud, Section 302 for murder) - Build arguments around that section's essential ingredients.")
            if not focus_areas:
                # Generate specific focus areas based on case details
                charges = (case_details or {}).get('charges', '').lower()
                case_type = (case_details or {}).get('case_type', '').lower()
                
                focus_areas = []
                
                # Add specific sections based on case type/charges
                if 'fraud' in charges or 'cheating' in charges:
                    focus_areas.append("Section 420 IPC - Focus on proving dishonest intention and deception elements. Establish mens rea at the time of transaction.")
                elif 'murder' in charges or 'homicide' in charges:
                    focus_areas.append("Section 300 IPC - Analyze which exception applies (e.g., Exception 4 for sudden provocation). Section 302 vs 304 IPC distinction.")
                elif 'assault' in charges or 'hurt' in charges:
                    focus_areas.append("Section 323/325 IPC - Distinguish between simple hurt and grievous hurt. Section 320 IPC defines grievous hurt.")
                else:
                    focus_areas.append("Section 299 IPC (Criminal Law) - Identify the specific IPC section applicable to the charges and build arguments around its essential ingredients.")
                
                # Add turning point based on conversation
                if conversation_history:
                    opp_msgs = [m for m in conversation_history if m.get('role') == 'opponent']
                    if opp_msgs:
                        last_opp = opp_msgs[-1].get('content', '')[:100]
                        focus_areas.append(f"Turning point: Opposing counsel's last challenge - Strengthen rebuttal with specific sections and case law. Address: '{last_opp[:50]}...'")
                    else:
                        focus_areas.append("Turning point: Initial arguments - Establish strong foundation with Section citations and precedent from the start.")
                else:
                    focus_areas.append("Turning point: Opening arguments - Begin with structured submissions citing relevant IPC/CrPC sections and landmark cases.")
                
                # Add evidence-related section if applicable
                if 'evidence' in (case_details or {}).get('evidence', '').lower() or 'document' in (case_details or {}).get('evidence', '').lower():
                    focus_areas.append("Section 65B Evidence Act - For electronic/digital evidence, ensure compliance with Section 65B admissibility requirements.")
                
                # Add case law suggestion
                focus_areas.append("Case law: Reference relevant Supreme Court/High Court precedents (e.g., Kesavananda Bharati for constitutional issues, State v. X for criminal procedure) - Cite specific case names and how they apply.")
            # Heuristic win probability based on conversation quality
            lawyer_msgs = [m for m in conversation_history if m.get('role') == 'lawyer']
            has_sections = any('section' in m.get('content', '').lower() or 's.' in m.get('content', '').lower() or 'article' in m.get('content', '').lower() for m in lawyer_msgs)
            has_citations = any('case' in m.get('content', '').lower() or 'held' in m.get('content', '').lower() or 'v.' in m.get('content', '').lower() for m in lawyer_msgs)
            has_structure = any('your honor' in m.get('content', '').lower() or 'i submit' in m.get('content', '').lower() or 'under section' in m.get('content', '').lower() for m in lawyer_msgs)
            
            if has_sections and has_citations and has_structure:
                win_prob = 70.0
            elif has_sections or has_citations:
                win_prob = 50.0
            else:
                win_prob = 35.0
            return win_prob, focus_areas
