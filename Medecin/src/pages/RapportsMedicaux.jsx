import Layout from '../layouts/Layout'
import { Search, Plus, Download, Eye, Edit, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export default function MedicalReports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [editingReport, setEditingReport] = useState(null)

  const [reports, setReports] = useState([
    {
      id: 1,
      patient: 'Baldé Oumou Fally',
      title: 'Suivi Cardiovasculaire',
      date: '2026-04-01',
      type: 'Consultation',
      status: 'Complété',
      diagnosis: 'Hypertension contrôlée',
      treatment: 'Adaptation du traitement antihypertenseur',
      notes: 'Suivi programmé dans un mois',
      nextFollow: '2026-05-01'
    },
    {
      id: 2,
      patient: 'Camara Aissatou',
      title: 'Bilan Biologique',
      date: '2026-04-04',
      type: 'Analyse',
      status: 'En cours',
      diagnosis: 'Résultats attendus de la formule sanguine',
      treatment: 'Aucun traitement pour le moment',
      notes: 'Relancer après réception du laboratoire',
      nextFollow: ''
    }
  ])

  const [formData, setFormData] = useState({
    patient: '',
    title: '',
    type: 'Consultation',
    status: 'En cours',
    diagnosis: '',
    treatment: '',
    notes: '',
    nextFollow: ''
  })

  const filteredReports = reports.filter((report) =>
    report.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddReport = () => {
    setEditingReport(null)
    setFormData({
      patient: '',
      title: '',
      type: 'Consultation',
      status: 'En cours',
      diagnosis: '',
      treatment: '',
      notes: '',
      nextFollow: ''
    })
    setShowModal(true)
  }

  const handleEditReport = (report) => {
    setEditingReport(report)
    setFormData({ ...report })
    setShowModal(true)
  }

  const handleSaveReport = (asDraft = false) => {
    if (!formData.patient.trim() || !formData.title.trim()) {
      alert('Veuillez renseigner le patient et le titre du rapport.')
      return
    }

    const payload = {
      ...formData,
      status: asDraft ? 'Brouillon' : formData.status || 'En cours'
    }

    if (editingReport) {
      setReports((current) =>
        current.map((report) =>
          report.id === editingReport.id ? { ...report, ...payload } : report
        )
      )
    } else {
      setReports((current) => [
        ...current,
        {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          ...payload
        }
      ])
    }

    setShowModal(false)
    setEditingReport(null)
  }

  const handleDeleteReport = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce rapport médical ?')) {
      setReports((current) => current.filter((report) => report.id !== id))
    }
  }

  const handleDownloadReport = (report) => {
    const content = `RAPPORT MÉDICAL\nPatient: ${report.patient}\nTitre: ${report.title}\nDate: ${report.date}\nType: ${report.type}\nStatut: ${report.status}\n\nDiagnostic:\n${report.diagnosis}\n\nTraitement:\n${report.treatment}\n\nNotes:\n${report.notes}`
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `rapport-${report.id}.txt`)
    element.click()
  }

  const handleViewDetail = (report) => {
    setSelectedReport(report)
    setShowDetailModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complété':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'En cours':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Brouillon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Annulé':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports Médicaux</h1>
            <p className="text-gray-600 mt-2">Retrouvez et gérez facilement vos rapports médicaux.</p>
          </div>
          <button
            onClick={handleAddReport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nouveau rapport
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un patient ou un titre..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            Aucun rapport médical trouvé. Créez un nouveau rapport pour commencer.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">{report.title}</h2>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">Patient : <span className="font-semibold text-gray-900">{report.patient}</span></p>
                  <p className="text-sm text-gray-500">{report.type} · {report.date} · Suivi : {report.nextFollow || 'Non programmé'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewDetail(report)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4" /> Voir
                  </button>
                  <button
                    onClick={() => handleEditReport(report)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-yellow-100 px-4 py-2 text-yellow-900 hover:bg-yellow-200 transition"
                  >
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-green-100 px-4 py-2 text-green-900 hover:bg-green-200 transition"
                  >
                    <Download className="w-4 h-4" /> Télécharger
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-100 px-4 py-2 text-red-900 hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{editingReport ? 'Modifier le rapport médical' : 'Nouveau rapport médical'}</h2>
                <p className="text-gray-600 mt-1">Remplissez les détails du rapport puis enregistrez.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Patient</span>
                  <input
                    name="patient"
                    value={formData.patient}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du patient"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Titre</span>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du rapport"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Type</span>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Consultation</option>
                    <option>Analyse</option>
                    <option>Bilan</option>
                    <option>Urgence</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Statut</span>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>En cours</option>
                    <option>Complété</option>
                    <option>Brouillon</option>
                    <option>Annulé</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Diagnostic</span>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-h-24 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Résumé du diagnostic"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Traitement</span>
                  <textarea
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-h-24 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Plan de traitement"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Notes</span>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-h-24 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes complémentaires"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Suivi prévu</span>
                  <input
                    type="date"
                    name="nextFollow"
                    value={formData.nextFollow}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-5 shrink-0 sm:flex-row sm:justify-end">
              <button
                onClick={() => handleSaveReport(true)}
                className="w-full rounded-2xl border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100 transition sm:w-auto"
              >
                Enregistrer comme brouillon
              </button>
              <button
                onClick={() => handleSaveReport(false)}
                className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition sm:w-auto"
              >
                Enregistrer le rapport
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Détails du rapport</h2>
                <p className="text-gray-600 mt-1">Visualisez toutes les informations du rapport médical.</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReport.patient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Titre</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReport.title}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900">{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-gray-900">{selectedReport.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="text-gray-900">{selectedReport.status}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Diagnostic</p>
                  <p className="text-gray-700 whitespace-pre-line">{selectedReport.diagnosis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Traitement</p>
                  <p className="text-gray-700 whitespace-pre-line">{selectedReport.treatment}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-700 whitespace-pre-line">{selectedReport.notes || 'Aucune note supplémentaire.'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Suivi prévu</p>
                <p className="text-gray-700">{selectedReport.nextFollow || 'Aucun suivi planifié'}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => {
                    handleEditReport(selectedReport)
                    setShowDetailModal(false)
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-yellow-100 px-5 py-3 text-yellow-900 hover:bg-yellow-200 transition"
                >
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-green-100 px-5 py-3 text-green-900 hover:bg-green-200 transition"
                >
                  <Download className="w-4 h-4" /> Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
