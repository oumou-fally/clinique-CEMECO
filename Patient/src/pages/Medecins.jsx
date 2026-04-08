import { useState } from 'react'
import Layout from '../layouts/Layout'
import { Star, MapPin, Phone, Mail, Calendar, MessageCircle, Search, Filter } from 'lucide-react'
import AskDoctorForm from '../components/AskDoctorForm'
import AppointmentForm from '../components/AppointmentForm'

// Composant principal de la page des médecins (renommé en français pour faciliter la recherche)
export default function Medecins() {
  // États pour gérer l'ouverture des formulaires et le médecin sélectionné
  const [showAskForm, setShowAskForm] = useState(false)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  // Liste des médecins (données affichées)
  const doctors = [
    {
      id: 1,
      name: 'Professeur Elhadji Yaya Baldé',
      specialty: 'Cardiologue',
      rating: 4.9,
      reviews: 185,
      location: 'Cabinet de Cardiologie',
      phone: '224 33 849 XX XX',
      email: 'yaya.balde@cardiologie.sn',
      availability: 'Lundi-Vendredi après-midi, Samedi 8h-17h',
      nextAvailable: 'Demain 10:00'
    },
    {
      id: 2,
      name: 'Dr. Mamadou Bassirou Bah',
      specialty: 'Cardiologue',
      rating: 4.8,
      reviews: 156,
      location: 'Cabinet de Cardiologie',
      phone: '224 33 849 XX XX',
      email: 'mamadou.bassirou@cardiologie.sn',
      availability: 'Lundi-Vendredi 8h-17h',
      nextAvailable: '20/04/2024 14:30'
    }
    // Autres médecins...
  ]

  // Liste des spécialités pour filtrage
  const specialties = [
    'Tous',
    'Cardiologie',
    'Arythmie',
    'Hypertension',
    'Insuffisance Cardiaque',
    'Prévention'
  ]

  return (
    <Layout>
      {/* Titre de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Cardiologues</h1>
        <p className="text-gray-600 mt-2">Rencontrez notre équipe de spécialistes en cardiologie</p>
      </div>

      {/* Zone de recherche et filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Recherche médecin */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Bouton filtre */}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
            <Filter className="w-5 h-5" />
            Filtrer
          </button>
        </div>

        {/* Filtres par spécialité */}
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                index === 0
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des médecins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
            {/* En-tête carte médecin */}
            <div className="bg-gradient-to-r from-teal-600 to-green-600 p-6 text-white">
              <div className="flex items-start justify-end mb-4">
                <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-white" />
                  <span className="text-sm font-semibold">{doctor.rating}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold">{doctor.name}</h3>
              <p className="text-teal-100 mt-1">{doctor.specialty}</p>
            </div>

            {/* Contenu carte */}
            <div className="p-6">
              {/* Informations localisation */}
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Localisation</p>
                  <p className="text-sm text-gray-900">{doctor.location}</p>
                </div>
              </div>

              {/* Disponibilité */}
              <div className="flex items-start gap-3 mb-3">
                <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Disponibilité</p>
                  <p className="text-sm text-gray-900">{doctor.availability}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{doctor.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{doctor.email}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor)
                    setShowAppointmentForm(true)
                  }}
                  className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Prendre RDV
                </button>

                <button
                  onClick={() => {
                    setSelectedDoctor(doctor)
                    setShowAskForm(true)
                  }}
                  className="flex-1 py-3 px-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Poser Question
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire poser question */}
      <AskDoctorForm
        isOpen={showAskForm}
        onClose={() => {
          setShowAskForm(false)
          setSelectedDoctor(null)
        }}
        selectedDoctorId={selectedDoctor?.id}
        onSubmit={(formData) => {
          console.log('Consultation avec', selectedDoctor?.name, formData)
          alert('Question envoyée avec succès!')
          setShowAskForm(false)
          setSelectedDoctor(null)
        }}
      />

      {/* Formulaire rendez-vous */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false)
          setSelectedDoctor(null)
        }}
        selectedDoctorId={selectedDoctor?.id}
        onSubmit={(formData) => {
          console.log('Rendez-vous avec', selectedDoctor?.name, formData)
          alert('Rendez-vous réservé avec succès!')
          setShowAppointmentForm(false)
          setSelectedDoctor(null)
        }}
      />
    </Layout>
  )
}
