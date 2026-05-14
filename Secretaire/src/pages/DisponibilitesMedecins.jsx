import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import {
  Calendar, Clock, Search, Filter, AlertCircle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  User, RefreshCw, AlertTriangle, MoreVertical,
  CalendarDays, Users
} from 'lucide-react';

export default function DisponibilitesMedecins() {
  const [planning, setPlanning] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('current'); // 'past', 'current', 'next'
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedImpacted, setSelectedImpacted] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Calcul des dates pour les filtres
  const getDates = useCallback(() => {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    let start = new Date(monday);
    let end = new Date(monday);
    
    if (filterPeriod === 'past') {
      start.setDate(monday.getDate() - 7);
      end.setDate(monday.getDate() - 1);
    } else if (filterPeriod === 'current') {
      end.setDate(monday.getDate() + 6);
    } else if (filterPeriod === 'next') {
      start.setDate(monday.getDate() + 7);
      end.setDate(monday.getDate() + 13);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [filterPeriod]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { start, end } = getDates();
      const params = new URLSearchParams({
        start_date: start,
        end_date: end,
        search: searchTerm,
        patient_search: patientSearch
      });
      
      const res = await fetch(`${API_URL}/api/medecin/planning/all/global?${params}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Erreur serveur');
      
      let filtered = data.planning || [];
      if (filterStatus !== 'all') {
        filtered = filtered.filter(p => p.statut === filterStatus);
      }
      
      setPlanning(filtered);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les disponibilités');
    } finally {
      setLoading(false);
    }
  }, [API_URL, getDates, searchTerm, patientSearch, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const updateSlotStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/medecin/planning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          statut: newStatus,
          // On garde les mêmes infos
          ...planning.find(p => p.id === id) 
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setActiveMenu(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce créneau ?')) return;
    try {
      const res = await fetch(`${API_URL}/api/medecin/planning/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setActiveMenu(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImpacts = async (slot) => {
    if (slot.nb_reservations === 0) return;
    try {
      setImpactLoading(true);
      const res = await fetch(`${API_URL}/api/medecin/planning/${slot.id}/impacts`);
      const data = await res.json();
      if (data.success) {
        setSelectedImpacted({ slot, patients: data.impactes });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImpactLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'disponible': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'indisponible': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'annulé': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'modifié': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'urgence': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'disponible': return <CheckCircle className="w-4 h-4" />;
      case 'indisponible': return <XCircle className="w-4 h-4" />;
      case 'annulé': return <AlertCircle className="w-4 h-4" />;
      case 'modifié': return <RefreshCw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <CalendarDays className="w-10 h-10 text-blue-600" />
              Planning des Médecins
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Gérez les disponibilités et les impacts sur les rendez-vous en temps réel.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => navigate('/dashboard/attribution')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Users className="w-5 h-5" />
              Attribution des RDV
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100">
          
          {/* Search Doctor */}
          <div className="lg:col-span-3 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 rounded-[1.8rem] transition-all font-medium text-gray-700"
            />
          </div>

          {/* Search Patient */}
          <div className="lg:col-span-3 relative group">
            <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Patient assigné..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 rounded-[1.8rem] transition-all font-medium text-gray-700"
            />
          </div>

          {/* Period Filters */}
          <div className="lg:col-span-4 flex p-1.5 bg-gray-100 rounded-[1.8rem]">
            {[
              { id: 'past', label: 'Passé' },
              { id: 'current', label: 'Cette Sem.' },
              { id: 'next', label: 'Suivante' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id)}
                className={`flex-1 py-3 px-4 rounded-[1.4rem] text-sm font-bold transition-all ${
                  filterPeriod === p.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="lg:col-span-2 relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-[1.8rem] font-bold transition-all border ${
                filterStatus !== 'all' 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {filterStatus === 'all' ? 'Statuts' : filterStatus}
            </button>

            {showFilterMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-2 animate-in slide-in-from-top-2 duration-200">
                {['all', 'disponible', 'indisponible', 'annulé', 'modifié', 'urgence'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setShowFilterMenu(false); }}
                    className="w-full text-left px-6 py-3 text-sm font-bold capitalize hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {s === 'all' ? 'Tous les statuts' : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold animate-pulse">Synchronisation des données...</p>
          </div>
        ) : planning.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Aucun créneau trouvé</h3>
            <p className="text-gray-500 mt-2">Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {planning.map((slot) => (
              <div 
                key={slot.id}
                className="group relative bg-white rounded-[2.8rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden"
              >
                {/* Impact Badge */}
                {slot.nb_reservations > 0 && (
                  <button 
                    onClick={() => fetchImpacts(slot)}
                    className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-tighter hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 animate-bounce-subtle"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {slot.nb_reservations} Impact{slot.nb_reservations > 1 ? 's' : ''}
                  </button>
                )}

                <div className="p-8">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-100 group-hover:scale-110 transition-transform">
                      {slot.medecin_prenom?.[0]}{slot.medecin_nom?.[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        Dr. {slot.medecin_prenom} {slot.medecin_nom}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{slot.specialite || 'Généraliste'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${getStatusStyle(slot.statut)}`}>
                          {getStatusIcon(slot.statut)}
                          {slot.statut}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slot Details Card */}
                  <div className="bg-gray-50/80 rounded-[2rem] p-6 space-y-4 border border-gray-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                          <p className="font-bold text-gray-900">
                            {new Date(slot.date_planning).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-200/60 w-full"></div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Horaire</p>
                        <p className="text-2xl font-black text-gray-900 tabular-nums">
                          {slot.heure_debut?.slice(0, 5)} <span className="text-gray-300 mx-1">—</span> {slot.heure_fin?.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {slot.commentaire && (
                    <div className="mt-6 flex gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                      <p className="italic font-medium leading-relaxed">{slot.commentaire}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between gap-3 relative">
                    <button 
                      onClick={() => {
                        localStorage.setItem('medecin_selection', slot.id_medecin);
                        navigate('/dashboard/attribution');
                      }}
                      className="flex-1 bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Assigner
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === slot.id ? null : slot.id)}
                        className="p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 transition-all active:scale-95"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenu === slot.id && (
                        <div className="absolute bottom-full right-0 mb-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <p className="px-6 py-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">Changer statut</p>
                          {['disponible', 'indisponible', 'annulé', 'modifié'].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateSlotStatus(slot.id, s)}
                              className="w-full text-left px-6 py-2.5 text-sm font-bold capitalize hover:bg-gray-50 text-gray-600 hover:text-blue-600"
                            >
                              {s}
                            </button>
                          ))}
                          <div className="h-px bg-gray-100 my-2"></div>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="w-full text-left px-6 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Impact Modal */}
        {selectedImpacted && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" 
              onClick={() => setSelectedImpacted(null)}
            ></div>
            
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-rose-500 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">Patients Impactés</h2>
                      <p className="text-rose-100 font-medium">Ce créneau a été {selectedImpacted.slot.statut}.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedImpacted(null)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {selectedImpacted.patients.length > 0 ? (
                    selectedImpacted.patients.map((rdv) => (
                      <div key={rdv.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                            {rdv.patient_prenom[0]}{rdv.patient_nom[0]}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{rdv.patient_prenom} {rdv.patient_nom}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              {rdv.heure_rendez_vous.slice(0, 5)} — {rdv.motif || 'Pas de motif'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => navigate('/dashboard/mes-rendez-vous')}
                             className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-700 transition-all"
                           >
                             Gérer
                           </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-400 font-medium">Aucun patient impacté directement.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-gray-50 flex gap-4">
                <button 
                  onClick={() => setSelectedImpacted(null)}
                  className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Fermer
                </button>
                <button 
                  onClick={() => navigate('/dashboard/mes-rendez-vous')}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all"
                >
                  Tout Reprogrammer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
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
      `}} />
    </Layout>
  );
}