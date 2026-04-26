import Layout from '../layouts/Layout'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  X,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Planning() {

  const { medecinId } = useAuth()

  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const [formData, setFormData] = useState({
    id: null,
    date_planning: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    heure_fin: '12:00',
    statut: 'disponible',
    commentaire: ''
  })

  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const API_URL = 'http://localhost:3000'

  // ======================================================
  // 🔄 CHARGER PLANNING MÉDECIN
  // ======================================================
  const fetchPlanning = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/api/medecin/planning/${medecinId}`)
      const data = await res.json()

      if (data.success) {
        setPlanning(data.planning)
      }

    } catch (error) {
      console.error('Erreur fetch planning:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (medecinId) fetchPlanning()
  }, [medecinId])

  // ======================================================
  // 💾 SAVE (CREATE + UPDATE)
  // ======================================================
  const handleSave = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.heure_debut >= formData.heure_fin) {
      setError("L'heure de début doit être avant l'heure de fin")
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/medecin/planning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id_medecin: medecinId
        })
      })

      const data = await res.json()

      if (data.success) {
        setShowAddModal(false)
        fetchPlanning()
        setSuccessMsg('Créneau enregistré ! Une notification a été envoyée à la secrétaire.')
        setTimeout(() => setSuccessMsg(''), 5000)
      } else {
        setError(data.message || 'Erreur')
      }

    } catch (error) {
      setError('Erreur serveur')
    }
  }

  // ======================================================
  // 🗑 SUPPRESSION
  // ======================================================
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return

    try {
      const res = await fetch(`${API_URL}/api/medecin/planning/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        fetchPlanning()
      }

    } catch (error) {
      console.error(error)
    }
  }

  // ======================================================
  // 🎨 STATUT COLOR & ICON
  // ======================================================
  const getStatutConfig = (statut) => {
    switch (statut) {
      case 'disponible':
        return { 
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
          icon: <CheckCircle className="w-4 h-4 mr-1.5" />,
          label: 'Disponible'
        }
      case 'indisponible':
        return { 
          bg: 'bg-rose-50 text-rose-700 border-rose-200', 
          icon: <XCircle className="w-4 h-4 mr-1.5" />,
          label: 'Indisponible'
        }
      case 'urgence':
        return { 
          bg: 'bg-amber-50 text-amber-700 border-amber-200', 
          icon: <AlertCircle className="w-4 h-4 mr-1.5" />,
          label: 'Urgence'
        }
      default:
        return { 
          bg: 'bg-gray-50 text-gray-700 border-gray-200', 
          icon: <Clock className="w-4 h-4 mr-1.5" />,
          label: statut
        }
    }
  }

  // ======================================================
  // 🖥️ UI PREMIUM
  // ======================================================
  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-8 min-h-screen font-sans">

        {/* HEADER SECTION (Gradient Glass) */}
        <div className="relative overflow-hidden bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-6 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl shadow-lg shadow-indigo-200 text-white transform -rotate-3 transition-transform duration-300 hover:rotate-0">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Mon Planning
              </h1>
              <p className="text-gray-500 mt-1.5 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gérez vos horaires et disponibilités
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto relative z-10">
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl border border-emerald-200 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right duration-300 shadow-sm">
                <CheckCircle className="w-5 h-5" />
                {successMsg}
              </div>
            )}
            <button
              onClick={() => {
                setFormData({
                  id: null,
                  date_planning: new Date().toISOString().split('T')[0],
                  heure_debut: '08:00',
                  heure_fin: '12:00',
                  statut: 'disponible',
                  commentaire: ''
                })
                setShowAddModal(true)
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-indigo-500/25 flex items-center justify-center gap-3 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Nouveau créneau
            </button>
          </div>
        </div>

        {/* LISTE DES CRENEAUX */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Synchronisation des horaires...</p>
          </div>
        ) : planning.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200/60 shadow-sm flex flex-col items-center justify-center h-96 transition-all hover:border-indigo-200 hover:bg-indigo-50/30">
            <div className="p-6 bg-indigo-50 rounded-full mb-6">
              <Calendar className="w-16 h-16 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Votre agenda est vide</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Vous n'avez pas encore défini de créneaux de disponibilité. Cliquez sur "Nouveau créneau" pour commencer à planifier.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {planning.map((item) => {
              const statutConfig = getStatutConfig(item.statut)
              const dateObj = new Date(item.date_planning)
              const dayNum = dateObj.getDate().toString().padStart(2, '0')
              const monthName = dateObj.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
              const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' })

              return (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
                >
                  {/* Accent Line Top */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${item.statut === 'disponible' ? 'bg-emerald-400' : item.statut === 'indisponible' ? 'bg-rose-400' : 'bg-amber-400'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                  {/* Header: Date & Status */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl w-14 h-14 border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                        <span className="text-lg font-black text-gray-900 group-hover:text-indigo-600 leading-none">{dayNum}</span>
                        <span className="text-[10px] font-bold text-gray-500">{monthName}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 capitalize">{dayName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {item.heure_debut.substring(0,5)} - {item.heure_fin.substring(0,5)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${statutConfig.bg}`}>
                      {statutConfig.icon}
                      {statutConfig.label}
                    </div>

                    {item.commentaire && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-600 italic line-clamp-3">
                          "{item.commentaire}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions (Hidden until hover on desktop) */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => {
                        setFormData({
                          ...item,
                          date_planning: new Date(item.date_planning).toISOString().split('T')[0]
                        })
                        setShowAddModal(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 font-semibold rounded-xl transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* MODAL AJOUT/EDITION */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>
            
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {formData.id ? 'Modifier le créneau' : 'Nouveau créneau'}
                </h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-white hover:bg-gray-200 text-gray-500 rounded-full transition-colors shadow-sm border border-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-sm font-semibold">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Date du créneau</label>
                    <input
                      type="date"
                      required
                      value={formData.date_planning}
                      onChange={(e) => setFormData({ ...formData, date_planning: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-semibold text-gray-800 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Heure début</label>
                      <input
                        type="time"
                        required
                        value={formData.heure_debut}
                        onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-semibold text-gray-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Heure fin</label>
                      <input
                        type="time"
                        required
                        value={formData.heure_fin}
                        onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-semibold text-gray-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Statut</label>
                    <div className="relative">
                      <select
                        value={formData.statut}
                        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-semibold text-gray-800 outline-none transition-all appearance-none"
                      >
                        <option value="disponible">✅ Disponible</option>
                        <option value="indisponible">❌ Indisponible</option>
                        <option value="urgence">⚠️ Urgence uniquement</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Commentaire (Optionnel)</label>
                    <textarea
                      value={formData.commentaire}
                      onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-medium text-gray-800 outline-none transition-all resize-none h-24 placeholder-gray-400"
                      placeholder="Ex: Remplacement, Formation..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> 
                      {formData.id ? 'Mettre à jour' : 'Enregistrer le créneau'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}