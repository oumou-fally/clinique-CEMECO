import Layout from '../layouts/Layout'
import { AlertCircle } from 'lucide-react'

export default function Patients() {
  const patients = [
    { id: 1, name: 'Jean Dupont', email: 'jean@email.com', phone: '06 12 34 56 78', status: 'Actif' },
    { id: 2, name: 'Marie Laurent', email: 'marie@email.com', phone: '06 98 76 54 32', status: 'Actif' },
    { id: 3, name: 'Pierre Martin', email: 'pierre@email.com', phone: '06 45 67 89 01', status: 'Inactif' }
  ]

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Patients</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Cette fonctionnalité sera complétée bientôt
            </p>
          </div>

          <button className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
            + Ajouter un Patient
          </button>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Téléphone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          patient.status === 'Actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
