import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock, User, Phone, Calendar, Heart, ArrowRight, UserPlus, LogIn, ChevronRight, CheckCircle2, MapPin } from 'lucide-react'

export default function Connexion() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    sexe: '',
    date_naissance: '',
    commune: '',
    quartier: ''
  })
  const [error, setError] = useState('')

  const { login, register, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Nettoyer l'état après 5 secondes
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        // Mode Connexion
        if (!formData.email || !formData.password) {
          setError('Veuillez remplir tous les champs de connexion')
          return
        }
        const res = await login(formData.email.trim(), formData.password.trim())
        if (res && res.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(res?.message || 'Identifiants incorrects')
        }
      } else {
        // Mode Inscription
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
          setError('Veuillez remplir les champs obligatoires (*)')
          return
        }
        const res = await register(formData)
        if (res && res.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(res?.message || 'Erreur lors de la création du compte')
        }
      }
    } catch (err) {
      console.error('🔴 Erreur Auth:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4">
      {/* Overlay pour le fond */}
      <div className="absolute inset-0 bg-linear-to-br from-teal-900/80 via-blue-900/70 to-emerald-900/80 backdrop-blur-sm"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 relative z-10">
        
        {/* Partie Gauche : Branding/Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-teal-600/40 to-emerald-600/40 text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                <Activity className="w-8 h-8 text-teal-600" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">Cabinet de Cardiologie</h1>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Votre santé,<br />
              <span className="text-teal-300">notre priorité.</span>
            </h2>
            <p className="text-teal-50 text-lg max-w-md font-medium opacity-90 leading-relaxed">
              Accédez à vos rendez-vous, consultez vos dossiers médicaux et communiquez avec vos médecins en toute sécurité.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
              <div className="p-2 bg-teal-400/20 rounded-lg">
                <Heart className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <p className="font-bold">Expertise en Cardiologie</p>
                <p className="text-sm text-teal-100">Des soins spécialisés pour votre cœur.</p>
              </div>
            </div>
            <div className="text-sm text-teal-200/80 mt-2 space-y-1">
              <p>📍 siege: CEMECO KIPE BP: 1384 CONAKRY REPUBLIQUE GUINEE</p>
              <p>📞 secretaire: tel 612 80 00 08</p>
            </div>
          </div>
        </div>

        {/* Partie Droite : Formulaire */}
        <div className="bg-white p-8 lg:p-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900">
                {isLogin ? 'Bon retour !' : 'Nouveau patient'}
              </h3>
              <p className="text-gray-500 font-medium">
                {isLogin ? 'Connectez-vous à votre espace' : 'Créez votre compte médical'}
              </p>
            </div>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-teal-600 font-bold text-sm hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              {isLogin ? 'S\'inscrire' : 'Se connecter'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            <div className={isLogin ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              
              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Prénom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        name="prenom"
                        placeholder=""
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Nom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        name="nom"
                        placeholder=""
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={`space-y-1 ${!isLogin ? 'md:col-span-2' : ''}`}>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Adresse Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder=""
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        name="telephone"
                        placeholder=""
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Date de Naissance</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="date_naissance"
                        value={formData.date_naissance}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Nouveaux champs : Commune & Quartier */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Commune</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        name="commune"
                        placeholder=""
                        value={formData.commune}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Quartier</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        name="quartier"
                        placeholder=""
                        value={formData.quartier}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Sexe</label>
                    <div className="flex gap-4">
                      {['M', 'F'].map(s => (
                        <label key={s} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition ${formData.sexe === s ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                          <input
                            type="radio"
                            name="sexe"
                            value={s}
                            checked={formData.sexe === s}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          {s === 'M' ? 'Masculin' : 'Féminin'}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className={`space-y-1 ${!isLogin ? 'md:col-span-2' : ''}`}>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder=""
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                  />
                </div>
                {isLogin && (
                  <div className="flex justify-end mt-1">
                    <Link 
                      to="/forgot-password" 
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-teal-600 to-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-100 hover:shadow-teal-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Se connecter' : 'Créer mon compte'}
                </>
              )}
            </button>

            {isLogin && (
              <div className="text-center mt-6">
                <p className="text-gray-400 font-medium text-sm">
                  Pas encore de compte ?{' '}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    Créez-en un ici
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Styles additionnels pour l'animation de secousse */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}} />
    </div>
  )
}