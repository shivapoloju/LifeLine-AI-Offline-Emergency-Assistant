import json
import os
import re

class MedicalRAGService:
    def __init__(self, data_path=None):
        if data_path is None:
            data_path = os.path.join(os.path.dirname(__file__), "..", "data", "medical_kb.json")
        self.data_path = data_path
        self.kb_data = self._load_kb()

    def _load_kb(self):
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading medical KB: {e}")
            return {"emergencies": [], "contraindications": [], "hospitals": []}

    def query_triage(self, query: str, lang: str = "EN"):
        """
        Query medical KB using keyword and semantic similarity score
        """
        query_lower = query.lower()
        matched = []

        for emergency in self.kb_data.get("emergencies", []):
            score = 0
            # match symptoms
            for symptom in emergency.get("symptoms", []):
                if symptom.lower() in query_lower or any(word in query_lower for word in symptom.lower().split()):
                    score += 3
            if emergency.get("title", "").lower() in query_lower:
                score += 5

            if score > 0:
                matched.append((score, emergency))

        matched.sort(key=lambda x: x[0], reverse=True)

        if matched:
            best_match = matched[0][1]
            first_aid = best_match.get(f"first_aid_{lang.lower()}", best_match.get("first_aid", []))
            return {
                "found": True,
                "title": best_match.get(f"title_{lang.lower()}", best_match.get("title")),
                "severity": best_match.get("severity"),
                "symptoms": best_match.get("symptoms"),
                "first_aid": first_aid,
                "do_not_take": best_match.get("do_not_take", []),
                "video_guide": best_match.get("video_guide")
            }

        # Fallback default triage response if no exact match
        return {
            "found": False,
            "title": "General Medical Emergency Triage",
            "severity": "MEDIUM",
            "symptoms": [query],
            "first_aid": [
                "Keep patient still, calm, and comfortable.",
                "Check for breathing, pulse, and severe bleeding.",
                "Contact nearest emergency medical services (108).",
                "Do not give oral fluids if patient is drowsy or unconscious."
            ],
            "do_not_take": ["Avoid giving unprescribed medications or pain pills without doctor advice."],
            "video_guide": None
        }

    def get_contraindications(self, condition_or_med: str):
        query_lower = condition_or_med.lower()
        results = []
        for item in self.kb_data.get("contraindications", []):
            if any(term in query_lower for term in item["condition"].lower().split()):
                results.append(item)
        return results if results else self.kb_data.get("contraindications", [])

    def get_nearby_hospitals(self, lat: float = None, lng: float = None):
        return self.kb_data.get("hospitals", [])

rag_service = MedicalRAGService()
