import { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  FileText,
  Stethoscope,
  Users,
  AlertCircle,
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

export default function TableauDeBord() {
  const { user, medecinId, isAuthenticated } = useAuth();

  const [consultationsDuJour, setConsultationsDuJour] = useState([]);
  const [stats, setStats] = useState({ today: 0, patients: 0, reports: 0 });
  const [loading, setLoading] = useState(true);
  const [rapportsRecents, setRapportsRecents] = useState([]);

  useEffect(() => {
    if (medecinId) {
      fetchDashboardData();
      fetchRecentReports();
    }
  }, [medecinId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/medecin/consultations/reservations/${medecinId}`);
      const data = await res.json();
      
      if (data.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayConsults = data.reservations.filter(r => r.date_rendez_vous.split('T')[0] === today);
        setConsultationsDuJour(todayConsults);
        
        setStats(prev => ({
          ...prev,
          today: todayConsults.length,
          patients: new Set(data.reservations.map(r => r.nom + r.prenom)).size
        }));
      }
    } catch (error) {
      console.error('Erreur fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const res = await fetch(`/api/medecin/consultations/historique/${medecinId}`);
      const data = await res.json();
      if (data.success) {
        setRapportsRecents(data.consultations.slice(0, 5));
        setStats(prev => ({ ...prev, reports: data.consultations.length }));
      }
    } catch (error) {
      console.error('Erreur fetch rapports:', error);
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'attente': return 'bg-yellow-100 text-yellow-800';
      case 'annule': return 'bg-red-100 text-red-800';
      case 'termine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Layout><div className="p-8 font-bold text-gray-500">Chargement...</div></Layout>;
  }

  const statistiques = [
    { label: "Consultations Aujourd'hui", valeur: stats.today.toString(), icon: Calendar, couleur: 'blue' },
    { label: 'Patients Actifs', valeur: stats.patients.toString(), icon: Users, couleur: 'green' },
    { label: 'Rapports Complétés', valeur: stats.reports.toString(), icon: FileText, couleur: 'purple' },
    { label: 'Taux de Satisfaction', valeur: '98%', icon: TrendingUp, couleur: 'orange' }
  ];

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Bonjour, <span className="text-blue-600">Dr. {user?.nomComplet}</span> 👋
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Prêt pour vos consultations du jour ?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Aujourd'hui</p>
              <p className="text-xl font-bold text-gray-900">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard/planning'}
            className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-gray-900">Gérer mon Planning</p>
                <p className="text-sm text-gray-500 font-medium">Définissez vos disponibilités</p>
              </div>
            </div>
            <Plus className="w-6 h-6 text-gray-300" />
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/consultations'}
            className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-gray-900">Nouvelle Consultation</p>
                <p className="text-sm text-gray-500 font-medium">Démarrer un suivi patient</p>
              </div>
            </div>
            <Plus className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistiques.map((stat, index) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              purple: 'bg-purple-50 text-purple-600',
              orange: 'bg-orange-50 text-orange-600'
            };
            return (
              <div key={index} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition group border border-transparent hover:border-blue-100">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl ${colors[stat.couleur]} group-hover:scale-110 transition transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stat.valeur}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  Consultations du jour
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-600">{consultationsDuJour.length} PATIENTS</span>
                </div>
              </div>

              <div className="space-y-6">
                {consultationsDuJour.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">Aucun rendez-vous pour aujourd'hui</p>
                  </div>
                ) : (
                  consultationsDuJour.map((consult) => (
                    <div key={consult.id} className="group p-6 border-2 border-gray-50 rounded-3xl hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition border border-gray-100">
                            <User className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900 capitalize">{consult.nom} {consult.prenom}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm font-medium text-gray-500">{consult.motif}</span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatutBadge(consult.statut)}`}>
                                {consult.statut}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-gray-900">{consult.heure_rendez_vous.substring(0, 5)}</p>
                          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Heure prévue</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button 
                          onClick={() => window.location.href = `/consultations?rdv=${consult.id}`}
                          className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg shadow-gray-200 hover:shadow-blue-200 flex items-center justify-center gap-3"
                        >
                          <Stethoscope className="w-5 h-5" />
                          Démarrer la consultation
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-xl text-white">
                  <FileText className="w-6 h-6" />
                </div>
                Rapports Récents
              </h2>
              <div className="space-y-4">
                {rapportsRecents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 italic font-medium">Aucun rapport récent</p>
                ) : (
                  rapportsRecents.map((rapport) => (
                    <div key={rapport.id} className="p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:scale-[1.02] transition cursor-pointer border border-transparent hover:border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 capitalize">{rapport.patient_nom} {rapport.patient_prenom}</p>
                          <p className="text-sm font-semibold text-blue-600 mt-1">Consultation terminée</p>
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 font-bold">
                            <Calendar className="w-3 h-3" />
                            {new Date(rapport.date_consultation).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}