import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import {
  Calendar, Clock, Search, Filter, AlertCircle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  User, RefreshCw, AlertTriangle, MoreVertical,
  CalendarDays, Users, UserPlus
} from 'lucide-react';

export default function DisponibilitesMedecins() {
  const [planning, setPlanning] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('current'); // 'past', 'current', 'next'
  const [filterStatus, setFilterStatus] = useState('all');
  const [impactLoading, setImpactLoading] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [slotImpacts, setSlotImpacts] = useState({});
  const [isImpactsModalOpen, setIsImpactsModalOpen] = useState(false);
  const [selectedSlotForImpacts, setSelectedSlotForImpacts] = useState(null);

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
      // Remove duplicate slots (by id or by medecin/date/time)
      const dedupeSlots = (items) => {
        const seen = new Set();
        return (items || []).filter(s => {
          const key = s.id ? `id:${s.id}` : `${s.id_medecin}:${s.date_planning}:${s.heure_debut}:${s.heure_fin}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      filtered = dedupeSlots(filtered);
      
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

  const updateSlotStatus = async (slot, newStatus) => {
    try {
      const formattedDate = new Date(slot.date_planning).toISOString().split('T')[0];

      const res = await fetch(`${API_URL}/api/medecin/planning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...slot,
          date_planning: formattedDate,
          statut: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        
        // Mettre à jour dynamiquement selectedDoctor dans la modal
        if (selectedDoctor) {
          setSelectedDoctor(prev => {
            if (!prev) return null;
            return {
              ...prev,
              slots: prev.slots.map(s => s.id === slot.id ? { ...s, statut: newStatus } : s)
            };
          });
        }
        
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
        await fetchData();
        
        // Retirer dynamiquement le créneau du planning du médecin affiché dans la modal
        if (selectedDoctor) {
          setSelectedDoctor(prev => {
            if (!prev) return null;
            return {
              ...prev,
              slots: prev.slots.filter(s => s.id !== id)
            };
          });
        }
        
        setActiveMenu(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImpacts = async (slot) => {
    try {
      setImpactLoading(true);
      const res = await fetch(`${API_URL}/api/medecin/planning/${slot.id}/impacts`);
      const data = await res.json();
      if (data.success) {
        setSlotImpacts(prev => ({ ...prev, [slot.id]: data.impactes }));
        setSelectedSlotForImpacts(slot);
        setIsImpactsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImpactLoading(false);
    }
  };

  const confirmAppointment = async (rdvId, slot = null) => {
    try {
      setImpactLoading(true);
      const res = await fetch(`${API_URL}/api/reservations/${rdvId}/confirm`, {
        method: 'PUT'
      });
      const data = await res.json();
      
      if (data.success) {
        // Optionnel: Essayer d'attribuer automatiquement si non fait (comme dans handleConfirmer)
        await fetch(`${API_URL}/api/reservations/${rdvId}/auto-assign`, {
          method: 'PUT'
        }).catch(() => {});

        // Rafraîchir les données globales
        await fetchData();

        // Si la modal des impacts est ouverte pour ce créneau, recharger ses impacts
        const targetSlot = slot || selectedSlotForImpacts;
        if (targetSlot) {
          const resImpacts = await fetch(`${API_URL}/api/medecin/planning/${targetSlot.id}/impacts`);
          const dataImpacts = await resImpacts.json();
          if (dataImpacts.success) {
            setSlotImpacts(prev => ({ ...prev, [targetSlot.id]: dataImpacts.impactes }));
          }
        }
        
        // Mettre à jour l'objet selectedDoctor avec les nouvelles données
        if (selectedDoctor) {
          setSelectedDoctor(prev => {
            if (!prev) return null;
            const updatedSlots = prev.slots.map(s => {
              if (s.id === (targetSlot ? targetSlot.id : null)) {
                return {
                  ...s,
                  reservations: s.reservations ? s.reservations.map(r => r.id === rdvId ? { ...r, statut: 'confirme' } : r) : []
                };
              }
              return s;
            });
            return { ...prev, slots: updatedSlots };
          });
        }

        alert('Le rendez-vous a été confirmé et le médecin a été attribué avec succès !');
      } else {
        alert(data.message || 'Une erreur est survenue lors de la confirmation.');
      }
    } catch (err) {
      console.error(err);
      alert('Impossible de confirmer le rendez-vous.');
    } finally {
      setImpactLoading(false);
    }
  };

  const reportReservation = async (rdv) => {
    // Ouvrir le formulaire de report dédié (GestionRendezVous) en passant la réservation
    try {
      navigate('/dashboard/rendez-vous', { state: { reportApp: rdv } })
    } catch (err) {
      console.error('Navigation vers le formulaire de report échouée', err)
      alert('Impossible d\'ouvrir le formulaire de report')
    }
  }

  const groupPlanningByDoctor = (planningData) => {
    const grouped = planningData.reduce((acc, slot) => {
      const key = slot.id_medecin;
      if (!acc[key]) {
        acc[key] = {
          id: slot.id_medecin,
          nom: slot.medecin_nom,
          prenom: slot.medecin_prenom,
          specialite: slot.specialite,
          slots: []
        };
      }
      acc[key].slots.push(slot);
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const doctors = groupPlanningByDoctor(planning);

  const openDoctorPlanning = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
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
            {doctors.map((doctor) => (
              <div 
                key={doctor.id}
                className="group relative bg-white rounded-[2.8rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden"
              >
                <div className="p-8">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-100 group-hover:scale-110 transition-transform">
                      {doctor.prenom?.[0]}{doctor.nom?.[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        Dr. {doctor.prenom} {doctor.nom}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{doctor.specialite || 'Généraliste'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                          {doctor.slots.length} Créneau{doctor.slots.length > 1 ? 'x' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary of next slots */}
                  <div className="space-y-3 mb-8">
                    {doctor.slots.slice(0, 2).map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">
                            {new Date(slot.date_planning).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-black text-gray-900 mr-2">{slot.heure_debut?.slice(0, 5)}</span>
                          {slot.nb_reservations > 0 && (
                            <span 
                              className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" 
                              title={`${slot.nb_reservations} RDV patient assigné`}
                            ></span>
                          )}
                        </div>
                      </div>
                    ))}
                    {doctor.slots.length > 2 && (
                      <p className="text-center text-xs font-bold text-gray-400 mt-2">
                        + {doctor.slots.length - 2} autres créneaux
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => openDoctorPlanning(doctor)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                  >
                    Voir le planning complet
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Doctor Planning Modal */}
        {isModalOpen && selectedDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" 
              onClick={() => { setIsModalOpen(false); setExpandedSlot(null); }}
            ></div>
            
            <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
                      {selectedDoctor.prenom[0]}{selectedDoctor.nom[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</h2>
                      <p className="text-blue-100 font-medium">{selectedDoctor.specialite || 'Généraliste'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsModalOpen(false); setExpandedSlot(null); }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Slots List */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Planning de la semaine
                </h3>

                <div className="space-y-4">
                  {selectedDoctor.slots.map((slot) => (
                    <div key={slot.id} className="border border-gray-100 rounded-[2rem] overflow-hidden transition-all hover:border-blue-100">
                      <div className="p-6 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="font-bold text-gray-900">
                              {new Date(slot.date_planning).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span className="font-black text-gray-900">{slot.heure_debut?.slice(0, 5)} — {slot.heure_fin?.slice(0, 5)}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase ${getStatusStyle(slot.statut)}`}>
                            {getStatusIcon(slot.statut)}
                            {slot.statut}
                          </div>
                          
                          {/* Patients details badge */}
                          {slot.reservations && slot.reservations.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {slot.reservations.map((r) => (
                                <div 
                                  key={r.id} 
                                  onClick={() => fetchImpacts(slot)}
                                  className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-100 rounded-xl text-xs font-bold shadow-sm transition-all"
                                  title="Cliquer pour voir les détails complets"
                                >
                                  <User className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Patient: {r.patient_prenom} {r.patient_nom}</span>
                                  <span className={`px-1.5 py-0.5 text-[8px] uppercase font-black rounded border ${
                                    r.statut === 'confirme' 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : r.statut === 'termine'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                  }`}>
                                    {r.statut === 'confirme' ? 'Confirmé' : r.statut === 'termine' ? 'Terminé' : 'En attente'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {slot.nb_reservations > 0 && (
                            <button 
                              onClick={() => fetchImpacts(slot)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                            >
                              <Users className="w-3.5 h-3.5" />
                              {slot.nb_reservations} RDV
                            </button>
                          )}
                          
                          {/* Quick confirmation button */}
                          {slot.reservations && slot.reservations.some(r => r.statut !== 'confirme' && r.statut !== 'termine') && (
                            <button 
                              onClick={async () => {
                                const pendingRdv = slot.reservations.find(r => r.statut !== 'confirme' && r.statut !== 'termine');
                                if (pendingRdv) {
                                  await confirmAppointment(pendingRdv.id, slot);
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md shadow-emerald-100 active:scale-95"
                              title="Confirmer rapidement le rendez-vous"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Confirmer
                            </button>
                          )}

                          <button 
                            onClick={() => fetchImpacts(slot)}
                            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
                            title="Voir les rendez-vous liés"
                          >
                            <Users className="w-5 h-5" />
                          </button>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => { setIsModalOpen(false); setExpandedSlot(null); }}
                  className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMPACTS MODAL (PATIENTS LIES AU RENDEZ-VOUS) */}
        {isImpactsModalOpen && selectedSlotForImpacts && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsImpactsModalOpen(false)} />
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 backdrop-blur-md">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Détails du Rendez-vous
                </h3>
                <button 
                  onClick={() => setIsImpactsModalOpen(false)} 
                  className="p-1.5 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50/30">
                <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(selectedSlotForImpacts.date_planning).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[11px] font-bold text-blue-600">
                      {selectedSlotForImpacts.heure_debut?.slice(0, 5)} - {selectedSlotForImpacts.heure_fin?.slice(0, 5)}
                    </p>
                  </div>
                </div>

                {slotImpacts[selectedSlotForImpacts.id]?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {slotImpacts[selectedSlotForImpacts.id].map((rdv) => (
                      <div key={rdv.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:border-blue-200 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-black text-base border border-blue-200/50 shadow-inner">
                              {rdv.patient_prenom?.[0]}{rdv.patient_nom?.[0]}
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                                {rdv.patient_prenom} {rdv.patient_nom}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-100">
                                  {rdv.heure_rendez_vous?.slice(0, 5)}
                                </span>
                                <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded border ${
                                  rdv.statut === 'confirme' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : rdv.statut === 'termine'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                }`}>
                                  {rdv.statut === 'confirme' ? 'Confirmé' : rdv.statut === 'termine' ? 'Terminé' : 'En attente'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Extra Details */}
                        <div className="bg-gray-50/50 rounded-xl p-3 space-y-2 text-xs border border-gray-100">
                          {rdv.patient_telephone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-bold text-gray-700">Tél :</span>
                              <span className="font-medium">{rdv.patient_telephone}</span>
                            </div>
                          )}
                          {rdv.patient_email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-bold text-gray-700">Email :</span>
                              <span className="font-medium">{rdv.patient_email}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-2 text-gray-600">
                            <span className="font-bold text-gray-700 min-w-[45px]">Motif :</span>
                            <span className="font-medium leading-relaxed">{rdv.motif || 'Consultation générale'}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {rdv.statut !== 'confirme' && rdv.statut !== 'termine' && (
                            <button
                              onClick={() => confirmAppointment(rdv.id)}
                              disabled={impactLoading}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-50 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Confirmer le RDV
                            </button>
                          )}
                          <button
                            onClick={() => reportReservation(rdv)}
                            disabled={impactLoading}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-50 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            Reporter
                          </button>
                          <button 
                            onClick={() => {
                              setIsImpactsModalOpen(false);
                              navigate('/dashboard/rendez-vous');
                            }}
                            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-xs font-bold rounded-xl transition-all border border-gray-200 flex items-center justify-center gap-1"
                          >
                            Toutes les Résas
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                      <Users className="w-6 h-6 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Aucun patient lié</h3>
                    <p className="text-xs text-gray-500 font-medium">Ce créneau n'est lié à aucun rendez-vous.</p>
                  </div>
                )}
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