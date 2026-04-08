import { BarChart3, Users, Calendar, FileText, TrendingUp, Bell, Search, Shield, Settings, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../layouts/Layout'

export default function Dashboard() {
  const { user } = useAuth()

  const stats = [
    { icon: Users, label: 'Total Patients', value: '1,234', change: '+12%', color: 'blue' },
    { icon: Calendar, label: 'Rendez-vous Aujourd\'hui', value: '156', change: '+8%', color: 'green' },
    { icon: FileText, label: 'Ordonnances Actives', value: '892', change: '+5%', color: 'purple' },
    { icon: TrendingUp, label: 'Revenus Mensuels', value: '45.2K GNF', change: '+23%', color: 'orange' }
  ]

  const recentAppointments = [
    { id: 1, patient: 'Oumou Baldé', time: '10:30 AM', doctor: 'Dr. Mamadou Diallo', status: 'Confirmé' },
    { id: 2, patient: 'Yaya Barry', time: '11:00 AM', doctor: 'Dr. Thierno Siradjo Baldé', status: 'En attente' },
    { id: 3, patient: 'Kenda Bah', time: '02:00 PM', doctor: 'Dr. Thierno Boubacar Barry', status: 'Confirmé' },
    { id: 4, patient: 'Kadiatou Diakité', time: '03:30 PM', doctor: 'Dr. Mamadou Bassirou Bah', status: 'Annulé' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmé':
        return 'bg-green-100 text-green-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Annulé':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    }
    return colors[color]
  }

  return (
    <Layout>
      {/* Admin Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Shield className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bienvenue, {user?.name}</h2>
            <p className="text-gray-600 text-sm mt-1">En tant qu'administrateur, vous pouvez contrôler et gérer tous les aspects de la clinique.</p>
          </div>
        </div>
        <Link
          to="/dashboard/admin"
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap"
        >
          <Settings className="w-4 h-4" />
          Panneau Admin
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">Bienvenue dans votre espace d'administration</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="relative p-2 bg-white rounded-lg shadow hover:shadow-md transition">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-green-600 text-sm mt-2">↑ {stat.change} ce mois</p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClass(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Rendez-vous Récents</h2>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Voir tous →
            </a>
          </div>

          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{appointment.patient}</p>
                  <p className="text-sm text-gray-600">
                    {appointment.time} • {appointment.doctor}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Actions Rapides</h2>

          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
              + Nouveau Patient
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition">
              + Rendez-vous
            </button>
            <button className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition">
              Générer Rapport
            </button>
            <button className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition">
              Exporter Données
            </button>
          </div>

          {/* Statistics Card */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Taux d'Occupation</p>
            <p className="text-2xl font-bold text-blue-900">87%</p>
            <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance du Mois</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart Placeholder */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Graphique de performance</p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Patients Traités</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">234</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Taux de Satisfaction</p>
              <p className="text-2xl font-bold text-green-600 mt-1">92%</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Rendez-vous Complétés</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">98%</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
