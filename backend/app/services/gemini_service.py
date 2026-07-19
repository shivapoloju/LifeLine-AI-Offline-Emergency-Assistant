import os
import json

class GeminiAIService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")

    def analyze_symptoms(self, symptoms_text: str, language: str = "EN"):
        """
        Uses Gemini API when available, otherwise falls back to smart structured generator in target language
        """
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"""
                You are LifeLine AI, an emergency response medical triage assistant.
                Patient reported symptoms: "{symptoms_text}"
                Target Language: {language} (EN, HI, TE)

                CRITICAL INSTRUCTION: All text fields ("title", "summary", "first_aid_steps", "medicines_to_avoid", "urgency_note") MUST be written strictly in the requested language ({language}):
                - If language is TE, write ONLY in Telugu script.
                - If language is HI, write ONLY in Hindi Devanagari script.
                - If language is EN, write in English.

                Respond strictly with JSON in this format:
                {{
                  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
                  "title": "Short diagnosis summary in {language}",
                  "summary": "Clear emergency assessment in {language}",
                  "first_aid_steps": ["step 1 in {language}", "step 2 in {language}"],
                  "medicines_to_avoid": ["med 1 to avoid in {language}"],
                  "urgency_note": "Emergency action note in {language}"
                }}
                """
                response = model.generate_content(prompt)
                clean_text = response.text.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_text)
            except Exception as e:
                print(f"Gemini API execution error: {e}")

        # Smart fallback generator in target language (EN, HI, TE) when GEMINI_API_KEY is not set
        lower = symptoms_text.lower()
        is_critical = any(w in lower for w in ["chest", "heart", "breath", "unconscious", "snake", "bleed", "stroke", "నొప్పి", "ఛాతీ", "పాము", "కాటు", "दर्द", "सांप", "सीने"])
        severity = "CRITICAL" if is_critical else "HIGH" if len(symptoms_text) > 15 else "MEDIUM"

        if language == "TE":
            if "పాము" in lower or "కాటు" in lower or "snake" in lower or "bite" in lower:
                return {
                    "severity": "CRITICAL",
                    "title": "పాము కాటు అత్యవసర పరిస్రీతి (ASV అవసరం)",
                    "summary": "పాము కాటు లక్షణాలు నమోదు చేయబడ్డాయి.",
                    "first_aid_steps": [
                        "బాధితుడిని ప్రశాంతంగా, కదలకుండా ఉంచండి. విషం వేగంగా వ్యాపించదు.",
                        "కాటు వేసిన అవయవాన్ని గుండె స్థాయి కంటే కింద ఉంచండి.",
                        "ఉంగరాలు, ఆభరణాలను వెంటనే తొలగించండి.",
                        "యాంటీ-స్నేక్ వెనమ్ (ASV) ఉన్న సమీప ఆసుపత్రికి వెంటనే తరలించండి."
                    ],
                    "medicines_to_avoid": [
                        "గాయం వద్ద కోయవద్దు, విషం నోటితో పీల్చవద్దు.",
                        "కట్టు బిగించి కట్టవద్దు, మంచు లేదా ఆల్కహాల్ వాడవద్దు."
                    ],
                    "urgency_note": "వెంటనే అత్యవసర వైద్య సహాయం అవసరం!"
                }
            elif "ఛాతీ" in lower or "నొప్పి" in lower or "గుండె" in lower or "chest" in lower or "heart" in lower:
                return {
                    "severity": "CRITICAL",
                    "title": "గుండెపోటు అనుమానం / తీవ్రమైన ఛాతీ నొప్పి",
                    "summary": "ఛాతీ నొప్పి మరియు శ్వాస ఇబ్బంది లక్షణాలు.",
                    "first_aid_steps": [
                        "వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి.",
                        "వ్యక్తిని కూర్చోబెట్టి, బట్టలు వదులు చేయండి.",
                        "శ్వాస నిలిచిపోతే వెంటనే CPR ప్రారంభించండి.",
                        "రోగిని ఒంటరిగా వదిలేయవద్దు."
                    ],
                    "medicines_to_avoid": [
                        "స్పృహలేని వ్యక్తికి ఆహారం లేదా నీరు ఇవ్వవద్దు.",
                        "డాక్టర్ సలహా లేకుండా ఇతర మందులు వేసుకోవద్దు."
                    ],
                    "urgency_note": "వెంటనే 108 అంబులెన్స్ సేవలు అవసరం!"
                }
            else:
                return {
                    "severity": severity,
                    "title": f"వైద్య అంచనా: {symptoms_text[:25]}...",
                    "summary": "తెలుగులో అత్యవసర పరిస్థితి అంచనా పూర్తయింది.",
                    "first_aid_steps": [
                        "రోగిని ప్రశాంతంగా, వెచ్చగా ఉంచండి.",
                        "శ్వాస మరియు స్పృహను పరిశీలించండి.",
                        "వెంటనే 108 ఎమర్జెన్సీ నంబర్‌కు కాల్ చేయండి.",
                        "డాక్టర్ సలహా లేకుండా మందులు ఇవ్వవద్దు."
                    ],
                    "medicines_to_avoid": [
                        "డెంగ్యూ అనుమానం ఉంటే ఆస్పిరిన్ (Aspirin) ఇవ్వకూడదు.",
                        "స్పృహ లేనప్పుడు ద్రవాలు ఇవ్వవద్దు."
                    ],
                    "urgency_note": "వైద్యుడిని వెంటనే సంప్రదించండి."
                }
        elif language == "HI":
            if "सांप" in lower or "काटा" in lower or "snake" in lower or "bite" in lower:
                return {
                    "severity": "CRITICAL",
                    "title": "सांप काटने की आपात स्थिति (एंटी-वेनम आवश्यक)",
                    "summary": "सांप काटने के लक्षण दर्ज किए गए।",
                    "first_aid_steps": [
                        "मरीज को पूरी तरह शांत रखें। अंग को बिल्कुल न हिलाएं।",
                        "अंग को दिल के स्तर से नीचे स्थिर रखें।",
                        "सूजन आने से पहले अंगूठी और घड़ियां निकाल दें।",
                        "तुरंत ASV (एंटी-स्नेक वेनम) वाले अस्पताल ले जाएं।"
                    ],
                    "medicines_to_avoid": [
                        "घाव पर चीरा न लगाएं और जहर न चूसें।",
                        "कसकर पट्टी न बांधें और बर्फ न लगाएं।"
                    ],
                    "urgency_note": "तुरंत अस्पताल जाने की आवश्यकता है!"
                }
            elif "सीने" in lower or "दर्द" in lower or "दिल" in lower or "chest" in lower or "heart" in lower:
                return {
                    "severity": "CRITICAL",
                    "title": "संभावित दिल का दौरा / सीने में तेज दर्द",
                    "summary": "सीने में दर्द और सांस की तकलीफ के लक्षण।",
                    "first_aid_steps": [
                        "तुरंत 108 एम्बुलेंस को कॉल करें।",
                        "व्यक्ति को बैठाएं और कपड़े ढीले करें।",
                        "यदि सांस बंद हो जाए तो तुरंत CPR शुरू करें।",
                        "मरीज को अकेला न छोड़ें।"
                    ],
                    "medicines_to_avoid": [
                        "बेहोश व्यक्ति को पानी या भोजन न दें।",
                        "बिना डॉक्टर सलाह के दवा न दें।"
                    ],
                    "urgency_note": "तुरंत 108 एम्बुलेंस की आवश्यकता है!"
                }
            else:
                return {
                    "severity": severity,
                    "title": f"चिकित्सा मूल्यांकन: {symptoms_text[:25]}...",
                    "summary": "हिंदी में आपातकालीन मूल्यांकन पूरा हुआ।",
                    "first_aid_steps": [
                        "मरीज को शांत और आरामदायक स्थिति में रखें।",
                        "सांस और चेतना की निगरानी करें।",
                        "108 आपातकालीन सेवा पर कॉल करें।",
                        "बिना डॉक्टर सलाह के दवा न दें।"
                    ],
                    "medicines_to_avoid": [
                        "डेंगू की आशंका पर एस्पिरिन न दें।",
                        "बेहोशी की स्थिति में तरल पदार्थ न दें।"
                    ],
                    "urgency_note": "त्वरित चिकित्सीय सलाह आवश्यक है।"
                }
        else:
            return {
                "severity": severity,
                "title": f"Triage Assessment: {symptoms_text[:25]}...",
                "summary": "Emergency evaluation completed in English.",
                "first_aid_steps": [
                    "Position the patient safely and keep airways clear.",
                    "Administer immediate pressure to bleeding wounds or keep patient calm.",
                    "Call 108 emergency service immediately if severity is HIGH or CRITICAL.",
                    "Do not leave patient unattended."
                ],
                "medicines_to_avoid": [
                    "Do NOT give Aspirin or NSAIDs if Dengue or internal bleeding is suspected.",
                    "Do NOT give oral water to unconscious patients."
                ],
                "urgency_note": "Urgent Medical Evaluation Recommended."
            }

gemini_service = GeminiAIService()
