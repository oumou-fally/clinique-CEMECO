import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock } from 'lucide-react'

// Nouveau nom de la fonction : ConnexionMedecin
export default function ConnexionMedecin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Tous les champs sont obligatoires pour accéder à votre espace médecin')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format d\'email invalide. Veuillez vérifier votre adresse')
      return
    }

    // Tentative de connexion
    login(email, password)

    // Redirection vers le tableau de bord patient
    setTimeout(() => {
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-16">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <Activity className="w-10 h-10 text-teal-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white text-center">Espace Médecin</h1>
            <p className="text-teal-100 text-center mt-3 text-sm font-medium">
              Connectez-vous pour accéder à votre tableau de bord médical
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse Email du médecin
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="medecin@clinique.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe sécurisé
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Entrez votre mot de passe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" />
                <span className="ml-2 text-sm text-gray-600">Rester connecté</span>
              </label>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours...' : 'Accéder à mon espace médecin'}
            </button>

            {/* Infos de démonstration */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <p className="text-xs text-gray-600 text-center font-semibold mb-2">
                Compte de démonstration (médecin) :
              </p>
              <p className="text-xs text-center">
                <span className="text-gray-600">Email :</span>{' '}
                <span className="font-mono text-gray-700 text-teal-600">patient@clinic.com</span>
              </p>
              <p className="text-xs text-center">
                <span className="text-gray-600">Mot de passe :</span>{' '}
                <span className="font-mono text-gray-700 text-teal-600">patient123</span>
              </p>
            </div>

            {/* Inscription */}
            <div className="text-center pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Nouveau médecin ?{' '}
                <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Créer un compte médecin
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Pied de page */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2026 MedCare - Plateforme de gestion médicale intelligente
        </p>
      </div>
    </div>
  )
}
