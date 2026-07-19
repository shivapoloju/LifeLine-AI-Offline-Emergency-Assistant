import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LifeLineContext from './context/LifeLineContext'
import Header from './components/Header'
import Home from './components/Home'
import SymptomTriage from './components/SymptomTriage'
import VoiceAssistant from './components/VoiceAssistant'
import FirstAidGuide from './components/FirstAidGuide'
import InjuryAnalyzer from './components/InjuryAnalyzer'
import HospitalLocator from './components/HospitalLocator'
import MedicineTracker from './components/MedicineTracker'
import PdfReportGenerator from './components/PdfReportGenerator'
import SosAlert from './components/SosAlert'
import NotFound from './components/NotFound'
import './App.css'

const App = () => {
  const [activeLanguage, setActiveLanguage] = useState('EN')
  const [isOffline, setIsOffline] = useState(false)
  const [triageHistory, setTriageHistory] = useState([])
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [activeReminders, setActiveReminders] = useState([
    { id: 1, name: 'Paracetamol 500mg', time: '08:00', dosage: '1 tablet after breakfast' },
    { id: 2, name: 'ORS Electrolyte Fluid', time: '14:00', dosage: '1 sachet in 1L clean water' }
  ])

  const changeLanguage = (lang) => {
    setActiveLanguage(lang)
  }

  const toggleOfflineMode = () => {
    setIsOffline((prev) => !prev)
  }

  const addTriageRecord = (record) => {
    setTriageHistory((prev) => [...prev, record])
  }

  const toggleSosModal = () => {
    setIsSosModalOpen((prev) => !prev)
  }

  const addReminder = (reminder) => {
    setActiveReminders((prev) => [...prev, reminder])
  }

  return (
    <LifeLineContext.Provider
      value={{
        activeLanguage,
        changeLanguage,
        isOffline,
        toggleOfflineMode,
        triageHistory,
        addTriageRecord,
        isSosModalOpen,
        toggleSosModal,
        activeReminders,
        addReminder
      }}
    >
      <BrowserRouter>
        <div className="app-main-container">
          <Header />
          <main className="app-content-body">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/triage" element={<SymptomTriage />} />
              <Route path="/voice" element={<VoiceAssistant />} />
              <Route path="/first-aid" element={<FirstAidGuide />} />
              <Route path="/injury-scanner" element={<InjuryAnalyzer />} />
              <Route path="/hospitals" element={<HospitalLocator />} />
              <Route path="/medicines" element={<MedicineTracker />} />
              <Route path="/reports" element={<PdfReportGenerator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <SosAlert />
        </div>
      </BrowserRouter>
    </LifeLineContext.Provider>
  )
}

export default App
