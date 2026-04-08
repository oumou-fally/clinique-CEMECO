import { Star, MapPin, Phone, Mail, Calendar, Video, Search, Filter } from 'lucide-react'
import Layout from '../layouts/Layout'

// Fonction principale renommée en français
export default function Medecins() {

  // =========================
  // DONNÉES : LISTE DES MÉDECINS
  // =========================
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sophie Martin',
      specialty: 'Médecin Généraliste',
      rating: 4.8,
      reviews: 128,
      experience: '12 ans',
      location: 'Clinique Santé Plus - Bureau 301',
      phone: '01 45 67 89 00',
      email: 'sophie.martin@clinic.com',
      availability: 'Lundi à Vendredi',
      nextAvailable: 'Demain 14:30',
      image: '👩‍⚕️'
    }
  ]

  // =========================
  // FILTRES : SPÉCIALITÉS
  // =========================
  const specialties = [
    'Tous',
    'Médecin Généraliste',
    'Cardiologue',
    'Dermatologue',
    'Orthopédiste',
    'Pédiatre',
    'Neurologue'
  ]

  return (
    <Layout>

      {/* ========================= */}
      {/* EN-TÊTE */}
      {/* ========================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Médecins</h1>
        <p className="text-gray-600 mt-2">
          Trouvez et prenez rendez-vous avec nos spécialistes
        </p>
      </div>

      {/* ========================= */}
      {/* RECHERCHE ET FILTRE */}
      {/* ========================= */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <Filter className="w-5 h-5" />
            Filtrer
          </button>
        </div>

        {/* Filtre par spécialité */}
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty, index) => (
            <button key={index} className="px-4 py-2 rounded-full bg-gray-100">
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* LISTE DES MÉDECINS */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl shadow-lg p-6">

            {/* Informations principales */}
            <h3 className="text-xl font-bold">{doctor.name}</h3>
            <p className="text-gray-600">{doctor.specialty}</p>

            {/* Évaluation */}
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400" />
              ))}
              <span className="text-sm text-gray-600">({doctor.reviews} avis)</span>
            </div>

            {/* Informations détaillées */}
            <div className="mt-4 space-y-2">
              <p><strong>Expérience :</strong> {doctor.experience}</p>
              <p><strong>Localisation :</strong> {doctor.location}</p>
              <p><strong>Disponibilité :</strong> {doctor.availability}</p>
              <p className="text-teal-600 font-bold">Prochain RDV : {doctor.nextAvailable}</p>
            </div>

            {/* Contact */}
            <div className="mt-4">
              <p className="text-sm">📞 {doctor.phone}</p>
              <p className="text-sm">📧 {doctor.email}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg">
                Prendre RDV
              </button>
              <button className="flex-1 border py-2 rounded-lg">
                Téléconsultation
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* BOUTON CHARGER PLUS */}
      {/* ========================= */}
      <div className="mt-8 text-center">
        <button className="px-6 py-3 border rounded-lg">
          Voir plus de médecins
        </button>
      </div>

    </Layout>
  )
}
