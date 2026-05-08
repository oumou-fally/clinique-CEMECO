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

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    date_planning: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    heure_fin: '12:00',
    statut: 'disponible',
    commentaire: ''
  });

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
        setPlanning(Array.isArray(data.planning) ? data.planning : []);
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

    if (formData.heure_debut >= formData.heure_fin) {
      setError("L'heure de début doit être avant l'heure de fin");
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
        setError(data.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Erreur serveur');
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
              onClick={() => setShowAddModal(true)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planning.map((item) => {
              const config = getStatutConfig(item.statut);
              const date = new Date(item.date_planning);

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

                    <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 bg-${config.color}-50 text-${config.color}-700 border border-${config.color}-100`}>
                      {config.icon} {config.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-lg font-semibold text-gray-700 mb-4">
                    <Clock className="w-5 h-5" />
                    {item.heure_debut?.slice(0,5)} — {item.heure_fin?.slice(0,5)}
                  </div>

                  {item.commentaire && (
                    <div className="bg-gray-50 p-4 rounded-2xl text-sm italic text-gray-600 mb-5">
                      "{item.commentaire}"
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setFormData({
                          ...item,
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
            })}
          </div>
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-semibold"
                >
                  {formData.id ? 'Mettre à jour' : 'Enregistrer le créneau'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}