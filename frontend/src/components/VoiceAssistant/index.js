import React, { useState, useContext } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Globe, CheckCircle } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const VoiceAssistant = () => {
  const { activeLanguage, changeLanguage } = useContext(LifeLineContext)
  const [isListening, setIsListening] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [assistantReply, setAssistantReply] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const t = translations[activeLanguage] || translations.EN

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // Demo fallback if browser speech recognition is unequipped
      const demoPhrases = {
        EN: "Patient is experiencing severe chest pain and dizziness.",
        HI: "मरीज को सीने में तेज दर्द और चक्कर आ रहे हैं।",
        TE: "రోగికి ఛాతీలో తీవ్రమైన నొప్పి మరియు కళ్ళు తిరగడం వస్తోంది."
      }
      const text = demoPhrases[activeLanguage] || demoPhrases["EN"]
      setSpokenText(text)
      processVoiceQuery(text)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = activeLanguage === 'HI' ? 'hi-IN' : activeLanguage === 'TE' ? 'te-IN' : 'en-US'

    setSpokenText('')
    setAssistantReply('')
    setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSpokenText(transcript)
      setIsListening(false)
      processVoiceQuery(transcript)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  const processVoiceQuery = (query) => {
    const lower = query.toLowerCase()
    let responseText = ''

    if (activeLanguage === 'HI') {
      if (lower.includes('दर्द') || lower.includes('छाती') || lower.includes('दिल') || lower.includes('सांस')) {
        responseText = "यह एक गंभीर आपात स्थिति हो सकती है! मरीज को शांत रखें, 108 पर कॉल करें और यदि सांस बंद हो जाए तो तुरंत CPR शुरू करें।"
      } else if (lower.includes('सांप') || lower.includes('काटा') || lower.includes('जहर')) {
        responseText = "सांप के काटने पर मरीज को हिलने न दें। घाव को चूसें नहीं। तुरंत एंटी-वेनम (ASV) वाले नजदीकी अस्पताल ले जाएं।"
      } else {
        responseText = "आपके लक्षणों को नोट कर लिया गया है। कृपया मरीज को आरामदायक स्थिति में रखें और प्राथमिक चिकित्सा निर्देशों का पालन करें।"
      }
    } else if (activeLanguage === 'TE') {
      if (lower.includes('నొప్పి') || lower.includes('ఛాతీ') || lower.includes('గుండె') || lower.includes('శ్వాస')) {
        responseText = "ఇది తీవ్రమైన అత్యవసర పరిస్థితి! వెంటనే 108కి కాల్ చేయండి. శ్వాస తీసుకోకపోతే CPR ప్రారంభించండి."
      } else if (lower.includes('పాము') || lower.includes('కాటు') || lower.includes('విషం')) {
        responseText = "పాము కాటు వేసిన బాధితుడిని కదలకుండా ఉంచండి. కాటు వేసిన చోట కోయవద్దు. వెంటనే ఆసుపత్రికి తరలించండి."
      } else {
        responseText = "మీ లక్షణాలను నమోదు చేసాము. రోగికి విశ్రాంతి ఇవ్వండి మరియు ప్రథమ చికిత్స చర్యలు తీసుకోండి."
      }
    } else {
      if (lower.includes('chest') || lower.includes('pain') || lower.includes('heart') || lower.includes('breath')) {
        responseText = "This may be a Critical Emergency! Call 108 immediately. Sit the patient down, keep calm, and prepare CPR if breathing stops."
      } else if (lower.includes('snake') || lower.includes('bite') || lower.includes('poison')) {
        responseText = "Snakebite emergency! Keep the bitten limb completely still below heart level. Do NOT cut the wound or suck venom out. Transport to hospital immediately."
      } else {
        responseText = "Symptom registered. Keep the patient comfortable, monitor breathing, and proceed to the nearest emergency clinic."
      }
    }

    setAssistantReply(responseText)
    speakText(responseText)
  }

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = activeLanguage === 'HI' ? 'hi-IN' : activeLanguage === 'TE' ? 'te-IN' : 'en-US'
    utterance.rate = 0.95

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="voice-container">
      <div className="voice-card">
        <div className="voice-header">
          <Mic size={32} className="voice-header-icon" />
          <div>
            <h1 className="voice-title">{t.voice_title}</h1>
            <p className="voice-subtitle">{t.voice_subtitle}</p>
          </div>
        </div>

        {/* Language Selection Bar */}
        <div className="voice-lang-bar">
          <Globe size={18} />
          <span>{t.active_voice_lang}</span>
          <div className="lang-buttons">
            <button
              type="button"
              className={`lang-btn ${activeLanguage === 'EN' ? 'active-lang' : ''}`}
              onClick={() => changeLanguage('EN')}
            >
              English
            </button>
            <button
              type="button"
              className={`lang-btn ${activeLanguage === 'HI' ? 'active-lang' : ''}`}
              onClick={() => changeLanguage('HI')}
            >
              हिंदी (Hindi)
            </button>
            <button
              type="button"
              className={`lang-btn ${activeLanguage === 'TE' ? 'active-lang' : ''}`}
              onClick={() => changeLanguage('TE')}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>

        {/* Big Mic Recording Button */}
        <div className="mic-wrapper">
          <button
            type="button"
            className={`big-mic-btn ${isListening ? 'mic-listening' : ''}`}
            onClick={toggleListen}
          >
            {isListening ? <MicOff size={48} /> : <Mic size={48} />}
          </button>
          <span className="mic-status-text">
            {isListening ? t.mic_listening_text : t.mic_idle_text}
          </span>
        </div>

        {/* Spoken Query Display */}
        {spokenText && (
          <div className="spoken-text-box">
            <span className="box-label">{t.query_label}</span>
            <p className="query-text">"{spokenText}"</p>
          </div>
        )}

        {/* AI Voice Response */}
        {assistantReply && (
          <div className="voice-reply-box">
            <div className="reply-header">
              <div className="reply-title-wrapper">
                <CheckCircle color="#10b981" size={20} />
                <span className="reply-title">{t.reply_title}</span>
              </div>

              {isSpeaking ? (
                <button type="button" className="audio-stop-btn" onClick={stopSpeaking}>
                  <VolumeX size={16} /> {t.stop_audio_btn}
                </button>
              ) : (
                <button type="button" className="audio-play-btn" onClick={() => speakText(assistantReply)}>
                  <Volume2 size={16} /> {t.replay_audio}
                </button>
              )}
            </div>

            <p className="reply-content">{assistantReply}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceAssistant
