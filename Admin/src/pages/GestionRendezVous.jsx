import Layout from '../layouts/Layout';
import { AlertCircle, Calendar, Plus, Search, Clock, User, Activity, Eye, Trash2, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function GestionRendezVous() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setAppointments(data.reservations);
      }
    } catch (error) {
      console.error('Erreur RDV:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // On utilise l'API de réservation existante ou une nouvelle route admin
      // Pour l'instant, on simule ou on utilise une route PUT sur reservations
      const response = await fetch(`http://localhost:3000/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchAppointments();
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const filteredAppts = appointments.filter(appt => {
    const matchesSearch = (appt.patient_nom + ' ' + appt.patient_prenom).toLowerCase().includes(search.toLowerCase()) ||
                          (appt.motif || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'tous' || appt.statut === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirme': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'attente': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'annule': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'termine': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'reporte': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gestion des Rendez-vous</h1>
            <p className="text-gray-500 font-medium mt-1">Supervision et planification centrale de la clinique CEMECO</p>
          </div>
          <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl transition-all font-black shadow-xl shadow-blue-100">
            <Plus className="w-5 h-5" />
            Nouveau RDV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total</p>
            <h3 className="text-3xl font-black text-gray-900">{loading ? '...' : appointments.length}</h3>
          </div>
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Confirmés</p>
            <h3 className="text-3xl font-black text-emerald-700">{loading ? '...' : appointments.filter(a => a.statut === 'confirme').length}</h3>
          </div>
          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">En attente</p>
            <h3 className="text-3xl font-black text-amber-700">{loading ? '...' : appointments.filter(a => a.statut === 'attente' || !a.statut).length}</h3>
          </div>
          <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100">
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Reportés</p>
            <h3 className="text-3xl font-black text-purple-700">{loading ? '...' : appointments.filter(a => a.statut === 'reporte').length}</h3>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-gray-50/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher patient ou motif..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm shadow-sm"
              />
            </div>
            <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto w-full md:w-auto">
              {['tous', 'attente', 'confirme', 'termine', 'reporte', 'annule'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-left">
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Patient & Motif</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Médecin</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-center">Planning</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Statut</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-8 py-8 h-24 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : filteredAppts.map((appt) => (
                  <tr key={appt.id_reservation} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {appt.patient_nom?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg">{appt.patient_prenom} {appt.patient_nom}</p>
                          <p className="text-xs text-blue-500 font-bold italic">{appt.motif}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2 text-gray-600 font-bold">
                        <User className="w-4 h-4 text-emerald-500" />
                        {appt.medecin_nom ? `Dr. ${appt.medecin_nom}` : 'Non assigné'}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="text-center space-y-1">
                        <p className="text-sm font-black text-gray-900">{new Date(appt.date_rendez_vous).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400 font-black flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appt.heure_rendez_vous?.substring(0, 5)}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(appt.statut || 'attente')}`}>
                        {appt.statut || 'attente'}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end gap-2">
                        {appt.statut === 'confirme' && (
                          <button onClick={() => updateStatus(appt.id_reservation, 'termine')} title="Terminer" className="p-2 bg-white text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-500 hover:text-white transition-all border border-gray-100">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {(appt.statut === 'attente' || !appt.statut) && (
                          <button onClick={() => updateStatus(appt.id_reservation, 'confirme')} title="Confirmer" className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all border border-gray-100">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {appt.statut !== 'annule' && appt.statut !== 'termine' && (
                          <button onClick={() => updateStatus(appt.id_reservation, 'annule')} title="Annuler" className="p-2 bg-white text-rose-600 rounded-xl shadow-sm hover:bg-rose-500 hover:text-white transition-all border border-gray-100">
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => updateStatus(appt.id_reservation, 'reporte')} title="Reporter" className="p-2 bg-white text-purple-600 rounded-xl shadow-sm hover:bg-purple-500 hover:text-white transition-all border border-gray-100">
                          <RefreshCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppts.length === 0 && !loading && (
            <div className="p-24 text-center space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Calendar className="w-12 h-12 text-gray-200" />
              </div>
              <p className="text-gray-400 font-black italic text-xl">Aucun rendez-vous ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}