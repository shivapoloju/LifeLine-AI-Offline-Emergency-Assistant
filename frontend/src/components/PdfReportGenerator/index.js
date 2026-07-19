import React, { useState, useContext } from 'react'
import { FileText, Download, Clock } from 'lucide-react'
import { jsPDF } from 'jspdf'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const PdfReportGenerator = () => {
  const { triageHistory, activeLanguage } = useContext(LifeLineContext)
  const [patientName, setPatientName] = useState('Emergency Patient')
  const [patientAge, setPatientAge] = useState('45')
  const [vitalsBp, setVitalsBp] = useState('140/90 mmHg')
  const [vitalsPulse, setVitalsPulse] = useState('105 BPM')
  const [vitalsSpo2, setVitalsSpo2] = useState('94%')

  const t = translations[activeLanguage] || translations.EN

  const latestRecord = triageHistory.length > 0 ? triageHistory[triageHistory.length - 1] : {
    title: activeLanguage === 'HI' ? 'सीने में दर्द और सांस की तकलीफ की ट्राइएज रिपोर्ट' : activeLanguage === 'TE' ? 'ఛాతీ నొప్పి మరియు శ్వాస ఇబ్బంది తనిఖీ నివేదిక' : 'Chest Pain & Shortness of Breath Emergency Triage',
    severity: 'CRITICAL',
    symptoms: activeLanguage === 'HI' ? 'मरीज को सीने में तेज जकड़न, पसीना और सांस लेने में कठिनाई है।' : activeLanguage === 'TE' ? 'రోగికి తీవ్రమైన ఛాతీ నొప్పి, చెమటలు మరియు శ్వాస ఇబ్బంది ఉంది.' : 'Patient experiencing severe chest tightness radiating to left arm with cold sweat.',
    first_aid_steps: [
      'Call 108 Emergency Ambulance service.',
      'Loosen tight clothing around neck and chest.',
      'Prepared CPR protocol if unconsciousness occurs.'
    ],
    medicines_to_avoid: [
      'Do NOT administer Aspirin if Dengue/Gastrointestinal Bleeding is suspected.'
    ]
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleString()

    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 210, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text("LIFELINE AI - EMERGENCY MEDICAL REPORT", 15, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${now} | Language: ${activeLanguage}`, 15, 28)

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("PATIENT IDENTIFICATION & VITALS", 15, 48)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Patient Name: ${patientName}`, 15, 56)
    doc.text(`Age: ${patientAge} Yrs`, 110, 56)
    doc.text(`Blood Pressure: ${vitalsBp}`, 15, 63)
    doc.text(`Heart Pulse: ${vitalsPulse}`, 110, 63)
    doc.text(`SpO2 Oxygen: ${vitalsSpo2}`, 15, 70)

    doc.setFillColor(239, 68, 68)
    doc.rect(15, 78, 180, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`SEVERITY LEVEL: ${latestRecord.severity}`, 20, 88)
    doc.setFontSize(10)
    doc.text(`Assessment: ${latestRecord.title}`, 20, 94)

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("REPORTED SYMPTOMS", 15, 110)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`"${latestRecord.symptoms}"`, 15, 118)

    doc.setFont("helvetica", "bold")
    doc.text("INITIAL FIRST-AID EXECUTED", 15, 132)
    doc.setFont("helvetica", "normal")
    let yPos = 140
    latestRecord.first_aid_steps.forEach((step, idx) => {
      doc.text(`${idx + 1}. ${step}`, 15, yPos)
      yPos += 7
    })

    doc.save(`LifeLine_Emergency_Report_${Date.now()}.pdf`)
  }

  return (
    <div className="pdf-container">
      <div className="pdf-card">
        <div className="pdf-header">
          <FileText size={32} className="header-icon" />
          <div>
            <h1 className="title">{t.pdf_page_title}</h1>
            <p className="subtitle">{t.pdf_page_subtitle}</p>
          </div>
        </div>

        <div className="pdf-form">
          <h2 className="section-title">{t.patient_vitals_heading}</h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="label">{t.patient_name_label}</label>
              <input
                type="text"
                className="input"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">{t.age_label}</label>
              <input
                type="text"
                className="input"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">{t.bp_label}</label>
              <input
                type="text"
                className="input"
                value={vitalsBp}
                onChange={(e) => setVitalsBp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">{t.pulse_label}</label>
              <input
                type="text"
                className="input"
                value={vitalsPulse}
                onChange={(e) => setVitalsPulse(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">{t.spo2_label}</label>
              <input
                type="text"
                className="input"
                value={vitalsSpo2}
                onChange={(e) => setVitalsSpo2(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="report-preview-box">
          <div className="preview-header">
            <span className="badge-critical">{latestRecord.severity} SEVERITY REPORT</span>
            <span className="timestamp-text"><Clock size={14} /> Language: {activeLanguage}</span>
          </div>

          <h3 className="preview-title">{latestRecord.title}</h3>
          <p className="preview-symptoms">"{latestRecord.symptoms}"</p>

          <button type="button" className="download-pdf-btn" onClick={generatePDF}>
            <Download size={20} /> {t.generate_pdf_btn}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PdfReportGenerator
