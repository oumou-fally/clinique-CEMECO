import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock } from 'lucide-react'


export default function ConnexionMedecin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  // 🔥 LOGIN BACKEND (BASE DE DONNÉES)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Tous les champs sont obligatoires')
      setLoading(false)
      return
    }

    try {
      const result = await login(email, password)
      
      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError(result.message || 'Erreur de connexion')
      }
    } catch (error) {
      setError('Erreur technique')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-16 text-center">
          <div className="bg-white p-4 rounded-full inline-block mb-4">
            <Activity className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-white">Cabinet de Cardiologie</h1>
          <p className="text-teal-100 text-xs mt-1">Connexion Médecin</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-3 pl-10 rounded-lg"
                placeholder="Entrez votre email"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3 pl-10 rounded-lg"
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

        </form>

      </div>
    </div>
  )
}