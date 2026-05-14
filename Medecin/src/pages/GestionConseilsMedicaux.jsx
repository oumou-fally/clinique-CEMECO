import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, MessageSquare, Eye, Trash2, Send, 
  ArrowLeft, Clock, User, CheckCircle2, AlertCircle, RefreshCw, Filter,
  Image as ImageIcon, Mic, Paperclip, FileText, Download, Play, Pause
} from 'lucide-react';

export default function GestionConseilsMedicaux() {
  const { medecinId, user } = useAuth();
  const [recherche, setRecherche] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [stats, setStats] = useState({ total_patients: 0, non_lus: 0, en_attente: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, answered
  const [discussionSelectionnee, setDiscussionSelectionnee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Charger les stats depuis la base de données
  const fetchStats = useCallback(async () => {
    if (!medecinId) return;
    try {
      const response = await fetch(`${API_URL}/api/messagerie/medecin/${medecinId}/stats`);
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Erreur stats messagerie:', error);
    }
  }, [medecinId, API_URL]);

  // Charger les discussions (derniers messages par patient)
  const fetchDiscussions = useCallback(async (showLoading = false) => {
    if (!medecinId) return;
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/api/messagerie/medecin/${medecinId}/discussions`);
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
  }, [medecinId, API_URL]);

  // Charger l'historique complet d'une conversation
  const fetchMessages = useCallback(async (patientId) => {
    if (!medecinId || !patientId) return;
    try {
      const response = await fetch(`${API_URL}/api/messagerie/conversation/${patientId}/${medecinId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        
        // Marquer comme lu si le dernier message vient du patient
        const aDesMessagesNonLus = data.data.some(m => m.expediteur === 'patient' && m.lu === 0);
        if (aDesMessagesNonLus) {
          await fetch(`${API_URL}/api/messagerie/marquer-lu`, {
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
  }, [medecinId, API_URL, fetchStats]);

  // Sync initiale et polling global
  useEffect(() => {
    if (medecinId) {
      fetchDiscussions(true);
      fetchStats();
      const interval = setInterval(() => {
        fetchDiscussions();
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [medecinId, fetchDiscussions, fetchStats]);

  // Polling spécifique pour la conversation active
  useEffect(() => {
    let interval;
    if (discussionSelectionnee && medecinId) {
      fetchMessages(discussionSelectionnee.patient_id);
      interval = setInterval(() => fetchMessages(discussionSelectionnee.patient_id), 4000);
    }
    return () => clearInterval(interval);
  }, [discussionSelectionnee, medecinId, fetchMessages]);

  // Scroll automatique au dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      setAttachmentType(type);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAttachment(new File([blob], "vocal_medecin.webm", { type: 'audio/webm' }));
        setAttachmentType('vocal');
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Accès microphone refusé.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const envoyerReponse = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim() && !attachment) return;
    if (!discussionSelectionnee || !medecinId) return;

    const formData = new FormData();
    formData.append('id_medecin', medecinId);
    formData.append('id_patient', discussionSelectionnee.patient_id);
    formData.append('expediteur', 'medecin');
    formData.append('message', nouveauMessage);
    formData.append('type', attachmentType);
    if (attachment) {
      formData.append('fichier', attachment);
    }

    try {
      const response = await fetch(`${API_URL}/api/messagerie/envoyer`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setNouveauMessage('');
        setAttachment(null);
        setAttachmentType('text');
        fetchMessages(discussionSelectionnee.patient_id);
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Erreur envoi réponse:', error);
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const formaterDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date().toLocaleDateString();
    if (today === date.toLocaleDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const discussionsFiltrees = discussions.filter(d => {
    const nomComplet = `${d.patient_prenom} ${d.patient_nom}`.toLowerCase();
    const matchesSearch = nomComplet.includes(recherche.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && d.non_lus > 0;
    if (activeTab === 'answered') return matchesSearch && d.expediteur === 'medecin';
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 animate-in fade-in duration-500">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                <MessageSquare className="w-8 h-8" />
              </div>
              Conseils Médicaux
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Suivi et messagerie directe avec vos patients</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-4">
               <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Non Lus</p>
                  <p className="text-2xl font-black text-indigo-700">{stats.non_lus}</p>
               </div>
               <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
               </div>
            </div>
            <button 
              onClick={() => fetchDiscussions(true)}
              className={`p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 shadow-sm transition-all ${refreshing ? 'animate-spin text-indigo-600' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-[380px] flex flex-col bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 space-y-4">
               <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                 {['all', 'pending', 'answered'].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                       activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-gray-400 hover:text-gray-600'
                     }`}
                   >
                     {tab === 'all' ? 'Tous' : tab === 'pending' ? 'Attente' : 'Répondus'}
                   </button>
                 ))}
               </div>
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input
                   type="text"
                   placeholder="Rechercher..."
                   value={recherche}
                   onChange={(e) => setRecherche(e.target.value)}
                   className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium transition"
                 />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-gray-300">
                  <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                  <p className="font-bold text-xs uppercase tracking-widest">Chargement...</p>
                </div>
              ) : discussionsFiltrees.length === 0 ? (
                <div className="p-12 text-center text-gray-300">
                  <MessageSquare className="w-16 h-16 opacity-10 mx-auto mb-4" />
                  <p className="font-bold">Aucune discussion</p>
                </div>
              ) : (
                discussionsFiltrees.map((disc) => (
                  <div
                    key={disc.patient_id}
                    onClick={() => setDiscussionSelectionnee(disc)}
                    className={`p-5 cursor-pointer transition-all hover:bg-indigo-50/50 group relative border-b border-gray-50 ${
                      discussionSelectionnee?.patient_id === disc.patient_id ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                          {disc.patient_nom.charAt(0)}
                        </div>
                        {disc.non_lus > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-md">
                            {disc.non_lus}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{disc.patient_prenom} {disc.patient_nom}</h3>
                          <span className="text-[9px] font-black text-gray-400 uppercase">{formaterDate(disc.date_envoi)}</span>
                        </div>
                        <p className={`text-xs truncate ${disc.non_lus > 0 ? 'text-indigo-900 font-black' : 'text-gray-500 font-medium'}`}>
                          {disc.expediteur === 'medecin' ? 'Vous : ' : ''}{disc.dernier_message || 'Fichier envoyé'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden relative">
            {discussionSelectionnee ? (
              <>
                <div className="px-8 py-6 bg-white border-b border-gray-50 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                      {discussionSelectionnee.patient_nom.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">{discussionSelectionnee.patient_prenom} {discussionSelectionnee.patient_nom}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Connecté</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 custom-scrollbar">
                  {messages.map((msg, idx) => {
                    const isMedecin = msg.expediteur === 'medecin';
                    return (
                      <div key={msg.id || idx} className={`flex ${isMedecin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[75%] rounded-[2rem] px-6 py-4 shadow-sm relative ${
                          isMedecin 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-gray-100'
                        }`}>
                          {msg.type === 'image' && msg.fichier_url && (
                            <div className="mb-3 rounded-xl overflow-hidden shadow-md">
                              <img src={getFullUrl(msg.fichier_url)} alt="Shared" className="max-w-full h-auto cursor-pointer hover:opacity-90" onClick={() => window.open(getFullUrl(msg.fichier_url), '_blank')} />
                            </div>
                          )}

                          {msg.type === 'vocal' && msg.fichier_url && (
                            <div className={`mb-3 p-4 rounded-[1.5rem] flex items-center gap-4 ${isMedecin ? 'bg-indigo-700/50' : 'bg-indigo-50/50'}`}>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 ${isMedecin ? 'bg-white text-teal-600' : 'bg-teal-600 text-white shadow-md'}`}>
                                 {playingAudio === msg.id ? (
                                   <Pause className="w-6 h-6 fill-current" onClick={() => { 
                                     if (audioRef.current) {
                                       audioRef.current.pause(); 
                                       setPlayingAudio(null); 
                                     }
                                   }} />
                                 ) : (
                                   <Play className="w-6 h-6 fill-current" onClick={() => {
                                     if (audioRef.current) {
                                       const url = getFullUrl(msg.fichier_url);
                                       audioRef.current.src = url;
                                       audioRef.current.load();
                                       audioRef.current.play()
                                         .then(() => setPlayingAudio(msg.id))
                                         .catch(err => {
                                           console.error('Audio playback error:', err);
                                           alert("Impossible de lire ce fichier audio.");
                                           setPlayingAudio(null);
                                         });
                                     }
                                   }} />
                                 )}
                              </div>
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="h-1 bg-gray-200/30 rounded-full overflow-hidden relative">
                                   <div className={`absolute top-0 left-0 h-full bg-current opacity-50 ${playingAudio === msg.id ? 'animate-progress' : 'w-0'}`}></div>
                                </div>
                                <p className={`text-[8px] font-black uppercase tracking-tighter ${isMedecin ? 'text-indigo-200' : 'text-indigo-600'}`}>Message Vocal</p>
                              </div>
                            </div>
                          )}

                          {msg.type === 'file' && msg.fichier_url && (
                            <div className={`mb-3 p-4 rounded-2xl flex items-center gap-4 border ${isMedecin ? 'bg-indigo-700/50 border-indigo-400' : 'bg-gray-50 border-gray-200'}`}>
                              <FileText className={`w-8 h-8 ${isMedecin ? 'text-indigo-200' : 'text-indigo-600'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold truncate ${isMedecin ? 'text-white' : 'text-gray-900'}`}>Pièce jointe</p>
                                <a href={getFullUrl(msg.fichier_url)} target="_blank" rel="noopener noreferrer" className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-1 ${isMedecin ? 'text-indigo-200 hover:text-white' : 'text-indigo-600 hover:text-indigo-700'}`}>
                                  <Download className="w-3 h-3" /> Télécharger
                                </a>
                              </div>
                            </div>
                          )}

                          {msg.message && <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>}
                          <div className={`flex items-center justify-end gap-2 mt-2 text-[9px] font-black uppercase tracking-widest ${isMedecin ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {new Date(msg.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMedecin && <CheckCircle2 className={`w-3.5 h-3.5 ${msg.lu ? 'text-green-300' : 'opacity-40'}`} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <audio ref={audioRef} hidden onEnded={() => setPlayingAudio(null)} />

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-50">
                  {attachment && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                          {attachmentType === 'image' ? <ImageIcon className="w-5 h-5" /> : attachmentType === 'vocal' ? <Mic className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <span className="text-xs font-bold text-indigo-900 truncate max-w-[200px]">{attachment.name}</span>
                      </div>
                      <button onClick={() => {setAttachment(null); setAttachmentType('text');}} className="text-indigo-400 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={envoyerReponse} className="flex items-end gap-3 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 focus-within:border-indigo-300 focus-within:bg-white transition-all shadow-sm">
                    <div className="flex items-center gap-1 pl-2 mb-1.5">
                      <button type="button" onClick={() => imageInputRef.current.click()} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"><ImageIcon className="w-5 h-5" /></button>
                      <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"><Paperclip className="w-5 h-5" /></button>
                      <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-indigo-600 hover:bg-white'}`}><Mic className="w-5 h-5" /></button>
                    </div>

                    <textarea
                      rows="1" value={nouveauMessage} onChange={(e) => setNouveauMessage(e.target.value)} placeholder={isRecording ? `Enregistrement... ${recordingTime}s` : "Écrivez votre conseil..." } disabled={isRecording} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-3 resize-none max-h-32"
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerReponse(e); } }}
                    />

                    <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                    <input type="file" ref={fileInputRef} hidden onChange={(e) => handleFileChange(e, 'file')} />

                    <button type="submit" disabled={!nouveauMessage.trim() && !attachment} className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white rounded-2xl shadow-xl transition-all shrink-0 active:scale-95">
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-300">
                 <MessageSquare className="w-20 h-20 opacity-20 mb-6" />
                 <h2 className="text-2xl font-black text-gray-900">Conseils Médicaux</h2>
                 <p className="max-w-xs mx-auto mt-2 font-medium">Sélectionnez une discussion pour commencer à échanger avec vos patients.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        .animate-progress { animation: progress 3s linear infinite; }
      `}} />
    </Layout>
  );
}