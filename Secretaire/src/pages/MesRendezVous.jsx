import { useState } from 'react'
import Layout from '../layouts/Layout'
import { Calendar, Clock, MapPin, User, X, Plus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

// Fonction principale renommée en français
export default function MesRendezVous() {

  // =========================
  // ETAT GLOBAL (STATE)
  // =========================
  // Onglet actif : à venir, passés ou annulés
  const [activeTab, setActiveTab] = useState('upcoming')

  // Mois sélectionné pour le calendrier
  const [selectedMonth, setSelectedMonth] = useState(3)

  // =========================
  // DONNÉES DES RENDEZ-VOUS
  // =========================
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Professeur Elhadj Yaya Baldé',
      specialty: 'Cardiologie',
      date: '2024-04-15',
      time: '14:30',
      location: 'Clinique Santé Plus - Bureau 101',
      type: 'Consultation Cardiologique',
      status: 'Confirmé'
    }
  ]

  const pastAppointments = []
  const cancelledAppointments = []

  // =========================
  // COULEUR DU STATUT
  // =========================
  // Permet d'afficher une couleur selon le statut du rendez-vous
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

  // =========================
  // COMPOSANT CARTE RENDEZ-VOUS
  // =========================
  const AppointmentCard = ({ appointment, isPast = false }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-teal-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-100 rounded-lg">
            <User className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            {/* Nom du médecin */}
            <h3 className="text-lg font-bold text-gray-900">{appointment.doctor}</h3>
            {/* Spécialité */}
            <p className="text-sm text-gray-600">{appointment.specialty}</p>
            {/* Type de consultation */}
            <p className="text-sm text-teal-600 font-medium mt-1">{appointment.type}</p>
          </div>
        </div>

        {/* Statut */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      {/* Informations date, heure et lieu */}
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

      {/* Raison si disponible */}
      {appointment.reason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800"><strong>Raison:</strong> {appointment.reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isPast && appointment.status !== 'Annulé' && (
          <>
            <button className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg text-sm font-medium">
              Reprogrammer
            </button>
            <button className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium">
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  )

  // =========================
  // RENDU PRINCIPAL
  // =========================
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
        <p className="text-gray-600 mt-2">Gestion complète de vos consultations</p>
      </div>

      {/* Tabs de navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button onClick={() => setActiveTab('upcoming')}>
          À venir
        </button>
        <button onClick={() => setActiveTab('past')}>
          Passés
        </button>
        <button onClick={() => setActiveTab('cancelled')}>
          Annulés
        </button>
      </div>

      {/* Affichage conditionnel des rendez-vous */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && upcomingAppointments.map(appt => (
          <AppointmentCard key={appt.id} appointment={appt} />
        ))}
      </div>

      {/* Calendrier */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Calendrier</h2>
      </div>
    </Layout>
  )
}
