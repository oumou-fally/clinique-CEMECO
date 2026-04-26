import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, medecinId } = useAuth()

  useEffect(() => {
    console.log('🔒 ProtectedRoute - État actuel:')
    console.log('  - loading:', loading)
    console.log('  - isAuthenticated:', isAuthenticated)
    console.log('  - user:', user)
    console.log('  - medecinId:', medecinId)
    console.log('  - localStorage.isAuthenticated:', localStorage.getItem('isAuthenticated'))
    console.log('  - localStorage.medecinId:', localStorage.getItem('medecinId'))

    if (isAuthenticated && user) {
      console.log('✅ L\'utilisateur est authentifié - Affichage du contenu')
    } else if (!loading) {
      console.log('❌ L\'utilisateur n\'est pas authentifié après le chargement')
    }
  }, [isAuthenticated, loading, user, medecinId])

  // Pendant le chargement
  if (loading) {
    console.log('⏳ Affichage du spinner de chargement...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  // Si authentifié et données chargées, afficher le contenu
  if (isAuthenticated && user && medecinId) {
    console.log('✅ Accès autorisé - Affichage du contenu protégé pour le médecin:', medecinId)
    return children
  }

  // Si pas authentifié, rediriger immédiatement
  console.log('❌ L\'utilisateur n\'est pas authentifié - Redirection vers /login')
  return <Navigate to="/login" replace />
}
