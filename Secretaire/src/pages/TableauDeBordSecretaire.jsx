import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react'
import Layout from '../layouts/Layout'

const getStatusColor = (status) => {
  switch (status) {
    case 'confirme':
      return 'bg-emerald-100 text-emerald-800'
    case 'attente':
      return 'bg-orange-100 text-orange-800'
    case 'annule':
      return 'bg-rose-100 text-rose-800'
    case 'reporte':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function TableauDeBordSecretaire() {

  const API_URL = 'http://localhost:3000'

  const [stats, setStats] = useState({
    total: 0,
    attente: 0,
    confirme: 0,
    annule: 0,
    reporte: 0
  })

  const [appointments, setAppointments] = useState([])

  // ======================================================
  // 🔄 CHARGER DONNÉES
  // ======================================================
  const fetchDashboard = async () => {
    try {

      const [resStats, resRdv] = await Promise.all([
        fetch(`${API_URL}/api/reservations/stats/dashboard`),
        fetch(`${API_URL}/api/reservations`)
      ])

      const statsData = await resStats.json()
      const rdvData = await resRdv.json()

      if (statsData.success) {
        setStats(statsData.stats || {
          total: 0,
          attente: 0,
          confirme: 0,
          annule: 0,
          reporte: 0
        })
      }

      if (rdvData.success) {
        setAppointments((rdvData.reservations || []).slice(0, 3))
      }

    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  // ======================================================
  // 📊 STATS (SAFE VERSION)
  // ======================================================
  const STATISTICS = [
    {
      title: "Total rendez-vous",
      value: stats?.total ?? 0,
      icon: Calendar,
      label: "Tous les rendez-vous"
    },
    {
      title: "En attente",
      value: stats?.attente ?? 0,
      icon: Clock,
      label: "À traiter"
    },
    {
      title: "Confirmés",
      value: stats?.confirme ?? 0,
      icon: Users,
      label: "Validés"
    },
    {
      title: "Annulés",
      value: stats?.annule ?? 0,
      icon: AlertCircle,
      label: "Refusés"
    }
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Tableau de bord secrétaire
          </h1>
          <p className="text-slate-600 mt-2">
            Gestion centralisée des rendez-vous et du planning médical
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATISTICS.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                  </div>
                  <div className="rounded-2xl bg-teal-600 p-3 text-white">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CONTENT */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

          {/* RDV */}
          <div className="card p-6">

            <h2 className="text-2xl font-semibold text-slate-900">
              Rendez-vous récents
            </h2>

            <div className="mt-6 space-y-4">

              {appointments.length === 0 && (
                <p className="text-slate-500 text-sm">
                  Aucun rendez-vous
                </p>
              )}

              {appointments.map((appt) => (
                <div key={appt.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {appt.patient_nom} {appt.patient_prenom}
                      </p>
                      <p className="text-sm text-slate-600">
                        Dr {appt.medecin_nom || 'Non assigné'}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.statut)}`}>
                      {appt.statut}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-500 flex gap-3">
                    <span>{appt.date_rendez_vous}</span>
                    <span>{appt.heure_rendez_vous}</span>
                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* ACTIONS */}
          <div className="card p-6 space-y-4">

            <h2 className="text-2xl font-semibold text-slate-900">
              Actions rapides
            </h2>

            <Link to="/dashboard/rendez-vous" className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-white">
              + Nouveau rendez-vous
            </Link>

            <Link to="/dashboard/emploi-du-temps" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-slate-800">
              Planning médecins
            </Link>

            <Link to="/dashboard/notifications" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-slate-800">
              Notifications
            </Link>

            <Link to="/dashboard/doctors" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-slate-800">
              Médecins
            </Link>

          </div>

        </div>

      </div>
    </Layout>
  )
}