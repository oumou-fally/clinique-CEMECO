import { useState, useEffect } from 'react'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'
import { Bell, BellOff, Calendar, Clock, CheckCircle, XCircle, RotateCcw, Stethoscope, CheckCheck } from 'lucide-react'

export default function Notifications() {
  const { patientId } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const API_URL = 'http://localhost:3000'

  // ======================================================
  // 🔄 CHARGER NOTIFICATIONS RÉELLES
  // ======================================================
  const fetchNotifications = async () => {
    if (!patientId) return
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/reservations/notifications/patient/${patientId}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Erreur chargement notifications patient:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [patientId])

  // ======================================================
  // ✅ MARQUER COMME LUE (notif_patient = 0)
  // ======================================================
  const markAsRead = async (rdvId) => {
    try {
      await fetch(`${API_URL}/api/reservations/notifications/patient/${rdvId}/lu`, {
        method: 'PUT'
      })
      setNotifications(prev => prev.filter(n => n.id !== rdvId))
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    for (const n of notifications) {
      await markAsRead(n.id)
    }
  }

  // ======================================================
  // 🎨 CONFIG STATUT
  // ======================================================
  const getStatutConfig = (statut) => {
    const s = (statut || '').toLowerCase()
    if (s === 'confirme')  return { label: 'Rendez-vous confirmé',   icon: <CheckCircle className="w-6 h-6" />, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    if (s === 'attribue')  return { label: 'Médecin attribué',        icon: <Stethoscope className="w-6 h-6" />, bg: 'bg-indigo-50',  iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-600',  border: 'border-indigo-200',  badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
    if (s === 'annule')    return { label: 'Rendez-vous annulé',      icon: <XCircle className="w-6 h-6" />,    bg: 'bg-rose-50',    iconBg: 'bg-rose-100',    iconColor: 'text-rose-600',    border: 'border-rose-200',    badge: 'bg-rose-100 text-rose-700 border-rose-200' }
    if (s === 'reporte')   return { label: 'Rendez-vous reporté',     icon: <RotateCcw className="w-6 h-6" />,  bg: 'bg-amber-50',   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700 border-amber-200' }
    return { label: 'Mise à jour de rendez-vous', icon: <Bell className="w-6 h-6" />, bg: 'bg-gray-50', iconBg: 'bg-gray-100', iconColor: 'text-gray-500', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600 border-gray-200' }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffHours < 1)  return 'À l\'instant'
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7)   return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    return date.toLocaleDateString('fr-FR')
  }

  const unreadCount = notifications.length

  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-teal-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              Mes Notifications
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Suivez l'évolution de vos rendez-vous en temps réel</p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-teal-100 active:scale-95"
              >
                <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
              </button>
            )}
            <button
              onClick={fetchNotifications}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
              title="Actualiser"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Chargement de vos notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center">
            <div className="p-6 bg-gray-50 rounded-full mb-5">
              <BellOff className="w-14 h-14 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Vous êtes à jour !</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Aucune nouvelle notification. Vous serez informé ici dès que votre rendez-vous sera confirmé ou modifié.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              const config = getStatutConfig(n.statut)
              const nomMedecin = n.medecin_nom
                ? `Dr. ${n.medecin_nom} ${n.medecin_prenom || ''}`
                : null

              return (
                <div
                  key={n.id}
                  className={`${config.bg} border-2 ${config.border} rounded-[1.75rem] p-6 shadow-sm hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start gap-5">
                    {/* Icône */}
                    <div className={`p-3.5 rounded-2xl shrink-0 ${config.iconBg} ${config.iconColor}`}>
                      {config.icon}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${config.badge}`}>
                          {config.label}
                        </span>
                      </div>

                      <div className="space-y-1.5 mt-3">
                        {n.date_rendez_vous && (
                          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            {new Date(n.date_rendez_vous).toLocaleDateString('fr-FR', {
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                        )}
                        {n.heure_rendez_vous && (
                          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                            {n.heure_rendez_vous?.substring(0, 5)}
                          </p>
                        )}
                        {nomMedecin && (
                          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Stethoscope className="w-4 h-4 text-gray-400 shrink-0" />
                            {nomMedecin}
                          </p>
                        )}
                        {n.motif && (
                          <p className="text-sm text-gray-500 italic mt-1">Motif : "{n.motif}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Marquer comme lu */}
                  <div className="mt-4 ml-[4.5rem]">
                    <button
                      onClick={() => markAsRead(n.id)}
                      className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${config.iconColor} hover:opacity-80 bg-white/60 hover:bg-white border border-white/80`}
                    >
                      <CheckCheck className="w-4 h-4" /> Marquer comme lu
                    </button>
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
