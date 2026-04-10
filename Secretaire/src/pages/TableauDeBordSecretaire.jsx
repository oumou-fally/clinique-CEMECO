import { Link } from 'react-router-dom'
import { BarChart3, Calendar, Users, CreditCard, Clock, AlertCircle } from 'lucide-react'
import Layout from '../layouts/Layout'

const STATISTICS = [
  {
    title: "Rendez-vous aujourd'hui",
    value: '12',
    icon: Calendar,
    label: '8 confirmés, 4 en attente'
  },
  {
    title: 'Médecins disponibles',
    value: '5',
    icon: Users,
    label: '3 en consultation, 2 en pause'
  },
  {
    title: 'Factures en attente',
    value: '5',
    icon: CreditCard,
    label: 'Total: 2 450 GNF'
  },
  {
    title: 'Alertes importantes',
    value: '3',
    icon: AlertCircle,
    label: '2 retards, 1 annulation'
  }
]

const RDV_A_VENIR = [
  {
    id: 1,
    patient: 'Jean Dupont',
    doctor: 'Professeur Elhadj Yaya Baldé',
    time: '10:30',
    status: 'confirmed',
    room: 'Salle 301'
  },
  {
    id: 2,
    patient: 'Marie Lefèvre',
    doctor: 'Docteur Mamadou Bassirou Bah',
    time: '11:00',
    status: 'pending',
    room: 'Salle 105'
  }
]

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-800'
    case 'pending':
      return 'bg-orange-100 text-orange-800'
    case 'cancelled':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function TableauDeBordSecretaire() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord secrétaire</h1>
          <p className="text-slate-600 mt-2">Organisez les rendez-vous, suivez la facturation et gérez la planification médicale.</p>
        </div>

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

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Rendez-vous à venir</h2>
                <p className="text-sm text-slate-500 mt-1">Suivez les prochains passages des patients.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">2 prévus</span>
            </div>

            <div className="mt-6 space-y-4">
              {RDV_A_VENIR.map((appt) => (
                <div key={appt.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{appt.patient}</p>
                      <p className="text-sm text-slate-600">{appt.doctor}</p>
                    </div>
                    <span className={`badge ${getStatusColor(appt.status)}`}>{appt.status === 'confirmed' ? 'Confirmé' : 'En attente'}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{appt.time}</span>
                    <span>{appt.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Actions rapides</h2>
            <Link to="/dashboard/rendez-vous" className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-white">
              + Nouveau rendez-vous
            </Link>
            <Link to="/dashboard/emploi-du-temps" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-slate-800">
              Emploi du temps
            </Link>
            <Link to="/dashboard/facturation" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-slate-800">
              Facturation
            </Link>
            <Link to="/dashboard/doctors" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-slate-800">
              Liste des médecins
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
