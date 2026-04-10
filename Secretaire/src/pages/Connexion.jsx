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
  const { connexion, loading } = useAuth()
  const navigate = useNavigate()

  // =========================
  // SOUMISSION DU FORMULAIRE
  // =========================
  const soumettreFormulaire = (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    connexion(email, password)

    setTimeout(() => {
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ========================= */}
        {/* EN-TÊTE / LOGO */}
        {/* ========================= */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-16 rounded-t-3xl shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Activity className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white text-center\">CEMECO</h1>
          <p className="text-emerald-100 text-center mt-2 text-sm font-medium\">
            Excellence en Cardiologie
          </p>
          <p className="text-emerald-100 text-center mt-1 text-xs font-light\">
            Espace Secrétaire
          </p>
        </div>

        {/* ========================= */}
        {/* FORMULAIRE DE CONNEXION */}
        {/* ========================= */}
        <form onSubmit={soumettreFormulaire} className="bg-white px-8 py-8 space-y-6 rounded-b-3xl shadow-xl\">

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium\">
              ⚠️ {error}
            </div>
          )}

          {/* ========================= */}
          {/* CHAMP EMAIL */}
          {/* ========================= */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="secretaire@cemeco.com"
                className="w-full pl-14 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* ========================= */}
          {/* CHAMP MOT DE PASSE */}
          {/* ========================= */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                className="w-full pl-14 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* ========================= */}
          {/* OPTIONS SUPPLÉMENTAIRES */}
          {/* ========================= */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2" />
              <span className="text-sm text-gray-600 font-medium">Se souvenir de moi</span>
            </label>
            <a href="#" className="text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors">
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

        </form>
      </div>
    </div>
  )
}