import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../layouts/Layout'
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, RotateCcw, Stethoscope, AlertTriangle, Phone, Mail, X } from 'lucide-react'

export default function GestionRendezVous() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  
  // États pour le modal de report
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [reportData, setReportData] = useState({
    date: '',
    heure: '',
    motif: 'Indisponibilité du médecin'
  })

  const API_URL = 'http://localhost:3000'

  const location = useLocation()
  const navigate = useNavigate()

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/reservations`)
      const data = await res.json()
      if (data.success) {
        setAppointments(data.reservations || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Si on reçoit une réservation via location.state.reportApp, ouvrir directement le modal de report
  useEffect(() => {
    try {
      const payload = location && location.state && location.state.reportApp
      if (payload) {
        openReportModal(payload)
        // nettoyer l'état de navigation pour éviter de rouvrir le modal
        navigate(location.pathname, { replace: true, state: {} })
      }
    } catch (err) {
      console.error('Erreur lors du traitement de location.state', err)
    }
  }, [location])

  // ======================================================
  // 📊 COMPTEURS PAR STATUT
  // ======================================================
  const countByStatut = (statuts) =>
    appointments.filter(a => statuts.includes((a.statut || '').toLowerCase())).length

  const countUpcoming  = countByStatut(['confirme', 'attribue'])
  const countPast      = countByStatut(['termine'])
  const countCancelled = countByStatut(['annule', 'reporte'])

  const filteredAppointments = appointments.filter(app => {
    const s = (app.statut || '').toLowerCase()
    if (activeTab === 'upcoming')  return ['confirme', 'attribue'].includes(s)
    if (activeTab === 'past')      return s === 'termine'
    if (activeTab === 'cancelled') return ['annule', 'reporte'].includes(s)
    return true
  })

  const handleCancel = async (id) => {
    if (!window.confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return
    setActionLoading(id)
    try {
      await fetch(`${API_URL}/api/reservations/${id}/cancel`, { method: 'PUT' })
      await fetchAppointments()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const openReportModal = (app) => {
    setSelectedApp(app)
    setReportData({
      date: app.date_rendez_vous ? app.date_rendez_vous.split('T')[0] : '',
      heure: app.heure_rendez_vous || '',
      motif: 'Indisponibilité du médecin'
    })
    setShowReportModal(true)
  }

  const handleConfirmReport = async () => {
    if (!reportData.date || !reportData.heure) {
      alert('Veuillez remplir la date et l\'heure')
      return
    }
    setActionLoading(selectedApp.id)
    try {
      const res = await fetch(`${API_URL}/api/reservations/${selectedApp.id}/report`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_rendez_vous: reportData.date,
          heure_rendez_vous: reportData.heure,
          motif_report: reportData.motif
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowReportModal(false)
        await fetchAppointments()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatutBadge = (statut) => {
    const s = (statut || '').toLowerCase()
    if (s === 'confirme')  return { label: 'Confirmé',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    if (s === 'attribue')  return { label: 'Attribué',   cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
    if (s === 'annule')    return { label: 'Annulé',     cls: 'bg-rose-100 text-rose-700 border-rose-200' }
    if (s === 'reporte')   return { label: 'Reporté',    cls: 'bg-orange-100 text-orange-700 border-orange-200' }
    if (s === 'termine')   return { label: 'Terminé',    cls: 'bg-gray-100 text-gray-600 border-gray-200' }
    return { label: statut, cls: 'bg-gray-100 text-gray-600 border-gray-200' }
  }

  const tabs = [
    { key: 'upcoming',  label: 'À venir',         count: countUpcoming,  icon: <CheckCircle className="w-4 h-4" />,  activeColor: 'border-b-emerald-500 text-emerald-600' },
    { key: 'past',      label: 'Passés',           count: countPast,      icon: <Clock className="w-4 h-4" />,        activeColor: 'border-b-gray-500 text-gray-600' },
    { key: 'cancelled', label: 'Annulés/Reportés', count: countCancelled, icon: <XCircle className="w-4 h-4" />,      activeColor: 'border-b-rose-500 text-rose-600' },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestion des Rendez-vous</h1>
          <p className="text-gray-500 mt-1.5 font-medium">Planification et report dynamique des consultations</p>
        </div>

        {/* TABS */}
        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-all ${
                activeTab === tab.key ? tab.activeColor : 'border-b-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === tab.key ? 'bg-current/10' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.map(app => (
              <div key={app.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatutBadge(app.statut).cls}`}>
                        {getStatutBadge(app.statut).label}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">ID: #{app.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{app.patient_prenom} {app.patient_nom}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar className="w-4 h-4 text-teal-500" /> {new Date(app.date_rendez_vous).toLocaleDateString('fr-FR')}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4 text-teal-500" /> {app.heure_rendez_vous?.substring(0, 5)}</div>
                      {app.medecin_nom && <div className="flex items-center gap-2 text-sm text-indigo-600 font-bold"><Stethoscope className="w-4 h-4" /> Dr. {app.medecin_nom}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['confirme', 'attribue'].includes((app.statut || '').toLowerCase()) && (
                      <>
                        <button onClick={() => openReportModal(app)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
                          <RotateCcw className="w-4 h-4" /> Reporter
                        </button>
                        <button onClick={() => handleCancel(app.id)} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors">
                          <XCircle className="w-4 h-4" /> Annuler
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE REPORT PROFESSIONNEL */}
        {showReportModal && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black">Reporter le Rendez-vous</h2>
                    <p className="text-amber-100 font-medium opacity-90">Modification dynamique de la planification</p>
                  </div>
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Infos Patient */}
                <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Informations du Patient</p>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{selectedApp.patient_prenom} {selectedApp.patient_nom}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="flex items-center gap-2 text-sm text-gray-500"><Phone className="w-3.5 h-3.5 text-teal-500" /> {selectedApp.patient_telephone || 'Non renseigné'}</span>
                        <span className="flex items-center gap-2 text-sm text-gray-500"><Mail className="w-3.5 h-3.5 text-teal-500" /> {selectedApp.patient_email || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulaire de report */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Nouvelle Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input 
                        type="date" 
                        value={reportData.date}
                        onChange={(e) => setReportData({...reportData, date: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Nouvelle Heure</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input 
                        type="time" 
                        value={reportData.heure}
                        onChange={(e) => setReportData({...reportData, heure: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Motif du report</label>
                  <textarea 
                    rows="2"
                    value={reportData.motif}
                    onChange={(e) => setReportData({...reportData, motif: e.target.value})}
                    placeholder="Ex: Le médecin est en urgence..."
                    className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-amber-500 outline-none transition-all font-medium text-gray-700"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowReportModal(false)} className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">
                    Annuler
                  </button>
                  <button 
                    onClick={handleConfirmReport}
                    disabled={actionLoading === selectedApp.id}
                    className="flex-[2] py-4 font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {actionLoading === selectedApp.id ? 'Traitement...' : 'Confirmer le Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}