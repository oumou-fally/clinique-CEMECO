import { createContext, useState, useContext, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [secretaireId, setSecretaireId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour charger les données depuis localStorage
  const loadFromStorage = useCallback(() => {
    console.log('🔄 Chargement des données secrétaire depuis localStorage...')
    const storedSecretaire = localStorage.getItem('secretaire')
    const storedAuth = localStorage.getItem('isAuthenticatedSecretaire')
    const storedId = localStorage.getItem('secretaireId')

    console.log('📂 localStorage.secretaire:', storedSecretaire)
    console.log('📂 localStorage.secretaireId:', storedId)
    console.log('📂 localStorage.isAuthenticatedSecretaire:', storedAuth)

    if (storedAuth === 'true' && storedSecretaire) {
      try {
        const secretaireData = JSON.parse(storedSecretaire)
        console.log('✅ Données de la secrétaire restaurées:', secretaireData)
        setUser(secretaireData)
        setSecretaireId(storedId || secretaireData.id)
        setIsAuthenticated(true)
        console.log('✅ État d\'authentification secrétaire restauré - ID:', storedId)
        setLoading(false)
        return true
      } catch (error) {
        console.error('❌ Erreur lors du parsing JSON:', error)
        localStorage.clear()
        setIsAuthenticated(false)
        setUser(null)
        setSecretaireId(null)
        setLoading(false)
        return false
      }
    } else {
      console.log('⚠️ Pas de données d\'authentification secrétaire trouvées')
      setIsAuthenticated(false)
      setUser(null)
      setSecretaireId(null)
      setLoading(false)
      return false
    }
  }, [])

  // Charger au montage du composant
  useEffect(() => {
    console.log('🚀 AuthProvider Secrétaire montée - Chargement initial...')
    loadFromStorage()
  }, [loadFromStorage])

  // Écouter les changements de localStorage en temps réel
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📢 Changement détecté dans localStorage Secrétaire - Rechargement...')
      loadFromStorage()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadFromStorage])

  // Fonction de connexion qui appelle le backend
  const connexion = async (email, password) => {
    console.log('🔐 Fonction connexion secrétaire appelée avec email:', email)
    setLoading(true)

    try {
      console.log('📡 Envoi de la requête au backend...')
      const response = await fetch('http://localhost:3000/api/secretaire/login-secretaire', {
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
      console.log('✅ Connexion secrétaire réussie!')
      console.log('👤 Données de la secrétaire:', data.secretaire)

      // Stocker les données dans localStorage
      const secretaireData = {
        id: data.secretaire.id,
        nom: data.secretaire.nom,
        prenom: data.secretaire.prenom,
        email: data.secretaire.email,
        nomComplet: data.secretaire.nomComplet
      }

      localStorage.setItem('secretaire', JSON.stringify(secretaireData))
      localStorage.setItem('secretaireId', String(data.secretaire.id))
      localStorage.setItem('isAuthenticatedSecretaire', 'true')

      console.log('💾 Données stockées dans localStorage:')
      console.log('  - secretaire:', JSON.parse(localStorage.getItem('secretaire')))
      console.log('  - secretaireId:', localStorage.getItem('secretaireId'))

      // Mettre à jour l'état
      setUser(secretaireData)
      setSecretaireId(String(data.secretaire.id))
      setIsAuthenticated(true)

      console.log('✨ État secrétaire mis à jour')

      setLoading(false)
      return {
        success: true,
        message: 'Connexion réussie',
        secretaire: secretaireData
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

  const deconnexion = () => {
    console.log('🚪 Déconnexion de la secrétaire ID:', secretaireId)
    setIsAuthenticated(false)
    setUser(null)
    setSecretaireId(null)
    localStorage.removeItem('secretaire')
    localStorage.removeItem('secretaireId')
    localStorage.removeItem('isAuthenticatedSecretaire')
    console.log('✅ Données de connexion secrétaire supprimées')
  }

  const value = {
    isAuthenticated,
    user,
    secretaireId,
    loading,
    connexion,
    deconnexion,
    loadFromStorage
  }

  console.log('🔄 État AuthContext Secrétaire:', value)

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
