import { useState, useEffect, useMemo } from 'react';
import { 
  Phone, Mail, Search, AlertCircle, CheckCircle, 
  User, Calendar, Clock, BarChart3, TrendingUp, 
  ChevronRight, ArrowUpRight, Activity, Users,
  X, Filter, MapPin, Award
} from 'lucide-react';
import Layout from '../layouts/Layout';

export default function Medecins() {
  const [medecins, setMedecins] = useState([]);
  const [statsGlobales, setStatsGlobales] = useState(null);
  const [analysePerformance, setAnalysePerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreSpecialite, setFiltreSpecialite] = useState('Tous');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [doctorPlanning, setDoctorPlanning] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resMed, resAnalyse] = await Promise.all([
        fetch(`${API_URL}/api/secretaire/medecins/all-with-stats`),
        fetch(`${API_URL}/api/secretaire/medecins/analyse-planning`)
      ]);

      const dataMed = await resMed.json();
      const dataAnalyse = await resAnalyse.json();

      if (dataMed.success) {
        setMedecins(dataMed.medecins);
        setStatsGlobales(dataMed.statsGlobales);
      }
      if (dataAnalyse.success) {
        setAnalysePerformance(dataAnalyse.analyse);
      }
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorPlanning = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/medecin/planning/medecin/${id}`);
      const data = await res.json();
      if (data.success) {
        setDoctorPlanning(data.planning);
      }
    } catch (error) {
      console.error('Erreur planning:', error);
    }
  };

  const specialites = useMemo(() => {
    const specs = medecins.map(m => m.specialite).filter(Boolean);
    return ['Tous', ...new Set(specs)];
  }, [medecins]);

  const medecinsFiltres = useMemo(() => {
    return medecins.filter(m => {
      const matchSearch = `${m.prenom} ${m.nom}`.toLowerCase().includes(recherche.toLowerCase());
      const matchSpec = filtreSpecialite === 'Tous' || m.specialite === filtreSpecialite;
      return matchSearch && matchSpec;
    });
  }, [medecins, recherche, filtreSpecialite]);

  const handleOpenDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorPlanning([]);
    fetchDoctorPlanning(doctor.id);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Médecins</h1>
            <p className="text-slate-500 font-medium mt-1">
              Surveillance des disponibilités et analyse des performances cliniques.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex">
              <button 
                onClick={fetchInitialData}
                className="p-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Activity className="w-5 h-5 text-teal-600" />
              </button>
            </div>
          </div>
        </div>

        {/* TOP STATS CARDS */}
        {statsGlobales && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Effectif</p>
                <p className="text-2xl font-black text-slate-900">{statsGlobales.totalMedecins}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actifs / Poste</p>
                <p className="text-2xl font-black text-slate-900">{statsGlobales.medecinsActifs}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">En Absence</p>
                <p className="text-2xl font-black text-slate-900">{statsGlobales.enAbsence}</p>
              </div>
            </div>
            <div className="bg-teal-600 p-6 rounded-[2rem] shadow-lg shadow-teal-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Activité Globale</p>
                <p className="text-2xl font-black text-white">Top Performance</p>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par nom ou spécialité..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-x-auto no-scrollbar">
            {specialites.map(spec => (
              <button
                key={spec}
                onClick={() => setFiltreSpecialite(spec)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                  filtreSpecialite === spec 
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* DOCTORS GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse">Synchronisation des données cliniques...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {medecinsFiltres.map((m) => (
              <div
                key={m.id}
                onClick={() => handleOpenDetails(m)}
                className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  {m.estAbsent ? (
                    <span className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" /> Absent
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" /> Disponible
                    </span>
                  )}
                </div>

                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-500">
                      <User size={40} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                        Dr. {m.prenom} {m.nom}
                      </h3>
                      <div className="flex items-center gap-2 text-teal-600 font-bold text-sm mt-1">
                        <Award size={16} />
                        <span>{m.specialite}</span>
                      </div>
                    </div>
                  </div>

                  {/* MINI STATS */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-3xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consults / Jour</p>
                      <p className="text-xl font-black text-slate-900">{m.consultationsAujourdhui}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Libres / Total</p>
                      <p className="text-xl font-black text-slate-900">{m.creneauxLibres} / {m.totalCreneaux}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-xl">
                        <Phone size={16} className="text-slate-600" />
                      </div>
                      <div className="p-2 bg-slate-100 rounded-xl">
                        <Mail size={16} className="text-slate-600" />
                      </div>
                    </div>
                    <span className="text-xs font-black text-teal-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Voir Profil <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DOCTOR DETAILS MODAL */}
        {showModal && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-teal-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-lg shadow-teal-200">
                    <User size={48} />
                  </div>
                  <div>
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl font-black text-slate-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</h2>
                      {selectedDoctor.estAbsent ? (
                        <span className="px-4 py-1.5 bg-rose-100 text-rose-700 text-xs font-black uppercase rounded-full">En Congé</span>
                      ) : (
                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-black uppercase rounded-full">Actif</span>
                      )}
                    </div>
                    <p className="text-teal-600 text-xl font-bold mt-2">{selectedDoctor.specialite}</p>
                    <div className="flex gap-4 mt-4">
                      <span className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Phone size={16} /> {selectedDoctor.telephone}
                      </span>
                      <span className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Mail size={16} /> {selectedDoctor.email}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                
                {/* ANALYSE PERFORMANCE RAPIDE */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <BarChart3 className="text-indigo-600" size={20} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Analyse de Performance (30j)</h4>
                  </div>
                  {(() => {
                    const perf = analysePerformance.find(a => a.id === selectedDoctor.id);
                    if (!perf) return <p className="text-slate-400 italic">Aucune donnée historique disponible.</p>;
                    const rate = perf.total_rendezvous > 0 ? Math.round((perf.termines / perf.total_rendezvous) * 100) : 0;
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem]">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rendez-vous Totaux</p>
                          <div className="flex items-end gap-3">
                            <p className="text-3xl font-black text-slate-900">{perf.total_rendezvous}</p>
                            <span className="text-slate-400 text-sm font-bold mb-1">sessions</span>
                          </div>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-[2rem]">
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Taux de Complétion</p>
                          <div className="flex items-end gap-3">
                            <p className="text-3xl font-black text-emerald-700">{rate}%</p>
                            <div className="flex-1 h-2 bg-emerald-200 rounded-full overflow-hidden mb-2">
                              <div className="h-full bg-emerald-600" style={{ width: `${rate}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-[2rem]">
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Disponibilité Hebdo</p>
                          <div className="flex items-end gap-3">
                            <p className="text-3xl font-black text-indigo-700">{perf.creneaux_ouverts_7j}</p>
                            <span className="text-indigo-400 text-sm font-bold mb-1">créneaux</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* PLANNING FUTUR */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                      <Calendar className="text-teal-600" size={20} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Planning & Créneaux</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctorPlanning.length > 0 ? (
                      doctorPlanning.map(slot => (
                        <div key={slot.id} className="flex items-center justify-between p-5 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              slot.statut === 'disponible' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              <Clock size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{new Date(slot.date_planning).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                              <p className="text-sm text-slate-500 font-medium">{slot.heure_debut.slice(0, 5)} - {slot.heure_fin.slice(0, 5)}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            slot.statut === 'disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {slot.statut}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold italic">Aucun créneau planifié prochainement.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}