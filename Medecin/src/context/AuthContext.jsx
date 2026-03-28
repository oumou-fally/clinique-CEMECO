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
        id: Math.floor(Math.random() * 10000),
        name: 'Dr. Sophie Martin',
        email: email,
        phone: '06 12 34 56 78',
        specialty: 'Médecin Généraliste',
        specialtyId: 'MG001',
        medicalLicense: 'LIC-2024-0001',
        clinic: 'Clinique Santé Plus',
        address: '123 Avenue de la Santé, 75000 Paris'
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
