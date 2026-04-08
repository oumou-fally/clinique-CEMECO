import Layout from '../layouts/Layout'
import { FileText, Download, Eye, Filter, Search } from 'lucide-react'

export default function Ordonnance() {
  const medicalRecords = [
    {
      id: 1,
      date: '15/03/2024',
      type: 'Bilan Sanguin',
      doctor: 'Dr. Sophie Martin',
      status: 'Reçu',
      results: ['Hémoglobine: 14.5 g/dL', 'Leucocytes: 7200 /µL', 'Plaquettes: 250K /µL']
    },
    {
      id: 2,
      date: '01/03/2024',
      type: 'Radiographie Thorax',
      doctor: 'Dr. Jean Rousseau',
      status: 'Confirmé',
      results: ['Poumons normaux', 'Cœur normal']
    },
    {
      id: 3,
      date: '18/02/2024',
      type: 'ECG',
      doctor: 'Dr. Sophie Martin',
      status: 'Reçu',
      results: ['Rythme cardiaque régulier', 'Pas d\'anomalies']
    },
    {
      id: 4,
      date: '05/02/2024',
      type: 'Consultation Générale',
      doctor: 'Dr. Marie Durand',
      status: 'Reçu',
      results: ['Tension: 120/80', 'Poids: 75 kg', 'Taille: 180 cm']
    }
  ]

  const prescriptions = [
    { id: 1, date: '15/03/2024', medicine: 'Aspirine 500mg', quantity: '30 comprimés', doctor: 'Dr. Sophie Martin' },
    { id: 2, date: '01/03/2024', medicine: 'Vitamine C 1000mg', quantity: '30 comprimés', doctor: 'Dr. Jean Rousseau' },
    { id: 3, date: '18/02/2024', medicine: 'Ibuprofène 400mg', quantity: '20 comprimés', doctor: 'Dr. Sophie Martin' }
  ]

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Ordonnances</h1>
        <p className="text-gray-600 mt-2">Consultez et gérez toutes les ordonnances médicales</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button className="pb-3 px-4 border-b-2 border-teal-600 text-teal-600 font-semibold">
          Examens Médicaux
        </button>
        <button className="pb-3 px-4 text-gray-600 hover:text-gray-900 font-medium">
          Ordonnances
        </button>
        <button className="pb-3 px-4 text-gray-600 hover:text-gray-900 font-medium">
          Vaccinations
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un examen..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
          <Filter className="w-5 h-5" />
          Filtrer
        </button>
      </div>

      {/* Medical Records */}
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
                  <p className="text-sm text-gray-600 mt-1">{record.doctor}</p>
                  <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'Reçu'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {record.status}
                </span>
              </div>
            </div>

            {record.results && record.results.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Résultats:</p>
                <ul className="space-y-1">
                  {record.results.map((result, idx) => (
                    <li key={idx} className="text-sm text-gray-600">• {result}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 py-2 px-4 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Voir en détail
              </button>
              <button className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prescriptions Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ordonnances Actives</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Médicament</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantité</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prescripteur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{prescription.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{prescription.medicine}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{prescription.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{prescription.doctor}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-teal-600 hover:text-teal-700 font-medium">Télécharger</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
