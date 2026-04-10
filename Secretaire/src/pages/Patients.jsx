import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Edit, Trash2, Eye, MoreVertical, X } from 'lucide-react'
import { useState } from 'react'

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  
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
      name: 'Oumar Baldé', 
      email: 'oumar.balde@email.com', 
      phone: '621 45 78 12', 
      dateOfBirth: '1990-03-15',
      status: 'Actif',
      lastVisit: '15/03/2026',
      nextAppointment: '15/04/2026',
      doctor: 'Professeur Elhadj Yaya Baldé'
    },
    { 
      id: 2, 
      name: 'Fatoumata Diallo', 
      email: 'fatoumata.diallo@email.com', 
      phone: '622 33 44 55', 
      dateOfBirth: '1985-07-22',
      status: 'Actif',
      lastVisit: '01/03/2026',
      nextAppointment: '22/04/2026',
      doctor: 'Docteur Mamadou Bassirou Bah'
    },
    { 
      id: 3, 
      name: 'Ibrahima Bah', 
      email: 'ibrahima.bah@email.com', 
      phone: '623 56 78 90', 
      dateOfBirth: '1988-11-10',
      status: 'Inactif',
      lastVisit: '18/02/2026',
      nextAppointment: '-',
      doctor: ''
    },
    { 
      id: 4, 
      name: 'Aissatou Barry', 
      email: 'aissatou.barry@email.com', 
      phone: '620 11 22 33', 
      dateOfBirth: '1992-05-05',
      status: 'Actif',
      lastVisit: '05/04/2026',
      nextAppointment: '19/04/2026',
      doctor: 'Docteur Mamadou Diallo'
    },
    { 
      id: 5, 
      name: 'Mamadou Camara', 
      email: 'mamadou.camara@email.com', 
      phone: '624 77 88 99', 
      dateOfBirth: '1975-08-12',
      status: 'Actif',
      lastVisit: '28/03/2026',
      nextAppointment: '02/04/2026',
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

      {/* SEARCH */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-left">Nom</th>
              <th className="px-6 py-4 text-left">Téléphone</th>
              <th className="px-6 py-4 text-left">Médecin</th>
              <th className="px-6 py-4 text-left">Dernier RDV</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{patient.name}</td>
                <td className="px-6 py-4">{patient.phone}</td>
                <td className="px-6 py-4">{patient.doctor || 'Non assigné'}</td>
                <td className="px-6 py-4">{patient.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}