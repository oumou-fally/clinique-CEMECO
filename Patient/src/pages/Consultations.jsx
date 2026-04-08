import { useState } from 'react'
import Layout from '../layouts/Layout'
import { MessageCircle, Send, CheckCircle, Clock, AlertCircle, Plus, Filter, Search } from 'lucide-react'
import AskDoctorForm from '../components/AskDoctorForm'

export default function Consultations() {
  const [showAskForm, setShowAskForm] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')

  const consultations = [
    {
      id: 1,
      doctor: 'Professeur Elhadji Yaya Baldé',
      subject: 'Question sur l\'hypertension',
      message: 'J\'ai remarqué une légère augmentation de ma tension artérielle ces derniers jours. Dois-je ajuster mon traitement?',
      date: '2024-03-28',
      status: 'Répondu',
      response: 'Je vous recommande de mesurer votre tension deux fois par jour et de tenir un carnet. Évitez le sel et continuez votre traitement actuel.',
      responseDate: '2024-03-29'
    },
    {
      id: 2,
      doctor: 'Dr. Mamadou Bassirou',
      subject: 'Douleur thoracique intermittente',
      message: 'J\'ai une douleur légère et intermittente dans la poitrine depuis deux jours. Est-ce inquiétant?',
      date: '2024-03-27',
      status: 'Répondu',
      response: 'Cette douleur peut être musculaire ou cardiaque. Je vous conseille une consultation urgente pour un ECG et nous rassurer.',
      responseDate: '2024-03-28'
    },
    {
      id: 3,
      doctor: 'Dr. Thierno Boubacar Barry',
      subject: 'Essoufflement à l\'effort',
      message: 'Je suis essoufflé très rapidement en montant les escaliers depuis une semaine...',
      date: '2024-03-26',
      status: 'En attente',
      response: null,
      responseDate: null
    },
    {
      id: 4,
      doctor: 'Dr. Mamadou Diallo',
      subject: 'Effet secondaire du béta-bloquant',
      message: 'Depuis que j\'ai commencé le béta-bloquant, j\'ai une grande fatigue et des vertiges...',
      date: '2024-03-25',
      status: 'En attente',
      response: null,
      responseDate: null
    }
  ]

  const handleConsultationSubmit = (formData) => {
    console.log('New consultation:', formData)
    alert('Votre question a été envoyée avec succès! Vous recevrez une réponse dans les 24-48 heures.')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Répondu':
        return 'bg-green-100 text-green-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch =
      consultation.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.doctor.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === 'pending') {
      return matchesSearch && consultation.status === 'En attente'
    } else if (activeTab === 'answered') {
      return matchesSearch && consultation.status === 'Répondu'
    }
    return matchesSearch
  })

  const ConsultationCard = ({ consultation }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-purple-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{consultation.subject}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(consultation.status)}`}>
              {consultation.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">{consultation.doctor}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-start gap-2">
          <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
          <p className="text-sm text-gray-700">{consultation.message}</p>
        </div>
        <p className="text-xs text-gray-500 ml-6">
          Envoyé le {consultation.date}
        </p>
      </div>

      {consultation.response && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-semibold text-green-900">Réponse de {consultation.doctor}</p>
              <p className="text-xs text-green-700 mt-1">{consultation.responseDate}</p>
            </div>
          </div>
          <p className="text-sm text-green-800 mt-3">{consultation.response}</p>
        </div>
      )}

      {consultation.status === 'En attente' && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 text-sm">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Réponse attendue dans les 24-48 heures</span>
        </div>
      )}

      {consultation.status === 'Répondu' && (
        <button className="w-full py-2 px-4 border border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition">
          Poser une question de suivi
        </button>
      )}
    </div>
  )

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conseils Médicaux</h1>
            <p className="text-gray-600 mt-2">Posez vos questions à nos médecins</p>
          </div>
          <button
            onClick={() => setShowAskForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Poser une Question
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Assistance Médicale</p>
          <p className="text-sm text-blue-800 mt-1">
            Posez vos questions à nos médecins. Vous recevrez généralement une réponse dans les 24-48 heures. 
            Pour les urgences, appelez le 15 (SAMU).
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          En attente ({consultations.filter(c => c.status === 'En attente').length})
        </button>
        <button
          onClick={() => setActiveTab('answered')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'answered'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Répondues ({consultations.filter(c => c.status === 'Répondu').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'all'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Toutes ({filteredConsultations.length})
        </button>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.length > 0 ? (
          filteredConsultations.map(consultation => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune consultation à afficher</p>
            <p className="text-gray-400 text-sm mt-2">
              {activeTab === 'pending'
                ? 'Vous n\'avez pas de questions en attente'
                : activeTab === 'answered'
                ? 'Vous n\'avez pas de réponses'
                : 'Posez une question pour démarrer'}
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Questions Posées</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{consultations.length}</p>
            </div>
            <MessageCircle className="w-10 h-10 text-purple-400 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Réolutions</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{consultations.filter(c => c.status === 'Répondu').length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{consultations.filter(c => c.status === 'En attente').length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* Ask Doctor Form Modal */}
      <AskDoctorForm
        isOpen={showAskForm}
        onClose={() => setShowAskForm(false)}
        onSubmit={handleConsultationSubmit}
      />
    </Layout>
  )
}
