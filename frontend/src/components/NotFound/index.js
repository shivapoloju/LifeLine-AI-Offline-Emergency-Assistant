import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const NotFound = () => {
  const { activeLanguage } = useContext(LifeLineContext)
  const t = translations[activeLanguage] || translations.EN

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <AlertTriangle size={64} className="not-found-icon" />
        <h1 className="not-found-heading">{t.page_not_found}</h1>
        <p className="not-found-description">{t.page_not_found_desc}</p>
        <Link to="/" className="home-link-btn">
          <Home size={18} /> {t.back_to_home}
        </Link>
      </div>
    </div>
  )
}

export default NotFound
