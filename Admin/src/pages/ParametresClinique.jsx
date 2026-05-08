import { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Save,
  Lock,
  Bell,
  Users,
  Globe,
  Database,
  Shield,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Edit2,
  Trash2,
  Plus,
  RefreshCcw,
  CreditCard
} from 'lucide-react';

export default function ParametresClinique() {
  const { user } = useAuth();
  const [messageEnregistre, setMessageEnregistre] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  const [parametres, setParametres] = useState({
    nomClinique: 'Clinique CEMECO',
    adresse: 'Kipé, près de Heroes Coffee - En face de Plaza Diamond',
    telephone: '+224 622 00 00 00',
    email: 'contact@cemeco.gn',
    siteWeb: 'www.cemeco.gn',
    heuresOuverture: '08:00 - 18:00',
    notificationsEmail: true,
    sauvegardeAuto: true,
    retentionDonnees: 'unlimited'
  });

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchConsultationTypes();
  }, []);

  const fetchConsultationTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/parametres/types-consultation`);
      const data = await res.json();
      if (data.success) {
        setConsultationTypes(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (id) => {
    if (!tempPrice || isNaN(tempPrice)) {
      alert('Veuillez entrer un prix valide');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/parametres/types-consultation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prix: tempPrice })
      });
      const data = await res.json();
      if (data.success) {
        setMessageEnregistre(true);
        setEditingId(null);
        fetchConsultationTypes();
        setTimeout(() => setMessageEnregistre(false), 3000);
      }
    } catch (error) {
      console.error('Erreur mise à jour prix:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (champ, valeur) => {
    setParametres(prev => ({ ...prev, [champ]: valeur }));
  };

  const handleSaveAll = () => {
    setMessageEnregistre(true);
    setTimeout(() => setMessageEnregistre(false), 3000);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* En-tête Dynamique */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <SettingsIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configuration Système</h1>
                <p className="text-gray-500 font-medium">Gérez les paramètres globaux et la tarification</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <Save className="w-5 h-5" />
            Tout Enregistrer
          </button>
        </div>

        {/* Message de succès Flottant */}
        {messageEnregistre && (
          <div className="fixed top-8 right-8 z-50 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300">
            <CheckCircle className="w-6 h-6" />
            <span className="font-black text-lg">Modifications enregistrées !</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION TARIFICATION (NOUVEAU & DYNAMIQUE) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-linear-to-r from-gray-50 to-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Grille Tarifaire</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Actes médicaux & Consultations</p>
                  </div>
                </div>
                <button 
                  onClick={fetchConsultationTypes}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <RefreshCcw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        <th className="pb-4 px-2">Type d'Acte</th>
                        <th className="pb-4 px-2">Prix Actuel (GNF)</th>
                        <th className="pb-4 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {consultationTypes.map((type) => (
                        <tr key={type.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-5 px-2">
                            <p className="font-bold text-gray-800">{type.nom}</p>
                          </td>
                          <td className="py-5 px-2">
                            {editingId === type.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-32 px-3 py-1.5 border-2 border-blue-500 rounded-lg outline-none font-bold"
                                  autoFocus
                                />
                                <span className="text-xs font-black text-gray-400">GNF</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-black text-sm">
                                <DollarSign className="w-3.5 h-3.5" />
                                {new Intl.NumberFormat('fr-GN').format(type.prix)} FG
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-2 text-right">
                            {editingId === type.id ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleUpdatePrice(type.id)}
                                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setEditingId(type.id);
                                  setTempPrice(type.prix);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE PARAMÈTRES GÉNÉRAUX */}
          <div className="space-y-6">
            
            {/* Info Clinique */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Identité</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l'établissement</label>
                  <input
                    type="text"
                    value={parametres.nomClinique}
                    onChange={(e) => handleChange('nomClinique', e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adresse physique</label>
                  <textarea
                    rows={2}
                    value={parametres.adresse}
                    onChange={(e) => handleChange('adresse', e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
               <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Sécurité</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer group hover:bg-gray-100 transition-colors">
                  <span className="font-bold text-gray-700">Sauvegarde Auto</span>
                  <input
                    type="checkbox"
                    checked={parametres.sauvegardeAuto}
                    onChange={(e) => handleChange('sauvegardeAuto', e.target.checked)}
                    className="w-6 h-6 text-blue-600 rounded-lg"
                  />
                </label>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dernière Backup</p>
                  <p className="text-sm font-black text-blue-900 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Aujourd'hui à 03:00
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

function X(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}