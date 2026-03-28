import { createContext, useState, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = (email, password) => {
    setLoading(true)
    // Simulation d'une requête API
    setTimeout(() => {
      setIsAuthenticated(true)
      setUser({
        id: 1,
        name: 'Dr. Admin',
        email: email,
        role: 'admin',
        clinic: 'Clinique Santé Plus'
      })
      setLoading(false)
    }, 500)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
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
