import Layout from '../layouts/Layout'
import { AlertCircle, Plus, Search, Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'

export default function GestionUtilisateurs() {
  const [recherche, setRecherche] = useState('')
  const [filtreRole, setFiltreRole] = useState('tous')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nom: '', email: '', role: 'patient', telephone: '', statut: 'actif' })

  const utilisateurs = [
    { id: 1, nom: 'Professeur Elhadj Yaya Baldé', email: 'elhadj.balde@clinic.com', role: 'admin', telephone: '07 01 02 03 00', statut: 'Actif' },
    { id: 2, nom: 'Docteur Mamadou Bassirou Bah', email: 'mamadou.bah@clinic.com', role: 'admin', telephone: '07 02 03 04 00', statut: 'Actif' },
    { id: 3, nom: 'Aissatou Baldé', email: 'aissatou.balde@clinic.com', role: 'secretaire', telephone: '07 09 10 11 12', statut: 'Actif' },
    { id: 4, nom: 'Docteur Mamadou Diallo', email: 'mamadou.diallo@clinic.com', role: 'medecin', specialite: 'Cardiologie', telephone: '07 05 06 07 08', statut: 'Actif' },
    { id: 5, nom: 'Docteur Thierno Siradjo Baldé', email: 'thierno.sirardjo@clinic.com', role: 'medecin', specialite: 'Cardiologie', telephone: '07 17 18 19 20', statut: 'Actif' },
    { id: 6, nom: 'Docteur Thierno Boubacar Barry', email: 'thierno.barry@clinic.com', role: 'medecin', specialite: 'Cardiologie', telephone: '07 21 22 23 24', statut: 'Actif' },
    { id: 7, nom: 'Oumou Bah', email: 'oumou.bah@example.com', role: 'patient', telephone: '07 13 14 15 16', statut: 'Actif' },
    { id: 8, nom: 'Yaya Barry', email: 'yaya.barry@example.com', role: 'patient', telephone: '07 33 34 35 36', statut: 'Inactif' }
  ]

  const utilisateursFiltres = utilisateurs.filter(u => {
    const matchRecherche = u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                           u.email.toLowerCase().includes(recherche.toLowerCase())
    const matchRole = filtreRole === 'tous' || u.role === filtreRole
    return matchRecherche && matchRole
  })

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-700'
      case 'medecin':
        return 'bg-green-100 text-green-700'
      case 'secretaire':
        return 'bg-purple-100 text-purple-700'
      case 'admin':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      patient: 'Patient',
      medecin: 'Médecin',
      secretaire: 'Secrétaire',
      admin: 'Administrateur'
    }
    return labels[role] || role
  }

  const handleAddUser = () => {
    if (formData.nom.trim() && formData.email.trim()) {
      setFormData({ nom: '', email: '', role: 'patient', telephone: '', statut: 'actif' })
      setShowForm(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-1">Créer, modifier et gérer les utilisateurs du système</p>
          </div>

          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouvel Utilisateur
          </button>
        </div>

        {/* Modal d'ajout */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Créer nouvel utilisateur</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="patient">Patient</option>
                  <option value="medecin">Médecin</option>
                  <option value="secretaire">Secrétaire</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    Créer
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filtreRole}
            onChange={(e) => setFiltreRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="tous">Tous les rôles</option>
            <option value="patient">Patients</option>
            <option value="medecin">Médecins</option>
            <option value="secretaire">Secrétaires</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Nom</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Rôle</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Spécialité</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Téléphone</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {utilisateursFiltres.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-medium text-gray-900">{user.nom}</td>
                    <td className="px-6 py-5 text-gray-600">{user.email}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-600">{user.role === 'medecin' ? user.specialite : '-'}</td>
                    <td className="px-6 py-5 text-gray-600">{user.telephone}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.statut === 'Actif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.statut}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button className="text-red-600 hover:text-red-700 inline-flex items-center gap-1">
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {utilisateursFiltres.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{utilisateurs.filter(u => u.role === 'patient').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Total Médecins</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{utilisateurs.filter(u => u.role === 'medecin').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-medium">Total Secrétaires</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{utilisateurs.filter(u => u.role === 'secretaire').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-medium">Utilisateurs Actifs</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{utilisateurs.filter(u => u.statut === 'Actif').length}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
