import React, { useState, useContext } from 'react'
import { Pill, Bell, Plus, CheckCircle, ShieldAlert } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const MedicineTracker = () => {
  const { activeReminders, addReminder, activeLanguage } = useContext(LifeLineContext)
  const [medName, setMedName] = useState('')
  const [medTime, setMedTime] = useState('08:00')
  const [medDosage, setMedDosage] = useState('1 Tablet after food')
  const [searchQuery, setSearchQuery] = useState('')

  const t = translations[activeLanguage] || translations.EN

  const dangerousContraindications = [
    {
      condition: activeLanguage === 'HI' ? "संभावित डेंगू / जोड़ों के दर्द के साथ तेज बुखार" : activeLanguage === 'TE' ? "డెంగ్యూ అనుమానం / కీళ్ల నొప్పులతో జ్వరం" : "Suspected Dengue / High Fever with Joint Pain",
      warning: activeLanguage === 'HI' ? "एस्पिरिन और दर्द निवारक (Ibuprofen) से आंतरिक रक्तस्राव हो सकता है!" : activeLanguage === 'TE' ? "ఆస్పిరిన్ మరియు పెయిన్ కిల్లర్లు ఆంతరిక రక్తస్రావం కలిగిస్తాయి!" : "Aspirin & NSAIDs (Ibuprofen, Naproxen) cause severe internal hemorrhaging!",
      safe_alternative: activeLanguage === 'HI' ? "पैरासिटामोल (Paracetamol) का उपयोग करें।" : activeLanguage === 'TE' ? "పారాసిటమాల్ (Paracetamol) వాడండి." : "Paracetamol (Acetaminophen) for fever control."
    },
    {
      condition: activeLanguage === 'HI' ? "सांप का काटना (Snake Bite Emergency)" : activeLanguage === 'TE' ? "పాము కాటు ఎమర్జెన్సీ" : "Snake Bite Emergency",
      warning: activeLanguage === 'HI' ? "खून पतला करने वाली दवाएं, एस्पिरिन या शराब जहर को तेजी से फैलाती हैं!" : activeLanguage === 'TE' ? "రక్తం పల్చబడే మందులు మరియు ఆస్పిరిన్ విషాన్ని వేగంగా వ్యాపింపజేస్తాయి!" : "Blood thinners, Painkillers, Aspirin, or Alcohol accelerate venom tissue necrosis!",
      safe_alternative: activeLanguage === 'HI' ? "मरीज को स्थिर रखें और तुरंत ASV अस्पताल ले जाएं।" : activeLanguage === 'TE' ? "రోగిని కదల్చకుండా ASV ఆసుపత్రికి తరలించండి." : "Immobilize patient & proceed immediately to ASV trauma center."
    },
    {
      condition: activeLanguage === 'HI' ? "गंभीर डिहाइड्रेशन / लू लगना (Heatstroke)" : activeLanguage === 'TE' ? "తీవ్రమైన నిర్జలీకరణం / వడదెబ్బ" : "Severe Dehydration / Heatstroke",
      warning: activeLanguage === 'HI' ? "दर्द निवारक गोलियां गुर्दे (Kidney) को नुकसान पहुंचा सकती हैं!" : activeLanguage === 'TE' ? "పెయిన్ కిల్లర్ మందులు మూత్రపిండాలను దెబ్బతీస్తాయి!" : "High-dose NSAIDs impair renal blood flow and trigger acute kidney failure!",
      safe_alternative: activeLanguage === 'HI' ? "ORS घोल और ठंडा पानी दें।" : activeLanguage === 'TE' ? "ORS ద్రావణం మరియు మంచి నీరు ఇవ్వండి." : "ORS (Oral Rehydration Salts) & isotonic fluids."
    }
  ]

  const handleAddReminder = (e) => {
    e.preventDefault()
    if (!medName.trim()) return
    const newRem = {
      id: Date.now(),
      name: medName,
      time: medTime,
      dosage: medDosage
    }
    addReminder(newRem)
    setMedName('')
  }

  const filteredWarnings = dangerousContraindications.filter(item =>
    item.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.warning.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="meds-container">
      <div className="meds-card">
        <div className="meds-header">
          <Pill size={32} className="header-icon" />
          <div>
            <h1 className="title">{t.meds_page_title}</h1>
            <p className="subtitle">{t.meds_page_subtitle}</p>
          </div>
        </div>

        <div className="section-box warning-box">
          <div className="section-header-row">
            <ShieldAlert size={24} className="icon-red" />
            <h2 className="section-title text-red">{t.critical_not_to_take_heading}</h2>
          </div>

          <p className="section-desc">{t.not_to_take_desc}</p>

          <input
            type="text"
            className="search-med-input"
            placeholder={t.search_med_ph}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="contra-list">
            {filteredWarnings.map((item, idx) => (
              <div key={idx} className="contra-item">
                <div className="contra-condition">{item.condition}</div>
                <div className="contra-danger">
                  <strong>{t.avoid_label}</strong> {item.warning}
                </div>
                <div className="contra-safe">
                  <CheckCircle size={16} /> <strong>{t.safe_alt_label}</strong> {item.safe_alternative}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-box">
          <div className="section-header-row">
            <Bell size={24} className="icon-blue" />
            <h2 className="section-title">{t.schedule_reminder_heading}</h2>
          </div>

          <form className="reminder-form" onSubmit={handleAddReminder}>
            <div className="form-group">
              <label className="form-label">{t.med_name_label}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Paracetamol 500mg"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.time_label}</label>
                <input
                  type="time"
                  className="form-input"
                  value={medTime}
                  onChange={(e) => setMedTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.dosage_label}</label>
                <input
                  type="text"
                  className="form-input"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="add-reminder-btn">
              <Plus size={18} /> {t.add_reminder_btn}
            </button>
          </form>

          <div className="reminders-list-wrapper">
            <h3 className="sub-heading">{t.active_reminders_heading} ({activeReminders.length})</h3>
            <div className="reminders-grid">
              {activeReminders.map((rem) => (
                <div key={rem.id} className="reminder-card-item">
                  <div className="rem-header">
                    <h4 className="rem-name">{rem.name}</h4>
                    <span className="rem-time">{rem.time}</span>
                  </div>
                  <p className="rem-dosage">{rem.dosage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicineTracker
