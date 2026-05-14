import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Eye, Phone, Calendar, FileText, Edit, Trash2, X, Stethoscope, Pill, Users, User, ArrowRight, Activity, MapPin, Mail, Clipboard, History } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import OrdonnanceModal from '../components/OrdonnanceModal'

export default function Patients() {
  const { medecinId, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState([])
  const [selectedRdvDetail, setSelectedRdvDetail] = useState(null)
  const [consultationData, setConsultationData] = useState(null)
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false)
  const [activeTab, setActiveTab] = useState('termine') // 'all', 'termine', 'recent'
  const [modalTab, setModalTab] = useState('current') // 'current', 'dossier', 'ordonnances'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchReservations = useCallback(async () => {
    if (!medecinId) return
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/medecin/consultations/reservations/${medecinId}`)
      const data = await res.json()
      if (data.success) {
        setReservations(data.reservations || [])
      }
    } catch (error) {
      console.error('Erreur fetch reservations:', error)
      setReservations([])
    } finally {
      setLoading(false)
    }
  }, [medecinId, API_URL])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const fetchMedicalRecord = async (patientId) => {
    try {
      const res = await fetch(`${API_URL}/api/patient/dossier/${patientId}`)
      const data = await res.json()
      if (data.success) {
        setMedicalRecord(data.data)
      }
    } catch (error) {
      console.error('Erreur fetch medical record:', error)
    }
  }

  // Grouper par patient
  const uniquePatients = (reservations || []).reduce((acc, current) => {
    if (!current || !current.patient_id) return acc;
    const x = acc.find(item => item.patient_id === current.patient_id)
    if (!x) {
      return acc.concat([current])
    } else {
      // Priorité 1: Garder celui qui est 'termine'
      if (current.statut === 'termine' && x.statut !== 'termine') {
        return acc.map(item => item.patient_id === current.patient_id ? current : item)
      }
      // Priorité 2: Si les deux sont 'termine' ou aucun, garder le plus récent
      if (new Date(current.date_rendez_vous) > new Date(x.date_rendez_vous)) {
        // Ne pas écraser un 'termine' par un récent qui ne l'est pas
        if (x.statut === 'termine' && current.statut !== 'termine') return acc;
        return acc.map(item => item.patient_id === current.patient_id ? current : item)
      }
      return acc
    }
  }, [])

  const filteredPatients = uniquePatients.filter(p => {
    const firstName = p.prenom || '';
    const lastName = p.nom || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const tel = p.telephone || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || tel.includes(searchTerm);
    
    if (activeTab === 'termine') {
      return matchesSearch && p.statut === 'termine';
    }
    if (activeTab === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && new Date(p.date_rendez_vous) >= oneWeekAgo;
    }
    return matchesSearch;
  })

  const handleViewDetail = async (rdv) => {
    setSelectedRdvDetail(rdv)
    setConsultationData(null)
    setMedicalRecord(null)
    setModalTab('current')
    
    if (rdv) {
      // Charger la consultation actuelle
      if (rdv.statut === 'termine') {
        try {
          const res = await fetch(`${API_URL}/api/medecin/consultations/detail/${rdv.id}`)
          const data = await res.json()
          if (data.success) {
            setConsultationData(data.consultation)
          }
        } catch (error) {
          console.error('Erreur fetch detail consultation:', error)
        }
      }
      // Charger le dossier médical complet
      fetchMedicalRecord(rdv.patient_id)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirme': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'attente': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'annule': return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'termine': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100">
                <Users className="w-8 h-8 text-white" />
              </div>
              Ma Patientèle
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Historique des patients et dossiers médicaux.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Patients</p>
                <p className="text-2xl font-black text-gray-900">{uniquePatients.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 relative group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border-transparent focus:ring-4 focus:ring-blue-50 rounded-[1.8rem] shadow-sm border border-gray-100 font-medium text-gray-700 transition-all"
            />
          </div>
          
          <div className="flex p-1.5 bg-gray-100 rounded-[1.8rem] w-full md:w-auto">
            {[
              { id: 'termine', label: 'Terminés' },
              { id: 'all', label: 'Tous' },
              { id: 'recent', label: 'Récents' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-[1.4rem] text-sm font-black transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold animate-pulse">Chargement...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Aucun patient trouvé</h3>
            <p className="text-gray-500 mt-2">Changez de filtre ou de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPatients.map((p) => (
              <div 
                key={p.id} 
                className="group bg-white rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-100 group-hover:scale-110 transition-transform">
                        {p.nom?.[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 capitalize group-hover:text-blue-600 transition-colors">
                          {p.prenom} {p.nom}
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: #{p.patient_id}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter ${getStatusColor(p.statut)}`}>
                      {p.statut}
                    </div>
                  </div>

                  <div className="space-y-4 bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100/50">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm">
                           <Calendar className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dernière Visite</p>
                           <p className="font-bold text-gray-900">{new Date(p.date_rendez_vous).toLocaleDateString()}</p>
                         </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm">
                           <Phone className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</p>
                           <p className="font-bold text-gray-900">{p.telephone || '--'}</p>
                         </div>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleViewDetail(p)}
                    className="w-full mt-8 py-4 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir Dossier Complet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Dossier Complet */}
        {selectedRdvDetail && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{selectedRdvDetail.prenom} {selectedRdvDetail.nom}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dossier Médical • Patient #{selectedRdvDetail.patient_id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRdvDetail(null)}
                  className="text-gray-400 hover:text-gray-900 p-3 hover:bg-gray-50 rounded-2xl transition-all"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Modal Tabs Selection */}
              <div className="px-8 py-4 bg-gray-50/50 flex gap-4 border-b border-gray-100 overflow-x-auto no-scrollbar">
                {[
                  { id: 'current', label: 'Consultation', icon: Stethoscope },
                  { id: 'dossier', label: 'Dossier Médical', icon: Clipboard },
                  { id: 'ordonnances', label: 'Ordonnances', icon: Pill }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${modalTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-100'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Modal Content */}
              <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                
                {modalTab === 'current' && (
                  <div className="space-y-8">
                    {consultationData ? (
                      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         {/* Stats Cards */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Tension', val: consultationData.pa, unit: '', color: 'blue' },
                              { label: 'Fréq. Cardiaque', val: consultationData.fc, unit: 'bpm', color: 'rose' },
                              { label: 'Température', val: consultationData.temperature, unit: '°C', color: 'amber' },
                              { label: 'Saturation', val: consultationData.saturation, unit: '%', color: 'emerald' }
                            ].map(s => (
                              <div key={s.label} className={`p-6 bg-${s.color}-50/50 rounded-3xl border border-${s.color}-100 text-center`}>
                                <p className={`text-[10px] font-black text-${s.color}-400 uppercase mb-1`}>{s.label}</p>
                                <p className={`text-2xl font-black text-${s.color}-900`}>{s.val || '--'} <span className="text-xs">{s.unit}</span></p>
                              </div>
                            ))}
                         </div>

                         {/* Results */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Diagnostic</p>
                               <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl min-h-[150px]">
                                 <p className="font-bold text-lg">{consultationData.diagnostic || 'Non renseigné'}</p>
                               </div>
                            </div>
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Traitement</p>
                               <div className="bg-blue-50 text-blue-900 p-8 rounded-[2.5rem] border border-blue-100 min-h-[150px]">
                                 <p className="font-bold whitespace-pre-wrap">{consultationData.traitement || 'Aucun traitement'}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
                        <p className="text-gray-400 font-bold">Aucune consultation détaillée pour ce rendez-vous.</p>
                      </div>
                    )}
                  </div>
                )}

                {modalTab === 'dossier' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <History className="w-8 h-8 text-blue-600" />
                        Historique des Consultations
                      </h3>
                    </div>
                    {medicalRecord?.consultations?.length > 0 ? (
                      <div className="space-y-6">
                        {medicalRecord.consultations.map(c => (
                          <div key={c.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-blue-200 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-black text-gray-900">{new Date(c.date_rendez_vous).toLocaleDateString()}</p>
                                  <p className="text-xs text-gray-500 font-bold uppercase">Dr. {c.medecin_prenom} {c.medecin_nom} • {c.medecin_specialite}</p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase">Terminé</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="bg-gray-50 p-4 rounded-2xl">
                                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Diagnostic</p>
                                  <p className="text-gray-900 font-bold text-sm">{c.diagnostic || '--'}</p>
                               </div>
                               <div className="bg-blue-50/30 p-4 rounded-2xl">
                                  <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Traitement</p>
                                  <p className="text-blue-900 font-bold text-sm truncate">{c.traitement || '--'}</p>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-20 text-gray-400">Aucun historique trouvé.</p>
                    )}
                  </div>
                )}

                {modalTab === 'ordonnances' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-black text-gray-900">Historique des Ordonnances</h3>
                    {medicalRecord?.ordonnances?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {medicalRecord.ordonnances.map(o => (
                          <div key={o.id} className="p-8 bg-blue-50/30 border border-blue-100 rounded-[2.5rem] relative overflow-hidden group">
                            <Pill className="absolute -right-4 -top-4 w-24 h-24 text-blue-500/10 group-hover:scale-110 transition-transform" />
                            <div className="flex items-center gap-3 mb-6">
                               <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm">
                                 <Calendar className="w-5 h-5" />
                               </div>
                               <p className="font-black text-blue-900">{new Date(o.date_ordination).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-3">
                              {o.medicaments.slice(0, 3).map((m, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm font-bold text-gray-700 bg-white/50 p-2 rounded-lg">
                                   <span>{m.nom}</span>
                                   <span className="text-xs text-blue-600">{m.dosage}</span>
                                </div>
                              ))}
                              {o.medicaments.length > 3 && (
                                <p className="text-xs text-gray-400 font-bold text-center">+{o.medicaments.length - 3} autres médicaments</p>
                              )}
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedRdvDetail({...selectedRdvDetail, id_consultation: o.id_consultation})
                                setShowOrdonnanceModal(true)
                              }}
                              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                            >
                              Voir Détails
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-20 text-gray-400">Aucune ordonnance archivée.</p>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-gray-50 flex gap-4 sticky bottom-0 border-t border-gray-100">
                <button 
                  onClick={() => setShowOrdonnanceModal(true)}
                  className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-3"
                >
                  <Pill className="w-5 h-5" />
                  Nouvelle Ordonnance
                </button>
                <button 
                   onClick={() => window.print()}
                   className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3"
                >
                   <FileText className="w-5 h-5" />
                   Imprimer Dossier
                </button>
              </div>
            </div>
          </div>
        )}

        <OrdonnanceModal 
          isOpen={showOrdonnanceModal}
          onClose={() => setShowOrdonnanceModal(false)}
          reservation={selectedRdvDetail}
          medecinId={medecinId}
          doctorName={user?.nomComplet}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </Layout>
  )
}
