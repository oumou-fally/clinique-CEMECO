import { useState } from 'react'
import Layout from '../layouts/Layout'
import { Calendar, Clock, MapPin, User, X, Plus, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import AppointmentForm from '../components/AppointmentForm'

// ===================== COMPOSANT PRINCIPAL =====================
// Page de gestion des rendez-vous du patient
export default function MesRendezVous() {

  // ===================== ETAT =====================
  // Onglet actif : 'upcoming', 'past', 'cancelled'
  const [activeTab, setActiveTab] = useState('upcoming')

  // Contrôle l'affichage du formulaire de prise de rendez-vous
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)

  // ===================== DONNÉES SIMULÉES =====================
  // Rendez-vous à venir
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Professeur Elhadj Yaya Baldé',
      specialty: 'Cardiologue',
      date: '2026-04-15',
      time: '14:30',
      location: 'Cabinet de Cardiologie - Bureau 101',
      type: 'Consultation Cardiaque',
      status: 'Confirmé'
    }
  ]

  // Rendez-vous passés
  const pastAppointments = [
    {
      id: 1,
      doctor: 'Professeur Elhadj Yaya Baldé',
      specialty: 'Cardiologue',
      date: '2026-03-15',
      time: '14:30',
      location: 'Cabinet de Cardiologie - Bureau 101',
      type: 'Consultation Cardiaque',
      status: 'Complété'
    }
  ]

  // Rendez-vous annulés
  const cancelledAppointments = [
    {
      id: 1,
      doctor: 'Docteur Mamadou Diallo',
      specialty: 'Cardiologue',
      date: '2026-02-20',
      time: '09:00',
      location: 'CEMECO Cabinet de Cardiologie - Kipé',
      type: 'Électrocardiogramme',
      status: 'Annulé',
      reason: 'Annulé par le patient'
    }
  ]

  // ===================== SOUMISSION NOUVEAU RENDEZ-VOUS =====================
  // Fonction appelée lors de la création d’un rendez-vous
  const handleAppointmentSubmit = (formData) => {
    const newAppointment = {
      id: Math.max(...upcomingAppointments.map(a => a.id), 0) + 1,
      doctor: formData.doctor,
      specialty: 'Consultation',
      date: formData.date,
      time: formData.time,
      location: 'CEMECO Cabinet de Cardiologie - Kipé',
      type: formData.reason,
      status: 'En attente',
      consultationType: formData.consultationType,
      notes: formData.notes
    }

    // Simulation d’envoi vers un backend
    console.log('Nouveau rendez-vous:', newAppointment)

    alert('Rendez-vous demandé avec succès! Vous recevrez une confirmation par email.')
  }

  // ===================== COULEUR SELON STATUT =====================
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

  // ===================== COMPOSANT CARTE RENDEZ-VOUS =====================
  // Affichage d’un rendez-vous individuel
  const AppointmentCard = ({ appointment, isPast = false }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">

      {/* Informations principales */}
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">{appointment.doctor}</h3>
          <p className="text-sm text-gray-600">{appointment.specialty}</p>
          <p className="text-sm text-teal-600 font-medium">{appointment.type}</p>
        </div>

        {/* Statut */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      {/* Détails (date, heure, lieu) */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          {appointment.date}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          {appointment.time}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4" />
          {appointment.location}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isPast && appointment.status !== 'Annulé' && (
          <>
            <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg">
              Reprogrammer
            </button>
            <button className="flex-1 border py-2 rounded-lg">
              Annuler
            </button>
          </>
        )}

        {isPast && appointment.status === 'Complété' && (
          <>
            <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg">
              Voir dossier
            </button>
            <button className="flex-1 border py-2 rounded-lg">
              Avis
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <Layout>

      {/* ===================== EN-TÊTE ===================== */}
      <div className="mb-8 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
          <p className="text-gray-600">Gestion de vos consultations</p>
        </div>

        {/* Bouton nouveau rendez-vous */}
        <button onClick={() => setShowAppointmentForm(true)} className="bg-teal-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau RDV
        </button>
      </div>

      {/* ===================== CONTENU ===================== */}
      <div className="space-y-4">

        {/* Liste des rendez-vous à venir */}
        {activeTab === 'upcoming' && upcomingAppointments.map(a => (
          <AppointmentCard key={a.id} appointment={a} />
        ))}

        {/* Liste des rendez-vous passés */}
        {activeTab === 'past' && pastAppointments.map(a => (
          <AppointmentCard key={a.id} appointment={a} isPast={true} />
        ))}

        {/* Liste des rendez-vous annulés */}
        {activeTab === 'cancelled' && cancelledAppointments.map(a => (
          <AppointmentCard key={a.id} appointment={a} />
        ))}

      </div>

      {/* ===================== FORMULAIRE MODAL ===================== */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSubmit={handleAppointmentSubmit}
      />

    </Layout>
  )
}
