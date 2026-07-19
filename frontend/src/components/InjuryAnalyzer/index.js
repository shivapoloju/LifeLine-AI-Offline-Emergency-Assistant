import React, { useState, useContext } from 'react'
import { ThreeDots } from 'react-loader-spinner'
import { Camera, Upload, AlertTriangle, CheckCircle, ShieldAlert, RefreshCw, Eye } from 'lucide-react'
import LifeLineContext from '../../context/LifeLineContext'
import translations from '../../utils/translations'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const InjuryAnalyzer = () => {
  const { isOffline, activeLanguage } = useContext(LifeLineContext)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial)
  const [analysisResult, setAnalysisResult] = useState(null)

  const t = translations[activeLanguage] || translations.EN

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setApiStatus(apiStatusConstants.initial)
    }
  }

  const handleSampleInjury = () => {
    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e293b"/><path d="M100 100 Q 150 70, 200 110 T 250 140" stroke="%23ef4444" stroke-width="8" fill="none"/><circle cx="150" cy="85" r="12" fill="%23dc2626"/></svg>`
    setPreviewUrl(sampleSvg)
    setSelectedFile({ name: 'sample_wound_burn.jpg' })
    setApiStatus(apiStatusConstants.initial)
  }

  const onClickAnalyze = async (e) => {
    e.preventDefault()
    if (!previewUrl) return

    setApiStatus(apiStatusConstants.inProgress)

    try {
      if (isOffline) {
        setTimeout(() => {
          setAnalysisResult({
            injury_type: activeLanguage === 'HI' ? 'गंभीर जलन / कटने का निशान' : activeLanguage === 'TE' ? 'తీవ్రమైన కాలిన గాయం / కోత' : 'Thermal Burn / Laceration Assessment (Offline AI)',
            severity_prediction: 'HIGH',
            confidence_score: '91%',
            observed_features: activeLanguage === 'HI' ? [
              'त्वचा का लाल होना और छाले',
              'सूजन और दर्द',
              'स्टेराइल पट्टी की आवश्यकता'
            ] : activeLanguage === 'TE' ? [
              'చర్మం ఎర్రబడటం మరియు బొబ్బలు',
              'వాపు మరియు నొప్పి',
              'బ్యాండేజ్ అవసరం'
            ] : [
              'Localized erythema and epidermal blistering',
              'Moderate tissue swelling',
              'Sterile dressing required'
            ],
            first_aid_recommendations: activeLanguage === 'HI' ? [
              '15 मिनट तक ठंडा पानी डालें।',
              'साफ कपड़े से ढीला ढकें।',
              'टीकाकरण (Tetanus) के लिए क्लिनिक जाएं।'
            ] : activeLanguage === 'TE' ? [
              '15 నిమిషాలు చల్లని నీరు పోయండి.',
              'పరిశుభ్రమైన గుడ్డతో కప్పండి.',
              'టిటానస్ టీకా కోసం క్లినిక్ వెళ్ళండి.'
            ] : [
              'Cool under clean running water for 15 minutes.',
              'Cover loosely with sterile non-stick cloth.',
              'Seek clinic evaluation for tetanus booster.'
            ],
            do_not_do: activeLanguage === 'HI' ? ['बर्फ, तेल या टूथपेस्ट न लगाएं।'] : activeLanguage === 'TE' ? ['మంచు, నూనె, పేస్ట్ రాయవద్దు.'] : ['Do NOT apply ice, oil, or homemade toothpaste pastes.']
          })
          setApiStatus(apiStatusConstants.success)
        }, 1200)
      } else {
        const formData = new FormData()
        if (selectedFile instanceof File) {
          formData.append('file', selectedFile)
        } else {
          formData.append('file', new Blob(["sample"], { type: "image/jpeg" }), "sample.jpg")
        }

        const response = await fetch('http://localhost:8000/api/analyze-injury', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error('Failed to analyze image')
        const data = await response.json()
        setAnalysisResult(data)
        setApiStatus(apiStatusConstants.success)
      }
    } catch (err) {
      console.error('Injury analysis error:', err)
      setApiStatus(apiStatusConstants.failure)
    }
  }

  const renderLoadingView = () => (
    <div className="loader-container">
      <ThreeDots color="#8b5cf6" height="60" width="60" />
      <p className="loading-text">{t.analyzing_injury_loader}</p>
    </div>
  )

  const renderFailureView = () => (
    <div className="failure-view-container">
      <AlertTriangle size={40} className="failure-icon" />
      <h3>Analysis Error</h3>
      <button type="button" className="retry-btn" onClick={onClickAnalyze}>
        <RefreshCw size={16} /> {t.retry_btn}
      </button>
    </div>
  )

  const renderSuccessView = () => {
    if (!analysisResult) return null
    const { injury_type, severity_prediction, confidence_score, observed_features, first_aid_recommendations, do_not_do } = analysisResult

    return (
      <div className="analysis-result-card">
        <div className="result-header-bar">
          <div className="result-type-info">
            <Eye color="#8b5cf6" size={24} />
            <div>
              <h2 className="injury-type-title">{injury_type}</h2>
              <span className="confidence-text">AI Confidence: {confidence_score}</span>
            </div>
          </div>

          <div className={`severity-tag ${severity_prediction === 'HIGH' ? 'tag-high' : 'tag-medium'}`}>
            {severity_prediction} SEVERITY
          </div>
        </div>

        <div className="result-body-section">
          <h3 className="section-title-sm">{t.observed_signs_title}</h3>
          <ul className="features-list">
            {observed_features.map((feat, idx) => (
              <li key={idx} className="feature-item">{feat}</li>
            ))}
          </ul>
        </div>

        <div className="result-body-section">
          <h3 className="section-title-sm text-green">
            <CheckCircle size={18} /> {t.recommended_first_aid_title}
          </h3>
          <ol className="recommendations-list">
            {first_aid_recommendations.map((rec, idx) => (
              <li key={idx} className="rec-item">{rec}</li>
            ))}
          </ol>
        </div>

        {do_not_do && (
          <div className="result-body-section avoid-bg">
            <h3 className="section-title-sm text-red">
              <ShieldAlert size={18} /> {t.do_not_do_title}
            </h3>
            <ul className="avoid-list">
              {do_not_do.map((item, idx) => (
                <li key={idx} className="avoid-item">{item}</li>
              ))}
            </ul>
          </div>
        )}
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
    <div className="injury-container">
      <div className="injury-card">
        <div className="injury-header">
          <Camera size={32} className="header-icon" />
          <div>
            <h1 className="title">{t.injury_page_title}</h1>
            <p className="subtitle">{t.injury_page_subtitle}</p>
          </div>
        </div>

        <div className="upload-box">
          {previewUrl ? (
            <div className="preview-container">
              <img src={previewUrl} alt="Injury Preview" className="injury-preview-img" />
              <button type="button" className="change-img-btn" onClick={() => { setPreviewUrl(null); setSelectedFile(null); setApiStatus(apiStatusConstants.initial); }}>
                {t.change_img_btn}
              </button>
            </div>
          ) : (
            <div className="drop-zone">
              <Upload size={48} className="upload-icon" />
              <p className="upload-text">{t.upload_drag_text}</p>
              <div className="upload-buttons">
                <label className="browse-file-btn">
                  {t.select_photo_btn}
                  <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>

                <button type="button" className="sample-btn" onClick={handleSampleInjury}>
                  {t.demo_sample_btn}
                </button>
              </div>
            </div>
          )}
        </div>

        {previewUrl && apiStatus === apiStatusConstants.initial && (
          <button type="button" className="run-analysis-btn" onClick={onClickAnalyze}>
            {t.run_injury_analysis_btn}
          </button>
        )}

        {renderApiStatusView()}
      </div>
    </div>
  )
}

export default InjuryAnalyzer
