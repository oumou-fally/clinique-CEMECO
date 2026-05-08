import Layout from '../layouts/Layout'
import { Plus, Edit2, Trash2, Save, X, DollarSign, Tag, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function GestionTarifs() {
  const [tarifs, setTarifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newTarif, setNewTarif] = useState({ nom: '', prix: '' })
  const [editTarif, setEditTarif] = useState({ nom: '', prix: '' })

  useEffect(() => {
    fetchTarifs()
  }, [])

  const getHeaders = () => {
    const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
    return {
      'Content-Type': 'application/json',
      'x-admin-role': adminData.role || ''
    }
  }

  const fetchTarifs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/tarifs')
      const data = await res.json()
      if (data.success) {
        setTarifs(data.tarifs)
      }
    } catch (error) {
      console.error('Erreur tarifs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
      const role = adminData.role

      const res = await fetch('http://localhost:3000/api/admin/tarifs', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newTarif)
      })
      const data = await res.json()
      if (data.success) {
        setShowAddForm(false)
        setNewTarif({ nom: '', prix: '' })
        fetchTarifs()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Erreur lors de l\'ajout')
    }
  }

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/tarifs/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editTarif)
      })
      const data = await res.json()
      if (data.success) {
        setEditingId(null)
        fetchTarifs()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Erreur lors de la modification')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce tarif définitivement ?')) return
    try {
      const res = await fetch(`http://localhost:3000/api/admin/tarifs/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      const data = await res.json()
      if (data.success) {
        fetchTarifs()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gestion des Tarifs</h1>
            <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Configurez les prix des consultations et services de la clinique
            </p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[2rem] transition-all font-black shadow-xl shadow-blue-100 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Nouveau Service
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2">Transparence Tarifaire</h2>
            <p className="text-blue-100 max-w-lg font-medium">
              Les prix modifiés ici seront instantanément mis à jour pour les patients lors de leur prise de rendez-vous. 
              Assurez-vous de valider les nouveaux tarifs avec la direction.
            </p>
          </div>
          <DollarSign className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/10" />
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-10 animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Ajouter un service</h2>
              <form onSubmit={handleAdd} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Nom du service</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Consultation Générale"
                      value={newTarif.nom}
                      onChange={(e) => setNewTarif({ ...newTarif, nom: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Prix (GNF)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      placeholder="Ex: 50000"
                      value={newTarif.prix}
                      onChange={(e) => setNewTarif({ ...newTarif, prix: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    Enregistrer
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tarifs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-[2.5rem]" />)
          ) : tarifs.map((tarif) => (
            <div 
              key={tarif.id} 
              className={`bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative ${editingId === tarif.id ? 'ring-2 ring-blue-500 shadow-blue-50' : ''}`}
            >
              {editingId === tarif.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTarif.nom}
                    onChange={(e) => setEditTarif({ ...editTarif, nom: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    value={editTarif.prix}
                    onChange={(e) => setEditTarif({ ...editTarif, prix: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(tarif.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Sauver
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-gray-500 rounded-xl">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Tag className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{tarif.nom}</h3>
                    <p className="text-gray-400 font-bold text-sm mt-1">Service de consultation</p>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prix unitaire</p>
                      <p className="text-3xl font-black text-gray-900">
                        {parseInt(tarif.prix).toLocaleString()} <span className="text-sm font-bold text-blue-600 ml-1">GNF</span>
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform">
                      <button 
                        onClick={() => {
                          setEditingId(tarif.id)
                          setEditTarif({ nom: tarif.nom, prix: tarif.prix })
                        }}
                        className="p-3 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-2xl transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tarif.id)}
                        className="p-3 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {tarifs.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <DollarSign className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-black text-xl italic">Aucun tarif configuré pour le moment.</p>
            <button onClick={() => setShowAddForm(true)} className="mt-4 text-blue-600 font-black hover:underline">Ajouter votre premier service</button>
          </div>
        )}
      </div>
    </Layout>
  )
}
