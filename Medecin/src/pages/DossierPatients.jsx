import Layout from '../layouts/Layout'
import { FileText, Download, Eye, Filter, Search, X } from 'lucide-react'
import { useState } from 'react'

// Nouveau nom : DossierPatients
export default function DossierPatients() {
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Données simulées côté médecin (patients)
  const medicalRecords = [
    {
      id: 1,
      patient: 'Aminata Diallo',
      date: '15/03/2024',
      type: 'Bilan Sanguin',
      doctor: 'Professeur Elhadj Yaya Baldé',
      status: 'Disponible',
      results: ['Hémoglobine: 14.5 g/dL', 'Leucocytes: 7200 /µL', 'Plaquettes: 250K /µL']
    },
    {
      id: 2,
      patient: 'Fatoumata Bah',
      date: '01/03/2024',
      type: 'Radiographie Thorax',
      doctor: 'Docteur Mamadou Bassirou Bah',
      status: 'Validé',
      results: ['Poumons normaux', 'Cœur normal']
    },
    {
      id: 3,
      patient: 'Mariama Traoré',
      date: '18/02/2024',
      type: 'ECG',
      doctor: 'Docteur Thierno Boubacar Barry',
      status: 'Disponible',
      results: ['Rythme cardiaque régulier', 'Pas d\'anomalies']
    }
  ]

  const prescriptions = [
    { id: 1, patient: 'Aminata Diallo', date: '15/03/2024', medicine: 'Bisoprolol 5mg', quantity: '30 comprimés', doctor: 'Professeur Elhadj Yaya Baldé' },
    { id: 2, patient: 'Fatoumata Bah', date: '01/03/2024', medicine: 'Amlodipine 10mg', quantity: '30 comprimés', doctor: 'Docteur Mamadou Diallo' }
  ]

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dossiers Médicaux des Patients</h1>
        <p className="text-gray-600 mt-2">Consultez, analysez et gérez les dossiers médicaux</p>
      </div>

      {/* Recherche */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient ou examen..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
          <Filter className="w-5 h-5" />
          Filtrer
        </button>
      </div>

      {/* Liste dossiers */}
      <div className="space-y-4 mb-8">
        {medicalRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-teal-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{record.type}</h3>
                  <p className="text-sm text-gray-600">Patient: {record.patient}</p>
                  <p className="text-sm text-gray-600">Médecin: {record.doctor}</p>
                  <p className="text-xs text-gray-500">{record.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                record.status === 'Disponible'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {record.status}
              </span>
            </div>

            {/* Résultats */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm font-semibold text-gray-700 mb-2">Résultats :</p>
              <ul className="space-y-1">
                {record.results.map((r, i) => (
                  <li key={i} className="text-sm text-gray-600">• {r}</li>
                ))}
              </ul>
            </div>

            {/* Actions médecin */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedRecord(record)
                  setShowModal(true)
                }}
                className="flex-1 py-2 px-4 border border-teal-600 text-teal-600 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Voir
              </button>

              <button className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Télécharger
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ordonnances */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ordonnances des Patients</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Médicament</th>
                <th className="px-6 py-3 text-left">Quantité</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-6 py-4">{p.patient}</td>
                  <td className="px-6 py-4">{p.date}</td>
                  <td className="px-6 py-4">{p.medicine}</td>
                  <td className="px-6 py-4">{p.quantity}</td>
                  <td className="px-6 py-4">
                    <button className="text-teal-600">Télécharger</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Détails du dossier patient</h2>
            <p><strong>Patient :</strong> {selectedRecord.patient}</p>
            <p><strong>Examen :</strong> {selectedRecord.type}</p>
            <p><strong>Date :</strong> {selectedRecord.date}</p>
            <div className="mt-4">
              {selectedRecord.results.map((r, i) => (
                <p key={i}>• {r}</p>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
