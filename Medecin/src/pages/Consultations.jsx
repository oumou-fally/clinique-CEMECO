import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Clock, User, Phone, MapPin, CheckCircle, AlertCircle, Video, X } from 'lucide-react'
import { useState } from 'react'

export default function Consultations() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  
  const consultations = [
    {
      id: 1,
      patient: 'Jean Dupont',
      phone: '06 12 34 56 78',
      date: '2024-04-15',
      time: '14:30',
      duration: '30 min',
      type: 'Consultation',
      status: 'Confirmé',
      notes: 'Suivi cardiovasculaire',
      room: 'Bureau 301'
    },
    {
      id: 2,
      patient: 'Marie Laurent',
      phone: '06 98 76 54 32',
      date: '2024-04-15',
      time: '15:30',
      duration: '30 min',
      type: 'Suivi',
      status: 'Confirmé',
      notes: 'Contrôle post-opératoire',
      room: 'Bureau 301'
    },
    {
      id: 3,
      patient: 'Pierre Martin',
      phone: '06 45 67 89 01',
      date: '2024-04-15',
      time: '16:00',
      duration: '45 min',
      type: 'Première visite',
      status: 'En attente',
      notes: 'Nouvelle patientèle',
      room: 'Bureau 302'
    },
    {
      id: 4,
      patient: 'Anne Rousseau',
      phone: '06 23 45 67 89',
      date: '2024-04-20',
      time: '10:00',
      duration: '30 min',
      type: 'Consultation',
      status: 'Programmé',
      notes: 'Bilan de santé',
      room: 'Bureau 301'
    },
    {
      id: 5,
      patient: 'Luc Bernard',
      phone: '06 34 56 78 90',
      date: '2024-04-10',
      time: '14:00',
      duration: '30 min',
      type: 'Consultation',
      status: 'Complété',
      notes: 'Diagnostic établi',
      room: 'Bureau 301'
    }
  ]

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

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Consultations</h1>
            <p className="text-gray-600 mt-2">Gérez vos consultations et rendez-vous</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
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

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou téléphone..."
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{consultations.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Confirmées</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{consultations.filter(c => c.status === 'Confirmé').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-600">
          <p className="text-gray-600 text-sm font-medium">En Attente</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{consultations.filter(c => c.status === 'En attente').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium">Complétées</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{consultations.filter(c => c.status === 'Complété').length}</p>
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.length > 0 ? (
          filteredConsultations.map((consultation) => (
            <div key={consultation.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{consultation.patient}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(consultation.status)}`}>
                      {consultation.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{consultation.type} • {consultation.notes}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{consultation.date} à {consultation.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Durée: {consultation.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{consultation.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{consultation.room}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {consultation.status === 'En attente' && (
                  <>
                    <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                      Confirmer
                    </button>
                    <button className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                      Annuler
                    </button>
                  </>
                )}
                {consultation.status === 'Confirmé' && (
                  <>
                    <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      Commencer
                    </button>
                    <button className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                      Reporter
                    </button>
                  </>
                )}
                {consultation.status === 'Complété' && (
                  <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition">
                    Voir le Rapport
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                  Plus
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune consultation trouvée</p>
          </div>
        )}
      </div>

      {/* Modal Nouvelle Consultation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Consultation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Sélectionnez un patient</option>
                  <option>Jean Dupont</option>
                  <option>Marie Laurent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Consultation</option>
                  <option>Suivi</option>
                  <option>Première visite</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
