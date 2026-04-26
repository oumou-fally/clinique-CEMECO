import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, patientId } = useAuth()

  useEffect(() => {
    console.log('🔒 ProtectedRoute Patient - État actuel:')
    console.log('  - loading:', loading)
    console.log('  - isAuthenticated:', isAuthenticated)
    console.log('  - user:', user)
    console.log('  - patientId:', patientId)
    console.log('  - localStorage.isAuthenticatedPatient:', localStorage.getItem('isAuthenticatedPatient'))
    console.log('  - localStorage.patientId:', localStorage.getItem('patientId'))

    if (isAuthenticated && user) {
      console.log('✅ Le patient est authentifié - Affichage du contenu')
    } else if (!loading) {
      console.log('❌ Le patient n\'est pas authentifié après le chargement')
    }
  }, [isAuthenticated, loading, user, patientId])

  // Pendant le chargement
  if (loading) {
    console.log('⏳ Affichage du spinner de chargement Patient...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre profil patient...</p>
        </div>
      </div>
    )
  }

  // Si authentifié et données chargées, afficher le contenu
  if (isAuthenticated && user && patientId) {
    console.log('✅ Accès autorisé - Affichage du contenu protégé pour le patient:', patientId)
    return children
  }

  // Si pas authentifié, rediriger immédiatement
  console.log('❌ Le patient n\'est pas authentifié - Redirection vers /login')
  return <Navigate to="/login" replace />
}
