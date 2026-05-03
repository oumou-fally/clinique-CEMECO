import { useState, useEffect, useRef } from 'react';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, MessageSquare, Eye, Trash2, Send, 
  ArrowLeft, Clock, User, CheckCircle2, AlertCircle, RefreshCw, Filter
} from 'lucide-react';

export default function GestionConseilsMedicaux() {
  const { medecinId } = useAuth();
  const [recherche, setRecherche] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [stats, setStats] = useState({ total_patients: 0, non_lus: 0, en_attente: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, answered
  const [discussionSelectionnee, setDiscussionSelectionnee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Charger les stats depuis la base de données
  const fetchStats = async () => {
    if (!medecinId) return;
    try {
      const response = await fetch(`/api/messagerie/medecin/${medecinId}/stats`);
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Erreur stats messagerie:', error);
    }
  };

  // Charger les discussions (derniers messages par patient)
  const fetchDiscussions = async (showLoading = false) => {
    if (!medecinId) return;
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`/api/messagerie/medecin/${medecinId}/discussions`);
      const data = await response.json();
      if (data.success) {
        setDiscussions(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement discussions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger l'historique complet d'une conversation
  const fetchMessages = async (patientId) => {
    if (!medecinId || !patientId) return;
    try {
      const response = await fetch(`/api/messagerie/conversation/${patientId}/${medecinId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        
        // Marquer comme lu si le dernier message vient du patient
        const aDesMessagesNonLus = data.data.some(m => m.expediteur === 'patient' && m.lu === 0);
        if (aDesMessagesNonLus) {
          await fetch('/api/messagerie/marquer-lu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_patient: patientId, id_medecin: medecinId, pour_qui: 'medecin' })
          });
          fetchStats(); // Update stats après marquage
        }
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  // Sync initiale et polling global
  useEffect(() => {
    if (medecinId) {
      fetchDiscussions(true);
      fetchStats();
      const interval = setInterval(() => {
        fetchDiscussions();
        fetchStats();
      }, 10000); // 10s pour la liste globale
      return () => clearInterval(interval);
    }
  }, [medecinId]);

  // Polling spécifique pour la conversation active
  useEffect(() => {
    let interval;
    if (discussionSelectionnee && medecinId) {
      fetchMessages(discussionSelectionnee.patient_id);
      interval = setInterval(() => fetchMessages(discussionSelectionnee.patient_id), 4000);
    }
    return () => clearInterval(interval);
  }, [discussionSelectionnee, medecinId]);

  // Scroll automatique au dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const envoyerReponse = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim() || !discussionSelectionnee || !medecinId) return;

    const messageAEnvoyer = nouveauMessage;
    setNouveauMessage(''); 

    try {
      const response = await fetch('/api/messagerie/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_medecin: medecinId,
          id_patient: discussionSelectionnee.patient_id,
          expediteur: 'medecin',
          message: messageAEnvoyer
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchMessages(discussionSelectionnee.patient_id);
        fetchDiscussions();
      } else {
        setNouveauMessage(messageAEnvoyer);
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur envoi réponse:', error);
      setNouveauMessage(messageAEnvoyer);
    }
  };

  const discussionsFiltrees = discussions.filter(d => {
    const nomComplet = `${d.patient_prenom} ${d.patient_nom}`.toLowerCase();
    const matchesSearch = nomComplet.includes(recherche.toLowerCase()) ||
                          (d.dernier_message && d.dernier_message.toLowerCase().includes(recherche.toLowerCase()));
    
    if (activeTab === 'pending') return matchesSearch && d.non_lus > 0;
    if (activeTab === 'answered') return matchesSearch && d.expediteur === 'medecin';
    return matchesSearch;
  });

  const formaterDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date().toLocaleDateString();
    const msgDate = date.toLocaleDateString();
    
    if (today === msgDate) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
        {/* En-tête Dynamique */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-indigo-600" />
              Messagerie Médicale
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Répondez aux questions et assurez le suivi de vos patients en temps réel</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Messages Non Lus</p>
                <p className="text-2xl font-black text-indigo-700">{stats.non_lus}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <button 
              onClick={() => fetchDiscussions(true)}
              className={`p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          {/* Liste des discussions (Sidebar) */}
          <div className="w-full md:w-[400px] flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 space-y-4">
              <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                {['all', 'pending', 'answered'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'all' ? 'Tous' : tab === 'pending' ? 'Attente' : 'Répondus'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-gray-300">
                  <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-bold">Chargement de vos messages...</p>
                </div>
              ) : discussionsFiltrees.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <MessageSquare className="w-16 h-16 opacity-10 mx-auto mb-4" />
                  <p className="font-bold">Aucune conversation trouvée</p>
                </div>
              ) : (
                discussionsFiltrees.map((disc) => (
                  <div
                    key={disc.patient_id}
                    onClick={() => setDiscussionSelectionnee(disc)}
                    className={`p-5 cursor-pointer transition-all hover:bg-indigo-50/50 group relative ${
                      discussionSelectionnee?.patient_id === disc.patient_id ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    {discussionSelectionnee?.patient_id === disc.patient_id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-r-full shadow-[2px_0_10px_rgba(79,70,229,0.4)]"></div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform shadow-sm">
                          {disc.patient_nom.charAt(0)}
                        </div>
                        {disc.non_lus > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                            {disc.non_lus}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-gray-900 truncate text-base">
                            {disc.patient_prenom} {disc.patient_nom}
                          </h3>
                          <span className="text-[10px] font-black text-gray-400 uppercase">
                            {formaterDate(disc.date_envoi)}
                          </span>
                        </div>
                        <p className={`text-xs truncate leading-relaxed ${disc.non_lus > 0 ? 'text-indigo-900 font-black' : 'text-gray-500 font-medium'}`}>
                          {disc.expediteur === 'medecin' ? 'Vous : ' : ''}{disc.dernier_message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de Chat (Main) */}
          <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
            {discussionSelectionnee ? (
              <>
                {/* Header Chat */}
                <div className="px-8 py-6 bg-white border-b border-gray-50 flex items-center justify-between z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                      {discussionSelectionnee.patient_nom.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">
                        {discussionSelectionnee.patient_prenom} {discussionSelectionnee.patient_nom}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Patient en ligne</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                  {messages.map((msg, idx) => {
                    const isMedecin = msg.expediteur === 'medecin';
                    return (
                      <div key={msg.id || idx} className={`flex ${isMedecin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[75%] rounded-[2rem] px-6 py-4 shadow-sm relative ${
                          isMedecin 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed font-medium">{msg.message}</p>
                          <div className={`flex items-center justify-end gap-2 mt-2 text-[9px] font-black uppercase tracking-widest ${isMedecin ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {new Date(msg.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMedecin && (
                              <CheckCircle2 className={`w-3.5 h-3.5 ${msg.lu ? 'text-green-300' : 'opacity-40'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-50">
                  <form onSubmit={envoyerReponse} className="flex items-end gap-4 bg-gray-50 p-3 rounded-3xl border border-gray-100 focus-within:border-indigo-300 focus-within:bg-white transition-all">
                    <textarea
                      rows="1"
                      value={nouveauMessage}
                      onChange={(e) => setNouveauMessage(e.target.value)}
                      placeholder="Donnez un conseil médical à votre patient..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-3 resize-none max-h-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          envoyerReponse(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!nouveauMessage.trim()}
                      className="w-14 h-14 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white rounded-[1.25rem] shadow-xl shadow-indigo-100 transition-all shrink-0 active:scale-95"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center mb-8 animate-bounce duration-[4000ms]">
                  <MessageSquare className="w-16 h-16 text-indigo-600 opacity-50" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Messagerie Médicale</h2>
                <p className="text-gray-500 mt-4 max-w-sm text-lg font-medium">
                  Sélectionnez un patient sur la gauche pour commencer à lui donner des conseils médicaux professionnels.
                </p>
                <div className="mt-12 flex gap-4 w-full max-w-md">
                  <div className="flex-1 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">À Répondre</p>
                    <p className="text-3xl font-black text-indigo-700">{stats.en_attente}</p>
                  </div>
                  <div className="flex-1 bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Non lus</p>
                    <p className="text-3xl font-black">{stats.non_lus}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}