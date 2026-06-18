import Layout from '../layouts/Layout';
import {
  Calendar, Clock, Plus, Trash2, Edit2, CheckCircle, XCircle,
  AlertCircle, CalendarDays, AlertTriangle, Save, X, Send
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Planning() {
  const { medecinId } = useAuth();

  const [planning, setPlanning] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [pendingSaveBody, setPendingSaveBody] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    date_planning: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    heure_fin: '12:00',
    statut: 'disponible',
    commentaire: ''
  });

  const defaultForm = {
    id: null,
    date_planning: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    heure_fin: '12:00',
    statut: 'disponible',
    commentaire: ''
  };

  const [selectedTab, setSelectedTab] = useState('current');

  const API_URL = 'http://localhost:3000';

  // ===================== FETCH PLANNING =====================
  const fetchPlanning = async () => {
    if (!medecinId) {
      setError("Médecin non connecté");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_URL}/api/medecin/planning/medecin/${medecinId}`);
      const data = await res.json();

      console.log("✅ Planning reçu :", data);

      if (data.success) {
        const cleaned = Array.isArray(data.planning) ? data.planning.map(p => ({
          ...p,
          commentaire: (p.commentaire && /^temp_from_notification_/.test(p.commentaire)) ? '' : p.commentaire
        })) : [];

        setPlanning(cleaned);
      } else {
        setError(data.message || "Erreur de chargement");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le planning (serveur injoignable)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanning();
  }, [medecinId]);

  // ===================== ENVOYER À LA SECRÉTAIRE =====================
  const envoyerASecretaire = async () => {
    if (!medecinId) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/medecin/planning/envoyer-jour`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_medecin: medecinId })
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message);
      } else {
        setError(data.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi au serveur");
    } finally {
      setSending(false);
      setTimeout(() => setSuccessMsg(''), 6000);
    }
  };

  // ===================== SAVE =====================
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (formData.heure_debut >= formData.heure_fin) {
      setError("L'heure de début doit être avant l'heure de fin");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/medecin/planning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_medecin: medecinId })
      });

      const data = await res.json();

      if (data.success) {
        setShowAddModal(false);
        fetchPlanning();
        setSuccessMsg('Créneau enregistré avec succès !');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        // Si chevauchement, proposer de forcer l'enregistrement
        if (data.message && data.message.toLowerCase().includes('chevauch')) {
          setPendingSaveBody({ ...formData, id_medecin: medecinId });
          setShowForceModal(true);
        } else {
          setError(data.message || 'Erreur lors de l\'enregistrement');
        }
      }
    } catch (err) {
      setError('Erreur serveur');
    }
    finally {
      setSaving(false);
    }
  };

  const handleForceSave = async () => {
    if (!pendingSaveBody) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/medecin/planning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pendingSaveBody, force: true })
      });

      const data = await res.json();
      if (data.success) {
        setShowForceModal(false);
        setPendingSaveBody(null);
        setShowAddModal(false);
        fetchPlanning();
        setSuccessMsg(data.message || 'Créneau enregistré (forcé)');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(data.message || 'Erreur lors de l\'enregistrement forcé');
      }
    } catch (err) {
      setError('Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  // ===================== DELETE =====================
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;

    try {
      const res = await fetch(`${API_URL}/api/medecin/planning/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchPlanning();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatutConfig = (statut) => {
    switch (statut) {
      case 'disponible': return { color: 'emerald', icon: <CheckCircle className="w-5 h-5" />, label: 'Disponible' };
      case 'indisponible': return { color: 'rose', icon: <XCircle className="w-5 h-5" />, label: 'Indisponible' };
      case 'urgence': return { color: 'amber', icon: <AlertCircle className="w-5 h-5" />, label: 'Urgence' };
      default: return { color: 'gray', icon: <Clock className="w-5 h-5" />, label: statut };
    }
  };

  const statusClassMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100'
  };

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

  const groupByWeek = (items) => {
    const past = [];
    const current = [];
    const next = [];
    const future = [];

    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(weekStart.getDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    nextWeekEnd.setHours(23,59,59,999);

    items.forEach(it => {
      const d = new Date(it.date_planning);
      if (d < weekStart) past.push(it);
      else if (d >= weekStart && d <= weekEnd) current.push(it);
      else if (d >= nextWeekStart && d <= nextWeekEnd) next.push(it);
      else future.push(it);
    });

    const sortByDate = (a,b) => new Date(a.date_planning) - new Date(b.date_planning) || a.heure_debut.localeCompare(b.heure_debut);

    return {
      past: past.sort(sortByDate),
      current: current.sort(sortByDate),
      next: next.sort(sortByDate),
      future: future.sort(sortByDate)
    };
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <CalendarDays className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Mon Planning</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={envoyerASecretaire}
              disabled={sending || planning.length === 0}
              className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-2xl font-semibold transition-all"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Envoi en cours...' : 'Envoyer à la secrétaire'}
            </button>

            <button
              onClick={() => { setFormData(defaultForm); setShowAddModal(true); }}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all"
            >
              <Plus className="w-5 h-5" /> Nouveau créneau
            </button>
          </div>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* Contenu principal */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500">Chargement du planning...</p>
          </div>
        ) : planning.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-20 text-center">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700">Aucun créneau disponible</h3>
            <p className="text-gray-500 mt-3">Cliquez sur "Nouveau créneau" pour commencer.</p>
          </div>
        ) : (
          (() => {
            const groups = groupByWeek(planning);
            const renderSlot = (item) => {
              const config = getStatutConfig(item.statut);
              const date = new Date(item.date_planning);
              const classes = statusClassMap[config.color] || statusClassMap.gray;

              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <div className="text-4xl font-bold text-gray-800">
                        {date.getDate().toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {date.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long' })}
                      </div>
                    </div>

                    <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 ${classes}`}>
                      {config.icon} {config.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-lg font-semibold text-gray-700 mb-4">
                    <Clock className="w-5 h-5" />
                    {item.heure_debut?.slice(0,5)} — {item.heure_fin?.slice(0,5)}
                  </div>

                  {item.commentaire && item.commentaire.trim() !== '' && (
                    <div className="bg-gray-50 p-4 rounded-2xl text-sm italic text-gray-600 mb-5">
                      "{item.commentaire}"
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setFormData({
                          ...item,
                          id: item.id,
                          date_planning: item.date_planning.split('T')[0]
                        });
                        setShowAddModal(true);
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-indigo-50 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            };

            return (
              <div>
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gray-100 rounded-full p-1 flex items-center">
                    <button
                      onClick={() => setSelectedTab('past')}
                      className={`px-6 py-2 rounded-full transition ${selectedTab === 'past' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                      Passé {groups.past.length > 0 && <span className="ml-2 text-sm text-gray-400">({groups.past.length})</span>}
                    </button>

                    <button
                      onClick={() => setSelectedTab('current')}
                      className={`px-6 py-2 rounded-full mx-1 transition ${selectedTab === 'current' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
                      Cette Sem. {groups.current.length > 0 && <span className="ml-2 text-sm text-gray-400">({groups.current.length})</span>}
                    </button>

                    <button
                      onClick={() => setSelectedTab('next')}
                      className={`px-6 py-2 rounded-full transition ${selectedTab === 'next' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                      Suivante {groups.next.length > 0 && <span className="ml-2 text-sm text-gray-400">({groups.next.length})</span>}
                    </button>
                  </div>
                </div>

                {groups[selectedTab].length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 font-bold">Aucun créneau dans cette période.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups[selectedTab].map(renderSlot)}
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {formData.id ? 'Modifier le créneau' : 'Nouveau créneau'}
                </h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">{error}</div>}

                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input 
                    type="date" 
                    value={formData.date_planning} 
                    onChange={(e) => setFormData({ ...formData, date_planning: e.target.value })} 
                    className="w-full border rounded-2xl px-4 py-3" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Heure début</label>
                    <input 
                      type="time" 
                      value={formData.heure_debut} 
                      onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })} 
                      className="w-full border rounded-2xl px-4 py-3" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Heure fin</label>
                    <input 
                      type="time" 
                      value={formData.heure_fin} 
                      onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })} 
                      className="w-full border rounded-2xl px-4 py-3" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <select 
                    value={formData.statut} 
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })} 
                    className="w-full border rounded-2xl px-4 py-3"
                  >
                    <option value="disponible">✅ Disponible</option>
                    <option value="indisponible">❌ Indisponible</option>
                    <option value="urgence">⚠️ Urgence uniquement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Commentaire (optionnel)</label>
                  <textarea 
                    value={formData.commentaire} 
                    onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })} 
                    className="w-full border rounded-2xl px-4 py-3 h-24" 
                    placeholder="Ex: Remplacement, formation..." 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={saving}
                  className={`w-full ${saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-4 rounded-2xl font-semibold`}
                >
                  {saving ? (formData.id ? 'Mise à jour...' : 'Enregistrement...') : (formData.id ? 'Mettre à jour' : 'Enregistrer le créneau')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FORCE SAVE CONFIRMATION */}
        {showForceModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Chevauchement détecté</h3>
              <p className="text-gray-600 mb-6">Ce créneau chevauche un créneau existant. Voulez-vous enregistrer quand même ?</p>

              <div className="flex gap-3">
                <button
                  onClick={handleForceSave}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-semibold"
                >
                  Enregistrer quand même
                </button>
                <button
                  onClick={() => { setShowForceModal(false); setPendingSaveBody(null); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-2xl font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}