import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, AlertCircle, FileText, Clock, User, Send, Save, ArrowLeft, X } from 'lucide-react'
import { useState } from 'react'

export default function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient: 'Baldé Oumou',
      medication: 'Amoxicilline 500mg',
      dosage: '1 comprimé x 3/jour',
      duration: '7 jours',
      date: '2026-04-15',
      status: 'Prescrite',
      indication: 'Infection respiratoire',
      notes: 'Prendre avec de la nourriture'
    },
    {
      id: 2,
      patient: 'Barry Yaya',
      medication: 'Métoprolol 50mg',
      dosage: '1 comprimé matin et soir',
      duration: 'Continu',
      date: '2026-04-10',
      status: 'Active',
      indication: 'Hypertension artérielle',
      notes: 'Suivi tensionnel recommandé'
    },
    {
      id: 3,
      patient: 'Bah Kenda',
      medication: 'Ibuprofène 400mg',
      dosage: '1 comprimé toutes les 6h si douleur',
      duration: 'Selon besoin',
      date: '2026-04-08',
      status: 'Prescrite',
      indication: 'Douleur musculaire',
      notes: 'Ne pas dépasser 4 comprimés par jour'
    },
    {
      id: 4,
      patient: 'Diakité Kadiatou',
      medication: 'Atorvastatine 20mg',
      dosage: '1 comprimé le soir',
      duration: 'Continu',
      date: '2026-04-05',
      status: 'Active',
      indication: 'Hypercholestérolémie',
      notes: 'Bilan lipidique annuel recommandé'
    }
  ])

  const [formData, setFormData] = useState({
    patient: '',
    medication: '',
    dosage: '',
    duration: '',
    status: 'Prescrite',
    indication: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.medication.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewPrescription = () => {
    setFormData({
      patient: '',
      medication: '',
      dosage: '',
      duration: '',
      status: 'Prescrite',
      indication: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    })
    setSelectedPrescription(null)
    setShowModal(true)
  }

  const handleEditPrescription = (prescription) => {
    setFormData(prescription)
    setSelectedPrescription(prescription.id)
    setShowModal(true)
  }

  const handleSavePrescription = () => {
    if (selectedPrescription) {
      setPrescriptions(prescriptions.map(p => p.id === selectedPrescription ? { ...formData, id: selectedPrescription } : p))
    } else {
      setPrescriptions([...prescriptions, { ...formData, id: Date.now() }])
    }
    setShowModal(false)
    setSelectedPrescription(null)
  }

  const handleDownload = (id) => {
    const prescription = prescriptions.find(p => p.id === id)
    alert(`Téléchargement de l'ordonnance pour ${prescription.patient}`)
  }

  const handleDeletePrescription = (id) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id))
  }

  const handleSendToPharmacy = (id) => {
    alert('Ordonnance envoyée à la pharmacie')
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Prescrite': return 'bg-blue-100 text-blue-800'
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Expirée': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      {!showModal ? (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Ordonnances</h1>
                <p className="text-gray-600 mt-1">Gérez les prescriptions médicales</p>
              </div>
              <button
                onClick={handleNewPrescription}
                className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Ordonnance
              </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un patient ou un médicament..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200">
                <Filter className="w-5 h-5" />
                Filtrer
              </button>
            </div>

            {/* Prescriptions Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Patient</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Médicament</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Dosage</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Durée</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPrescriptions.map((prescription) => (
                      <tr key={prescription.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleEditPrescription(prescription)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                              {prescription.patient.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800">{prescription.patient}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{prescription.medication}</td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{prescription.dosage}</td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{prescription.duration}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{prescription.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(prescription.status)}`}>
                            {prescription.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(prescription.id); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSendToPharmacy(prescription.id); }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Envoyer à la pharmacie"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePrescription(prescription.id); }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            </div>

            {/* Empty State */}
            {filteredPrescriptions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg mt-6">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucune ordonnance trouvée</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedPrescription ? 'Modifier' : 'Nouvelle'} Ordonnance
                </h1>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient</label>
                  <input
                    type="text"
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Nom du patient"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Médicament</label>
                  <input
                    type="text"
                    value={formData.medication}
                    onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Nom du médicament"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="1 comprimé x 3/jour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Durée</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="7 jours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option>Prescrite</option>
                    <option>Active</option>
                    <option>Expirée</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Indication</label>
                  <input
                    type="text"
                    value={formData.indication}
                    onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Indication médicale"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Recommandations additionnelles"
                    rows="4"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSavePrescription}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  <Save className="w-5 h-5" />
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
