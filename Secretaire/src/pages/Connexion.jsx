import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)

  const navigate = useNavigate()
  const { connexion, isAuthenticated } = useAuth()

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
    
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, isAuthenticated])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const soumettreFormulaire = async (e) => {
    e.preventDefault()
    
    if (attempts >= 5 && !blocked) {
      setBlocked(true)
      setError('Trop de tentatives. Veuillez réessayer dans 5 minutes.')
      setTimeout(() => {
        setBlocked(false)
        setAttempts(0)
      }, 300000)
      return
    }

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email')
      return
    }

    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe')
      return
    }

    if (!isValidEmail(email)) {
      setError('Email invalide (ex: nom@domaine.com)')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await connexion(email.trim().toLowerCase(), password.trim())

      if (result.success) {
        setAttempts(0)
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email.trim().toLowerCase())
        } else {
          localStorage.removeItem('rememberedEmail')
        }
        
        setSuccess('✅ Connexion réussie ! Redirection...')
        
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 1000)
      } else {
        setAttempts(prev => prev + 1)
        setError(result.message || 'Erreur de connexion')
      }

    } catch (err) {
      console.error('Erreur:', err)
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-700 px-6 pt-10 pb-12 rounded-t-3xl shadow-2xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-400/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-2.5 rounded-xl shadow-xl transform transition-all duration-500 hover:scale-110 hover:rotate-6 group">
                <Activity className="w-8 h-8 text-emerald-600 group-hover:text-teal-600 transition-colors" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none">
                  Cabinet de cardiologie
                </h1>
                <div className="h-1 w-full bg-emerald-400 rounded-full mt-1 opacity-50"></div>
              </div>
            </div>
            
            <p className="text-emerald-50 text-center text-xs font-semibold tracking-wide uppercase opacity-90">
              Centre Médical d'Excellence
            </p>
            <p className="text-teal-100/80 text-center text-[10px] font-medium mt-1">
              siege: CEMECO KIPE BP: 1384 CONAKRY REPUBLIQUE GUINEE
            </p>
            <p className="text-teal-100/80 text-center text-[10px] font-medium mt-1">
              secretaire: tel 612 80 00 08
            </p>

            <div className="mt-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-xl shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Espace Sécurisé • Secrétariat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={soumettreFormulaire} className="bg-white px-6 py-6 space-y-4 rounded-b-3xl shadow-2xl">
          {success && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-3 py-2 rounded-r-lg text-sm font-medium flex items-center gap-2 animate-slideDown">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-3 py-2 rounded-r-lg text-sm font-medium flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {attempts > 0 && attempts < 5 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs text-center">
              ⚠️ Tentative {attempts}/5 - Après 5 essais, compte bloqué 5 minutes
            </div>
          )}

          <div className="space-y-1 group">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 ml-1 mb-1 transition-colors group-focus-within:text-emerald-600">
              <div className="p-1 bg-emerald-50 rounded-md group-focus-within:bg-emerald-100 transition-colors">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Adresse Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading || blocked}
                placeholder=""
                autoComplete="email"
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1 group">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 ml-1 mb-1 transition-colors group-focus-within:text-emerald-600">
              <div className="p-1 bg-emerald-50 rounded-md group-focus-within:bg-emerald-100 transition-colors">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={loading || blocked}
                placeholder=""
                autoComplete="current-password"
                className="w-full px-4 pr-10 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-3.5 h-3.5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">Se souvenir de moi</span>
            </label>
            <button
              type="button"
              onClick={() => navigate('/mot-de-passe-oublie')}
              className="text-xs text-emerald-600 font-medium hover:text-emerald-700 transition-colors hover:underline"
            >
              Mot de passe oublié?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || blocked}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  )
}
