import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import {
  Calendar, Clock, X, AlertCircle, CheckCircle, RefreshCcw,
  Info, UserCheck, Eye
} from 'lucide-react';

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);           // Demandes RDV patients
  const [planningNotifications, setPlanningNotifications] = useState([]); // Plannings médecins
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // ======================================================
  // 🔄 CHARGER NOTIFICATIONS
  // ======================================================
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/reservations/notifications/secretaire`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error('Impossible de charger les notifications');
      }

      setNotifications(data.notifications.rendezvous || []);
      setPlanningNotifications(data.notifications.planning || []);

    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ======================================================
  // ✅ CONFIRMER
  // ======================================================
  const handleConfirmer = async (notification) => {
    try {
      setLoading(true);
      setError(null);

      const confirmRes = await fetch(`${API_URL}/api/reservations/${notification.id}/confirm`, {
        method: 'PUT'
      });
      const confirmData = await confirmRes.json();

      if (!confirmRes.ok || !confirmData.success) {
        setError('Erreur lors de la confirmation. Réessayez.');
        return;
      }

      localStorage.setItem('rdv_selection', JSON.stringify(notification));

      const assignRes = await fetch(`${API_URL}/api/reservations/${notification.id}/auto-assign`, {
        method: 'PUT'
      });
      const assignData = await assignRes.json();

      if (assignRes.ok && assignData.success && assignData.medecin) {
        localStorage.setItem('medecin_selection', String(assignData.medecin.id));
      }

      await fetchNotifications();
      navigate('/dashboard/disponibilites');

    } catch (error) {
      console.error(error);
      setError('Erreur serveur lors de la confirmation.');
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ❌ ANNULER
  // ======================================================
  const handleAnnuler = async (id) => {
    if (!window.confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/reservations/${id}/cancel`, {
        method: 'PUT'
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError('Impossible d’annuler le rendez-vous.');
        return;
      }

      await fetchNotifications();
    } catch (error) {
      console.error(error);
      setError('Erreur serveur lors de l’annulation.');
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 👁️ VOIR CRÉNEAU (Planning Médecin)
  // ======================================================
  const handleVoirPlanning = async (notif) => {
    try {
      // Marquer la notification comme lue
      await fetch(`${API_URL}/api/reservations/notifications/systeme/${notif.id}/lu`, {
        method: 'PUT'
      }).catch(() => { }); // Non bloquant

      // Stocker les informations complètes pour mise en évidence
      localStorage.setItem('selected_creneau', JSON.stringify({
        id: notif.planning_id || notif.id,
        id_medecin: notif.id_medecin,
        medecin_prenom: notif.medecin_prenom || notif.prenom,
        medecin_nom: notif.medecin_nom || notif.nom,
        date_planning: notif.date_planning,
        heure_debut: notif.heure_debut,
        heure_fin: notif.heure_fin,
        message: notif.message,
        type: 'planning_notification'
      }));

      // Redirection
      navigate('/dashboard/disponibilites');

    } catch (error) {
      console.error(error);
      // Redirection quand même en cas d'erreur
      navigate('/dashboard/disponibilites');
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Notifications Secrétaire
          </h1>
          <p className="text-gray-500 mt-1">Demandes patients & Plannings médecins</p>
        </div>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="space-y-10">

        {/* ===================== PLANNINGS DES MÉDECINS ===================== */}
        {planningNotifications.length > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8">
            <h2 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
              <UserCheck className="w-6 h-6" />
              Plannings envoyés par les médecins ({planningNotifications.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {planningNotifications.map((n) => (
                <div key={n.id} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-800">{n.message?.split(':')[0] || 'Planning reçu'}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      PLANNING
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {n.message.split('•').slice(1).map((slot, idx) => {
                      const [timeRange] = slot.trim().split('(');
                      return (
                        <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{timeRange.trim()}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleVoirPlanning(n)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Eye className="w-5 h-5" />
                    Voir le créneau dans le planning
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== DEMANDES DE RENDEZ-VOUS ===================== */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-800">Demandes de rendez-vous patients</h2>
            <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {notifications.length} en attente
            </span>
          </div>

          {notifications.length === 0 && !loading && (
            <div className="bg-white rounded-[2rem] p-16 text-center border border-dashed border-gray-200">
              <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune demande de rendez-vous en attente.</p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {notifications.map((n) => (
              <div key={n.id} className="bg-white p-6 border border-gray-100 rounded-[1.75rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg">
                        {n.prenom?.[0]}{n.nom?.[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {n.prenom} {n.nom}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">Patient</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-wider rounded-lg border border-amber-100">
                      En attente
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">
                        {new Date(n.date_rendez_vous).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">{n.heure_rendez_vous?.substring(0, 5)}</span>
                    </div>
                    <div className="flex items-start gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                      <p className="text-sm leading-relaxed">
                        <span className="font-bold text-gray-900">Motif :</span> {n.motif || 'Non précisé'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleConfirmer(n)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => handleAnnuler(n.id)}
                    className="px-4 py-3 border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}