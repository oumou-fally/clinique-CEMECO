import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, AlertCircle, FileText, Clock, User } from 'lucide-react'
import { useState } from 'react'

export default function MedicalReports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  const reports = [
    {
      id: 1,
      patient: 'Jean Dupont',
      title: 'Consultation - Suivi Cardiovasculaire',
      date: '2024-04-15',
      type: 'Consultation',
      status: 'Complété',
      diagnosis: 'Hypertension maîtrisée',
      treatment: 'Traitement antihypertenseur adapté',
      nextFollow: '2024-05-15'
    },
    {
      id: 2,
      patient: 'Marie Laurent',
      title: 'Rapport Post-Opératoire',
      date: '2024-04-10',
      type: 'Post-opératoire',
      status: 'Complété',
      diagnosis: 'Intervention réussie',
      treatment: 'Repos et physiothérapie',
      nextFollow: '2024-04-24'
    },
    {
      id: 3,
      patient: 'Anne Rousseau',
      title: 'Bilan de Santé Annuel',
      date: '2024-04-08',
      type: 'Bilan Santé',
      status: 'Complété',
      diagnosis: 'Patient en bonne santé',
      treatment: 'Aucun traitement nécessaire',
      nextFollow: '2025-04-08'
    },
    {
      id: 4,
      patient: 'Luc Bernard',
      title: 'Diagnostic Préliminaire',
      date: '2024-04-05',
      type: 'Diagnostic',
      status: 'En cours',
      diagnosis: 'En attente de résultats',
      treatment: 'Examens complémentaires nécessaires',
      nextFollow: '2024-04-22'
    },
    {
      id: 5,
      patient: 'Sophie Blanc',
      title: 'Consultation Urgente',
      date: '2024-04-01',
      type: 'Urgence',
      status: 'Brouillon',
      diagnosis: 'À compléter',
      treatment: 'À définir',
      nextFollow: '-'
    }
  ]

  const filteredReports = reports.filter(report =>
    report.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Complété':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'En cours':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Brouillon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports Médicaux</h1>
            <p className="text-gray-600 mt-2">Rédigez et gérez vos rapports médicaux</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Nouveau Rapport
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou titre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
          <p className="text-2xl font-bold text-blue-600 mt-2">{reports.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Complétés</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{reports.filter(r => r.status === 'Complété').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-600">
          <p className="text-gray-600 text-sm font-medium">Brouillons</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{reports.filter(r => r.status === 'Brouillon').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium">En Cours</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{reports.filter(r => r.status === 'En cours').length}</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">{report.type}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Patient</p>
                  <p className="text-sm text-gray-900 mt-1">
                    <User className="w-3 h-3 inline mr-1" />
                    {report.patient}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Diagnostic</p>
                    <p className="text-sm text-gray-900 mt-1">{report.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Traitement</p>
                    <p className="text-sm text-gray-900 mt-1">{report.treatment}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-200 mt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {report.date}
                  </span>
                  <span>Suivi: {report.nextFollow}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Voir
                </button>
                {report.status === 'Brouillon' && (
                  <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                )}
                {report.status === 'En cours' && (
                  <button className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition">
                    Continuer
                  </button>
                )}
                {report.status === 'Complété' && (
                  <button className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun rapport trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Nouveau Rapport */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Nouveau Rapport Médical</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option>Sélectionnez un patient</option>
                    <option>Jean Dupont</option>
                    <option>Marie Laurent</option>
                    <option>Anne Rousseau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option>Consultation</option>
                    <option>Diagnostic</option>
                    <option>Post-opératoire</option>
                    <option>Bilan Santé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input 
                  type="text" 
                  placeholder="Ex: Consultation - Suivi cardiovasculaire"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnostic</label>
                <textarea 
                  placeholder="Describe le diagnostic..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Traitement Recommandé</label>
                <textarea 
                  placeholder="Décrivez le traitement..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes Additionnelles</label>
                <textarea 
                  placeholder="Ajoutez des notes..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suivi Recommandé</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
                <button className="px-4 py-2 border border-gray-300 hover:bg-yellow-50 text-yellow-700 rounded-lg font-medium transition">
                  Brouillon
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
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
