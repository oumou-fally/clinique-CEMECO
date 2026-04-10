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
      // Guinean patient names database
      const guineanPatients = [
        { email: 'patient1@clinic.com', name: 'Aminata Diallo', password: 'patient123' },
        { email: 'patient2@clinic.com', name: 'Fatoumata Bah', password: 'patient456' },
        { email: 'patient3@clinic.com', name: 'Mariama Traoré', password: 'patient789' },
        { email: 'patient@clinic.com', name: 'Mmady Sacko', password: 'patient123' }
      ]
      
      // Validate credentials
      const patient = guineanPatients.find(p => p.email === email && p.password === password)
      
      if (!patient) {
        alert('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }
      
      setUser({
        id: Math.floor(Math.random() * 10000),
        name: patient.name,
        email: email,
        phone: '224 33 849 96 18',
        dateOfBirth: '15/03/1990',
        address: 'Conakry, Guinée',
        insuranceNumber: 'INS-123456789',
        lastConsultedDoctor: null
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
