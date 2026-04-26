import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../layouts/Layout'
import { Calendar, User, Clock, Trash2, Plus, AlertTriangle, CheckCircle, Plane, Briefcase, Zap } from 'lucide-react'

export default function DisponibilitesMedecins() {
  const [absences, setAbsences] = useState([])
  const [medecins, setMedecins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    medecin_id: '',
    date_debut: '',
    date_fin: '',
    type: 'congé',
    commentaire: ''
  })
  const [planning, setPlanning] = useState([])
  const [rdvEnCours, setRdvEnCours] = useState(null)
  const navigate = useNavigate()

  const API_URL = '' // Proxy Vite

  useEffect(() => {
    fetchData()
    const storedRdv = localStorage.getItem('rdv_selection')
    if (storedRdv) {
      setRdvEnCours(JSON.parse(storedRdv))
    }
  }, [])

  const fetchData = async () => {
    try {
      const [absRes, medRes, planRes] = await Promise.all([
        fetch(`${API_URL}/api/disponibilites`),
        fetch(`${API_URL}/api/personnel?role=medecin`),
        fetch(`${API_URL}/api/medecin/planning/all/global`)
      ])
      const absData = await absRes.json()
      const medData = await medRes.json()
      const planData = await planRes.json()
      setAbsences(Array.isArray(absData) ? absData : (absData.disponibilites || []))
      setMedecins(medData.personnel || [])
      setPlanning(planData.planning || [])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/disponibilites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ medecin_id: '', date_debut: '', date_fin: '', type: 'congé', commentaire: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette absence ?')) return
    try {
      await fetch(`${API_URL}/api/disponibilites/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'congé': return <Briefcase className="w-4 h-4" />
      case 'voyage': return <Plane className="w-4 h-4" />
      case 'urgence': return <Zap className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'congé': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'voyage': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'urgence': return 'bg-amber-100 text-amber-700 border-amber-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disponibilités des Médecins</h1>
            <p className="text-gray-600 mt-2">Consultez les plannings et gérez les absences des médecins.</p>
          </div>
          <div className="flex gap-3">
            {rdvEnCours && (
               <button
                 onClick={() => {
                   localStorage.removeItem('rdv_selection')
                   setRdvEnCours(null)
                 }}
                 className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl transition-all"
               >
                 Annuler l'attribution
               </button>
            )}
            <button
              onClick={() => navigate('/dashboard/attribution')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
            >
              Passer à l'attribution
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" /> Signaler une absence
            </button>
          </div>
        </div>

        {rdvEnCours && (
          <div className="bg-emerald-50 border-2 border-emerald-500 p-6 rounded-2xl flex justify-between items-center shadow-sm">
             <div>
               <h2 className="text-emerald-800 font-bold text-lg flex items-center gap-2">
                 <CheckCircle className="w-5 h-5" />
                 Attribution de rendez-vous en cours
               </h2>
               <p className="text-emerald-700 mt-1">
                 Veuillez sélectionner un médecin disponible pour <strong>{rdvEnCours.prenom} {rdvEnCours.nom}</strong> le <strong>{rdvEnCours.date_rendez_vous}</strong>.
               </p>
             </div>
          </div>
        )}

        {/* LISTE DES DISPONIBILITÉS (PLANNING) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Plannings des médecins</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {planning.filter(p => p.statut === 'disponible').length === 0 && (
               <p className="text-gray-500">Aucun créneau disponible renseigné.</p>
             )}
             {planning.filter(p => p.statut === 'disponible').map(p => (
               <div key={`plan-${p.id}`} className="border rounded-2xl p-4 hover:border-emerald-200 transition-colors">
                  <h3 className="font-bold text-lg">Dr. {p.medecin_prenom} {p.medecin_nom}</h3>
                  <p className="text-xs text-emerald-600 font-bold uppercase mb-2">{p.specialite}</p>
                  <p className="text-sm text-gray-600"><Calendar className="inline w-4 h-4 mr-1" />{new Date(p.date_planning).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mb-4"><Clock className="inline w-4 h-4 mr-1" />{p.heure_debut?.substring(0,5)} - {p.heure_fin?.substring(0,5)}</p>
                  
                  {rdvEnCours && (
                    <button 
                      onClick={() => {
                        // Stocker le médecin choisi
                        localStorage.setItem('medecin_selection', p.id_medecin)
                        navigate('/dashboard/attribution')
                      }}
                      className="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold py-2 rounded-xl transition-colors"
                    >
                      Choisir ce médecin
                    </button>
                  )}
               </div>
             ))}
          </div>
        </div>

        {/* LISTE DES ABSENCES */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : absences.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune absence signalée pour le moment.</p>
            </div>
          ) : (
            absences.map((abs) => (
              <div key={abs.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${getTypeColor(abs.type)} border`}>
                    {getTypeIcon(abs.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Dr. {abs.prenom} {abs.nom}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>Du {new Date(abs.date_debut).toLocaleDateString()} au {new Date(abs.date_fin).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 md:justify-center px-4">
                  <p className="text-sm text-gray-600 italic">
                    {abs.commentaire || "Aucun commentaire"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getTypeColor(abs.type)}`}>
                    {abs.type}
                  </span>
                  <button
                    onClick={() => handleDelete(abs.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL AJOUT */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white">
                <h2 className="text-2xl font-bold">Signaler une absence</h2>
                <p className="text-teal-100 text-sm mt-1">Empêcher la prise de rendez-vous pour cette période.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Médecin</label>
                  <select
                    required
                    value={formData.medecin_id}
                    onChange={(e) => setFormData({ ...formData, medecin_id: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 focus:border-teal-500 focus:bg-white transition-all outline-none"
                  >
                    <option value="">Sélectionner un médecin</option>
                    {medecins.map((m) => (
                      <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date de début</label>
                    <input
                      type="date"
                      required
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 focus:border-teal-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date de fin</label>
                    <input
                      type="date"
                      required
                      value={formData.date_fin}
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 focus:border-teal-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type d'absence</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['congé', 'voyage', 'urgence'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t })}
                        className={`py-3 rounded-2xl text-sm font-bold capitalize transition-all border-2 ${
                          formData.type === t
                            ? 'bg-teal-50 border-teal-500 text-teal-700'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Commentaire (optionnel)</label>
                  <textarea
                    value={formData.commentaire}
                    onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 focus:border-teal-500 focus:bg-white transition-all outline-none min-h-[100px] resize-none"
                    placeholder="Détails sur l'absence..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 py-4 rounded-2xl font-bold text-white shadow-lg shadow-teal-200 hover:shadow-xl transition-all"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
