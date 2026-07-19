import React, { useState, useContext } from 'react'
import { ThreeDots } from 'react-loader-spinner'
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, ArrowRight, RefreshCw, Volume2, VolumeX, Mic, MicOff, Pill, PhoneCall } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const SymptomTriage = () => {
  const { activeLanguage, isOffline, addTriageRecord, toggleSosModal } = useContext(LifeLineContext)
  const [symptomsInput, setSymptomsInput] = useState('')
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial)
  const [triageData, setTriageData] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)

  const t = translations[activeLanguage] || translations.EN

  const quickSymptoms = [
    { label: 'Chest Pain / Shortness of Breath', label_hi: 'सीने में दर्द / सांस फूलना', label_te: 'ఛాతీ నొప్పి / శ్వాస ఇబ్బంది' },
    { label: 'Snake Bite Emergency', label_hi: 'सांप का काटना', label_te: 'పాము కాటు ఎమర్జెన్సీ' },
    { label: 'Severe Thermal Burn', label_hi: 'गंभीर जलन', label_te: 'తీవ్రమైన కాలిన గాయాలు' },
    { label: 'High Fever with Rash', label_hi: 'तेज बुखार और चकत्ते', label_te: 'తీవ్రమైన జ్వరం' },
    { label: 'Fracture / Bone Injury', label_hi: 'हड्डी टूटना', label_te: 'ఎముక విరగడం' },
  ]

  const getQuickLabel = (item) => {
    if (activeLanguage === 'HI') return item.label_hi
    if (activeLanguage === 'TE') return item.label_te
    return item.label
  }

  const onSelectQuickSymptom = (item) => {
    setSymptomsInput(getQuickLabel(item))
  }

  const toggleVoiceInput = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false)
      return
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const sampleQueries = {
        EN: "Patient has severe chest pain and shortness of breath.",
        HI: "मरीज को सीने में तेज दर्द और सांस लेने में तकलीफ है।",
        TE: "రోగికి ఛాతీలో తీవ్రమైన నొప్పి మరియు శ్వాస తీసుకోలేకపోతున్నారు."
      }
      setSymptomsInput(sampleQueries[activeLanguage] || sampleQueries["EN"])
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = activeLanguage === 'HI' ? 'hi-IN' : activeLanguage === 'TE' ? 'te-IN' : 'en-US'

    setIsRecordingVoice(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSymptomsInput(transcript)
      setIsRecordingVoice(false)
    }

    recognition.onerror = () => setIsRecordingVoice(false)
    recognition.onend = () => setIsRecordingVoice(false)

    recognition.start()
  }

  const onClickAnalyze = async (e) => {
    if (e) e.preventDefault()
    if (!symptomsInput.trim()) return

    setApiStatus(apiStatusConstants.inProgress)

    try {
      if (isOffline) {
        setTimeout(() => {
          const result = generateLocalTriage(symptomsInput, activeLanguage)
          setTriageData(result)
          addTriageRecord(result)
          setApiStatus(apiStatusConstants.success)
        }, 800)
      } else {
        const response = await fetch('http://localhost:8000/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symptoms: symptomsInput, language: activeLanguage })
        })

        if (!response.ok) throw new Error('API request failed')
        const data = await response.json()
        const ai = data.ai_prediction || {}
        const rag = data.rag_kb || {}

        // Guarantee 100% native language translation fallback if backend returned English strings
        let result = {
          severity: ai.severity || rag.severity || 'HIGH',
          title: ai.title || rag.title || 'Emergency Assessment',
          symptoms: symptomsInput,
          first_aid_steps: ai.first_aid_steps || rag.first_aid || [],
          medicines_to_avoid: ai.medicines_to_avoid || rag.do_not_take || [],
          urgency_note: ai.urgency_note || 'Urgent medical attention recommended',
          is_offline_result: false
        }

        // If active language is TE or HI and returned steps are in English, substitute with native language translation
        if ((activeLanguage === 'TE' || activeLanguage === 'HI') && isEnglishText(result.first_aid_steps[0])) {
          result = generateLocalTriage(symptomsInput, activeLanguage)
        }

        setTriageData(result)
        addTriageRecord(result)
        setApiStatus(apiStatusConstants.success)
      }
    } catch (err) {
      console.error('Triage error:', err)
      // Fallback to local triage engine in target language
      const result = generateLocalTriage(symptomsInput, activeLanguage)
      setTriageData(result)
      addTriageRecord(result)
      setApiStatus(apiStatusConstants.success)
    }
  }

  const isEnglishText = (text) => {
    if (!text) return false
    return /[a-zA-Z]/.test(text) && !/[\u0C00-\u0C7F\u0900-\u097F]/.test(text)
  }

  const generateLocalTriage = (query, lang) => {
    const lower = query.toLowerCase()
    let severity = 'MEDIUM'

    if (lang === 'TE') {
      if (lower.includes('పాము') || lower.includes('కాటు') || lower.includes('snake') || lower.includes('bite')) {
        return {
          severity: 'CRITICAL',
          title: 'పాము కాటు అత్యవసర పరిస్రీతి (ASV అవసరం)',
          symptoms: query,
          first_aid_steps: [
            'బాధితుడిని ప్రశాంతంగా, కదలకుండా ఉంచండి. విషం వేగంగా వ్యాపించదు.',
            'కాటు వేసిన అవయవాన్ని గుండె స్థాయి కంటే కింద ఉంచండి.',
            'ఉంగరాలు, ఆభరణాలను వెంటనే తొలగించండి.',
            'యాంటీ-స్నేక్ వెనమ్ (ASV) ఉన్న సమీప ఆసుపత్రికి వెంటనే తరలించండి.'
          ],
          medicines_to_avoid: [
            'గాయం వద్ద కోయవద్దు, విషం నోటితో పీల్చవద్దు.',
            'కట్టు బిగించి కట్టవద్దు, మంచు లేదా ఆల్కహాల్ వాడవద్దు.'
          ],
          urgency_note: 'వెంటనే అత్యవసర అంబులెన్స్ సహాయం అవసరం!',
          is_offline_result: true
        }
      } else if (lower.includes('ఛాతీ') || lower.includes('నొప్పి') || lower.includes('గుండె') || lower.includes('chest') || lower.includes('heart') || lower.includes('breath')) {
        return {
          severity: 'CRITICAL',
          title: 'గుండెపోటు అనుమానం / తీవ్రమైన ఛాతీ నొప్పి',
          symptoms: query,
          first_aid_steps: [
            'వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి.',
            'వ్యక్తిని కూర్చోబెట్టి, బట్టలు వదులు చేయండి.',
            'శ్వాస నిలిచిపోతే వెంటనే CPR ప్రారంభించండి.',
            'రోగిని ఒంటరిగా వదిలేయవద్దు.'
          ],
          medicines_to_avoid: [
            'స్పృహలేని వ్యక్తికి ఆహారం లేదా నీరు ఇవ్వవద్దు.',
            'డాక్టర్ సలహా లేకుండా ఇతర మందులు వేసుకోవద్దు.'
          ],
          urgency_note: 'వెంటనే 108 అంబులెన్స్ సేవలు అవసరం!',
          is_offline_result: true
        }
      } else {
        return {
          severity: 'MEDIUM',
          title: `అత్యవసర అంచనా: ${query.slice(0, 25)}...`,
          symptoms: query,
          first_aid_steps: [
            'రోగిని ప్రశాంతంగా, వెచ్చగా ఉంచండి.',
            'శ్వాస మరియు స్పృహను పరిశీలించండి.',
            'వెంటనే 108 ఎమర్జెన్సీ నంబర్‌కు కాల్ చేయండి.',
            'డాక్టర్ సలహా లేకుండా మందులు ఇవ్వవద్దు.'
          ],
          medicines_to_avoid: [
            'డెంగ్యూ అనుమానం ఉంటే ఆస్పిరిన్ (Aspirin) ఇవ్వకూడదు.',
            'స్పృహ లేనప్పుడు ద్రవాలు ఇవ్వవద్దు.'
          ],
          urgency_note: 'వైద్యుడిని వెంటనే సంప్రదించండి.',
          is_offline_result: true
        }
      }
    } else if (lang === 'HI') {
      if (lower.includes('सांप') || lower.includes('काटा') || lower.includes('snake') || lower.includes('bite')) {
        return {
          severity: 'CRITICAL',
          title: 'सांप काटने की आपात स्थिति (एंटी-वेनम आवश्यक)',
          symptoms: query,
          first_aid_steps: [
            'मरीज को पूरी तरह शांत रखें। अंग को बिल्कुल न हिलाएं।',
            'अंग को दिल के स्तर से नीचे स्थिर रखें।',
            'सूजन आने से पहले अंगूठी और घड़ियां निकाल दें।',
            'तुरंत ASV (एंटी-स्नेक वेनम) वाले अस्पताल ले जाएं।'
          ],
          medicines_to_avoid: [
            'घाव पर चीरा न लगाएं और जहर न चूसें।',
            'कसकर पट्टी न बांधें और बर्फ न लगाएं।'
          ],
          urgency_note: 'तुरंत अस्पताल जाने की आवश्यकता है!',
          is_offline_result: true
        }
      } else if (lower.includes('सीने') || lower.includes('दर्द') || lower.includes('दिल') || lower.includes('chest') || lower.includes('heart') || lower.includes('breath')) {
        return {
          severity: 'CRITICAL',
          title: 'संभावित दिल का दौरा / सीने में तेज दर्द',
          symptoms: query,
          first_aid_steps: [
            'तुरंत 108 एम्बुलेंस को कॉल करें।',
            'व्यक्ति को बैठाएं और कपड़े ढीले करें।',
            'यदि सांस बंद हो जाए तो तुरंत CPR शुरू करें।',
            'मरीज को अकेला न छोड़ें।'
          ],
          medicines_to_avoid: [
            'बेहोश व्यक्ति को पानी या भोजन न दें।',
            'बिना डॉक्टर सलाह के दवा न दें।'
          ],
          urgency_note: 'तुरंत 108 एम्बुलेंस की आवश्यकता है!',
          is_offline_result: true
        }
      } else {
        return {
          severity: 'MEDIUM',
          title: `चिकित्सा मूल्यांकन: ${query.slice(0, 25)}...`,
          symptoms: query,
          first_aid_steps: [
            'मरीज को शांत और आरामदायक स्थिति में रखें।',
            'सांस और चेतना की निगरानी करें।',
            '108 आपातकालीन सेवा पर कॉल करें।',
            'बिना डॉक्टर सलाह के दवा न दें।'
          ],
          medicines_to_avoid: [
            'डेंगू की आशंका पर एस्पिरिन न दें।',
            'बेहोशी की स्थिति में तरल पदार्थ न दें।'
          ],
          urgency_note: 'त्वरित चिकित्सीय सलाह आवश्यक है।',
          is_offline_result: true
        }
      }
    } else {
      return {
        severity: 'MEDIUM',
        title: `Triage Assessment: ${query.slice(0, 25)}...`,
        symptoms: query,
        first_aid_steps: [
          'Position the patient safely and keep airways clear.',
          'Administer immediate pressure to bleeding wounds or keep patient calm.',
          'Call 108 emergency service immediately if severity is HIGH or CRITICAL.',
          'Do not leave patient unattended.'
        ],
        medicines_to_avoid: [
          'Do NOT give Aspirin or NSAIDs if Dengue or internal bleeding is suspected.',
          'Do NOT give oral water to unconscious patients.'
        ],
        urgency_note: 'Urgent Medical Evaluation Recommended.',
        is_offline_result: true
      }
    }
  }

  const speakInstructions = () => {
    if (!triageData || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const langCode = activeLanguage === 'HI' ? 'hi-IN' : activeLanguage === 'TE' ? 'te-IN' : 'en-US'
    const textToSpeak = `${triageData.title}. ${triageData.first_aid_steps.join('. ')}`
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = langCode
    utterance.rate = 0.95

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <ThreeDots color="#3b82f6" height="60" width="60" />
      <p className="loading-text">{t.loading_triage}</p>
    </div>
  )

  const renderFailureView = () => (
    <div className="failure-view-container">
      <AlertTriangle size={48} className="failure-icon" />
      <h3 className="failure-title">{t.failure_triage}</h3>
      <button type="button" className="retry-btn" onClick={onClickAnalyze}>
        <RefreshCw size={16} /> {t.retry_btn}
      </button>
    </div>
  )

  const renderSuccessView = () => {
    if (!triageData) return null
    const { severity, title, first_aid_steps, medicines_to_avoid, urgency_note, is_offline_result } = triageData

    const getSeverityBadgeClass = () => {
      switch (severity) {
        case 'CRITICAL': return 'severity-critical'
        case 'HIGH': return 'severity-high'
        case 'MEDIUM': return 'severity-medium'
        default: return 'severity-low'
      }
    }

    const getSeverityLabel = () => {
      switch (severity) {
        case 'CRITICAL': return t.severity_critical_label
        case 'HIGH': return t.severity_high_label
        case 'MEDIUM': return t.severity_medium_label
        default: return t.severity_low_label
      }
    }

    return (
      <div className="triage-result-card">
        <div className={`triage-severity-banner ${getSeverityBadgeClass()}`}>
          <div className="severity-badge-pill">{getSeverityLabel()}</div>
          <h2 className="triage-result-title">{title}</h2>
          <p className="triage-urgency-note">{urgency_note}</p>
        </div>

        <div className="result-audio-bar">
          <button type="button" className={`speak-btn ${isSpeaking ? 'speaking-active' : ''}`} onClick={speakInstructions}>
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isSpeaking ? t.stop_audio_btn : t.listen_audio_btn}</span>
          </button>
          {is_offline_result && <span className="offline-tag-pill">{t.offline_mode}</span>}
        </div>

        {severity === 'CRITICAL' && (
          <div className="critical-warning-box">
            <ShieldAlert size={24} />
            <div>
              <strong>{t.critical_warning_title}</strong> {t.critical_warning_desc}
            </div>
            <button type="button" className="critical-sos-btn" onClick={toggleSosModal}>
              {t.trigger_sos_btn}
            </button>
          </div>
        )}

        <div className="result-section">
          <h3 className="section-subtitle">
            <CheckCircle color="#10b981" size={20} /> {t.first_aid_title}
          </h3>
          <ol className="first-aid-list">
            {first_aid_steps.map((step, idx) => (
              <li key={idx} className="first-aid-step-item">
                <span className="step-number">{idx + 1}</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {medicines_to_avoid && medicines_to_avoid.length > 0 && (
          <div className="result-section contraindications-box">
            <h3 className="section-subtitle warning-subtitle">
              <Pill color="#ef4444" size={20} /> {t.avoid_title}
            </h3>
            <ul className="avoid-list">
              {medicines_to_avoid.map((item, idx) => (
                <li key={idx} className="avoid-item">
                  <strong>{t.avoid_label}</strong> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="triage-actions-footer">
          <a href="tel:108" className="footer-call-btn">
            <PhoneCall size={18} /> {t.call_108_btn}
          </a>
          <button type="button" className="reset-triage-btn" onClick={() => setApiStatus(apiStatusConstants.initial)}>
            {t.new_check_btn}
          </button>
        </div>
      </div>
    )
  }

  const renderApiStatusView = () => {
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return renderLoadingView()
      case apiStatusConstants.success:
        return renderSuccessView()
      case apiStatusConstants.failure:
        return renderFailureView()
      default:
        return null
    }
  }

  return (
    <div className="triage-page-container">
      <div className="triage-card-wrapper">
        <div className="triage-header">
          <Activity size={28} className="triage-icon" />
          <div>
            <h1 className="triage-title">{t.triage_title}</h1>
            <p className="triage-subtitle">{t.triage_subtitle}</p>
          </div>
        </div>

        <div className="quick-symptoms-wrapper">
          <span className="quick-label">{t.common_emergencies}</span>
          <div className="quick-buttons-row">
            {quickSymptoms.map((symptom, i) => (
              <button
                key={i}
                type="button"
                className="quick-symptom-btn"
                onClick={() => onSelectQuickSymptom(symptom)}
              >
                {getQuickLabel(symptom)}
              </button>
            ))}
          </div>
        </div>

        <form className="triage-form" onSubmit={onClickAnalyze}>
          <div className="input-field-wrapper">
            <textarea
              className="symptom-textarea"
              rows={4}
              placeholder={t.textarea_placeholder}
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
            />

            <button
              type="button"
              className={`mic-triage-btn ${isRecordingVoice ? 'recording-active' : ''}`}
              onClick={toggleVoiceInput}
              title={t.mic_btn_idle}
            >
              {isRecordingVoice ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isRecordingVoice ? t.mic_btn_listening : t.mic_btn_idle}</span>
            </button>
          </div>

          <button type="submit" className="analyze-submit-btn" disabled={!symptomsInput.trim()}>
            <span>{t.analyze_btn}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {renderApiStatusView()}
      </div>
    </div>
  )
}

export default SymptomTriage
