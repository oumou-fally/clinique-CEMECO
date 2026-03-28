import { BarChart3, Calendar, Users, CreditCard, Clock, AlertCircle } from 'lucide-react'
import Layout from '../layouts/Layout'

export default function SecretaryDashboard() {
  const stats = [
    {
      title: 'Rendez-vous Aujourd\'hui',
      value: '12',
      icon: Calendar,
      color: 'from-teal-500 to-green-500',
      details: '8 confirmés, 4 en attente'
    },
    {
      title: 'Médecins Disponibles',
      value: '8',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      details: '6 en consultation, 2 en pause'
    },
    {
      title: 'Factures en Attente',
      value: '5',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      details: 'Total: 2.450€'
    },
    {
      title: 'Alertes Importantes',
      value: '3',
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      details: '2 retards, 1 annulation'
    }
  ]

  const upcomingAppointments = [
    {
      id: 1,
      patient: 'Jean Dupont',
      doctor: 'Dr. Sophie Martin',
      time: '10:30',
      status: 'confirmed',
      room: 'Salle 301'
    },
    {
      id: 2,
      patient: 'Marie Lefevre',
      doctor: 'Dr. Jean Rousseau',
      time: '11:00',
      status: 'pending',
      room: 'Salle 105'
    },
    {
      id: 3,
      patient: 'Pierre Martin',
      doctor: 'Dr. Sophie Martin',
      time: '14:00',
      status: 'confirmed',
      room: 'Salle 301'
    },
    {
      id: 4,
      patient: 'Anne Durand',
      doctor: 'Dr. Marie Durand',
      time: '15:30',
      status: 'confirmed',
      room: 'Salle 202'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Secrétaire</h1>
          <p className="text-gray-600 mt-2">Bienvenue, Marie Dupont</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-2">{stat.details}</p>
                  </div>
                  <div className={`bg-linear-to-br ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Rendez-vous à venir</h2>
              <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold">
                Voir tous
              </button>
            </div>

            <div className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{appt.patient}</p>
                    <p className="text-sm text-gray-600">
                      {appt.doctor} • {appt.time} • {appt.room}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                    {appt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
            <div className="space-y-2">
              <button className="w-full bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition">
                + Nouveau Rendez-vous
              </button>
              <button className="w-full bg-blue-100 text-blue-700 font-semibold py-3 rounded-lg hover:bg-blue-200 transition">
                Emploi de Temps
              </button>
              <button className="w-full bg-purple-100 text-purple-700 font-semibold py-3 rounded-lg hover:bg-purple-200 transition">
                Facturation
              </button>
              <button className="w-full bg-orange-100 text-orange-700 font-semibold py-3 rounded-lg hover:bg-orange-200 transition">
                Gestion Médecins
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
