import { useState } from 'react'
import Layout from '../layouts/Layout'
import { Calendar, Clock, MapPin, User, X, Plus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming', 'past', 'cancelled'
  const [selectedMonth, setSelectedMonth] = useState(3) // April = 3

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sophie Martin',
      specialty: 'Médecin Généraliste',
      date: '2024-04-15',
      time: '14:30',
      location: 'Clinique Santé Plus - Bureau 301',
      type: 'Consultation Générale',
      status: 'Confirmé'
    },
    {
      id: 2,
      doctor: 'Dr. Jean Rousseau',
      specialty: 'Cardiologue',
      date: '2024-04-22',
      time: '10:00',
      location: 'Clinique Santé Plus - Bureau 105',
      type: 'Suivi Cardiaque',
      status: 'Confirmé'
    },
    {
      id: 3,
      doctor: 'Dr. Marie Durand',
      specialty: 'Dermatologue',
      date: '2024-05-03',
      time: '15:45',
      location: 'Clinique Santé Plus - Bureau 202',
      type: 'Consultation Dermatologie',
      status: 'En attente'
    }
  ]

  const pastAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sophie Martin',
      specialty: 'Médecin Généraliste',
      date: '2024-03-15',
      time: '14:30',
      location: 'Clinique Santé Plus - Bureau 301',
      type: 'Consultation Générale',
      status: 'Complété'
    },
    {
      id: 2,
      doctor: 'Dr. Jean Rousseau',
      specialty: 'Cardiologue',
      date: '2024-03-01',
      time: '10:00',
      location: 'Clinique Santé Plus - Bureau 105',
      type: 'Suivi Cardiaque',
      status: 'Complété'
    }
  ]

  const cancelledAppointments = [
    {
      id: 1,
      doctor: 'Dr. Pierre Lefebvre',
      specialty: 'Orthopédiste',
      date: '2024-02-20',
      time: '09:00',
      location: 'Clinique Santé Plus - Bureau 103',
      type: 'Consultation Orthopédiste',
      status: 'Annulé',
      reason: 'Annulé par le patient'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmé':
        return 'bg-green-100 text-green-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Complété':
        return 'bg-blue-100 text-blue-800'
      case 'Annulé':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const AppointmentCard = ({ appointment, isPast = false }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-teal-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-100 rounded-lg">
            <User className="w-6 h-6 text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{appointment.doctor}</h3>
            <p className="text-sm text-gray-600">{appointment.specialty}</p>
            <p className="text-sm text-teal-600 font-medium mt-1">{appointment.type}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <MapPin className="w-4 h-4 text-teal-600" />
          <span>{appointment.location}</span>
        </div>
      </div>

      {appointment.reason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800"><strong>Raison:</strong> {appointment.reason}</p>
        </div>
      )}

      <div className="flex gap-2">
        {!isPast && appointment.status !== 'Annulé' && (
          <>
            <button className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition">
              Reprogrammer
            </button>
            <button className="flex-1 py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
              Annuler
            </button>
          </>
        )}
        {isPast && appointment.status === 'Complété' && (
          <>
            <button className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition">
              Voir le dossier
            </button>
            <button className="flex-1 py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
              Donner un avis
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
            <p className="text-gray-600 mt-2">Gestion complète de vos consultations</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition">
            <Plus className="w-5 h-5" />
            Nouveau RDV
          </button>
        </div>
      </div>

      {/* Alert */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-900">Vous avez un rendez-vous demain</p>
          <p className="text-sm text-green-800 mt-1">Dr. Sophie Martin à 14h30 - Confirmé</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'upcoming'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          À venir ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'past'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Passés ({pastAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'cancelled'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Annulés ({cancelledAppointments.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && upcomingAppointments.length > 0 && (
          <>
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </>
        )}

        {activeTab === 'past' && pastAppointments.length > 0 && (
          <>
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
            ))}
          </>
        )}

        {activeTab === 'cancelled' && cancelledAppointments.length > 0 && (
          <>
            {cancelledAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </>
        )}

        {(activeTab === 'upcoming' && upcomingAppointments.length === 0) ||
        (activeTab === 'past' && pastAppointments.length === 0) ||
        (activeTab === 'cancelled' && cancelledAppointments.length === 0) ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun rendez-vous à afficher</p>
            <p className="text-gray-400 text-sm mt-2">
              {activeTab === 'upcoming'
                ? 'Prenez rendez-vous avec nos médecins'
                : activeTab === 'past'
                ? 'Vos rendez-vous passés apparaîtront ici'
                : 'Vos rendez-vous annulés apparaîtront ici'}
            </p>
          </div>
        ) : null}
      </div>

      {/* Calendar Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendrier des Rendez-vous</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Avril 2024</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Simple Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="font-semibold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}

            {[...Array(30)].map((_, i) => {
              const day = i + 1
              const hasAppointment = [15, 22].includes(day)
              return (
                <div
                  key={day}
                  className={`p-3 rounded-lg text-sm font-medium cursor-pointer transition ${
                    hasAppointment
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-600 rounded"></div>
              <span className="text-gray-600">Avec RDV</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
