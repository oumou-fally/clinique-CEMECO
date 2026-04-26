import { createContext, useState, useContext, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [medecinId, setMedecinId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour charger les données depuis localStorage
  const loadFromStorage = useCallback(() => {
    console.log('🔄 Chargement des données depuis localStorage...')
    const storedMedecin = localStorage.getItem('medecin')
    const storedAuth = localStorage.getItem('isAuthenticated')
    const storedId = localStorage.getItem('medecinId')

    console.log('📂 localStorage.medecin:', storedMedecin)
    console.log('📂 localStorage.medecinId:', storedId)
    console.log('📂 localStorage.isAuthenticated:', storedAuth)

    if (storedAuth === 'true' && storedMedecin) {
      try {
        const medecinData = JSON.parse(storedMedecin)
        console.log('✅ Données du médecin restaurées:', medecinData)
        setUser(medecinData)
        setMedecinId(storedId || medecinData.id)
        setIsAuthenticated(true)
        console.log('✅ État d\'authentification restauré - ID:', storedId)
        setLoading(false)
        return true
      } catch (error) {
        console.error('❌ Erreur lors du parsing JSON:', error)
        localStorage.clear()
        setIsAuthenticated(false)
        setUser(null)
        setMedecinId(null)
        setLoading(false)
        return false
      }
    } else {
      console.log('⚠️ Pas de données d\'authentification trouvées')
      setIsAuthenticated(false)
      setUser(null)
      setMedecinId(null)
      setLoading(false)
      return false
    }
  }, [])

  // Charger au montage du composant
  useEffect(() => {
    console.log('🚀 AuthProvider montée - Chargement initial...')
    loadFromStorage()
  }, [loadFromStorage])

  // Écouter les changements de localStorage en temps réel
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📢 Changement détecté dans localStorage - Rechargement...')
      loadFromStorage()
    }

    // Écouter l'événement 'storage' (pour les autres onglets)
    window.addEventListener('storage', handleStorageChange)
    
    // Écouter l'événement personnalisé 'storage' (déclenché manuellement dans la même page)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadFromStorage])

  const login = async (email, password) => {
    console.log('🔐 Fonction login appelée avec email:', email)
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/medecin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        const medecinData = {
          id: data.medecin.id,
          nom: data.medecin.nom,
          prenom: data.medecin.prenom,
          email: data.medecin.email,
          nomComplet: data.medecin.nomComplet
        }
        
        localStorage.setItem('medecin', JSON.stringify(medecinData))
        localStorage.setItem('medecinId', String(data.medecin.id))
        localStorage.setItem('isAuthenticated', 'true')

        setUser(medecinData)
        setMedecinId(String(data.medecin.id))
        setIsAuthenticated(true)
        
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('🔴 Erreur serveur:', error)
      return { success: false, message: 'Erreur serveur' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('🚪 Déconnexion de l\'utilisateur ID:', medecinId)
    setIsAuthenticated(false)
    setUser(null)
    setMedecinId(null)
    localStorage.removeItem('medecin')
    localStorage.removeItem('medecinId')
    localStorage.removeItem('isAuthenticated')
    console.log('✅ Données de connexion supprimées')
  }

  const value = {
    isAuthenticated,
    user,
    medecinId,
    loading,
    login,
    logout,
    loadFromStorage
  }

  console.log('🔄 État AuthContext:', value)

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
