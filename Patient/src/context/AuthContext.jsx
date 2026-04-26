import { createContext, useState, useContext, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour charger les données depuis localStorage
  const loadFromStorage = useCallback(() => {
    console.log('🔄 Chargement des données patient depuis localStorage...')
    const storedPatient = localStorage.getItem('patient')
    const storedAuth = localStorage.getItem('isAuthenticatedPatient')
    const storedId = localStorage.getItem('patientId')

    console.log('📂 localStorage.patient:', storedPatient)
    console.log('📂 localStorage.patientId:', storedId)
    console.log('📂 localStorage.isAuthenticatedPatient:', storedAuth)

    if (storedAuth === 'true' && storedPatient) {
      try {
        const patientData = JSON.parse(storedPatient)
        console.log('✅ Données du patient restaurées:', patientData)
        setUser(patientData)
        setPatientId(storedId || patientData.id)
        setIsAuthenticated(true)
        console.log('✅ État d\'authentification patient restauré - ID:', storedId)
        setLoading(false)
        return true
      } catch (error) {
        console.error('❌ Erreur lors du parsing JSON:', error)
        localStorage.clear()
        setIsAuthenticated(false)
        setUser(null)
        setPatientId(null)
        setLoading(false)
        return false
      }
    } else {
      console.log('⚠️ Pas de données d\'authentification patient trouvées')
      setIsAuthenticated(false)
      setUser(null)
      setPatientId(null)
      setLoading(false)
      return false
    }
  }, [])

  // Charger au montage du composant
  useEffect(() => {
    console.log('🚀 AuthProvider Patient montée - Chargement initial...')
    loadFromStorage()
  }, [loadFromStorage])

  // Écouter les changements de localStorage en temps réel
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📢 Changement détecté dans localStorage Patient - Rechargement...')
      loadFromStorage()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadFromStorage])

  // Fonction de connexion qui appelle le backend
  const login = async (email, password) => {
    console.log('🔐 Fonction login patient appelée avec email:', email)
    setLoading(true)

    try {
      console.log('📡 Envoi de la requête au backend...')
      const response = await fetch('http://localhost:3000/api/patient/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('📨 Réponse du backend reçue:', data)

      if (!data.success) {
        console.error('❌ Erreur de connexion:', data.message)
        setLoading(false)
        return {
          success: false,
          message: data.message
        }
      }

      // Connexion réussie
      console.log('✅ Connexion patient réussie!')
      console.log('👤 Données du patient:', data.patient)

      // Stocker les données dans localStorage
      const patientData = {
        id: data.patient.id,
        nom: data.patient.nom,
        prenom: data.patient.prenom,
        email: data.patient.email,
        nomComplet: data.patient.nomComplet
      }

      localStorage.setItem('patient', JSON.stringify(patientData))
      localStorage.setItem('patientId', String(data.patient.id))
      localStorage.setItem('isAuthenticatedPatient', 'true')

      console.log('💾 Données stockées dans localStorage:')
      console.log('  - patient:', JSON.parse(localStorage.getItem('patient')))
      console.log('  - patientId:', localStorage.getItem('patientId'))

      // Mettre à jour l'état
      setUser(patientData)
      setPatientId(String(data.patient.id))
      setIsAuthenticated(true)

      console.log('✨ État patient mis à jour')

      setLoading(false)
      return {
        success: true,
        message: 'Connexion réussie',
        patient: patientData
      }

    } catch (error) {
      console.error('🔴 Erreur serveur:', error)
      setLoading(false)
      return {
        success: false,
        message: 'Erreur serveur'
      }
    }
  }

  const logout = () => {
    console.log('🚪 Déconnexion du patient ID:', patientId)
    setIsAuthenticated(false)
    setUser(null)
    setPatientId(null)
    localStorage.removeItem('patient')
    localStorage.removeItem('patientId')
    localStorage.removeItem('isAuthenticatedPatient')
    console.log('✅ Données de connexion patient supprimées')
  }

  const value = {
    isAuthenticated,
    user,
    patientId,
    loading,
    login,
    logout,
    loadFromStorage
  }

  console.log('🔄 État AuthContext Patient:', value)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
