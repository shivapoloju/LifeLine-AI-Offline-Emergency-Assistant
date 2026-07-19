import React, { useState, useContext, useEffect } from 'react'
import { BookOpen, Search, Play, Square, AlertCircle, Heart, ShieldAlert } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const FirstAidGuide = () => {
  const { activeLanguage } = useContext(LifeLineContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuideId, setSelectedGuideId] = useState('cardiac_cpr')
  const [isCprRunning, setIsCprRunning] = useState(false)
  const [cprCount, setCprCount] = useState(0)

  const t = translations[activeLanguage] || translations.EN

  useEffect(() => {
    let interval = null
    if (isCprRunning) {
      interval = setInterval(() => setCprCount((prev) => prev + 1), 550)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isCprRunning])

  const firstAidGuides = [
    {
      id: 'cardiac_cpr',
      title: activeLanguage === 'HI' ? 'CPR और कार्डिएक अरेस्ट' : activeLanguage === 'TE' ? 'CPR & కార్డియాక్ అరెస్ట్' : 'CPR & Cardiac Arrest Protocol',
      category: 'CRITICAL',
      icon: Heart,
      steps: activeLanguage === 'HI' ? [
        '108 एम्बुलेंस को तुरंत कॉल करें।',
        'मरीज को समतल सतह पर पीठ के बल लिटाएं।',
        'हथेलियों को मरीज की छाती के बीच में रखें।',
        '100-120 प्रति मिनट की गति से छाती को दबाएं।',
        'हर 30 दबाव के बाद 2 बार मुंह से सांस (Rescue Breath) दें।'
      ] : activeLanguage === 'TE' ? [
        'వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి.',
        'రోగిని గట్టి ఉపరితలంపై వెల్లకిలా పండబెట్టండి.',
        'మీ రెండు చేతులను ఛాతీ మధ్యలో ఉంచండి.',
        'నిమిషానికి 100-120 సార్లు వేగంగా నొక్కండి.',
        'ప్రతి 30 నొక్కులకు 2 సార్లు నోటి ద్వారా శ్వాస ఇవ్వండి.'
      ] : [
        'Call 108 Emergency Ambulance immediately.',
        'Place patient on their back on a firm, flat surface.',
        'Place heel of your hand on the center of chest.',
        'Compress hard and fast at a rate of 100-120 compressions per minute.',
        'After every 30 compressions, give 2 rescue breaths.'
      ],
      warnings: activeLanguage === 'HI' ? [
        'CPR को 10 सेकंड से अधिक न रोकें।',
        'बेहोश व्यक्ति को पानी या भोजन न दें।'
      ] : activeLanguage === 'TE' ? [
        'CPR ను 10 సెకన్ల కంటే ఎక్కువ ఆపవద్దు.',
        'స్పృహలేని వ్యక్తికి నీరు లేదా ఆహారం ఇవ్వవద్దు.'
      ] : [
        'Do NOT interrupt CPR for more than 10 seconds.',
        'Do NOT give liquids to an unconscious person.'
      ],
      has_cpr_timer: true
    },
    {
      id: 'snakebite',
      title: activeLanguage === 'HI' ? 'सांप का काटना (Snake Bite)' : activeLanguage === 'TE' ? 'పాము కాటు (Snake Bite)' : 'Snakebite Protocol',
      category: 'CRITICAL',
      icon: ShieldAlert,
      steps: activeLanguage === 'HI' ? [
        'पीड़ित को पूरी तरह शांत रखें। हिलने-डुलने से जहर तेजी से फैलता है।',
        'काटे गए अंग को स्थिर रखें और दिल के स्तर से नीचे रखें।',
        'सूजन आने से पहले अंगूठी और घड़ियां निकाल दें।',
        'तुरंत ASV (एंटी-वेनम) वाले अस्पताल ले जाएं।'
      ] : activeLanguage === 'TE' ? [
        'బాధితుడిని ప్రశాంతంగా ఉంచండి.',
        'కాటు వేసిన అవయవాన్ని గుండె స్థాయికి దిగువన ఉంచండి.',
        'ఉంగరాలు, ఆభరణాలను వెంటనే తొలగించండి.',
        'ASV సదుపాయం ఉన్న ఆసుపత్రికి తరలించండి.'
      ] : [
        'Keep patient calm and completely still.',
        'Immobilize the bitten limb below heart level.',
        'Remove watches, rings, or constricting clothes.',
        'Transport immediately to a facility with Anti-Snake Venom (ASV).'
      ],
      warnings: activeLanguage === 'HI' ? [
        'घाव पर चीरा न लगाएं और जहर न चूसें।',
        'कसकर पट्टी न बांधें और बर्फ न लगाएं।'
      ] : activeLanguage === 'TE' ? [
        'గాయం వద్ద కోయవద్దు, విషం పీల్చవద్దు.',
        'కట్టు బిగించి కట్టవద్దు, మంచు రాయవద్దు.'
      ] : [
        'Never cut the bite wound or attempt to suck out venom.',
        'Never apply a tight tourniquet or ice.'
      ],
      has_cpr_timer: false
    },
    {
      id: 'burns',
      title: activeLanguage === 'HI' ? 'गंभीर जलना (Burn Care)' : activeLanguage === 'TE' ? 'కాలిన గాయాలు (Burns)' : 'Severe Burn Management',
      category: 'HIGH',
      icon: AlertCircle,
      steps: activeLanguage === 'HI' ? [
        'जले हुए हिस्से पर कम से कम 10-20 मिनट तक ठंडा बहता पानी डालें।',
        'साफ सूती कपड़े या स्टेराइल पट्टी से ढीला ढकें।',
        'मरीज को गर्म रखें।'
      ] : activeLanguage === 'TE' ? [
        'కాలిన ప్రాంతంపై కనీసం 10-20 నిమిషాలు చల్లని పారే నీటిని పోయండి.',
        'పరిశుభ్రమైన క్లాత్ తో వదులుగా కప్పండి.',
        'రోగిని వెచ్చగా ఉంచండి.'
      ] : [
        'Cool the burn under cool, clean running water for at least 10-20 minutes.',
        'Cover loosely with sterile non-stick cloth.',
        'Keep patient warm with a clean blanket.'
      ],
      warnings: activeLanguage === 'HI' ? [
        'जले हुए पर बर्फ न लगाएं।',
        'फोले न फोड़ें।',
        'घी, तेल, टूथपेस्ट या हल्दी न लगाएं।'
      ] : activeLanguage === 'TE' ? [
        'మంచు రాయవద్దు.',
        'గుల్లలు పగలకొట్టవద్దు.',
        'నెయ్యి, నూనె, పేస్ట్ రాయవద్దు.'
      ] : [
        'Do NOT apply ice directly.',
        'Do NOT pop blisters.',
        'Do NOT apply butter, toothpaste, oil, or turmeric.'
      ],
      has_cpr_timer: false
    }
  ]

  const filteredGuides = firstAidGuides.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeGuide = firstAidGuides.find(g => g.id === selectedGuideId) || firstAidGuides[0]

  return (
    <div className="first-aid-container">
      <div className="first-aid-header">
        <BookOpen size={32} className="header-icon" />
        <div>
          <h1 className="page-title">{t.first_aid_page_title}</h1>
          <p className="page-subtitle">{t.first_aid_page_subtitle}</p>
        </div>
      </div>

      <div className="search-bar-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={t.search_first_aid_ph}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="manual-grid-layout">
        <div className="guides-sidebar">
          <span className="sidebar-title">{t.protocols_sidebar_title}</span>
          <div className="guide-buttons-list">
            {filteredGuides.map(guide => {
              const Icon = guide.icon
              const isSelected = guide.id === activeGuide.id
              return (
                <button
                  key={guide.id}
                  type="button"
                  className={`guide-select-btn ${isSelected ? 'selected-guide' : ''}`}
                  onClick={() => {
                    setSelectedGuideId(guide.id)
                    setIsCprRunning(false)
                  }}
                >
                  <Icon size={18} />
                  <span>{guide.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="protocol-details-panel">
          <div className="protocol-banner">
            <span className="category-pill">{activeGuide.category} EMERGENCY</span>
            <h2 className="protocol-title">{activeGuide.title}</h2>
          </div>

          {activeGuide.has_cpr_timer && (
            <div className="cpr-timer-box">
              <div className="cpr-info">
                <Heart size={28} className={`heart-beat-icon ${isCprRunning ? 'beating' : ''}`} />
                <div>
                  <h4 className="cpr-box-title">{t.cpr_timer_title}</h4>
                  <p className="cpr-box-desc">{t.cpr_timer_desc}</p>
                </div>
              </div>

              <div className="cpr-counter-display">
                <span className="count-number">{cprCount}</span>
                <span className="count-unit">BEATS</span>
              </div>

              <button
                type="button"
                className={`cpr-toggle-btn ${isCprRunning ? 'stop-cpr' : 'start-cpr'}`}
                onClick={() => {
                  if (isCprRunning) {
                    setIsCprRunning(false)
                  } else {
                    setCprCount(0)
                    setIsCprRunning(true)
                  }
                }}
              >
                {isCprRunning ? <Square size={16} /> : <Play size={16} />}
                <span>{isCprRunning ? t.stop_cpr_btn : t.start_cpr_btn}</span>
              </button>
            </div>
          )}

          <div className="protocol-section">
            <h3 className="section-heading">{t.step_by_step_heading}</h3>
            <div className="steps-wrapper">
              {activeGuide.steps.map((step, idx) => (
                <div key={idx} className="step-card">
                  <div className="step-num">{idx + 1}</div>
                  <p className="step-desc">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {activeGuide.warnings && (
            <div className="warnings-section">
              <h3 className="warnings-heading">
                <ShieldAlert size={20} /> {t.contraindications_heading}
              </h3>
              <ul className="warnings-list">
                {activeGuide.warnings.map((w, idx) => (
                  <li key={idx} className="warning-list-item">{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FirstAidGuide
