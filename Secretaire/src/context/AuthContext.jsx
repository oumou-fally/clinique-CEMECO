import { createContext, useState, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const connexion = (email, password) => {
    setLoading(true)
    setTimeout(() => {
      setIsAuthenticated(true)
      setUser({
        id: Math.floor(Math.random() * 10000),
        name: 'Baldé Aissatou',
        email,
        phone: '06 12 34 56 78',
        department: 'Secrétariat Médical',
        permissions: ['manage_appointments', 'manage_doctors', 'manage_facturation']
      })
      setLoading(false)
    }, 500)
  }

  const deconnexion = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, connexion, deconnexion }}>
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
