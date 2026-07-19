import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, ShieldAlert, Globe, WifiOff, Wifi } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const Header = () => {
  const { activeLanguage, changeLanguage, isOffline, toggleOfflineMode, toggleSosModal } = useContext(LifeLineContext)
  const location = useLocation()
  const t = translations[activeLanguage] || translations.EN

  const navItems = [
    { id: 'home', path: '/', label: t.nav_home },
    { id: 'triage', path: '/triage', label: t.nav_triage },
    { id: 'voice', path: '/voice', label: t.nav_voice },
    { id: 'first-aid', path: '/first-aid', label: t.nav_first_aid },
    { id: 'injury', path: '/injury-scanner', label: t.nav_injury },
    { id: 'hospitals', path: '/hospitals', label: t.nav_hospitals },
    { id: 'medicines', path: '/medicines', label: t.nav_medicines },
    { id: 'reports', path: '/reports', label: t.nav_reports },
  ]

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="brand-logo-link">
          <div className="brand-logo-icon-wrapper">
            <Activity className="brand-logo-icon" size={26} />
          </div>
          <div className="brand-text-container">
            <span className="brand-name">LifeLine <span className="brand-badge">AI</span></span>
            <span className="brand-subtitle">{t.brand_subtitle}</span>
          </div>
        </Link>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="header-actions">
          {/* Offline Toggle */}
          <button
            type="button"
            className={`offline-toggle-btn ${isOffline ? 'offline-active' : 'online-active'}`}
            onClick={toggleOfflineMode}
            title="Toggle offline RAG mode"
          >
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>{isOffline ? t.offline_mode : t.online_mode}</span>
          </button>

          {/* Language Selector */}
          <div className="language-selector-wrapper">
            <Globe size={16} className="lang-icon" />
            <select
              className="language-dropdown"
              value={activeLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              <option value="EN">English</option>
              <option value="HI">हिंदी (Hindi)</option>
              <option value="TE">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Emergency SOS Button */}
          <button
            type="button"
            className="header-sos-btn"
            onClick={toggleSosModal}
          >
            <ShieldAlert size={18} className="sos-pulse-icon" />
            <span>{t.sos_siren_btn}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
