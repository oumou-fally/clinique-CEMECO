import { useState, useEffect } from 'react'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'
import { Bell, BellOff, Calendar, Clock, User, Phone, FileText, CheckCheck, Stethoscope } from 'lucide-react'

export default function Notifications() {
  const { medecinId } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'unread'

  const API_URL = 'http://localhost:3000'

  // ======================================================
  // 🔄 CHARGER NOTIFICATIONS RÉELLES
  // ======================================================
  const fetchNotifications = async () => {
    if (!medecinId) return
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/notifications/notifications/${medecinId}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [medecinId])

  // ======================================================
  // ✅ MARQUER COMME LUE
  // ======================================================
  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/notifications/notifications/${id}/lu`, {
        method: 'PUT'
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: 1 } : n))
    } catch (error) {
      console.error('Erreur marquage lu:', error)
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.lu)
    for (const n of unread) {
      await markAsRead(n.id)
    }
  }

  // Filtrage
  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.lu)
    : notifications

  const unreadCount = notifications.filter(n => !n.lu).length

  // Formater la date de création
  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-indigo-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Vos rendez-vous et alertes en temps réel
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtre */}
            <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Tous ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'unread' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Non lus ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                <CheckCheck className="w-4 h-4" /> Tout marquer
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
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Chargement des notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center">
            <div className="p-6 bg-gray-50 rounded-full mb-5">
              <BellOff className="w-14 h-14 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? 'Vous avez lu toutes vos notifications.'
                : 'La secrétaire vous notifiera dès qu\'un rendez-vous vous est attribué.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((n) => {
              const isRdv = n.type === 'rendez-vous'
              const isUnread = !n.lu

              return (
                <div
                  key={n.id}
                  className={`group relative bg-white rounded-[1.75rem] p-6 border-2 transition-all duration-200 hover:shadow-lg ${
                    isUnread ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-gray-100'
                  }`}
                >
                  {/* Point bleu non-lu */}
                  {isUnread && (
                    <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-100"></div>
                  )}

                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`p-3.5 rounded-2xl shrink-0 ${
                      isRdv ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {isRdv ? <Stethoscope className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                          isRdv ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {n.type || 'Système'}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{formatTime(n.created_at)}</span>
                      </div>

                      {/* Détails RDV structurés */}
                      {isRdv && (n.patient_nom || n.date_rendez_vous) ? (
                        <div className="space-y-2 mt-3">
                          <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400 shrink-0" />
                            {n.patient_prenom} {n.patient_nom}
                          </p>
                          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-gray-600 ml-6">
                            {n.date_rendez_vous && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-indigo-400" />
                                {new Date(n.date_rendez_vous).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            )}
                            {n.heure_rendez_vous && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                {n.heure_rendez_vous?.substring(0, 5)}
                              </span>
                            )}
                            {n.motif && (
                              <span className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                {n.motif}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2 font-medium leading-relaxed">{n.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Marquer comme lu */}
                  {isUnread && (
                    <div className="mt-5 ml-[4.25rem]">
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" /> Marquer comme lu
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}
