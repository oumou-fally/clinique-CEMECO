import { Phone, Mail, Search, Filter } from 'lucide-react'
import Layout from '../layouts/Layout'
import { DOCTORS } from '../data/clinicData'

export default function Medecins() {

  const specialties = ['Tous', 'Cardiologie']

  return (
    <Layout>

      {/* EN-TÊTE */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Médecins</h1>
        <p className="text-gray-600 mt-2">
          Trouvez et prenez rendez-vous avec nos spécialistes
        </p>
      </div>

      {/* RECHERCHE */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <Filter className="w-5 h-5" />
            Filtrer
          </button>
        </div>

        <div className="flex gap-2">
          {specialties.map((s, i) => (
            <button key={i} className="px-4 py-2 bg-gray-100 rounded-full">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOCTORS.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl shadow-lg p-6">

            <h3 className="text-xl font-bold">{doctor.name}</h3>
            <p className="text-gray-600">{doctor.specialty}</p>

            <div className="mt-4 space-y-2">
              <p><strong>Note :</strong> {doctor.rating}/5 ({doctor.reviews} avis)</p>
              <p><strong>Disponibilité :</strong> {doctor.availability}</p>
            </div>

            <div className="mt-4 space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {doctor.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {doctor.email}
              </p>
            </div>

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

      <div className="mt-8 text-center">
        <button className="px-6 py-3 border rounded-lg">
          Voir plus de médecins
        </button>
      </div>

    </Layout>
  )
}