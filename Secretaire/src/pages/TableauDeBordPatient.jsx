import { Calendar, FileText, Stethoscope, Phone, MapPin, Clock, ArrowRight, Heart, AlertCircle } from 'lucide-react'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'

// =========================
// COMPOSANT PRINCIPAL : TABLEAU DE BORD PATIENT
// =========================
export default function TableauDeBordPatient() {

  // =========================
  // AUTHENTIFICATION UTILISATEUR
  // =========================
  const { user } = useAuth()

  // =========================
  // DONNÉES : RENDEZ-VOUS À VENIR
  // =========================
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sophie Martin',
      specialty: 'Médecin Généraliste',
      date: '2024-04-15',
      time: '14:30',
      location: 'Clinique Santé Plus - Bureau 301',
      type: 'Consultation'
    }
  ]

  // =========================
  // DONNÉES : INFORMATIONS MÉDICALES
  // =========================
  const medicalInfo = [
    { label: 'Groupe Sanguin', value: 'O+' },
    { label: 'Allergies', value: 'Pénicilline' },
    { label: 'Tension Artérielle', value: '120/80 mmHg' },
    { label: 'Poids', value: '75 kg' }
  ]

  // =========================
  // ACTIONS RAPIDES (SHORTCUTS UTILISATEUR)
  // =========================
  const quickActions = [
    { icon: Calendar, label: 'Prendre RDV', color: 'bg-teal-500' },
    { icon: Phone, label: 'Appeler', color: 'bg-blue-500' },
    { icon: FileText, label: 'Ordonnances', color: 'bg-green-500' },
    { icon: Heart, label: 'Mes Résultats', color: 'bg-red-500' }
  ]

  return (
    <Layout>

      {/* ========================= */}
      {/* EN-TÊTE / ACCUEIL UTILISATEUR */}
      {/* ========================= */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenue, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre santé et vos rendez-vous
        </p>
      </div>

      {/* ========================= */}
      {/* BLOC ALERTE / RAPPEL */}
      {/* ========================= */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Rappel de consultation</p>
          <p className="text-sm text-blue-800 mt-1">
            Vous avez un rendez-vous demain avec Dr. Martin à 14h30
          </p>
        </div>
      </div>

      {/* ========================= */}
      {/* STATISTIQUES RAPIDES */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-6 border border-teal-200">
          <p className="text-sm text-gray-600">Prochains RDV</p>
          <p className="text-3xl font-bold text-teal-600 mt-2">2</p>
        </div>
      </div>

      {/* ========================= */}
      {/* LISTE DES RENDEZ-VOUS */}
      {/* ========================= */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Prochains Rendez-vous</h2>

        {upcomingAppointments.map((appointment) => (
          <div key={appointment.id} className="p-4 border rounded-lg mb-4">
            <p className="font-bold">{appointment.doctor}</p>
            <p className="text-sm text-gray-600">{appointment.specialty}</p>
            <p className="text-sm text-gray-600">
              {appointment.date} à {appointment.time}
            </p>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* ACTIONS RAPIDES UTILISATEUR */}
      {/* ========================= */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Actions Rapides</h2>

        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`w-full py-3 ${action.color} text-white rounded-lg flex items-center justify-center gap-2`}
            >
              <action.icon className="w-5 h-5" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* DOSSIERS MÉDICAUX RÉCENTS */}
      {/* ========================= */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Mes Dossiers Récents</h2>

        <table className="w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Médecin</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>15/03/2024</td>
              <td>Bilan Sanguin</td>
              <td>Dr. Sophie Martin</td>
              <td>Reçu</td>
            </tr>
          </tbody>
        </table>
      </div>

    </Layout>
  )
}