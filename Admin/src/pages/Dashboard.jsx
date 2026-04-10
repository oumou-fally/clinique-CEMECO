import { ArrowRight, BarChart3, Calendar, CreditCard, FileText, Shield, Settings, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../layouts/Layout'

export default function Dashboard() {
  const { user } = useAuth()

  const cards = [
    {
      title: 'Gestion des Utilisateurs',
      description: 'Créer, modifier et supprimer médecins, secrétaires et patients.',
      icon: Users,
      link: '/dashboard/users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Gestion du Système',
      description: 'Paramétrer horaires, services, spécialités et comptes.',
      icon: Settings,
      link: '/dashboard/system',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Supervision',
      description: 'Voir tous les rendez-vous, dossiers médicaux et statistiques.',
      icon: Calendar,
      link: '/dashboard/supervision',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Gestion Financière',
      description: 'Suivre paiements et générer des rapports financiers.',
      icon: CreditCard,
      link: '/dashboard/finance',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const metrics = [
    { label: 'Patients actifs', value: '1,234', icon: Users, color: 'blue' },
    { label: 'Rendez-vous aujourd’hui', value: '156', icon: Calendar, color: 'green' },
    { label: 'Dossiers disponibles', value: '1,234', icon: FileText, color: 'purple' },
    { label: 'Paiements enregistrés', value: '284', icon: CreditCard, color: 'orange' }
  ]

  const getMetricColor = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    }
    return colors[color] || 'bg-gray-50 text-gray-600'
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-6 flex flex-col lg:flex-row lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
              <Shield className="w-5 h-5" />
              Espace Admin
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-6">Bienvenue, {user?.name}</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Gérez les rôles, paramètres, supervision et finances de la clinique depuis un seul tableau de bord central.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard/users"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              <Users className="w-4 h-4" />
              Gérer les utilisateurs
            </Link>
            <Link
              to="/dashboard/finance"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-white font-semibold shadow hover:bg-orange-700 transition"
            >
              <CreditCard className="w-4 h-4" />
              Voir les paiements
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${getMetricColor(metric.color)}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                to={card.link}
                className={`block rounded-3xl p-8 shadow-lg text-white bg-gradient-to-br ${card.color} hover:scale-[1.01] transition`}
              >
                <div className="flex items-center justify-between gap-4 mb-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/80 font-semibold">{card.title}</p>
                  <Icon className="w-7 h-7 opacity-90" />
                </div>
                <h2 className="text-2xl font-bold">{card.description}</h2>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
                  Accéder
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Résumé Rapide</h2>
              <p className="text-gray-600 mt-2">Rôle de l'application : administration globale, supervision et paramétrage centralisé.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-500 mt-1">Pages clés</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-500 mt-1">Rôles gérés</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-sm text-gray-500 mt-1">Contrôle administratif</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">1</p>
                <p className="text-sm text-gray-500 mt-1">Application dédiée</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
