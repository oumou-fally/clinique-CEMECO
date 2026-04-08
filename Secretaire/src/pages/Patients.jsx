import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Edit, Trash2, Eye, MoreVertical, X } from 'lucide-react'
import { useState } from 'react'

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null) // 'assign' ou 'add'
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  
  // Formulaire nouveau patient
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    doctor: ''
  })

  const doctors = [
    { id: 1, name: 'Professeur Elhadj Yaya Baldé', specialty: 'Cardiologue' },
    { id: 2, name: 'Docteur Mamadou Bassirou Bah', specialty: 'Cardiologue' },
    { id: 3, name: 'Docteur Mamadou Diallo', specialty: 'Cardiologue' },
    { id: 4, name: 'Docteur Thierno Siradjo Baldé', specialty: 'Cardiologue' },
    { id: 5, name: 'Docteur Thierno Boubacar Barry', specialty: 'Cardiologue' }
  ]

  const [patients, setPatients] = useState([
    { 
      id: 1, 
      name: 'Jean Dupont', 
      email: 'jean@email.com', 
      phone: '06 12 34 56 78', 
      dateOfBirth: '15/03/1990',
      status: 'Actif',
      lastVisit: '15/03/2024',
      nextAppointment: '15/04/2024',
      doctor: 'Professeur Elhadj Yaya Baldé'
    },
    { 
      id: 2, 
      name: 'Marie Laurent', 
      email: 'marie@email.com', 
      phone: '06 98 76 54 32', 
      dateOfBirth: '22/07/1985',
      status: 'Actif',
      lastVisit: '01/03/2024',
      nextAppointment: '22/04/2024',
      doctor: 'Docteur Mamadou Bassirou Bah'
    },
    { 
      id: 3, 
      name: 'Pierre Martin', 
      email: 'pierre@email.com', 
      phone: '06 45 67 89 01', 
      dateOfBirth: '10/11/1988',
      status: 'Inactif',
      lastVisit: '18/02/2024',
      nextAppointment: '-',
      doctor: ''
    },
    { 
      id: 4, 
      name: 'Anne Rousseau', 
      email: 'anne@email.com', 
      phone: '06 23 45 67 89', 
      dateOfBirth: '05/05/1992',
      status: 'Actif',
      lastVisit: '05/04/2024',
      nextAppointment: '19/04/2024',
      doctor: 'Docteur Mamadou Diallo'
    },
    { 
      id: 5, 
      name: 'Luc Bernard', 
      email: 'luc@email.com', 
      phone: '06 34 56 78 90', 
      dateOfBirth: '12/08/1975',
      status: 'Actif',
      lastVisit: '28/03/2024',
      nextAppointment: '02/04/2024',
      doctor: 'Docteur Thierno Siradjo Baldé'
    }
  ])

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAssignDoctor = () => {
    if (selectedDoctor && selectedPatient) {
      setPatients(
        patients.map(p =>
          p.id === selectedPatient.id
            ? { ...p, doctor: selectedDoctor }
            : p
        )
      )
      setShowModal(false)
      setSelectedPatient(null)
      setSelectedDoctor('')
    }
  }

  const openAssignModal = (patient) => {
    setSelectedPatient(patient)
    setSelectedDoctor(patient.doctor || '')
    setModalType('assign')
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddPatient = () => {
    if (formData.name && formData.email && formData.phone && formData.dateOfBirth) {
      const newPatient = {
        id: patients.length + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        status: 'Actif',
        lastVisit: '-',
        nextAppointment: '-',
        doctor: formData.doctor || ''
      }
      setPatients([...patients, newPatient])
      setFormData({ name: '', email: '', phone: '', dateOfBirth: '', doctor: '' })
      setShowModal(false)
      setModalType(null)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType(null)
    setSelectedPatient(null)
    setSelectedDoctor('')
    setFormData({ name: '', email: '', phone: '', dateOfBirth: '', doctor: '' })
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-600 mt-2">Répartissez les patients entre les médecins disponibles</p>
          </div>
          <button 
            onClick={() => {
              setModalType('add')
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition">
            <Plus className="w-5 h-5" />
            Ajouter un Patient
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
          <Filter className="w-5 h-5" />
          Filtrer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Total Patients</p>
          <p className="text-3xl font-bold text-teal-600 mt-2">{patients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Patients Actifs</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{patients.filter(p => p.status === 'Actif').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Patients Assignés</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{patients.filter(p => p.doctor).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Non Assignés</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{patients.filter(p => !p.doctor).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Médecin Assigné</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dernier RDV</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center font-semibold text-teal-600">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                  <td className="px-6 py-4">
                    {patient.doctor ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {patient.doctor}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Non assigné
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      patient.status === 'Actif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openAssignModal(patient)}
                        className="p-2 hover:bg-teal-100 rounded-lg text-teal-600 transition" 
                        title="Assigner un médecin"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600 transition" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun patient trouvé</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Affichage de <strong>{filteredPatients.length}</strong> patient(s)
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
            Précédent
          </button>
          <button className="px-3 py-2 bg-teal-600 text-white rounded-lg font-medium">1</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">2</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
            Suivant
          </button>
        </div>
      </div>

      {/* Modal Assign Doctor */}
      {showModal && modalType === 'assign' && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assigner un Médecin</h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Patient: <span className="font-semibold text-gray-900">{selectedPatient.name}</span></p>
                <p className="text-sm text-gray-600 mt-1">Email: <span className="font-semibold text-gray-900">{selectedPatient.email}</span></p>
                <p className="text-sm text-gray-600 mt-1">Téléphone: <span className="font-semibold text-gray-900">{selectedPatient.phone}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sélectionnez un Médecin</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor.name)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        selectedDoctor === doctor.name
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{doctor.name}</p>
                      <p className="text-xs text-gray-600">{doctor.specialty}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignDoctor}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition"
                >
                  Assigner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter Patient */}
      {showModal && modalType === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau Patient</h2>
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
                  placeholder="Nom du patient"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="patient@email.com"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="06 12 34 56 78"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Naissance</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Médecin (Optionnel)</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Sélectionnez un médecin</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>{doc.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddPatient}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

