import Layout from '../layouts/Layout'
import { User, Save, Mail, Phone, MapPin, Calendar, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ParametresCompte() {
  const { user, patientId, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sexe: '',
    date_naissance: '',
    commune: '',
    quartier: ''
  })

  // Charger le profil depuis la base de données
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const id = patientId || user?.id
        if (!id) {
          // Fallback: remplir depuis le contexte auth
          setFormData({
            nom: user?.nom ?? '',
            prenom: user?.prenom ?? '',
            email: user?.email ?? '',
            telephone: '',
            sexe: '',
            date_naissance: '',
            commune: '',
            quartier: ''
          })
          setLoading(false)
          return
        }

        const res = await fetch(`http://localhost:3000/api/patient/profil/${id}`)
        const data = await res.json()

        if (res.ok && data.success) {
          const p = data.patient
          setFormData({
            nom: p.nom ?? '',
            prenom: p.prenom ?? '',
            email: p.email ?? '',
            telephone: p.telephone ?? '',
            sexe: p.sexe ?? '',
            date_naissance: p.date_naissance ? new Date(p.date_naissance).toISOString().split('T')[0] : '',
            commune: p.commune ?? '',
            quartier: p.quartier ?? ''
          })
        } else {
          // Fallback
          setFormData({
            nom: user?.nom ?? '',
            prenom: user?.prenom ?? '',
            email: user?.email ?? '',
            telephone: '',
            sexe: '',
            date_naissance: '',
            commune: '',
            quartier: ''
          })
        }
        setError('')
      } catch (e) {
        console.error(e)
        setFormData({
          nom: user?.nom ?? '',
          prenom: user?.prenom ?? '',
          email: user?.email ?? '',
          telephone: '',
          sexe: '',
          date_naissance: '',
          commune: '',
          quartier: ''
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [patientId, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const id = patientId || user?.id
      if (!id) {
        setError('Impossible de déterminer votre identifiant')
        return
      }

      const res = await fetch(`http://localhost:3000/api/patient/profil/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess('Profil mis à jour avec succès !')
        // Mettre à jour localStorage
        const updatedPatient = {
          ...user,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          nomComplet: `${formData.prenom} ${formData.nom}`
        }
        localStorage.setItem('patient', JSON.stringify(updatedPatient))
      } else {
        throw new Error(data.message || `Enregistrement échoué (${res.status})`)
      }
    } catch (e) {
      console.error(e)
      setError(e.message || "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-500 mb-6">Gérez vos informations personnelles</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
              <p className="text-sm text-gray-500">Modifiez vos informations de profil</p>
            </div>
          </div>

          {/* Champs du formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="prenom">Prénom</label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nom">Nom</label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> Email</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="telephone">
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> Téléphone</span>
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            {/* Sexe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="sexe">Sexe</label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
              >
                <option value="">-- Sélectionner --</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="date_naissance">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Date de naissance</span>
              </label>
              <input
                id="date_naissance"
                name="date_naissance"
                type="date"
                value={formData.date_naissance}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            {/* Commune */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="commune">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Commune</span>
              </label>
              <input
                id="commune"
                name="commune"
                type="text"
                value={formData.commune}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            {/* Quartier */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="quartier">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Quartier</span>
              </label>
              <input
                id="quartier"
                name="quartier"
                type="text"
                value={formData.quartier}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg flex items-center justify-center gap-2 font-semibold transition"
            >
              {saving ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nom: user?.nom ?? '',
                  prenom: user?.prenom ?? '',
                  email: user?.email ?? '',
                  telephone: '',
                  sexe: '',
                  date_naissance: '',
                  commune: '',
                  quartier: ''
                })
                setError('')
                setSuccess('')
              }}
              className="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </div>

        {/* Déconnexion */}
        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:underline transition font-medium"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </div>
    </Layout>
  )
}
