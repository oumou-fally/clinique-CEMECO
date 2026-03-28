import { Calendar, FileText, Stethoscope, Phone, MapPin, Clock, ArrowRight, Heart, AlertCircle } from 'lucide-react'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sophie Martin',
      specialty: 'Médecin Généraliste',
      date: '2024-04-15',
      time: '14:30',
      location: 'Clinique Santé Plus - Bureau 301',
      type: 'Consultation'
    },
    {
      id: 2,
      doctor: 'Dr. Jean Rousseau',
      specialty: 'Cardiologue',
      date: '2024-04-22',
      time: '10:00',
      location: 'Clinique Santé Plus - Bureau 105',
      type: 'Suivi Cardiaque'
    }
  ]

  const medicalInfo = [
    { label: 'Groupe Sanguin', value: 'O+' },
    { label: 'Allergies', value: 'Pénicilline' },
    { label: 'Tension Artérielle', value: '120/80 mmHg' },
    { label: 'Poids', value: '75 kg' }
  ]

  const quickActions = [
    { icon: Calendar, label: 'Prendre RDV', color: 'bg-teal-500' },
    { icon: Phone, label: 'Appeler', color: 'bg-blue-500' },
    { icon: FileText, label: 'Ordonnances', color: 'bg-green-500' },
    { icon: Heart, label: 'Mes Résultats', color: 'bg-red-500' }
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Bienvenue, {user?.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Voici un aperçu de votre santé et vos rendez-vous</p>
      </div>

      {/* Alert */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Rappel de consultation</p>
          <p className="text-sm text-blue-800 mt-1">Vous avez un rendez-vous demain avec Dr. Martin à 14h30</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-6 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prochains RDV</p>
              <p className="text-3xl font-bold text-teal-600 mt-2">2</p>
            </div>
            <Calendar className="w-10 h-10 text-teal-400 opacity-30" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Médecins</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
            </div>
            <Stethoscope className="w-10 h-10 text-blue-400 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dossiers</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">8</p>
            </div>
            <FileText className="w-10 h-10 text-purple-400 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Score Santé</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">86%</p>
            </div>
            <Heart className="w-10 h-10 text-orange-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Prochains Rendez-vous</h2>
            </div>
            <div className="p-6">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{appointment.doctor}</p>
                          <p className="text-sm text-gray-500">{appointment.specialty}</p>
                        </div>
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                          {appointment.type}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span>{appointment.date} à {appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 text-teal-600" />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition">
                          Reprogrammer
                        </button>
                        <button className="flex-1 py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun rendez-vous à venir</p>
                </div>
              )}
              
              <button className="w-full mt-4 py-3 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Ajouter un Rendez-vous
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Actions Rapides</h2>
            </div>
            <div className="p-6 space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`w-full py-3 ${action.color} hover:opacity-90 text-white rounded-lg font-medium transition flex items-center justify-center gap-2`}
                >
                  <action.icon className="w-5 h-5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Medical Info Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Mon Profil Médical</h2>
            </div>
            <div className="p-6 space-y-3">
              {medicalInfo.map((info, index) => (
                <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                  <p className="text-xs font-semibold text-gray-600 uppercase">{info.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Records Preview */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Mes Dossiers Récents</h2>
          <a href="/dashboard/medical-record" className="flex items-center gap-2 text-white hover:text-gray-100 text-sm font-medium">
            Voir tous <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Médecin</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">15/03/2024</td>
                <td className="px-6 py-4 text-sm text-gray-600">Bilan Sanguin</td>
                <td className="px-6 py-4 text-sm text-gray-600">Dr. Sophie Martin</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Reçu</span></td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">01/03/2024</td>
                <td className="px-6 py-4 text-sm text-gray-600">Radiographie</td>
                <td className="px-6 py-4 text-sm text-gray-600">Dr. Jean Rousseau</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Confirmé</span></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">18/02/2024</td>
                <td className="px-6 py-4 text-sm text-gray-600">ECG</td>
                <td className="px-6 py-4 text-sm text-gray-600">Dr. Sophie Martin</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Reçu</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
