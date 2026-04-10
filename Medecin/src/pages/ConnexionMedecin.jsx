import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock, User, ChevronDown } from 'lucide-react'

// Liste des médecins de la clinique
const MEDECINS = [
  { id: 1, nom: 'Professeur Elhadj Yaya Baldé', email: 'elhadj.yaya.balde@clinic.com', password: 'Medecin@123', specialite: 'Cardiologie' },
  { id: 2, nom: 'Docteur Mamadou Bassirou Bah', email: 'mamadou.bassirou.bah@clinic.com', password: 'Medecin@123', specialite: 'Cardiologie' },
  { id: 3, nom: 'Docteur Mamadou Diallo', email: 'mamadou.diallo@clinic.com', password: 'Medecin@123', specialite: 'Cardiologie' },
  { id: 4, nom: 'Docteur Thierno Siradjo Baldé', email: 'thierno.sirardjo.balde@clinic.com', password: 'Medecin@123', specialite: 'Cardiologie' },
  { id: 5, nom: 'Docteur Thierno Boubacar Barry', email: 'thierno.boubacar.barry@clinic.com', password: 'Medecin@123', specialite: 'Cardiologie' }
]

export default function ConnexionMedecin() {
  const [selectedMedecin, setSelectedMedecin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: sélection médecin, 2: connexion
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleMedecinSelect = (medecinId) => {
    const medecin = MEDECINS.find(m => m.id === medecinId)
    if (medecin) {
      setSelectedMedecin(medecinId)
      setEmail(medecin.email)
      setStep(2)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Tous les champs sont obligatoires')
      return
    }

    const medecin = MEDECINS.find(m => m.id === selectedMedecin)
    if (!medecin) {
      setError('Médecin non trouvé')
      return
    }

    if (email !== medecin.email || password !== medecin.password) {
      setError('Email ou mot de passe incorrect')
      return
    }

    // Connexion réussie
    login(email, password)

    // Redirection vers le tableau de bord
    setTimeout(() => {
      navigate('/dashboard')
    }, 600)
  }

  const handleBack = () => {
    setStep(1)
    setSelectedMedecin('')
    setEmail('')
    setPassword('')
    setError('')
  }

  if (step === 1) {
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
                Sélectionnez votre nom dans la liste
              </p>
            </div>

            <div className="px-8 py-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choisissez votre nom :
                  </label>
                  <div className="space-y-3">
                    {MEDECINS.map((medecin) => (
                      <button
                        key={medecin.id}
                        onClick={() => handleMedecinSelect(medecin.id)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{medecin.nom}</p>
                            <p className="text-sm text-gray-600">{medecin.specialite}</p>
                          </div>
                          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-4xl font-bold text-white text-center">Connexion</h1>
            <p className="text-teal-100 text-center mt-3 text-sm font-medium">
              {MEDECINS.find(m => m.id === selectedMedecin)?.nom}
            </p>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    placeholder="votre.email@clinic.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    placeholder="Votre mot de passe"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors duration-200"
              >
                ← Retour à la sélection
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
