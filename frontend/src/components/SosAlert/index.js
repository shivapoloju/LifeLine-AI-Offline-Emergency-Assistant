import React, { useState, useEffect, useContext } from 'react'
import { ShieldAlert, Volume2, VolumeX, MapPin, Share2, PhoneCall, X } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const SosAlert = () => {
  const { isSosModalOpen, toggleSosModal, activeLanguage } = useContext(LifeLineContext)
  const [isSirenActive, setIsSirenActive] = useState(false)
  const [locationText, setLocationText] = useState('Fetching GPS coordinates...')
  const [audioCtx, setAudioCtx] = useState(null)

  const t = translations[activeLanguage] || translations.EN

  useEffect(() => {
    if (isSosModalOpen) {
      startSiren()
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            setLocationText(`https://maps.google.com/?q=${lat},${lng}`)
          },
          () => {
            setLocationText('GPS Location: Emergency Zone (Sector 4 Highway)')
          }
        )
      }
    } else {
      stopSiren()
    }

    return () => stopSiren()
  }, [isSosModalOpen])

  const startSiren = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()

      setAudioCtx(ctx)
      setIsSirenActive(true)
    } catch (e) {
      console.log('Audio Context Siren error:', e)
    }
  }

  const stopSiren = () => {
    if (audioCtx) {
      audioCtx.close()
      setAudioCtx(null)
    }
    setIsSirenActive(false)
  }

  if (!isSosModalOpen) return null

  const shareText = encodeURIComponent(`EMERGENCY SOS! Medical Assistance Required: ${locationText}`)
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`
  const smsUrl = `sms:?body=${shareText}`

  return (
    <div className="sos-modal-overlay">
      <div className="sos-modal-content">
        <button type="button" className="sos-close-btn" onClick={toggleSosModal}>
          <X size={24} />
        </button>

        <div className="sos-header">
          <ShieldAlert size={64} className="sos-pulse-icon" />
          <h1 className="sos-title">{t.sos_modal_title}</h1>
          <p className="sos-subtitle">{t.sos_modal_subtitle}</p>
        </div>

        <div className="siren-control-bar">
          {isSirenActive ? (
            <button type="button" className="siren-toggle-btn siren-on" onClick={stopSiren}>
              <VolumeX size={20} /> {t.mute_siren}
            </button>
          ) : (
            <button type="button" className="siren-toggle-btn siren-off" onClick={startSiren}>
              <Volume2 size={20} /> {t.sound_siren}
            </button>
          )}
        </div>

        <div className="location-box">
          <MapPin size={20} className="loc-icon" />
          <div>
            <span className="loc-label">{t.gps_broadcast_label}</span>
            <div className="loc-link">{locationText}</div>
          </div>
        </div>

        <div className="sos-actions-grid">
          <a href="tel:108" className="sos-action-btn btn-red">
            <PhoneCall size={20} /> {t.call_108_sos}
          </a>

          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="sos-action-btn btn-green">
            <Share2 size={20} /> {t.broadcast_whatsapp}
          </a>

          <a href={smsUrl} className="sos-action-btn btn-blue">
            <Share2 size={20} /> {t.send_sms}
          </a>
        </div>
      </div>
    </div>
  )
}

export default SosAlert
