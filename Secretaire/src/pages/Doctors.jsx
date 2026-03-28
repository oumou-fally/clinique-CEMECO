import Layout from '../layouts/Layout'
import { Star, MapPin, Phone, Mail, Calendar, Video, Search, Filter } from 'lucide-react'

export default function Doctors() {
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
    },
    {
      id: 2,
      name: 'Dr. Jean Rousseau',
      specialty: 'Cardiologue',
      rating: 4.9,
      reviews: 156,
      experience: '15 ans',
      location: 'Clinique Santé Plus - Bureau 105',
      phone: '01 45 67 89 01',
      email: 'jean.rousseau@clinic.com',
      availability: 'Lundi, Mercredi, Vendredi',
      nextAvailable: '20/04/2024 10:00',
      image: '👨‍⚕️'
    },
    {
      id: 3,
      name: 'Dr. Marie Durand',
      specialty: 'Dermatologue',
      rating: 4.7,
      reviews: 95,
      experience: '8 ans',
      location: 'Clinique Santé Plus - Bureau 202',
      phone: '01 45 67 89 02',
      email: 'marie.durand@clinic.com',
      availability: 'Mardi à Samedi',
      nextAvailable: '19/04/2024 16:00',
      image: '👩‍⚕️'
    },
    {
      id: 4,
      name: 'Dr. Pierre Lefebvre',
      specialty: 'Orthopédiste',
      rating: 4.6,
      reviews: 112,
      experience: '10 ans',
      location: 'Clinique Santé Plus - Bureau 103',
      phone: '01 45 67 89 03',
      email: 'pierre.lefebvre@clinic.com',
      availability: 'Tous les jours sauf dimanche',
      nextAvailable: 'Lundi 15/04/2024 09:00',
      image: '👨‍⚕️'
    }
  ]

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Médecins</h1>
        <p className="text-gray-600 mt-2">Trouvez et prenez rendez-vous avec nos spécialistes</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
            <Filter className="w-5 h-5" />
            Filtrer
          </button>
        </div>

        {/* Specialty Filter */}
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

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-green-600 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{doctor.image}</div>
                <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-white" />
                  <span className="text-sm font-semibold">{doctor.rating}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold">{doctor.name}</h3>
              <p className="text-teal-100 mt-1">{doctor.specialty}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Rating and Reviews */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(doctor.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({doctor.reviews} avis)</span>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Expérience</p>
                    <p className="text-sm text-gray-900">{doctor.experience}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Localisation</p>
                    <p className="text-sm text-gray-900">{doctor.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Disponibilité</p>
                    <p className="text-sm text-gray-900">{doctor.availability}</p>
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-teal-900 uppercase">Prochain RDV</p>
                  <p className="text-sm font-bold text-teal-700 mt-1">{doctor.nextAvailable}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
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
                <button className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Prendre RDV
                </button>
                <button className="flex-1 py-3 px-4 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                  <Video className="w-5 h-5" />
                  Téléconsultation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="px-8 py-3 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold transition">
          Voir plus de médecins
        </button>
      </div>
    </Layout>
  )
}
