import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import {
  Calendar, Clock, Plus, CheckCircle, X,
  AlertTriangle, RefreshCcw, User, FileText
} from 'lucide-react';

export default function DisponibilitesMedecins() {
  const [planning, setPlanning] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rdvEnCours, setRdvEnCours] = useState(null);
  const [selectedCreneau, setSelectedCreneau] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const highlightedRef = useRef(null);

  // Initialisation
  useEffect(() => {
    const init = async () => {
      await Promise.all([cleanupOldSlots(), fetchData()]);

      const storedRdv = localStorage.getItem('rdv_selection');
      if (storedRdv) setRdvEnCours(JSON.parse(storedRdv));

      const storedCreneau = localStorage.getItem('selected_creneau');
      if (storedCreneau) {
        setSelectedCreneau(JSON.parse(storedCreneau));
      }
    };
    init();
  }, []);

  const cleanupOldSlots = async () => {
    try {
      await fetch(`${API_URL}/api/medecin/planning/cleanup/daily`, { method: 'POST' });
    } catch (err) {
      console.warn('Cleanup non disponible');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/medecin/planning/all/global`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Erreur serveur');

      const now = Date.now();
      const filtered = (data.planning || []).filter(p => {
        try {
          const endTime = new Date(`${p.date_planning}T${p.heure_fin}`);
          return endTime.getTime() >= now - (24 * 60 * 60 * 1000);
        } catch {
          return false;
        }
      });

      setPlanning(filtered);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les disponibilités');
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedCreneau = () => {
    localStorage.removeItem('selected_creneau');
    setSelectedCreneau(null);
  };

  // Scroll automatique
  useEffect(() => {
    if (selectedCreneau && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 600);
    }
  }, [selectedCreneau]);

  const isHighlighted = (p) => {
    if (!selectedCreneau) return false;
    const sel = selectedCreneau;
    return (
      String(p.id) === String(sel.id) ||
      String(p.id_medecin || p.medecin_id) === String(sel.id_medecin || sel.medecin_id)
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disponibilités des Médecins</h1>
            <p className="text-gray-600 mt-1">Les créneaux expirent automatiquement après 24h</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { cleanupOldSlots(); fetchData(); }} className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
              <RefreshCcw className="w-5 h-5" /> Actualiser
            </button>
            <button onClick={() => navigate('/dashboard/attribution')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold">
              Attribution des RDV
            </button>
          </div>
        </div>

        {/* Bannière 24h */}
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5" />
          Les créneaux sont automatiquement supprimés <strong>24 heures</strong> après leur heure de fin.
        </div>

        {/* === CRÉNEAU SÉLECTIONNÉ VIA NOTIFICATION - VERSION AMÉLIORÉE === */}
        {selectedCreneau && (
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <User className="w-9 h-9" />
                </div>
                <div>
                  <p className="uppercase tracking-widest text-emerald-200 text-sm font-medium">Créneau sélectionné</p>
                  <h2 className="text-3xl font-bold">
                    Dr. {selectedCreneau.medecin_prenom} {selectedCreneau.medecin_nom}
                  </h2>
                </div>
              </div>
              <button
                onClick={clearSelectedCreneau}
                className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-emerald-200" />
                  <span className="text-emerald-200 font-medium">Date</span>
                </div>
                <p className="text-2xl font-semibold">
                  {new Date(selectedCreneau.date_planning).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-emerald-200" />
                  <span className="text-emerald-200 font-medium">Horaire</span>
                </div>
                <p className="text-3xl font-bold">
                  {selectedCreneau.heure_debut?.slice(0, 5)} — {selectedCreneau.heure_fin?.slice(0, 5)}
                </p>
              </div>
            </div>

            {selectedCreneau.message && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4 text-emerald-100">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Détails du planning reçu</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCreneau.message.split('•').slice(1).map((slot, idx) => {
                    const [timeRange] = slot.trim().split('(');
                    return (
                      <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white/20 transition-all">
                        <div className="w-10 h-10 bg-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-100">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-tight">Créneau {idx + 1}</p>
                          <p className="text-lg font-black text-white">{timeRange.trim()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Liste des créneaux */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Créneaux disponibles</h2>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Chargement des plannings...</div>
          ) : planning.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Aucun créneau disponible pour le moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planning
                .filter(p => p.statut === 'disponible')
                .map((p) => {
                  const highlighted = isHighlighted(p);

                  return (
                    <div
                      key={p.id}
                      ref={highlighted ? highlightedRef : null}
                      className={`group relative overflow-hidden bg-white border-2 rounded-[2rem] transition-all duration-500 ${highlighted
                          ? 'border-emerald-500 shadow-2xl shadow-emerald-100 ring-8 ring-emerald-50/50 scale-[1.02]'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-xl'
                        }`}
                    >
                      {/* Top Bar Status */}
                      <div className={`h-2 w-full ${highlighted ? 'bg-emerald-500' : 'bg-blue-600'}`} />

                      <div className="p-8">
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${highlighted ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                              {p.medecin_prenom?.[0]}{p.medecin_nom?.[0]}
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                                Dr. {p.medecin_prenom} {p.medecin_nom}
                              </h3>
                              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{p.specialite || 'Généraliste'}</p>
                            </div>
                          </div>
                          {highlighted && (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-tighter rounded-xl animate-bounce">
                              Nouveau
                            </span>
                          )}
                        </div>

                        {/* Ticket Body */}
                        <div className="relative p-6 bg-gray-50/80 rounded-3xl border border-dashed border-gray-200">
                          {/* Left Circle cutout */}
                          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white border-r-2 border-gray-100 rounded-full" />
                          {/* Right Circle cutout */}
                          <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-white border-l-2 border-gray-100 rounded-full" />

                          <div className="flex justify-between items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                              </div>
                              <p className="font-bold text-gray-800">
                                {new Date(p.date_planning).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>

                            <div className="h-10 w-[1px] bg-gray-200" />

                            <div className="flex-1 text-center">
                              <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Horaire</span>
                              </div>
                              <p className="font-black text-2xl text-gray-900 tabular-nums">
                                {p.heure_debut?.slice(0, 5)} <span className="text-gray-300 font-light mx-1">-</span> {p.heure_fin?.slice(0, 5)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {rdvEnCours && (
                          <button
                            onClick={() => {
                              localStorage.setItem('medecin_selection', p.id_medecin || p.medecin_id);
                              navigate('/dashboard/attribution');
                            }}
                            className={`w-full mt-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 ${highlighted
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                                : 'bg-gray-900 hover:bg-black text-white shadow-gray-100'
                              }`}
                          >
                            Sélectionner
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}