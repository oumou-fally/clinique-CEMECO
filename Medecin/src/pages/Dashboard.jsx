import { Calendar, FileText, Stethoscope, Users, AlertCircle, Plus, TrendingUp, CheckCircle } from 'lucide-react'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  
  const upcomingConsultations = [
    {
      id: 1,
      patient: 'Jean Dupont',
      time: '14:30',
      date: '2024-04-15',
      type: 'Consultation',
      status: 'Confirmé'
    },
    {
      id: 2,
      patient: 'Marie Laurent',
      time: '15:30',
      date: '2024-04-15',
      type: 'Suivi',
      status: 'Confirmé'
    },
    {
      id: 3,
      patient: 'Pierre Martin',
      time: '16:00',
      date: '2024-04-15',
      type: 'Première visite',
      status: 'En attente'
    }
  ]

  const recentReports = [
    {
      id: 1,
      patient: 'Anne Rousseau',
      date: '2024-04-10',
      type: 'Rapport de consultation',
      status: 'Complété'
    },
    {
      id: 2,
      patient: 'Luc Bernard',
      date: '2024-04-08',
      type: 'Diagnostic',
      status: 'Complété'
    }
  ]

  const stats = [
    {
      label: 'Consultations Aujourd\'hui',
      value: '5',
      icon: Calendar,
      color: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-400'
    },
    {
      label: 'Patients Actifs',
      value: '24',
      icon: Users,
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-400'
    },
    {
      label: 'Rapports Complétés',
      value: '12',
      icon: FileText,
      color: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-400'
    },
    {
      label: 'Taux de Satisfaction',
      value: '95%',
      icon: TrendingUp,
      color: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-400'
    }
  ]

  const quickActions = [
    { icon: Plus, label: 'Nouvelle Consultation', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FileText, label: 'Nouveau Rapport', color: 'bg-green-600 hover:bg-green-700' },
    { icon: Users, label: 'Ajouter Patient', color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: Stethoscope, label: 'Mes Disponibilités', color: 'bg-orange-600 hover:bg-orange-700' }
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Bienvenue, Dr. {user?.name?.split(' ').pop()}! 👋</h1>
        <p className="text-gray-600 mt-2">Tableau de bord - {user?.specialty}</p>
      </div>

      {/* Alert */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-900">Tous les rapports sont à jour</p>
          <p className="text-sm text-green-800 mt-1">Vous avez {recentReports.length} rapports complétés cette semaine</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 border ${stat.borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor} opacity-60`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action, idx) => {
          const Icon = action.icon
          return (
            <button key={idx} className={`flex items-center justify-center gap-2 px-4 py-3 ${action.color} text-white rounded-lg font-medium text-sm transition`}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Consultations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Consultations Programmées Aujourd'hui</h2>
            </div>
            <div className="p-6">
              {upcomingConsultations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation) => (
                    <div key={consultation.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{consultation.patient}</p>
                          <p className="text-sm text-gray-500">{consultation.type}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          consultation.status === 'Confirmé'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {consultation.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>{consultation.date} à {consultation.time}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                            Commencer
                          </button>
                          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                            Détails
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune consultation programmée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Medical Reports */}
        <div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Rapports Récents</h2>
            </div>
            <div className="p-6">
              {recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{report.patient}</p>
                          <p className="text-xs text-gray-500 mt-1">{report.type}</p>
                          <p className="text-xs text-gray-400 mt-1">{report.date}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucun rapport</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
