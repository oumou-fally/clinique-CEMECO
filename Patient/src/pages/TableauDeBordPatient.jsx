import { Calendar, FileText, Stethoscope, Phone, MapPin, Clock, ArrowRight, Heart, AlertCircle, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import AppointmentForm from '../components/AppointmentForm'
import AskDoctorForm from '../components/AskDoctorForm'

// ===================== COMPOSANT PRINCIPAL =====================
// Tableau de bord du patient
export default function TableauDeBordPatient() {

  // ===================== AUTH =====================
  // Récupération des informations de l'utilisateur connecté
  const { user, patientId, isAuthenticated } = useAuth()

  // ===================== LOGS =====================
  useEffect(() => {
    console.log('📊 TableauDeBordPatient chargé')
    console.log('✅ Authentifié:', isAuthenticated)
    console.log('👤 Données du patient:', user)
    console.log('🆔 ID du patient:', patientId)
    console.log('📂 localStorage.patient:', JSON.parse(localStorage.getItem('patient') || 'null'))
    console.log('📍 localStorage.patientId:', localStorage.getItem('patientId'))
    
    if (isAuthenticated && user) {
      console.log('✓ Nom du patient:', user.nomComplet)
      console.log('✓ Email:', user.email)
      console.log('✓ ID complet:', user.id)
    }
  }, [user, patientId, isAuthenticated])

  // ===================== ETATS =====================
  // Contrôle l'affichage du formulaire de rendez-vous
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)

  // Contrôle l'affichage du formulaire de consultation (poser une question)
  const [showConsultationForm, setShowConsultationForm] = useState(false)

  // ===================== DONNÉES SIMULÉES =====================
  // Liste des prochains rendez-vous
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Professeur Elhadj Yaya Baldé',
      specialty: 'Cardiologue',
      date: '2026-04-15',
      time: '14:30',
      location: 'CEMECO Cabinet de Cardiologie - Kipé',
      type: 'Consultation Cardiaque'
    },
    {
      id: 2,
      doctor: 'Docteur Mamadou Bassirou Bah',
      specialty: 'Cardiologue',
      date: '2026-04-22',
      time: '10:00',
      location: 'CEMECO Cabinet de Cardiologie - Kipé',
      type: 'Suivi Tensionnel'
    }
  ]

  // Informations médicales du patient
  const medicalInfo = [
    { label: 'Groupe Sanguin', value: 'O+' },
    { label: 'Allergies', value: 'Pénicilline' },
    { label: 'Tension Artérielle', value: '120/80 mmHg' },
    { label: 'Poids', value: '75 kg' }
  ]

  // Actions rapides affichées dans le dashboard
  const quickActions = [
    { icon: Calendar, label: 'Prendre RDV', color: 'bg-teal-500' },
    { icon: Phone, label: 'Appeler', color: 'bg-blue-500' },
    { icon: FileText, label: 'Ordonnances', color: 'bg-green-500' },
    { icon: Heart, label: 'Mes Résultats', color: 'bg-red-500' }
  ]

  return (
    <Layout>

      {/* ===================== EN-TÊTE ===================== */}
      <div className="mb-8">
       <h1 className="text-4xl font-bold text-gray-900">
  Bienvenue, {user?.prenom} {user?.nom}! 👋
</h1>
        <p className="text-gray-600 mt-2">ID Patient: {patientId} — Email: {user?.email || 'N/A'}</p>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre état de santé</p>
      </div>

      {/* ===================== ALERTE ===================== */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Rappel de consultation</p>
          <p className="text-sm text-blue-800 mt-1">Vous avez un rendez-vous demain</p>
        </div>
      </div>

      {/* ===================== STATISTIQUES ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm">Prochains RDV</p>
          <p className="text-3xl font-bold">2</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm">Médecins</p>
          <p className="text-3xl font-bold">3</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm">Dossiers</p>
          <p className="text-3xl font-bold">8</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm">Score Santé</p>
          <p className="text-3xl font-bold">86%</p>
        </div>

      </div>

      {/* ===================== RENDEZ-VOUS ===================== */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Prochains Rendez-vous</h2>

        {upcomingAppointments.map((appointment) => (
          <div key={appointment.id} className="mb-4 border p-4 rounded-lg">
            <p className="font-bold">{appointment.doctor}</p>
            <p className="text-sm text-gray-600">{appointment.specialty}</p>
            <p className="text-sm">{appointment.date} à {appointment.time}</p>
            <p className="text-sm text-gray-500">{appointment.location}</p>
          </div>
        ))}

        <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg">
          Ajouter un rendez-vous
        </button>
      </div>

      {/* ===================== ACTIONS RAPIDES ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button onClick={() => setShowAppointmentForm(true)} className="bg-teal-500 text-white p-4 rounded-lg">
          Prendre RDV
        </button>
        <Link to="/dashboard/consultations" className="bg-purple-500 text-white p-4 rounded-lg text-center">
          Poser Question
        </Link>
        <Link to="/dashboard/medical-record" className="bg-green-500 text-white p-4 rounded-lg text-center">
          Ordonnances
        </Link>
        <Link to="/dashboard/doctors" className="bg-red-500 text-white p-4 rounded-lg text-center">
          Mes Médecins
        </Link>
      </div>

      {/* ===================== PROFIL MÉDICAL ===================== */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Mon Profil Médical</h2>

        {medicalInfo.map((info, index) => (
          <div key={index} className="border-b py-2">
            <p className="text-xs text-gray-500">{info.label}</p>
            <p className="font-bold">{info.value}</p>
          </div>
        ))}
      </div>

      {/* ===================== FORMULAIRES MODALS ===================== */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSubmit={(formData) => {
          console.log('Rendez-vous:', formData)
          alert('Rendez-vous demandé avec succès!')
          setShowAppointmentForm(false)
        }}
      />

      <AskDoctorForm
        isOpen={showConsultationForm}
        onClose={() => setShowConsultationForm(false)}
        onSubmit={(formData) => {
          console.log('Consultation:', formData)
          alert('Question envoyée!')
          setShowConsultationForm(false)
        }}
      />

    </Layout>
  )
}
