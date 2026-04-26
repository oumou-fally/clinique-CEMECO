import { useState, useEffect } from 'react'
import Layout from '../layouts/Layout'
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, RotateCcw, Stethoscope, ChevronRight, AlertTriangle } from 'lucide-react'

export default function MesRendezVous() {

  const [activeTab, setActiveTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const API_URL = 'http://localhost:3000'

  // ======================================================
  // 🔄 CHARGER RENDEZ-VOUS DEPUIS LA DB
  // ======================================================
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

  // ======================================================
  // 📊 COMPTEURS PAR STATUT
  // ======================================================
  const countByStatut = (statuts) =>
    appointments.filter(a => statuts.includes((a.statut || '').toLowerCase())).length

  const countUpcoming  = countByStatut(['confirme', 'attribue'])
  const countPast      = countByStatut(['termine'])
  const countCancelled = countByStatut(['annule', 'reporte'])

  // ======================================================
  // 🔥 FILTRAGE PAR ONGLET
  // ======================================================
  const filteredAppointments = appointments.filter(app => {
    const s = (app.statut || '').toLowerCase()
    if (activeTab === 'upcoming')  return ['confirme', 'attribue'].includes(s)
    if (activeTab === 'past')      return s === 'termine'
    if (activeTab === 'cancelled') return ['annule', 'reporte'].includes(s)
    return true
  })

  // ======================================================
  // ❌ ANNULER
  // ======================================================
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

  // ======================================================
  // 🔁 REPORTER
  // ======================================================
  const handleReport = async (id) => {
    const date = prompt('Nouvelle date (YYYY-MM-DD)')
    const heure = prompt('Nouvelle heure (HH:MM)')
    if (!date || !heure) return
    setActionLoading(id)
    try {
      await fetch(`${API_URL}/api/reservations/${id}/report`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_rendez_vous: date, heure_rendez_vous: heure })
      })
      await fetchAppointments()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  // ======================================================
  // 🎨 CONFIG BADGE STATUT
  // ======================================================
  const getStatutBadge = (statut) => {
    const s = (statut || '').toLowerCase()
    if (s === 'confirme')  return { label: 'Confirmé',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    if (s === 'attribue')  return { label: 'Attribué',   cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
    if (s === 'attente')   return { label: 'En attente', cls: 'bg-amber-100 text-amber-700 border-amber-200' }
    if (s === 'annule')    return { label: 'Annulé',     cls: 'bg-rose-100 text-rose-700 border-rose-200' }
    if (s === 'reporte')   return { label: 'Reporté',    cls: 'bg-orange-100 text-orange-700 border-orange-200' }
    if (s === 'termine')   return { label: 'Terminé',    cls: 'bg-gray-100 text-gray-600 border-gray-200' }
    return { label: statut, cls: 'bg-gray-100 text-gray-600 border-gray-200' }
  }

  const getAccentColor = (statut) => {
    const s = (statut || '').toLowerCase()
    if (s === 'confirme')  return 'border-l-emerald-400'
    if (s === 'attribue')  return 'border-l-indigo-400'
    if (s === 'annule')    return 'border-l-rose-400'
    if (s === 'reporte')   return 'border-l-orange-400'
    if (s === 'termine')   return 'border-l-gray-300'
    return 'border-l-teal-400'
  }

  // ======================================================
  // 🎨 UI
  // ======================================================
  const tabs = [
    { key: 'upcoming',  label: 'À venir',         count: countUpcoming,  icon: <CheckCircle className="w-4 h-4" />,  activeColor: 'border-b-emerald-500 text-emerald-600' },
    { key: 'past',      label: 'Passés',           count: countPast,      icon: <Clock className="w-4 h-4" />,        activeColor: 'border-b-gray-500 text-gray-600' },
    { key: 'cancelled', label: 'Annulés/Reportés', count: countCancelled, icon: <XCircle className="w-4 h-4" />,      activeColor: 'border-b-rose-500 text-rose-600' },
  ]

  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mes Rendez-vous</h1>
          <p className="text-gray-500 mt-1.5 font-medium">Suivi et gestion de tous les rendez-vous de la clinique</p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{countUpcoming}</p>
              <p className="text-sm text-gray-500 font-medium">Confirmés / Attribués</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Clock className="w-6 h-6 text-gray-400" />
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

        {/* TABS */}
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
              {tab.icon}
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === tab.key ? 'bg-current/10' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium animate-pulse">Chargement des rendez-vous...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-200">
            <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">Aucun rendez-vous dans cette catégorie</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(app => {
              const badge = getStatutBadge(app.statut)
              const accent = getAccentColor(app.statut)
              const isActive = ['confirme', 'attribue'].includes((app.statut || '').toLowerCase())
              const nomPatient = `${app.patient_prenom || ''} ${app.patient_nom || ''}`.trim()
              const nomMedecin = app.medecin_prenom && app.medecin_nom
                ? `Dr. ${app.medecin_prenom} ${app.medecin_nom}`
                : null

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-[1.75rem] p-6 border border-gray-100 border-l-4 ${accent} shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">

                    {/* INFO */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {nomMedecin && (
                          <span className="flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
                            <Stethoscope className="w-3 h-3" /> {nomMedecin}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        {nomPatient || 'Patient inconnu'}
                      </h3>

                      {app.motif && (
                        <p className="text-gray-500 text-sm italic">"{app.motif}"</p>
                      )}

                      <div className="flex flex-wrap gap-4 pt-1">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          {app.date_rendez_vous
                            ? new Date(app.date_rendez_vous).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
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

                    {/* ACTIONS */}
                    {isActive && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          disabled={actionLoading === app.id}
                          onClick={() => handleReport(app.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-sm transition-colors border border-amber-200"
                        >
                          <RotateCcw className="w-4 h-4" /> Reporter
                        </button>
                        <button
                          disabled={actionLoading === app.id}
                          onClick={() => handleCancel(app.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-sm transition-colors border border-rose-200"
                        >
                          {actionLoading === app.id
                            ? <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                            : <XCircle className="w-4 h-4" />}
                          Annuler
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}