import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Vérifier la session au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user')
    const storedToken = localStorage.getItem('admin_token')

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error)
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_token')
      }
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        const userData = data.admin

        // Stocker dans localStorage
        localStorage.setItem('admin_user', JSON.stringify(userData))
        localStorage.setItem('admin_token', 'admin_logged_in') // Token simple pour cet exemple

        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setError(data.message || 'Erreur de connexion')
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      setError('Erreur de réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Supprimer du localStorage
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')

    setIsAuthenticated(false)
    setUser(null)
    setError(null)
  }

  // Fonction pour récupérer l'ID de l'administrateur connecté
  const getAdminId = () => {
    return user?.id || null
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      error,
      login,
      logout,
      getAdminId
    }}>
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
