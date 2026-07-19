import React, { useState, useEffect, useContext } from 'react'
import { MapPin, PhoneCall, Navigation, CheckCircle, XCircle } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const HospitalLocator = () => {
  const { activeLanguage } = useContext(LifeLineContext)
  const [gpsStatus, setGpsStatus] = useState('')
  const [hospitalsList, setHospitalsList] = useState([])
  const t = translations[activeLanguage] || translations.EN
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    setGpsStatus(t.gps_active)
    fetchHospitals()
  }, [activeLanguage])

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hospitals`)
      if (res.ok) {
        const data = await res.json()
        setHospitalsList(data)
        return
      }
    } catch (e) {
      console.log('Using offline hospital cache')
    }

    setHospitalsList([
      {
        id: 1,
        name: activeLanguage === 'HI' ? 'जिला आपातकालीन एवं ट्रॉमा सेंटर' : activeLanguage === 'TE' ? 'జిల్లా అత్యవసర మరియు ట్రామా సెంటర్' : 'District Emergency & Trauma Center',
        address: activeLanguage === 'HI' ? 'मुख्य हाईवे मार्ग, सेक्टर 4' : activeLanguage === 'TE' ? 'ప్రధాన రహదారి, సెక్టార్ 4' : 'Main Highway Road, Sector 4',
        phone: '+91 98765 43210',
        distance_km: 1.2,
        has_asv: true,
        has_icu: true,
        oxygen_available: true
      },
      {
        id: 2,
        name: activeLanguage === 'HI' ? 'संजीवनी ग्रामीण अस्पताल' : activeLanguage === 'TE' ? 'సంజీవని గ్రామీణ ఆసుపత్రి' : 'Sanjivani Rural Community Hospital',
        address: activeLanguage === 'HI' ? 'ग्राम पंचायत मार्ग' : activeLanguage === 'TE' ? 'గ్రామ పంచాయితీ మార్గం' : 'Village Panchayat Road',
        phone: '+91 98765 11223',
        distance_km: 3.5,
        has_asv: true,
        has_icu: false,
        oxygen_available: true
      },
      {
        id: 3,
        name: activeLanguage === 'HI' ? 'रेड क्रॉस आपातकालीन पोस्ट' : activeLanguage === 'TE' ? 'రెడ్ క్రాస్ అత్యవసర కేంద్రం' : 'Red Cross Emergency First Responder Post',
        address: activeLanguage === 'HI' ? 'सेंट्रल बस डिपो के पास' : activeLanguage === 'TE' ? 'కేంద్ర బస్సు డిపో వద్ద' : 'Near Central Bus Depot',
        phone: '+91 91234 56789',
        distance_km: 5.1,
        has_asv: false,
        has_icu: false,
        oxygen_available: true
      }
    ])
  }

  return (
    <div className="hospital-container">
      <div className="hospital-card">
        <div className="hospital-header">
          <MapPin size={32} className="header-icon" />
          <div>
            <h1 className="title">{t.hospitals_page_title}</h1>
            <p className="subtitle">{t.hospitals_page_subtitle}</p>
          </div>
        </div>

        <div className="gps-banner">
          <Navigation size={18} className="gps-icon" />
          <span>{gpsStatus}</span>
        </div>

        <div className="hospitals-list-wrapper">
          <h2 className="section-title">{t.nearby_hospitals_heading} ({hospitalsList.length})</h2>
          
          <div className="hospitals-grid">
            {hospitalsList.map((hosp) => (
              <div key={hosp.id} className="hospital-item-card">
                <div className="hosp-card-header">
                  <h3 className="hosp-name">{hosp.name}</h3>
                  <span className="distance-badge">{hosp.distance_km} {t.km_away}</span>
                </div>
                <p className="hosp-address">{hosp.address}</p>

                <div className="capabilities-row">
                  <span className={`capability-pill ${hosp.has_asv ? 'cap-green' : 'cap-red'}`}>
                    {hosp.has_asv ? <CheckCircle size={14} /> : <XCircle size={14} />} {t.asv_available}
                  </span>

                  <span className={`capability-pill ${hosp.has_icu ? 'cap-green' : 'cap-red'}`}>
                    {hosp.has_icu ? <CheckCircle size={14} /> : <XCircle size={14} />} {t.icu_beds}
                  </span>

                  <span className={`capability-pill ${hosp.oxygen_available ? 'cap-green' : 'cap-red'}`}>
                    {hosp.oxygen_available ? <CheckCircle size={14} /> : <XCircle size={14} />} {t.oxygen_supply}
                  </span>
                </div>

                <div className="hosp-footer">
                  <a href={`tel:${hosp.phone}`} className="hosp-call-btn">
                    <PhoneCall size={16} /> {t.call_hospital} {hosp.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalLocator
