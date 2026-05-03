import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../layouts/Layout'

export default function Notifications() {

  const [notifications, setNotifications] = useState([])
  const [systemNotifications, setSystemNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const API_URL = 'http://localhost:3000'

  // ======================================================
  // 🔄 CHARGER NOTIFICATIONS
  // ======================================================
  const fetchNotifications = async () => {
    try {
      setError(null)
      setLoading(true)

      const res = await fetch(`${API_URL}/api/reservations/notifications/secretaire`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError('Impossible de charger les notifications. Vérifiez le serveur.')
        setNotifications([])
        setSystemNotifications([])
        return
      }

      setNotifications(data.notifications.rendezvous || [])
      setSystemNotifications(data.notifications.planning || [])

    } catch (error) {
      console.error(error)
      setError('Erreur réseau lors du chargement des notifications.')
      setNotifications([])
      setSystemNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // ======================================================
  // ✅ CONFIRMER → ESSAYER D'ATTRIBUER UN MÉDECIN DISPONIBLE
  // ======================================================
  const handleConfirmer = async (notification) => {
    try {
      setLoading(true)
      setError(null)

      const confirmRes = await fetch(`${API_URL}/api/reservations/${notification.id}/confirm`, {
        method: 'PUT'
      })
      const confirmData = await confirmRes.json()

      if (!confirmRes.ok || !confirmData.success) {
        setError('Erreur lors de la confirmation. Réessayez.')
        return
      }

      localStorage.setItem('rdv_selection', JSON.stringify(notification))

      const assignRes = await fetch(`${API_URL}/api/reservations/${notification.id}/auto-assign`, {
        method: 'PUT'
      })
      const assignData = await assignRes.json()

      if (assignRes.ok && assignData.success && assignData.medecin) {
        localStorage.setItem('medecin_selection', String(assignData.medecin.id))
      } else if (assignData && !assignData.success) {
        alert(assignData.message || 'Aucun médecin disponible pour ce créneau. Vous pouvez attribuer manuellement.')
      }

      await fetchNotifications()
      navigate('/dashboard/disponibilites')

    } catch (error) {
      console.error(error)
      setError('Erreur serveur lors de la confirmation.')
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // ❌ ANNULER
  // ======================================================
  const handleAnnuler = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/api/reservations/${id}/cancel`, {
        method: 'PUT'
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError('Impossible d’annuler le rendez-vous.')
        return
      }

      await fetchNotifications()

    } catch (error) {
      console.error(error)
      setError('Erreur serveur lors de l’annulation.')
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // 🔁 REPORTER
  // ======================================================
  const handleReporter = async (id) => {
    const date = prompt('Nouvelle date (YYYY-MM-DD)')
    const heure = prompt('Nouvelle heure (HH:MM)')

    if (!date || !heure) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/api/reservations/${id}/report`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_rendez_vous: date, heure_rendez_vous: heure })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError('Impossible de reporter le rendez-vous.')
        return
      }

      await fetchNotifications()

    } catch (error) {
      console.error(error)
      setError('Erreur serveur lors du report.')
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // 🖥️ UI (INCHANGÉ)
  // ======================================================
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Notifications Secrétaire
        </h1>
        <p className="text-gray-600 mt-2">
          Gestion des rendez-vous patients
        </p>
      </div>

      <button
        onClick={fetchNotifications}
        className="px-4 py-2 bg-gray-200 rounded-lg mb-6"
      >
        Actualiser
      </button>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <p>Chargement...</p>}

      <div className="space-y-4">

        {/* NOTIFICATIONS SYSTEME (PLANNING MÉDECIN) */}
        {systemNotifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
              Mises à jour des plannings ({systemNotifications.length})
            </h2>
            <div className="space-y-3">
              {systemNotifications.map(n => (
                <div key={`sys-${n.id}`} className="p-4 border border-indigo-200 rounded-lg bg-indigo-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <p className="font-medium text-indigo-900">{n.message}</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_URL}/api/reservations/notifications/systeme/${n.id}/lu`, {
                          method: 'PUT'
                        })
                        if (res.ok) {
                          setSystemNotifications(prev => prev.filter(sys => sys.id !== n.id))
                        }
                        navigate('/dashboard/disponibilites')
                      } catch (error) {
                        console.error('Erreur mark as read:', error)
                        navigate('/dashboard/disponibilites')
                      }
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg shadow-sm font-semibold border border-indigo-100 transition-colors"
                  >
                    Voir disponibilités
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS DEMANDES DE RENDEZ-VOUS */}
        <div className="flex items-center justify-between gap-3 mt-10 mb-3 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">Demandes de rendez-vous patients</h2>
          <span className="text-sm text-gray-500">{notifications.length} nouvelle(s)</span>
        </div>
        
        {notifications.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-8">
            Aucune demande de rendez-vous
          </p>
        )}

        {notifications.map((n) => (
          <div key={n.id} className="p-5 border rounded-lg bg-blue-50 shadow-sm transition-all hover:shadow-md">

            <div className="flex flex-col sm:flex-row justify-between gap-4">

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Demande</span>
                  <span className="text-gray-500 text-sm">{n.date_rendez_vous} à {n.heure_rendez_vous}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900">{n.prenom} {n.nom}</h3>
                <p className="text-gray-600 mt-1 italic">"{n.motif}"</p>
              </div>

              <div className="flex flex-col gap-2 min-w-30">
                <button
                  onClick={() => handleConfirmer(n)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded shadow-sm transition-colors w-full"
                >
                  Confirmer
                </button>
                <button 
                  onClick={() => handleReporter(n.id)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium px-4 py-2 rounded transition-colors w-full"
                >
                  Reporter
                </button>

                <button 
                  onClick={() => handleAnnuler(n.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded transition-colors w-full"
                >
                  Annuler
                </button>
              </div>

            </div>

          </div>
        ))}

      </div>
    </Layout>
  )
}