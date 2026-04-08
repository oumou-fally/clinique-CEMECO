import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import { useState } from 'react'

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const patients = [
    { 
      id: 1, 
      name: 'Baldé Oumou Fally', 
      email: 'baldeoumoufally14@gmail.com', 
      phone: '627634812', 
      dateOfBirth: '06/06/2002',
      status: 'Actif',
      lastVisit: '15/03/2026',
      nextAppointment: '15/04/2026'
    },
    { 
      id: 2, 
      name: 'Barry Yaya', 
      email: 'barryyaya12@gmail.com', 
      phone: '623874632', 
      dateOfBirth: '22/07/2003',
      status: 'Actif',
      lastVisit: '01/03/2026',
      nextAppointment: '22/04/2026'
    },
    { 
      id: 3, 
      name: 'Bah Fatoumata Kenda', 
      email: 'bahf@gmail.com', 
      phone: '628843913', 
      dateOfBirth: '10/11/2002',
      status: 'Inactif',
      lastVisit: '18/02/2026',
      nextAppointment: '-'
    },
    { 
      id: 4, 
      name: 'Diakité Kadiatou', 
      email: 'diakitekadi@gmail.com', 
      phone: '620682673', 
      dateOfBirth: '05/05/2002',
      status: 'Actif',
      lastVisit: '05/04/2026',
      nextAppointment: '19/04/2026'
    }
  ]

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-600 mt-2">Gérez tous les patients de la clinique</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
            <Plus className="w-5 h-5" />
            Ajouter un Patient
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Total Patients</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{patients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Patients Actifs</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{patients.filter(p => p.status === 'Actif').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Patients Inactifs</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{patients.filter(p => p.status === 'Inactif').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Naissance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dernier RDV</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Prochain RDV</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.dateOfBirth}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.nextAppointment}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      patient.status === 'Actif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600 transition" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition" title="Plus">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun patient trouvé</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Affichage de <strong>{filteredPatients.length}</strong> patient(s)
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
            Précédent
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium">1</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">2</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
            Suivant
          </button>
        </div>
      </div>
    </Layout>
  )
}

