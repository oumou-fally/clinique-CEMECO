import Layout from '../layouts/Layout'
import { Bell, X, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react'

export default function Notifications() {
  const allNotifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'Rappel de consultation',
      message: 'Votre rendez-vous avec Professeur Elhadj Yaya Baldé est demain à 14h30',
      time: 'Il y a 2 heures',
      read: false,
      icon: Calendar
    },
    {
      id: 2,
      type: 'result',
      title: 'Résultat disponible',
      message: 'Vos résultats de bilan sanguin sont maintenant disponibles',
      time: 'Il y a 5 heures',
      read: false,
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'warning',
      title: 'Rappel important',
      message: 'Pensez à renouveler votre ordonnance pour l\'aspirine',
      time: 'Il y a 1 jour',
      read: true,
      icon: AlertCircle
    },
    {
      id: 4,
      type: 'info',
      title: 'Mise à jour disponible',
      message: 'Un nouveau médecin spécialiste a rejoint notre clinique : Docteur Mamadou Diallo',
      time: 'Il y a 2 jours',
      read: true,
      icon: Info
    },
    {
      id: 5,
      type: 'appointment',
      title: 'RDV confirmé',
      message: 'Docteur Thierno Siradjo Baldé a confirmé votre rendez-vous pour le 22/04/2024',
      time: 'Il y a 3 jours',
      read: true,
      icon: Calendar
    },
    {
      id: 6,
      type: 'result',
      title: 'Résultat disponible',
      message: 'Vos résultats de radiographie thorax sont maintenant disponibles',
      time: 'Il y a 5 jours',
      read: true,
      icon: CheckCircle
    }
  ]

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50 border-blue-200'
      case 'result':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-red-50 border-red-200'
      case 'info':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-600'
      case 'result':
        return 'text-green-600'
      case 'warning':
        return 'text-red-600'
      case 'info':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Restez informé de vos consultations et résultats</p>
      </div>

      <div className="space-y-4">
        {allNotifications.map((notification) => {
          const Icon = notification.icon
          return (
            <div
              key={notification.id}
              className={`p-6 rounded-lg border-2 transition hover:shadow-md ${
                getNotificationColor(notification.type)
              } ${!notification.read ? 'opacity-100' : 'opacity-80'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-full ${
                    notification.type === 'appointment' ? 'bg-blue-100' :
                    notification.type === 'result' ? 'bg-green-100' :
                    notification.type === 'warning' ? 'bg-red-100' :
                    'bg-purple-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${getIconColor(notification.type)}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </div>
                </div>

                <button className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition ml-4">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center py-8">
        <p className="text-gray-500 mb-4">Vous êtes à jour avec vos notifications</p>
        <button className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition">
          Paramètres de notification
        </button>
      </div>
    </Layout>
  )
}