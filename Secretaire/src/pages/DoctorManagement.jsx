import { useState } from 'react'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Award,
  Clock
} from 'lucide-react'
import Layout from '../layouts/Layout'

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. Sophie Martin',
      specialty: 'Médecin Généraliste',
      phone: '01 45 67 89 00',
      email: 'sophie.martin@clinic.com',
      location: 'Bureau 301',
      experience: '12 ans',
      patients: 45,
      rating: 4.8,
      status: 'active'
    },
    {
      id: 2,
      name: 'Dr. Jean Rousseau',
      specialty: 'Cardiologue',
      phone: '01 45 67 89 01',
      email: 'jean.rousseau@clinic.com',
      location: 'Bureau 105',
      experience: '15 ans',
      patients: 38,
      rating: 4.9,
      status: 'active'
    },
    {
      id: 3,
      name: 'Dr. Marie Durand',
      specialty: 'Dermatologue',
      phone: '01 45 67 89 02',
      email: 'marie.durand@clinic.com',
      location: 'Bureau 202',
      experience: '8 ans',
      patients: 32,
      rating: 4.7,
      status: 'active'
    },
    {
      id: 4,
      name: 'Dr. Pierre Lefebvre',
      specialty: 'Psychiatre',
      phone: '01 45 67 89 03',
      email: 'pierre.lefebvre@clinic.com',
      location: 'Bureau 401',
      experience: '10 ans',
      patients: 28,
      rating: 4.6,
      status: 'inactive'
    }
  ])

  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [patients, setPatients] = useState([
    { id: 1, name: 'Jean Dupont', age: 45, phone: '06 12 34 56 78' },
    { id: 2, name: 'Marie Lefevre', age: 32, phone: '06 23 45 67 89' },
    { id: 3, name: 'Pierre Martin', age: 58, phone: '06 34 56 78 90' },
    { id: 4, name: 'Anne Durand', age: 28, phone: '06 45 67 89 01' },
    {
      id: 5,
      name: 'Luc Bernard',
      age: 72,
      phone: '06 56 78 90 12'
    }
  ])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Médecins</h1>
            <p className="text-gray-600 mt-2">Gérez les médecins et attribuez-leur des patients</p>
          </div>
          <button className="bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter un Médecin
          </button>
        </div>

        {/* Doctors Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`rounded-xl shadow-md overflow-hidden transition cursor-pointer ${
                selectedDoctor?.id === doctor.id ? 'ring-2 ring-teal-600' : ''
              } ${doctor.status === 'active' ? 'bg-white' : 'bg-gray-50'}`}
              onClick={() => setSelectedDoctor(doctor)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-linear-to-br from-teal-500 to-green-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {doctor.name[4]}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      doctor.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {doctor.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm">{doctor.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{doctor.specialty}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-700">{doctor.patients} patients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-700">{doctor.rating}/5 étoiles</span>
                  </div>
                </div>

                <button className="w-full text-teal-600 hover:text-teal-700 font-semibold text-xs py-2 border-t">
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Doctor Details and Patient Assignment */}
        {selectedDoctor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Doctor Details */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations du Médecin</h2>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Données Personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Nom</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Spécialité</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.specialty}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Expérience</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.experience}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Bureau</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.location}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-teal-600" />
                      <span className="text-gray-700">{selectedDoctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-teal-600" />
                      <span className="text-gray-700">{selectedDoctor.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      <span className="text-gray-700">Salle: {selectedDoctor.location}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-teal-600">{selectedDoctor.patients}</p>
                    <p className="text-xs text-gray-600 mt-1">Patients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{selectedDoctor.rating}</p>
                    <p className="text-xs text-gray-600 mt-1">Note</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{selectedDoctor.experience}</p>
                    <p className="text-xs text-gray-600 mt-1">Expérience</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button className="flex-1 bg-teal-100 text-teal-700 font-semibold py-2 rounded-lg hover:bg-teal-200 transition flex items-center justify-center gap-2">
                    <Edit className="w-5 h-5" />
                    Modifier
                  </button>
                  <button className="flex-1 bg-red-100 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Assignment */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Patients Actuels</h2>

              <p className="text-sm text-gray-600 mb-4">
                Total: <span className="font-semibold">{selectedDoctor.patients}</span>
              </p>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {patients.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{patient.name}</p>
                      <p className="text-xs text-gray-600">{patient.age} ans</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button className="w-full border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600 hover:border-gray-400 transition font-semibold">
                + Ajouter un Patient
              </button>
            </div>
          </div>
        )}

        {/* Unassigned Patients */}
        {!selectedDoctor && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Patients Non Attribués</h2>
            <p className="text-gray-600">Sélectionnez un médecin pour lui attribuer des patients</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
