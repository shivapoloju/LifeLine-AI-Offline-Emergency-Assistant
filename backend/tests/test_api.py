from app.services.rag_service import rag_service
from app.services.gemini_service import gemini_service

def test_rag_triage():
    result = rag_service.query_triage("chest pain shortness of breath", "EN")
    assert result["found"] == True
    assert result["severity"] == "CRITICAL"
    assert len(result["first_aid"]) > 0

def test_gemini_analysis_fallback():
    result = gemini_service.analyze_symptoms("severe snake bite wound", "HI")
    assert result["severity"] == "CRITICAL"
    assert "first_aid_steps" in result
    assert "medicines_to_avoid" in result

def test_hospital_locator():
    hospitals = rag_service.get_nearby_hospitals()
    assert len(hospitals) >= 2
    assert hospitals[0]["has_asv"] == True
