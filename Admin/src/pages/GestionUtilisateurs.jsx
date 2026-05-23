import Layout from '../layouts/Layout'
import { Plus, Search, Trash2, Edit2, User, Mail, Phone, Shield, Activity, Save, X, Key } from 'lucide-react'
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

  const [formData, setFormData] = useState({ 
    prenom: '', 
    nom: '', 
    email: '', 
    role: 'medecin', 
    telephone: '' 
  })

  const fetchUtilisateurs = async () => {
    setLoading(true)
    try {
      const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
      const res = await fetch(`${API_URL}/api/personnel?role=${filtreRole}&search=${recherche}`, {
        headers: { 'x-admin-role': adminData.role || '' }
      })
      const data = await res.json()
      if (data.success) {
        setUtilisateurs(data.personnel)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUtilisateurs()
  }, [filtreRole, recherche])

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!formData.prenom.trim() || !formData.nom.trim() || !formData.email.trim()) return
    
    try {
      const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
      const res = await fetch(`${API_URL}/api/personnel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-role': adminData.role || ''
        },
        body: JSON.stringify({ ...formData, id_admin: adminData.id })
      })
      const data = await res.json()
      if (data.success) {
        setNewPassword(data.password)
        setNewUserName(`${formData.prenom} ${formData.nom}`)
        setShowPasswordModal(true)
        setFormData({ prenom: '', nom: '', email: '', role: 'medecin', telephone: '' })
        setShowForm(false)
        fetchUtilisateurs()
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert("Erreur de connexion")
    }
  }

  const handleDelete = async (id, role) => {
    if (!confirm(`Supprimer ce membre ?`)) return
    try {
      const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
      const res = await fetch(`${API_URL}/api/personnel/${id}?role=${role}`, { 
        method: 'DELETE',
        headers: { 'x-admin-role': adminData.role || '' }
      })
      const data = await res.json()
      if (data.success) {
        fetchUtilisateurs()
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert("Erreur de suppression")
    }
  }

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gestion du Personnel</h1>
            <p className="text-gray-500 font-medium">Administration des comptes médecins et secrétariat</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${showForm ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-blue-600 text-white shadow-blue-100'}`}
          >
            {showForm ? <><X className="w-5 h-5" /> Fermer</> : <><Plus className="w-5 h-5" /> Nouveau Membre</>}
          </button>
        </div>

        {/* Formulaire Dynamique d'ajout */}
        {showForm && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-blue-100 overflow-hidden animate-in slide-in-from-top duration-300">
            <div className="p-8 bg-blue-50/50 border-b border-blue-50 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Plus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Inscription Immédiate</h2>
            </div>
            <form onSubmit={handleAddUser} className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                <input required type="text" value={formData.prenom} onChange={e=>setFormData({...formData, prenom: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Prénom" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                <input required type="text" value={formData.nom} onChange={e=>setFormData({...formData, nom: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Nom" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" placeholder="email@clinique.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                <input type="tel" value={formData.telephone} onChange={e=>setFormData({...formData, telephone: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" placeholder="06..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rôle</label>
                <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold">
                  <option value="medecin">Médecin</option>
                  <option value="secretaire">Secrétaire</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Enregistrer en Base
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-10 text-center border border-emerald-100">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Compte Créé !</h2>
              <p className="text-gray-500 font-medium mb-8">Mot de passe généré pour <br/><span className="text-gray-900 font-black">{newUserName}</span></p>
              
              <div className="bg-gray-100 p-6 rounded-3xl font-mono text-2xl font-black text-blue-600 mb-8 tracking-widest flex items-center justify-center gap-4">
                {newPassword}
              </div>

              <button 
                onClick={() => setShowPasswordModal(false)}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                Terminer
              </button>
            </div>
          </div>
        )}

        {/* Liste Dynamic */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-4 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher un nom..." 
                value={recherche}
                onChange={e=>setRecherche(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold shadow-sm"
              />
            </div>
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100">
              {['tous', 'medecin', 'secretaire'].map(r => (
                <button 
                  key={r} 
                  onClick={() => setFiltreRole(r)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtreRole === r ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Membre du Personnel</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rôle</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="4" className="h-24 px-10 bg-gray-50/50"></td></tr>)
                ) : utilisateurs.map(user => (
                  <tr key={`${user.role}-${user.id}`} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-10 py-8">
                      <p className="font-black text-gray-900 text-lg uppercase tracking-tighter">
                        {user.prenom} {user.nom}
                      </p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                          <Mail className="w-4 h-4 text-blue-500" /> {user.email}
                        </div>
                        {user.telephone && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                            <Phone className="w-3 h-3" /> {user.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-center">
                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${user.role === 'medecin' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => handleDelete(user.id, user.role)}
                        className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm group-hover:shadow-rose-100"
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
      </div>
    </Layout>
  )
}