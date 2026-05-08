import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Activity, Mail, Lock, ArrowRight, ShieldCheck, Key, RefreshCcw, CheckCircle2, ChevronLeft } from 'lucide-react'

export default function MotDePasseOublie() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetToken, setResetToken] = useState('') // Token pour la réinitialisation
  
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  })

  const navigate = useNavigate()

  // 1. Demander le code OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const normalizedEmail = email.trim().toLowerCase()
    setEmail(normalizedEmail)
    console.log('📤 handleRequestOTP envoi', { normalizedEmail })

    if (!normalizedEmail) {
      setError('Veuillez saisir une adresse email valide.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/patient/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      })
      const data = await res.json()
      console.log('📥 handleRequestOTP réponse', data)
      
      if (data.success) {
        setStep(2)
        setSuccess('Un code de vérification a été envoyé à votre adresse email.')
      } else {
        setError(data.message || 'Email non trouvé ou erreur service')
      }
    } catch (err) {
      console.error('❌ handleRequestOTP erreur', err)
      setError('Erreur de connexion au serveur. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Vérifier le code OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 handleVerifyOTP envoi', { email, otp })

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedOtp = otp.trim()
      const res = await fetch('/api/patient/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp: normalizedOtp })
      })
      const data = await res.json()
      console.log('📥 handleVerifyOTP réponse', data)

      if (data.success) {
        setResetToken(data.resetToken) // Stocker le token
        setStep(3)
        setSuccess('Code vérifié, vous pouvez maintenant changer votre mot de passe.')
      } else {
        setError(data.message || 'Code invalide ou expiré')
      }
    } catch (err) {
      console.error('❌ handleVerifyOTP erreur', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  // 3. Réinitialiser le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (passwords.new.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setError('')

    console.log('🔑 handleResetPassword envoi', { email, hasToken: !!resetToken, newPasswordLength: passwords.new.length })

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const res = await fetch('/api/patient/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: normalizedEmail, 
          resetToken: resetToken,
          newPassword: passwords.new 
        })
      })
      const data = await res.json()
      console.log('📥 handleResetPassword réponse', data)

      if (data.success) {
        setSuccess('Mot de passe réinitialisé avec succès ! Redirection...')
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Mot de passe réinitialisé avec succès. Connectez-vous maintenant.' 
            } 
          })
        }, 3000)
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation')
      }
    } catch (err) {
      console.error('❌ handleResetPassword erreur', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-linear-to-br from-teal-900/80 via-blue-900/70 to-emerald-900/80 backdrop-blur-sm"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/20">
        <div className="p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="bg-teal-50 p-4 rounded-2xl mb-4">
              <Activity className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">CEMECO</h1>
            <h2 className="text-xl font-bold text-gray-600">
              {step === 1 && 'Mot de passe oublié'}
              {step === 2 && 'Vérification'}
              {step === 3 && 'Nouveau mot de passe'}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {step === 1 && 'Entrez votre email pour recevoir un code de vérification.'}
              {step === 2 && `Nous avons envoyé un code à ${email}`}
              {step === 3 && 'Choisissez un mot de passe sécurisé.'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Form Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-teal-600 to-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Code de vérification</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition tracking-[0.5em] font-bold text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-teal-600 to-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Vérifier le code
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-400 font-bold text-sm hover:text-teal-600 flex items-center justify-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Changer l'email
              </button>
            </form>
          )}

          {/* Form Step 3: Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Confirmer</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-teal-600 to-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Enregistrer
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <Link to="/login" className="text-teal-600 font-bold text-sm hover:underline flex items-center justify-center gap-1">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}