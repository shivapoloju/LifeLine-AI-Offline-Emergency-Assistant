from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from app.services.rag_service import rag_service
from app.services.gemini_service import gemini_service
from app.services.whisper_service import whisper_service

app = FastAPI(
    title="LifeLine AI - Offline Emergency Medical Assistant API",
    description="Emergency medical triage, offline RAG knowledge, multi-lingual audio processing, and hospital recommendations.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TriageRequest(BaseModel):
    symptoms: str
    language: Optional[str] = "EN"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "LifeLine AI Backend",
        "features": ["AI Triage", "Offline RAG", "Whisper Voice", "Gemini Vision", "Hospital Locator"]
    }

@app.post("/api/triage")
def perform_triage(request: TriageRequest):
    # 1. RAG query
    rag_result = rag_service.query_triage(request.symptoms, request.language)
    
    # 2. Deep Gemini analysis
    gemini_result = gemini_service.analyze_symptoms(request.symptoms, request.language)
    
    return {
        "symptoms": request.symptoms,
        "language": request.language,
        "rag_kb": rag_result,
        "ai_prediction": gemini_result
    }

@app.get("/api/first-aid/{emergency_id}")
def get_first_aid(emergency_id: str, lang: str = "EN"):
    return rag_service.query_triage(emergency_id, lang)

@app.get("/api/contraindications")
def get_contraindications(query: Optional[str] = ""):
    return rag_service.get_contraindications(query)

@app.get("/api/hospitals")
def get_hospitals(lat: Optional[float] = None, lng: Optional[float] = None):
    return rag_service.get_nearby_hospitals(lat, lng)

@app.post("/api/voice-transcribe")
async def transcribe_voice(file: UploadFile = File(...), language: str = Form("EN")):
    contents = await file.read()
    res = whisper_service.transcribe_audio(contents, language)
    return res

@app.post("/api/analyze-injury")
async def analyze_injury(file: UploadFile = File(...)):
    contents = await file.read()
    res = gemini_service.analyze_injury_image(contents, file.filename)
    return res

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
