import Layout from '../layouts/Layout'
import { Calendar, FileText, BarChart3, Eye, Search, RefreshCw, AlertCircle, X, User, Clock, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Supervision() {
  const [searchRendezVous, setSearchRendezVous] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // États pour les modales
  const [selectedRDV, setSelectedRDV] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`)
      const data = await response.json()
      if (data.success) {
        setStats(data)
      } else {
        setError("Impossible de charger les données.")
      }
    } catch (error) {
      console.error('Erreur supervision:', error)
      setError("Erreur de connexion au serveur.")
    } finally {
      setLoading(false)
    }
  }

  const statistiques = [
    { label: 'Total Rendez-vous', value: stats?.reservations?.length || '0', icon: Calendar, color: 'blue' },
    { label: 'Patients Inscrits', value: stats?.metrics?.patients || '0', icon: BarChart3, color: 'purple' },
    { label: 'Médecins Actifs', value: stats?.metrics?.medecins || '0', icon: Eye, color: 'orange' },
  ]

  const rendezvousFiltres = (stats?.reservations || []).filter(rv => {
    const searchLower = searchRendezVous.toLowerCase()
    const patientFullName = `${rv.patient_prenom || ''} ${rv.patient_nom || ''}`.toLowerCase()
    const medecinName = (rv.medecin_nom || 'Non assigné').toLowerCase()
    
    const matchSearch = patientFullName.includes(searchLower) || medecinName.includes(searchLower)
    const matchStatut = filterStatut === 'tous' || rv.statut === filterStatut
    return matchSearch && matchStatut
  })

  const getStatutColor = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'confirmé':
      case 'confirme': return 'bg-green-100 text-green-800'
      case 'en attente':
      case 'attente': return 'bg-amber-100 text-amber-800'
      case 'annulé':
      case 'annule': return 'bg-rose-100 text-rose-800'
      case 'termine': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !stats) {
      return (
          <Layout>
              <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                  <RefreshCw className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">Initialisation de la supervision...</p>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-20 relative">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Supervision Globale</h1>
            <p className="text-gray-500 font-medium mt-1">Surveillance des activités cliniques en temps réel</p>
          </div>
          <button 
            onClick={fetchData}
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:text-blue-600 transition-all"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold">{error}</span>
            </div>
        )}

        {/* Statistiques Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistiques.map((stat, index) => {
            const Icon = stat.icon
            const colorMap = {
              blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50',
              green: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50',
              purple: 'bg-purple-50 text-purple-600 border-purple-100 shadow-purple-50',
              orange: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50'
            }
            return (
              <div key={index} className={`bg-white rounded-[2rem] shadow-xl p-8 border ${colorMap[stat.color]} transition-all hover:scale-[1.02]`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                    <p className="text-4xl font-black mt-2 text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-600' : stat.color === 'green' ? 'bg-emerald-600' : stat.color === 'purple' ? 'bg-purple-600' : 'bg-amber-600'} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tableau Rendez-vous */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 overflow-hidden border border-gray-100">
          <div className="border-b bg-gray-50/30 p-8 flex flex-col md:flex-row justify-between gap-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Flux des Rendez-vous
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Patient ou médecin..."
                  value={searchRendezVous}
                  onChange={(e) => setSearchRendezVous(e.target.value)}
                  className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 font-bold text-sm shadow-sm"
                />
              </div>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm shadow-sm"
              >
                <option value="tous">Tous les statuts</option>
                <option value="attente">En attente</option>
                <option value="confirme">Confirmés</option>
                <option value="annule">Annulés</option>
                <option value="termine">Terminés</option>
              </select>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Identité Patient</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Spécialiste</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Programmation</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Statut</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rendezvousFiltres.map((rv) => (
                  <tr key={rv.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900">{rv.patient_prenom} {rv.patient_nom}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-500">{rv.medecin_nom ? `Dr. ${rv.medecin_nom}` : 'Non assigné'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-700 text-sm">{new Date(rv.date_rendez_vous).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{rv.heure.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatutColor(rv.statut)} shadow-sm`}>
                        {rv.statut}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedRDV(rv)}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-lg rounded-2xl transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rendezvousFiltres.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-xs">Aucune donnée correspondante</p>
                </div>
            )}
          </div>
        </div>

        {/* Tableau Dossiers Patients (supprimé) */}

        {/* MODALE DÉTAILS RENDEZ-VOUS */}
        {selectedRDV && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="bg-blue-600 p-8 text-white flex justify-between items-start">
                        <div>
                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Détails du Rendez-vous</p>
                            <h3 className="text-3xl font-black tracking-tight">{selectedRDV.patient_prenom} {selectedRDV.patient_nom}</h3>
                        </div>
                        <button onClick={() => setSelectedRDV(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spécialiste</p>
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <User className="w-4 h-4 text-blue-500" />
                                    Dr. {selectedRDV.medecin_nom || 'Non assigné'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut Actuel</p>
                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${getStatutColor(selectedRDV.statut)}`}>
                                    {selectedRDV.statut}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    {new Date(selectedRDV.date_rendez_vous).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Heure</p>
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    {selectedRDV.heure.substring(0, 5)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Motif de consultation
                            </p>
                            <p className="text-gray-700 font-medium leading-relaxed italic">
                              {(selectedRDV && (selectedRDV.motif || selectedRDV.info || selectedRDV.motif_consultation))
                                ? (selectedRDV.motif || selectedRDV.info || selectedRDV.motif_consultation)
                                : 'Aucun motif spécifié pour ce rendez-vous.'}
                            </p>
                        </div>
                    </div>
                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        <button 
                            onClick={() => setSelectedRDV(null)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                        >
                            Fermer les détails
                        </button>
                    </div>
                </div>
            </div>
        )}

        

        {/* MODALE DÉTAILS PATIENT supprimée */}

      </div>
    </Layout>
  )
}
