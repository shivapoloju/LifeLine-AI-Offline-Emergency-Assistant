class WhisperAudioService:
    def transcribe_audio(self, audio_bytes, language: str = "EN"):
        """
        Audio transcription service supporting English, Hindi (HI), Telugu (TE)
        """
        # Simulated multi-lingual transcript fallback for testing voice input
        transcripts = {
            "EN": "Patient has severe chest pain and difficulty breathing since 15 minutes.",
            "HI": "मरीज को पिछले 15 मिनट से सीने में तेज दर्द और सांस लेने में तकलीफ है।",
            "TE": "రోగికి గత 15 నిమిషాలుగా గుండె వద్ద తీవ్రమైన నొప్పి మరియు శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంది."
        }
        return {
            "transcript": transcripts.get(language, transcripts["EN"]),
            "language_detected": language,
            "confidence": 0.96
        }

whisper_service = WhisperAudioService()
