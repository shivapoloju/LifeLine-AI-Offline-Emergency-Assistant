import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Mic, BookOpen, Camera, MapPin, Pill, FileDown, ShieldAlert, PhoneCall, Zap, WifiOff, HeartPulse } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const Home = () => {
  const { activeLanguage, isOffline, toggleSosModal } = useContext(LifeLineContext)
  const t = translations[activeLanguage] || translations.EN

  const featureCards = [
    {
      id: 'triage',
      path: '/triage',
      icon: Activity,
      color: '#ef4444',
      title: t.triage_title,
      desc: t.triage_subtitle,
      tag: 'CORE AI'
    },
    {
      id: 'voice',
      path: '/voice',
      icon: Mic,
      color: '#3b82f6',
      title: t.voice_title,
      desc: t.voice_subtitle,
      tag: 'VOICE AI'
    },
    {
      id: 'first-aid',
      path: '/first-aid',
      icon: BookOpen,
      color: '#10b981',
      title: t.first_aid_page_title,
      desc: t.first_aid_page_subtitle,
      tag: 'OFFLINE RAG'
    },
    {
      id: 'injury',
      path: '/injury-scanner',
      icon: Camera,
      color: '#8b5cf6',
      title: t.injury_page_title,
      desc: t.injury_page_subtitle,
      tag: 'GEMINI VISION'
    },
    {
      id: 'hospitals',
      path: '/hospitals',
      icon: MapPin,
      color: '#f59e0b',
      title: t.hospitals_page_title,
      desc: t.hospitals_page_subtitle,
      tag: 'GPS MAP'
    },
    {
      id: 'medicines',
      path: '/medicines',
      icon: Pill,
      color: '#ec4899',
      title: t.meds_page_title,
      desc: t.meds_page_subtitle,
      tag: 'SAFETY'
    },
    {
      id: 'reports',
      path: '/reports',
      icon: FileDown,
      color: '#06b6d4',
      title: t.pdf_page_title,
      desc: t.pdf_page_subtitle,
      tag: 'EXPORT'
    }
  ]

  return (
    <div className="home-container">
      {/* Hero Emergency Banner */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <HeartPulse size={16} />
            <span>{t.hero_badge}</span>
          </div>
          <h1 className="hero-title">
            {t.hero_title_pre} <span className="highlight-text">{t.hero_title_highlight}</span>
          </h1>
          <p className="hero-description">{t.hero_desc}</p>

          <div className="hero-actions">
            <Link to="/triage" className="primary-hero-btn">
              <Zap size={18} />
              <span>{t.start_triage_btn}</span>
            </Link>

            <button type="button" className="sos-hero-btn" onClick={toggleSosModal}>
              <ShieldAlert size={18} />
              <span>{t.sos_hero_btn}</span>
            </button>
          </div>

          {isOffline && (
            <div className="hero-offline-alert">
              <WifiOff size={18} />
              <span><strong>{t.offline_mode}:</strong> Operating using local vector database and browser medical cache.</span>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Hotline Quick Ribbon */}
      <section className="emergency-ribbon">
        <div className="ribbon-title">
          <PhoneCall size={18} />
          <span>{t.hotline_title}</span>
        </div>
        <div className="ribbon-pills">
          <a href="tel:108" className="hotline-pill red-pill">
            <strong>108</strong> {t.hotline_108}
          </a>
          <a href="tel:102" className="hotline-pill blue-pill">
            <strong>102</strong> {t.hotline_102}
          </a>
          <a href="tel:1066" className="hotline-pill yellow-pill">
            <strong>1066</strong> {t.hotline_1066}
          </a>
          <a href="tel:112" className="hotline-pill purple-pill">
            <strong>112</strong> {t.hotline_112}
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-grid-section">
        <h2 className="section-title">{t.modules_heading}</h2>
        <div className="features-grid">
          {featureCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.id} to={card.path} className="feature-card">
                <div className="card-header-line">
                  <div className="card-icon-box" style={{ background: card.color }}>
                    <Icon size={24} color="#ffffff" />
                  </div>
                  <span className="card-tag">{card.tag}</span>
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-desc">{card.desc}</p>
                <div className="card-footer-link">
                  <span>{t.open_module} &rarr;</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Home
