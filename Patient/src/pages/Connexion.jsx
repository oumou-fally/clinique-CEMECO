import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock } from 'lucide-react'

// Composant de la page de connexion
export default function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    console.log('📝 Tentative de connexion avec email:', email)

    if (!email || !password) {
      console.warn('⚠️ Champs manquants')
      setError('Veuillez remplir tous les champs')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn('⚠️ Email invalide')
      setError('Veuillez entrer un email valide')
      return
    }

    try {
      console.log('🔐 Appel de la fonction login...')
      const res = await login(email.trim(), password.trim())

      console.log('📨 Réponse login:', res)

      // ❌ STOP STRICT
      if (!res || res.success !== true) {
        console.error('❌ Erreur de connexion:', res?.message)
        setError(res?.message || 'Email ou mot de passe incorrect')
        return
      }

      // Vérifier localStorage
      console.log('📂 Vérification du localStorage après connexion:')
      console.log('  - patient:', localStorage.getItem('patient'))
      console.log('  - patientId:', localStorage.getItem('patientId'))
      console.log('  - isAuthenticatedPatient:', localStorage.getItem('isAuthenticatedPatient'))

      console.log('🚀 Redirection immédiate vers /dashboard')

      // Redirection immédiate sans délai
      navigate('/dashboard', { replace: true })
      console.log('✨ Redirection effectuée')

    } catch (err) {
      console.error('🔴 Erreur:', err)
      setError('Erreur serveur')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

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

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}