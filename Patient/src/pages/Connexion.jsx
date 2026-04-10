import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock } from 'lucide-react'

// Composant de la page de connexion (nom en français pour faciliter la recherche)
export default function Connexion() {
  // États pour gérer les champs du formulaire et les erreurs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Hook d'authentification (login + état de chargement)
  const { login, loading } = useAuth()

  // Navigation après connexion
  const navigate = useNavigate()

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault()

    // Vérification des champs obligatoires
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    // Vérification du format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez entrer un email valide')
      return
    }

    // Appel de la fonction de connexion
    login(email, password)

    // Redirection vers le tableau de bord après un court délai
    setTimeout(() => {
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* En-tête avec logo et titre */}
          <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-16">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <Activity className="w-10 h-10 text-teal-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white text-center">CEMECO</h1>
            <p className="text-teal-100 text-center mt-2 text-sm font-medium">
              Cabinet de Cardiologie
            </p>
            <p className="text-teal-100 text-center mt-1 text-xs font-light">
              Kipé, près de Heroes Coffee - En face de Plaza Diamond
            </p>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Champ Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="patient@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" />
                <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Mot de passe oublié?
              </a>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>



            {/* Lien vers inscription */}
            <div className="text-center pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Pas encore inscrit?{' '}
                <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Créer un compte
                </a>
              </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2024 MedCare - Tous droits réservés
        </p>
      </div>
    </div>
  )
}
