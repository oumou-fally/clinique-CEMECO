import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock } from 'lucide-react'

// =========================
// FONCTION PRINCIPALE (CONNEXION)
// =========================
export default function Connexion() {

  // =========================
  // ÉTATS DU FORMULAIRE
  // =========================
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // =========================
  // AUTHENTIFICATION ET NAVIGATION
  // =========================
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  // =========================
  // SOUMISSION DU FORMULAIRE
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault()

    // Vérification des champs vides
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

    // Redirection après connexion
    setTimeout(() => {
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ========================= */}
        {/* EN-TÊTE / LOGO */}
        {/* ========================= */}
        <div className="bg-linear-to-r from-teal-600 to-green-600 px-8 py-16">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Activity className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white text-center">MedCare</h1>
          <p className="text-teal-100 text-center mt-3 text-sm font-medium">
            Plateforme de Gestion Médicale - Secrétaire
          </p>
        </div>

        {/* ========================= */}
        {/* FORMULAIRE DE CONNEXION */}
        {/* ========================= */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ========================= */}
          {/* CHAMP EMAIL */}
          {/* ========================= */}
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
                placeholder="secretaire@clinic.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* ========================= */}
          {/* CHAMP MOT DE PASSE */}
          {/* ========================= */}
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* ========================= */}
          {/* OPTIONS SUPPLÉMENTAIRES */}
          {/* ========================= */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4" />
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            <a href="#" className="text-sm text-teal-600 font-medium">
              Mot de passe oublié?
            </a>
          </div>

          {/* ========================= */}
          {/* BOUTON DE CONNEXION */}
          {/* ========================= */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          {/* ========================= */}
          {/* INFORMATIONS DE DÉMONSTRATION */}
          {/* ========================= */}
          <div className="border-t border-gray-200 pt-4 text-center text-xs">
            <p>Email: secretaire@clinic.com</p>
            <p>Mot de passe: secretaire123</p>
          </div>

        </form>
      </div>
    </div>
  )
}