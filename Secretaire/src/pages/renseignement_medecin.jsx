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
  Clock,
  X
} from 'lucide-react'
import Layout from '../layouts/Layout'

export default function DoctorManagement() {
  const [showModal, setShowModal] = useState(false)
  
  // Formulaire nouveau médecin
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'Cardiologue',
    phone: '',
    email: '',
    location: '',
    experience: '',
    patients: ''
  })

  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Professeur Elhadj Yaya Baldé',
      specialty: 'Cardiologue',
      phone: '01 45 67 89 00',
      email: 'elhadj.yaya@clinic.com',
      location: 'Bureau 301',
      experience: '18 ans',
      patients: 52,
      rating: 4.9,
      status: 'active'
    },
    {
      id: 2,
      name: 'Docteur Mamadou Bassirou Bah',
      specialty: 'Cardiologue',
      phone: '01 45 67 89 01',
      email: 'mamadou.bah@clinic.com',
      location: 'Bureau 105',
      experience: '12 ans',
      patients: 42,
      rating: 4.8,
      status: 'active'
    },
    {
      id: 3,
      name: 'Docteur Mamadou Diallo',
      specialty: 'Cardiologue',
      phone: '01 45 67 89 02',
      email: 'mamadou.diallo@clinic.com',
      location: 'Bureau 202',
      experience: '5 ans',
      patients: 28,
      rating: 4.6,
      status: 'active'
    },
    {
      id: 4,
      name: 'Docteur Thierno Siradjo Baldé',
      specialty: 'Cardiologue',
      phone: '01 45 67 89 03',
      email: 'thierno.siradjo@clinic.com',
      location: 'Bureau 401',
      experience: '7 ans',
      patients: 35,
      rating: 4.7,
      status: 'active'
    },
    {
      id: 5,
      name: 'Docteur Thierno Boubacar Barry',
      specialty: 'Cardiologue',
      phone: '01 45 67 89 04',
      email: 'thierno.barry@clinic.com',
      location: 'Bureau 501',
      experience: '10 ans',
      patients: 42,
      rating: 4.8,
      status: 'active'
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

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddDoctor = () => {
    if (formData.name && formData.phone && formData.email && formData.location && formData.experience) {
      const newDoctor = {
        id: doctors.length + 1,
        name: formData.name,
        specialty: formData.specialty,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        experience: formData.experience,
        patients: parseInt(formData.patients) || 0,
        rating: 4.5,
        status: 'active'
      }
      setDoctors([...doctors, newDoctor])
      setFormData({ name: '', specialty: 'Cardiologue', phone: '', email: '', location: '', experience: '', patients: '' })
      setShowModal(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({ name: '', specialty: 'Cardiologue', phone: '', email: '', location: '', experience: '', patients: '' })
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Médecins</h1>
            <p className="text-gray-600 mt-2">Gérez les médecins et attribuez-leur des patients</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2">
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

        {/* Modal Ajouter Médecin */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nouveau Médecin</h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Dr. Nom Prénom"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="01 45 67 89 00"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="doctor@clinic.com"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bureau</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Bureau 301"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
                  <input
                    type="text"
                    name="experience"
                    placeholder="10 ans"
                    value={formData.experience}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de patients</label>
                  <input
                    type="number"
                    name="patients"
                    placeholder="0"
                    value={formData.patients}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddDoctor}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
