import React from 'react'

const LifeLineContext = React.createContext({
  activeLanguage: 'EN',
  changeLanguage: () => {},
  isOffline: false,
  toggleOfflineMode: () => {},
  triageHistory: [],
  addTriageRecord: () => {},
  isSosModalOpen: false,
  toggleSosModal: () => {},
  activeReminders: [],
  addReminder: () => {},
})

export default LifeLineContext
