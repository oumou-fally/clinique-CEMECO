import Layout from '../layouts/Layout'
import { Plus, Search, Trash2, Edit2, User, Mail, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function GestionUtilisateurs() {
  const [recherche, setRecherche] = useState('')
  const [filtreRole, setFiltreRole] = useState('tous')
  const [showForm, setShowForm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [newUserName, setNewUserName] = useState('')

  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({ 
    prenom: '', 
    nom: '', 
    email: '', 
    role: 'medecin', 
    telephone: '' 
  })

  // Charger les utilisateurs depuis l'API
  const fetchUtilisateurs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/personnel?role=${filtreRole}&search=${recherche}`)
      const data = await res.json()
      
      if (data.success) {
        setUtilisateurs(data.personnel)
      }
    } catch (err) {
      console.error(err)
      setError('Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUtilisateurs()
  }, [filtreRole, recherche])

  const handleAddUser = async () => {
    if (!formData.prenom.trim() || !formData.nom.trim() || !formData.email.trim()) {
      alert("Prénom, nom et email sont obligatoires")
      return
    }

    try {
      // Récupérer l'ID admin depuis le localStorage
      const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
      const adminId = adminData.id || null

      const res = await fetch(`${API_URL}/api/personnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_admin: adminId })
      })

      const data = await res.json()

      if (data.success) {
        setNewPassword(data.password)
        setNewUserName(`${formData.prenom} ${formData.nom}`)
        setShowPasswordModal(true)
        
        // Réinitialiser le formulaire
        setFormData({ prenom: '', nom: '', email: '', role: 'medecin', telephone: '' })
        setShowForm(false)
        
        // Rafraîchir la liste
        fetchUtilisateurs()
      } else {
        alert(data.message || "Erreur lors de l'ajout")
      }
    } catch (err) {
      console.error(err)
      alert("Erreur de connexion au serveur")
    }
  }

  const handleDelete = async (id, role) => {
    if (!confirm(`Supprimer ce ${role === 'medecin' ? 'médecin' : 'secrétaire'} ?`)) return

    try {
      const res = await fetch(`${API_URL}/api/personnel/${id}?role=${role}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        fetchUtilisateurs()
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert("Erreur lors de la suppression")
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Mot de passe copié !')
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'medecin': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'secretaire': return 'bg-violet-100 text-violet-700 border-violet-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRoleLabel = (role) => {
    return role === 'medecin' ? 'Médecin' : 'Secrétaire'
  }

  const RoleSelector = () => (
    <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
      {[
        { value: 'medecin', label: 'Médecin', icon: User },
        { value: 'secretaire', label: 'Secrétaire', icon: Mail }
      ].map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setFormData({ ...formData, role: value })}
          className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-semibold transition-all ${
            formData.role === value 
              ? getRoleColor(value) + ' shadow-sm' 
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
          }`}
        >
          <Icon className="w-5 h-5" />
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Personnel</h1>
            <p className="text-gray-600 mt-1">Gérez les médecins et secrétaires de la clinique</p>
          </div>

          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl transition-all font-semibold shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5" />
            Nouveau membre
          </button>
        </div>

        {/* Modal d'ajout */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="px-8 pt-8 pb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Ajouter un membre</h2>
                <p className="text-gray-500 mt-1">Le mot de passe sera généré automatiquement</p>
              </div>

              <div className="px-8 pb-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Aminata"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Diallo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="exemple@clinic.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="07 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Type de compte</label>
                  <RoleSelector />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold transition"
                  >
                    Ajouter le membre
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-semibold transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal du mot de passe généré */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
              <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Membre ajouté avec succès !</h2>
              <p className="text-gray-600 mb-6">
                {newUserName} a été ajouté.<br />
                Voici son mot de passe temporaire :
              </p>

              <div className="bg-gray-100 p-4 rounded-2xl font-mono text-lg mb-6 flex items-center justify-between">
                <span>{newPassword}</span>
                <button 
                  onClick={() => copyToClipboard(newPassword)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-amber-600 mb-6">
                ⚠️ Donnez ce mot de passe à la personne. Elle pourra le modifier ultérieurement.
              </p>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Filtres + Recherche */}
        <div className="bg-white rounded-3xl shadow p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou prénom..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-12 pr-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filtreRole}
            onChange={(e) => setFiltreRole(e.target.value)}
            className="px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="tous">Tous les membres</option>
            <option value="medecin">Médecins</option>
            <option value="secretaire">Secrétaires</option>
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-8 py-5 text-left font-semibold text-gray-700">Nom complet</th>
                  <th className="px-8 py-5 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-8 py-5 text-left font-semibold text-gray-700">Type de compte</th>
                  <th className="px-8 py-5 text-left font-semibold text-gray-700">Téléphone</th>
                  <th className="px-8 py-5 text-left font-semibold text-gray-700">Statut</th>
                  <th className="px-8 py-5 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {utilisateurs.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-8 py-6 font-medium text-gray-900">
                      {user.nomComplet || `${user.prenom} ${user.nom}`}
                    </td>
                    <td className="px-8 py-6 text-gray-600">{user.email}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-block px-5 py-2 rounded-2xl text-sm font-semibold ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-gray-600">{user.telephone || '-'}</td>
                    <td className="px-8 py-6">
                      <span className="inline-block px-5 py-2 rounded-2xl text-sm font-semibold bg-emerald-100 text-emerald-700">
                        Actif
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-4">
                      <button className="text-blue-600 hover:text-blue-700 transition">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.role)}
                        className="text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {utilisateurs.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-10">Aucun membre trouvé</p>
        )}
      </div>
    </Layout>
  )
}