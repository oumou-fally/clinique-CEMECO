import { createContext, useState, useContext } from 'react'

const AuthContext = createContext(null)

// Administrateurs autorisés de la clinique
const ADMINS = [
  {
    id: 1,
    name: 'Professeur Elhadj Yaya Baldé',
    email: 'elhadj.balde@clinic.com',
    password: 'Admin@123',
    role: 'admin',
    clinic: 'Clinique Santé Plus'
  },
  {
    id: 2,
    name: 'Docteur Mamadou Bassirou Bah',
    email: 'mamadou.bah@clinic.com',
    password: 'Admin@123',
    role: 'admin',
    clinic: 'Clinique Santé Plus'
  }
]

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = (email, password) => {
    setLoading(true)
    setError(null)
    
    // Simulation d'une requête API
    setTimeout(() => {
      const admin = ADMINS.find(a => a.email === email && a.password === password)
      
      if (admin) {
        setIsAuthenticated(true)
        setUser({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          clinic: admin.clinic
        })
      } else {
        setError('Email ou mot de passe incorrect')
      }
      setLoading(false)
    }, 500)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, error, login, logout }}>
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
