import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Eye, Phone, Calendar, FileText, Edit, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [patients, setPatients] = useState([
    { 
      id: 1, 
      name: 'Baldé Oumou Fally', 
      email: 'baldeoumoufally14@gmail.com', 
      phone: '627634812', 
      status: 'Actif',
      lastVisit: '15/03/2026'
    },
    { 
      id: 2, 
      name: 'Barry Yaya', 
      email: 'barryy12@gmail.com', 
      phone: '628456312', 
      status: 'Actif',
      lastVisit: '01/03/2026'
    },
    { 
      id: 3, 
      name: 'Bah Fatoumata Kenda', 
      email: 'bahfatouma12@gmail.com', 
      phone: '627121314', 
      status: 'Inactif',
      lastVisit: '18/02/2026'
    }
  ])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Actif',
    lastVisit: ''
  })
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedPatientDetail, setSelectedPatientDetail] = useState(null)

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedPatient) {
      setPatients(prev => prev.map(p => 
        p.id === selectedPatient.id 
          ? { ...selectedPatient, ...formData }
          : p
      ))
    } else {
      const newPatient = {
        id: Math.max(...patients.map(p => p.id), 0) + 1,
        ...formData,
        lastVisit: new Date().toLocaleDateString('fr-FR')
      }
      setPatients([...patients, newPatient])
    }
    resetForm()
    setShowModal(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      status: 'Actif',
      nextAppointment: '',
      bloodType: 'O+',
      allergies: ''
    })
    setSelectedPatient(null)
  }

  const handleEdit = (patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      status: patient.status,
      nextAppointment: patient.nextAppointment,
      bloodType: patient.bloodType,
      allergies: patient.allergies
    })
    setShowModal(true)
  }

  const handleDeletePatient = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient?')) {
      setPatients(prev => prev.filter(p => p.id !== id))
    }
  }

  const handleViewDetail = (patient) => {
    setSelectedPatientDetail(patient)
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Patients</h1>
            <p className="text-gray-600 mt-2">Gestion de vos patients et consultations</p>
          </div>
          <button 
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
          <Filter className="w-5 h-5" />
          Filtrer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Total de Patients</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{patients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Patients Actifs</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{patients.filter(p => p.status === 'Actif').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm font-medium">Patients Inactifs</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{patients.filter(p => p.status === 'Inactif').length}</p>
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
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
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
                        onClick={() => handleViewDetail(patient)}
                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" 
                        title="Voir profil"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(patient)}
                        className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition" 
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePatient(patient.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition" 
                        title="Supprimer"
                      >
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

      {/* Modal Ajouter/Modifier Patient */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedPatient ? 'Modifier Patient' : 'Ajouter un Nouveau Patient'}
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom Complet</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Jean Dupont"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jean@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="06 12 34 56 78"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {selectedPatient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détail Patient */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Détails du Patient</h2>
              <button 
                onClick={() => setSelectedPatientDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Nom</p>
                  <p className="text-gray-900 font-medium">{selectedPatientDetail.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                  <p className="text-gray-900 font-medium">{selectedPatientDetail.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                  <p className="text-gray-900 font-medium">{selectedPatientDetail.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Téléphone</p>
                  <p className="text-gray-900 font-medium">{selectedPatientDetail.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Statut</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                    selectedPatientDetail.status === 'Actif'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedPatientDetail.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Dernier RDV</p>
                  <p className="text-gray-900 font-medium">{selectedPatientDetail.lastVisit}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedPatientDetail(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

