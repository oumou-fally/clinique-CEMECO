import Layout from '../layouts/Layout'
import ConsultationForm from '../components/ConsultationForm'
import { Search, Filter, Plus, Clock, User, Phone, CheckCircle, AlertCircle, Video, X, Save, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function Consultations() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedConsultationId, setSelectedConsultationId] = useState(null)
  const [consultations, setConsultations] = useState([
    {
      id: 1,
      patient: 'Baldé Oumou Fally',
      phone: '06 12 34 56 78',
      date: '2026-04-15',
      time: '14:30',
      duration: '30 min',
      type: 'Consultation',
      status: 'Confirmé',
      notes: 'Suivi cardiovasculaire'
    },
    {
      id: 2,
      patient: 'Camara Aissatou',
      phone: '06 98 76 54 32',
      date: '2026-04-15',
      time: '15:30',
      duration: '30 min',
      type: 'Suivi',
      status: 'Confirmé',
      notes: 'Contrôle post-opératoire'
    },
    {
      id: 3,
      patient: 'Touré Mariama',
      phone: '06 45 67 89 01',
      date: '2026-04-15',
      time: '16:00',
      duration: '45 min',
      type: 'Première visite',
      status: 'En attente',
      notes: 'Nouvelle patientèle'
    },
    {
      id: 4,
      patient: 'Diallo Mamadou',
      phone: '06 23 45 67 89',
      date: '2026-04-20',
      time: '10:00',
      duration: '30 min',
      type: 'Consultation',
      status: 'Programmé',
      notes: 'Bilan de santé'
    }
  ])
  
  // Récupérer la consultation sélectionnée si elle existe
  const selectedConsultation = selectedConsultationId 
    ? consultations.find(c => c.id === selectedConsultationId)
    : null

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          consultation.phone.includes(searchTerm)
    
    if (selectedTab === 'all') return matchesSearch
    if (selectedTab === 'today') {
      const today = new Date().toISOString().split('T')[0]
      return matchesSearch && consultation.date === today
    }
    return matchesSearch && consultation.status.toLowerCase() === selectedTab
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmé':
      case 'Complété':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Programmé':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Annulé':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleOpenForm = (consultation = null) => {
    if (consultation) {
      setSelectedConsultationId(consultation.id)
    } else {
      setSelectedConsultationId(null)
    }
    setShowModal(true)
  }

  const handleSaveConsultation = (newFormData) => {
    if (selectedConsultationId) {
      // Modification d'une consultation existante
      setConsultations(consultations.map(c => 
        c.id === selectedConsultationId ? { ...newFormData, id: selectedConsultationId } : c
      ))
    } else {
      // Création d'une nouvelle consultation
      setConsultations([...consultations, { ...newFormData, id: Date.now() }])
    }
    setShowModal(false)
    setSelectedConsultationId(null)
  }

  const handleCloseForm = () => {
    setShowModal(false)
    setSelectedConsultationId(null)
  }

  return (
    <Layout>
      {!showModal ? (
        <div>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes Consultations</h1>
                <p className="text-gray-600 mt-2">Gérez vos consultations et rendez-vous</p>
              </div>
              <button 
                onClick={() => handleOpenForm()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Consultation
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                selectedTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedTab('confirmé')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                selectedTab === 'confirmé'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Confirmées
            </button>
            <button
              onClick={() => setSelectedTab('en attente')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                selectedTab === 'en attente'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              En Attente
            </button>
            <button
              onClick={() => setSelectedTab('complété')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                selectedTab === 'complété'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Complétées
            </button>
          </div>

          {/* Search */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <Filter className="w-5 h-5" />
              Filtrer
            </button>
          </div>

          {/* Consultations List */}
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer border-l-4 border-blue-500"
                onClick={() => handleOpenForm(consultation)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-800">{consultation.patient}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {consultation.date} {consultation.time}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {consultation.phone}
                      </div>
                      <div className="text-gray-600">
                        {consultation.duration}
                      </div>
                    </div>
                    
                    {consultation.notes && (
                      <p className="mt-3 text-gray-600 text-sm"><span className="font-semibold">Notes:</span> {consultation.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ConsultationForm 
          initialData={selectedConsultation}
          onSave={handleSaveConsultation}
          onClose={handleCloseForm}
        />
      )}
    </Layout>
  )
}
