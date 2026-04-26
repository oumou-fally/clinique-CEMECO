import { useState, useEffect } from 'react'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'
import { Calendar, Clock, MapPin, Plus, X, CheckCircle, XCircle, RotateCcw, Stethoscope, Hourglass } from 'lucide-react'
import AppointmentForm from '../components/AppointmentForm'

export default function MesRendezVous() {
  const { patientId } = useAuth()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)

  const API_URL = 'http://localhost:3000'

  // ======================================================
  // 🔄 CHARGER DEPUIS LA BASE DE DONNÉES
  // ======================================================
  const fetchAppointments = async () => {
    if (!patientId) return
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/reservations/patient/${patientId}`)
      const data = await res.json()
      if (data.success) {
        setAppointments(data.reservations || [])
      }
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [patientId])

  // ======================================================
  // 📊 COMPTEURS PAR STATUT
  // ======================================================
  const count = (statuts) =>
    appointments.filter(a => {
      const s = (a.statut || '').toLowerCase().replace('_', '')
      return statuts.some(st => st.replace('_','') === s)
    }).length

  const countUpcoming  = count(['attente', 'en_attente', 'confirme', 'attribue']) 
  const countPast      = count(['termine'])
  const countCancelled = count(['annule', 'reporte'])

  // ======================================================
  // 🔥 FILTRAGE
  // ======================================================
  const filtered = appointments.filter(a => {
    const s = (a.statut || '').toLowerCase().replace('_', '')
    if (activeTab === 'upcoming')  return ['attente', 'enattente', 'confirme', 'attribue', ''].includes(s)
    if (activeTab === 'past')      return s === 'termine'
    if (activeTab === 'cancelled') return ['annule', 'reporte'].includes(s)
    return true
  })

  // ======================================================
  // ✉️ ENVOYER DEMANDE RDV
  // ======================================================
  const handleAppointmentSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          id_secretaire: 1,
          date_rendez_vous: formData.date,
          heure_rendez_vous: formData.time,
          motif: formData.reason
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Votre demande a été envoyée à la secrétaire. En attente de validation.')
        setShowAppointmentForm(false)
        fetchAppointments()
      } else {
        alert('Erreur lors de la création du rendez-vous')
      }
    } catch (error) {
      console.error(error)
      alert('Erreur serveur')
    }
  }

  // ======================================================
  // 🎨 CONFIG STATUT
  // ======================================================
  const getStatutConfig = (statut) => {
    const s = (statut || '').toLowerCase().replace('_', '')
    if (s === 'confirme')  return { label: 'Confirmé',   icon: <CheckCircle className="w-4 h-4" />, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', accent: 'border-l-emerald-400' }
    if (s === 'attribue')  return { label: 'Attribué',   icon: <Stethoscope className="w-4 h-4" />, cls: 'bg-indigo-100 text-indigo-700 border-indigo-200',   accent: 'border-l-indigo-400' }
    if (s === 'attente' || s === 'enattente' || s === '') return { label: 'En attente', icon: <Hourglass className="w-4 h-4" />, cls: 'bg-amber-100 text-amber-700 border-amber-200', accent: 'border-l-amber-400' }
    if (s === 'annule')    return { label: 'Annulé',     icon: <XCircle className="w-4 h-4" />,     cls: 'bg-rose-100 text-rose-700 border-rose-200',          accent: 'border-l-rose-400' }
    if (s === 'reporte')   return { label: 'Reporté',    icon: <RotateCcw className="w-4 h-4" />,   cls: 'bg-orange-100 text-orange-700 border-orange-200',    accent: 'border-l-orange-400' }
    if (s === 'termine')   return { label: 'Terminé',    icon: <CheckCircle className="w-4 h-4" />, cls: 'bg-gray-100 text-gray-600 border-gray-200',          accent: 'border-l-gray-300' }
    return { label: 'En attente', icon: <Hourglass className="w-4 h-4" />, cls: 'bg-amber-100 text-amber-700 border-amber-200', accent: 'border-l-amber-400' }
  }

  // ======================================================
  // 📑 ONGLETS
  // ======================================================
  const tabs = [
    { key: 'upcoming',  label: 'À venir',         count: countUpcoming,  activeColor: 'border-b-teal-500 text-teal-600' },
    { key: 'past',      label: 'Passés',           count: countPast,      activeColor: 'border-b-gray-500 text-gray-600' },
    { key: 'cancelled', label: 'Annulés/Reportés', count: countCancelled, activeColor: 'border-b-rose-500 text-rose-600' },
  ]

  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mes Rendez-vous</h1>
            <p className="text-gray-500 mt-1 font-medium">Suivez vos consultations à la Clinique CEMECO</p>
          </div>
          <button
            onClick={() => setShowAppointmentForm(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-teal-100 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Nouveau RDV
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border-2 border-teal-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 rounded-2xl">
              <Calendar className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{countUpcoming}</p>
              <p className="text-sm text-gray-500 font-medium">À venir / En attente</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{countPast}</p>
              <p className="text-sm text-gray-500 font-medium">Passés / Terminés</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-rose-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <XCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{countCancelled}</p>
              <p className="text-sm text-gray-500 font-medium">Annulés / Reportés</p>
            </div>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-all ${
                activeTab === tab.key
                  ? `${tab.activeColor} border-b-2`
                  : 'border-b-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === tab.key ? '' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* LISTE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium animate-pulse">Chargement de vos rendez-vous...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-200">
            <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">Aucun rendez-vous dans cette catégorie</p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => setShowAppointmentForm(true)}
                className="mt-4 inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700"
              >
                <Plus className="w-4 h-4" /> Prendre un rendez-vous
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(app => {
              const config = getStatutConfig(app.statut)
              const nomMedecin = app.medecin_nom
                ? `Dr. ${app.medecin_nom} ${app.medecin_prenom || ''}`
                : 'Médecin non encore attribué'

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-[1.75rem] p-6 border border-gray-100 border-l-4 ${config.accent} shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">

                      {/* Badge statut */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${config.cls}`}>
                        {config.icon}
                        {config.label}
                      </span>

                      {/* Médecin */}
                      <p className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                        <Stethoscope className="w-4 h-4 text-gray-400 shrink-0" />
                        {nomMedecin}
                      </p>

                      {/* Motif */}
                      {app.motif && (
                        <p className="text-gray-500 text-sm italic">"{app.motif}"</p>
                      )}

                      {/* Date & heure */}
                      <div className="flex flex-wrap gap-4 pt-1">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          {app.date_rendez_vous
                            ? new Date(app.date_rendez_vous).toLocaleDateString('fr-FR', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                              })
                            : '—'}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Clock className="w-4 h-4 text-teal-400" />
                          {app.heure_rendez_vous?.substring(0, 5) || '—'}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <MapPin className="w-4 h-4 text-teal-400" />
                          Clinique CEMECO
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* FORMULAIRE */}
        <AppointmentForm
          isOpen={showAppointmentForm}
          onClose={() => setShowAppointmentForm(false)}
          onSubmit={handleAppointmentSubmit}
        />

      </div>
    </Layout>
  )
}