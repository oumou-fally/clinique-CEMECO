import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Calendar, Users, Clock, AlertCircle } from "lucide-react"
import Layout from "../layouts/Layout"

const getStatusColor = (status) => {
  switch (status) {
    case "confirme":
      return "bg-emerald-100 text-emerald-800"
    case "attente":
      return "bg-orange-100 text-orange-800"
    case "annule":
      return "bg-rose-100 text-rose-800"
    case "reporte":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export default function TableauDeBordSecretaire() {
  const API_URL = "http://localhost:3000"
  const [stats, setStats] = useState({ total: 0, attente: 0, confirme: 0, annule: 0, reporte: 0 })
  const [appointments, setAppointments] = useState([])

  const fetchDashboard = async () => {
    try {
      const [resStats, resRdv] = await Promise.all([
        fetch(`${API_URL}/api/reservations/stats/dashboard`),
        fetch(`${API_URL}/api/reservations`)
      ])
      const statsData = await resStats.json()
      const rdvData = await resRdv.json()
      if (statsData.success) setStats(statsData.stats || { total: 0, attente: 0, confirme: 0, annule: 0, reporte: 0 })
      if (rdvData.success) setAppointments((rdvData.reservations || []).slice(0, 3))
    } catch (error) { console.error(error) }
  }

  useEffect(() => { fetchDashboard() }, [])

  const STATISTICS = [
    { title: "Total rendez-vous", value: stats?.total ?? 0, icon: Calendar, label: "Tous les rendez-vous" },
    { title: "En attente", value: stats?.attente ?? 0, icon: Clock, label: "À traiter" },
    { title: "Confirmés", value: stats?.confirme ?? 0, icon: Users, label: "Validés" },
    { title: "Annulés", value: stats?.annule ?? 0, icon: AlertCircle, label: "Refusés" }
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tableau de bord secrétaire</h1>
          <p className="text-slate-500 mt-2 text-base">Gestion centralisée des rendez-vous et du planning médical</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATISTICS.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{stat.title}</p>
                    <p className="mt-4 text-4xl font-extrabold text-slate-900">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Rendez-vous récents</h2>
            <div className="mt-6 space-y-3">
              {appointments.length === 0 && <p className="text-slate-500 text-sm">Aucun rendez-vous</p>}
              {appointments.map((appt) => (
                <div key={appt.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{appt.patient_nom} {appt.patient_prenom}</p>
                      <p className="text-sm text-slate-500 mt-1">Dr {appt.medecin_nom || "Non assigné"}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(appt.statut)}`}>
                      {appt.statut}
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-slate-500 flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-600">📅</span>
                      <span>{appt.date_rendez_vous}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-600">⏰</span>
                      <span>{appt.heure_rendez_vous}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Actions rapides</h2>
            <div className="mt-6 space-y-3">
              <Link to="/dashboard/rendez-vous" className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 active:bg-teal-800">
                + Nouveau rendez-vous
              </Link>
              <Link to="/dashboard/emploi-du-temps" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200">
                Planning médecins
              </Link>
              <Link to="/dashboard/notifications" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200">
                Notifications
              </Link>
              <Link to="/dashboard/doctors" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200">
                Médecins
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
