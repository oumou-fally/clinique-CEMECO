import { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  Calendar,
  Search,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  X,
  Save,
  ChevronRight,
  Filter,
  Stethoscope,
  AlertCircle,
  Briefcase
} from 'lucide-react'
import Layout from '../layouts/Layout'

export default function EmploiDuTempsMedecins() {
  const [planningGlobal, setPlanningGlobal] = useState([])
  const [absences, setAbsences] = useState([])
  const [medecins, setMedecins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [planRes, absRes, medRes] = await Promise.all([
        fetch('/api/medecin/planning/all/global'),
        fetch('/api/medecin/disponibilites'),
        fetch('/api/personnel?role=medecin')
      ])
      
      const planData = await planRes.json()
      const absData = await absRes.json()
      const medData = await medRes.json()

      if (planData.success) setPlanningGlobal(planData.planning)
      setAbsences(absData || [])
      setMedecins(medData.personnel || [])
    } catch (error) {
      console.error('Erreur fetchData:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSlot = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/medecin/planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSlot)
      })
      const data = await res.json()
      if (data.success) {
        setShowEditModal(false)
        fetchData()
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Erreur lors de la sauvegarde')
    }
  }

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce créneau ?')) return
    try {
      const res = await fetch(`/api/medecin/planning/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchData()
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const filteredPlanning = planningGlobal.filter(p => 
    `${p.medecin_prenom} ${p.medecin_nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatutBadge = (statut) => {
    switch(statut) {
      case 'disponible': return 'bg-green-100 text-green-700 border-green-200'
      case 'indisponible': return 'bg-red-100 text-red-700 border-red-200'
      case 'modifié': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'annulé': return 'bg-gray-200 text-gray-700 border-gray-300'
      case 'urgence': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const startOfWeek = (d) => {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // Monday = 0
    date.setDate(date.getDate() - day);
    date.setHours(0,0,0,0);
    return date;
  };

  const endOfWeek = (d) => {
    const s = startOfWeek(d);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    e.setHours(23,59,59,999);
    return e;
  };

  const dedupeSlots = (items) => {
    const seen = new Set();
    return items.filter(s => {
      const key = s.id ? `id:${s.id}` : `${s.id_medecin}:${s.date_planning}:${s.heure_debut}:${s.heure_fin}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const groupByWeek = (items) => {
    const past = [];
    const current = [];
    const next = [];

    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(weekStart.getDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    nextWeekEnd.setHours(23,59,59,999);

    items.forEach(p => {
      const d = new Date(p.date_planning);
      if (d < weekStart) past.push(p);
      else if (d >= weekStart && d <= weekEnd) current.push(p);
      else if (d >= nextWeekStart && d <= nextWeekEnd) next.push(p);
      else {
        // ignore further future for this view
      }
    });

    const sortByDate = (a,b) => new Date(a.date_planning) - new Date(b.date_planning) || a.heure_debut.localeCompare(b.heure_debut);

    return {
      past: past.sort(sortByDate),
      current: current.sort(sortByDate),
      next: next.sort(sortByDate)
    };
  };

  const [selectedTab, setSelectedTab] = useState('current');

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 text-white">
              <Calendar className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Centre de Planning Global</h1>
              <p className="text-gray-500 mt-1 font-medium">Gérez les horaires et disponibilités de tous les médecins</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Rechercher un médecin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl transition-all font-medium text-sm"
              />
            </div>
            <button 
              onClick={() => {
                setEditingSlot({
                  id_medecin: '',
                  date_planning: new Date().toISOString().split('T')[0],
                  heure_debut: '08:00',
                  heure_fin: '12:00',
                  statut: 'disponible',
                  commentaire: ''
                })
                setShowEditModal(true)
              }}
              className="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100"
            >
              <Plus className="w-5 h-5" />
              Nouvel Horaire
            </button>
          </div>
        </div>

        {/* Section Absences Récentes */}
        {absences.length > 0 && (
          <div className="bg-orange-50 border border-orange-100 p-6 rounded-[35px] flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                 <AlertCircle className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-black text-orange-900">Alertes Absences</p>
                 <p className="text-sm text-orange-700 font-medium">{absences.length} médecin(s) ont des absences signalées actuellement.</p>
               </div>
             </div>
             <button 
               onClick={() => window.location.href = '/dashboard/disponibilites'}
               className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-100 transition-all flex items-center gap-2"
             >
               <Briefcase className="w-4 h-4" />
               Gérer les Absences
             </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold text-lg">Synchronisation du planning global...</p>
          </div>
        ) : filteredPlanning.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border border-gray-100">
            <Calendar className="w-20 h-20 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-xl">Aucun horaire de travail défini</p>
            <p className="text-gray-300">Utilisez le bouton "Nouvel Horaire" pour commencer.</p>
          </div>
        ) : (
          (() => {
            const groups = groupByWeek(dedupeSlots(filteredPlanning));
            const renderCard = (slot) => (
              <div 
                key={slot.id}
                className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      {slot.medecin_nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 capitalize leading-tight">Dr. {slot.medecin_prenom} {slot.medecin_nom}</h3>
                      <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">{slot.specialite}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatutBadge(slot.statut)}`}>
                    {slot.statut}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Horaires</p>
                       <Clock className="w-3 h-3 text-gray-300" />
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-50 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800 text-lg leading-none mb-1">
                          {new Date(slot.date_planning).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-sm font-black text-indigo-600">
                          {slot.heure_debut.substring(0, 5)} — {slot.heure_fin.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {slot.commentaire && (
                    <div className="bg-white p-4 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-500 font-bold italic text-center">"{slot.commentaire}"</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setEditingSlot({
                        ...slot,
                        date_planning: new Date(slot.date_planning).toISOString().split('T')[0]
                      })
                      setShowEditModal(true)
                    }}
                    className="flex-1 py-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-gray-200 group-hover:shadow-indigo-100"
                  >
                    <Edit className="w-4 h-4" />
                    Ajuster
                  </button>
                  <button 
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-4 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl transition-all border border-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );

            return (
              <div>
                {/* Tabs */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gray-100 rounded-full p-1 flex items-center">
                    <button
                      onClick={() => setSelectedTab('past')}
                      className={`px-6 py-2 rounded-full transition ${selectedTab === 'past' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                      Passé {groups.past.length > 0 && <span className="ml-2 text-sm text-gray-400">({groups.past.length})</span>}
                    </button>

                    <button
                      onClick={() => setSelectedTab('current')}
                      className={`px-6 py-2 rounded-full transition ${selectedTab === 'current' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
                      Cette Sem. {groups.current.length > 0 && <span className="ml-2 text-sm text-gray-400">({groups.current.length})</span>}
                    </button>

                    <button
                      onClick={() => setSelectedTab('next')}
                      className={`px-6 py-2 rounded-full transition ${selectedTab === 'next' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                      Suivante {groups.next.length > 0 && <span className="ml-2 text-sm text-gray-400">({groups.next.length})</span>}
                    </button>
                  </div>
                </div>

                {/* Selected group */}
                {groups[selectedTab].length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 font-bold">Aucun créneau dans cette section.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups[selectedTab].map(renderCard)}
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Modal Edition / Ajout */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
              <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black">{editingSlot.id ? 'Ajuster l\'horaire' : 'Nouvel Horaire'}</h2>
                  {editingSlot.id && (
                    <p className="text-sm opacity-80 font-bold">Dr. {editingSlot.medecin_prenom} {editingSlot.medecin_nom}</p>
                  )}
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-white/20 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveSlot} className="p-10 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  {!editingSlot.id && (
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block tracking-widest">Choisir un Médecin</label>
                      <select 
                        required
                        value={editingSlot.id_medecin}
                        onChange={(e) => setEditingSlot({...editingSlot, id_medecin: e.target.value})}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                      >
                        <option value="">Sélectionner un médecin</option>
                        {medecins.map(m => (
                          <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block tracking-widest">Date</label>
                    <input 
                      type="date"
                      required
                      value={editingSlot.date_planning}
                      onChange={(e) => setEditingSlot({...editingSlot, date_planning: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block tracking-widest">Début</label>
                      <input 
                        type="time"
                        required
                        value={editingSlot.heure_debut}
                        onChange={(e) => setEditingSlot({...editingSlot, heure_debut: e.target.value})}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block tracking-widest">Fin</label>
                      <input 
                        type="time"
                        required
                        value={editingSlot.heure_fin}
                        onChange={(e) => setEditingSlot({...editingSlot, heure_fin: e.target.value})}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 mb-1 block tracking-widest">Statut</label>
                    <select 
                      value={editingSlot.statut}
                      onChange={(e) => setEditingSlot({...editingSlot, statut: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                    >
                      <option value="disponible">✅ Disponible</option>
                      <option value="indisponible">❌ Indisponible</option>
                      <option value="modifié">🟠 Modifié</option>
                      <option value="annulé">⚪ Annulé</option>
                      <option value="urgence">⚠️ Urgence uniquement</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <Save className="w-6 h-6" />
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
