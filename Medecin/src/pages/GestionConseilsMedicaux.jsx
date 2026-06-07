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
  const [activeTab, setActiveTab] = useState('all');
  const [discussionSelectionnee, setDiscussionSelectionnee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const recordingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchStats = useCallback(async () => {
    if (!medecinId) return;
    try {
      const response = await fetch(`${API_URL}/api/messagerie/medecin/${medecinId}/stats`);
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [medecinId, API_URL]);

  const fetchDiscussions = useCallback(async (showLoading = false) => {
    if (!medecinId) return;
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/api/messagerie/medecin/${medecinId}/discussions`);
      const data = await response.json();
      if (data.success) setDiscussions(data.data);
    } catch (error) {
      console.error('Erreur discussions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [medecinId, API_URL]);

  const fetchMessages = useCallback(async (patientId) => {
    if (!medecinId || !patientId) return;
    try {
      const response = await fetch(`${API_URL}/api/messagerie/conversation/${patientId}/${medecinId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        const nonLus = data.data.some(m => m.expediteur === 'patient' && m.lu === 0);
        if (nonLus) {
          await fetch(`${API_URL}/api/messagerie/marquer-lu`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_patient: patientId, id_medecin: medecinId, pour_qui: 'medecin' })
          });
          fetchStats();
        }
      }
    } catch (error) {
      console.error('Erreur messages:', error);
    }
  }, [medecinId, API_URL, fetchStats]);

  useEffect(() => {
    if (medecinId) {
      fetchDiscussions(true);
      fetchStats();
      const interval = setInterval(() => { fetchDiscussions(); fetchStats(); }, 10000);
      return () => clearInterval(interval);
    }
  }, [medecinId, fetchDiscussions, fetchStats]);

  useEffect(() => {
    let interval;
    if (discussionSelectionnee && medecinId) {
      fetchMessages(discussionSelectionnee.patient_id);
      interval = setInterval(() => fetchMessages(discussionSelectionnee.patient_id), 4000);
    }
    return () => clearInterval(interval);
  }, [discussionSelectionnee, medecinId, fetchMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) { setAttachment(file); setAttachmentType(type); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/aac'];
      const supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMime });
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: supportedMime || 'audio/wav' });
        const ext = supportedMime.includes('mp4') ? 'mp4' : supportedMime.includes('webm') ? 'webm' : supportedMime.includes('ogg') ? 'ogg' : 'wav';
        setAttachment(new File([blob], `vocal_medecin_${Date.now()}.${ext}`, { type: supportedMime || 'audio/wav' }));
        setAttachmentType('vocal');
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (err) { alert("Microphone inaccessible"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const envoyerReponse = async (e) => {
    if (e) e.preventDefault();
    if (!nouveauMessage.trim() && !attachment) return;
    if (!discussionSelectionnee || !medecinId) return;

    const formData = new FormData();
    formData.append('id_medecin', medecinId);
    formData.append('id_patient', discussionSelectionnee.patient_id);
    formData.append('expediteur', 'medecin');
    formData.append('message', nouveauMessage);
    formData.append('type', attachmentType);
    if (attachment) formData.append('fichier', attachment);

    try {
      const response = await fetch(`${API_URL}/api/messagerie/envoyer`, { method: 'POST', body: formData });
      const data = await response.json();
      if (data.success) {
        setNouveauMessage(''); setAttachment(null); setAttachmentType('text');
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMessages(discussionSelectionnee.patient_id);
        fetchDiscussions();
      }
    } catch (error) { console.error('Erreur envoi:', error); }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API_URL || window.location.origin;
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Central audio controls to ensure single audio element behavior
  const playAudio = (url, id) => {
    if (!audioRef.current) return;
    try {
      const audio = audioRef.current;
      const fullUrl = getFullUrl(url);

      // If same audio clicked while playing -> pause
      if (playingAudio === id) {
        audio.pause();
        setPlayingAudio(null);
        return;
      }

      // If another audio was playing, stop it and reset its progress
      if (playingAudio && playingAudio !== id) {
        audio.pause();
        audio.currentTime = 0;
        setAudioProgress(prev => ({ ...prev, [playingAudio]: 0 }));
        setPlayingAudio(null);
      }

      // Load new source if different
      if (!audio.src || !audio.src.includes(fullUrl)) {
        audio.src = fullUrl;
      }
      audio.currentTime = 0;
      audio.play()
        .then(() => setPlayingAudio(id))
        .catch(() => setPlayingAudio(null));
    } catch (err) {
      console.error('Audio play error', err);
      setPlayingAudio(null);
    }
  };

  // Audio element event handlers
  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || !playingAudio) return;
    const a = audioRef.current;
    if (!isNaN(a.duration) && a.duration > 0) {
      setAudioProgress(prev => ({ ...prev, [playingAudio]: (a.currentTime / a.duration) * 100 }));
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (!audioRef.current || !playingAudio) return;
    const a = audioRef.current;
    if (!isNaN(a.duration) && a.duration > 0) {
      setAudioProgress(prev => ({ ...prev, [playingAudio]: (a.currentTime / a.duration) * 100 }));
    }
  };

  const handleAudioEnded = () => {
    if (!audioRef.current) return;
    setPlayingAudio(null);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener('timeupdate', handleAudioTimeUpdate);
    audio.addEventListener('loadedmetadata', handleAudioLoadedMetadata);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', () => setPlayingAudio(null));
    return () => {
      audio.removeEventListener('timeupdate', handleAudioTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleAudioLoadedMetadata);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', () => setPlayingAudio(null));
    };
  }, [playingAudio]);

  const formaterDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date().toLocaleDateString();
    if (today === date.toLocaleDateString()) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
      <div className="h-[calc(100vh-120px)] flex flex-col space-y-6 animate-in fade-in duration-500">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xs border border-gray-100/80">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3.5">
              <div className="p-3 bg-linear-to-br from-indigo-600 to-violet-600 rounded-2xl text-white shadow-md shadow-indigo-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              Conseils Médicaux
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1.5 pl-0.5">Suivi rigoureux et messagerie directe avec vos patients</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-indigo-50/70 px-5 py-3.5 rounded-2xl border border-indigo-100/50 flex items-center gap-4">
               <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Messages en attente</p>
                  <p className="text-2xl font-extrabold text-indigo-700 leading-tight">{stats.non_lus}</p>
               </div>
               <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
               </div>
            </div>
            <button 
              onClick={() => fetchDiscussions(true)} 
              className={`p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 shadow-xs hover:border-indigo-100 transition-all active:scale-95 ${refreshing ? 'animate-spin text-indigo-600' : ''}`}
              title="Rafraîchir les discussions"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Double-Pane Container */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Sidebar Pane (Discussions List) */}
          <div className="w-full md:w-[380px] flex flex-col bg-white rounded-[2rem] shadow-xs border border-gray-100/80 overflow-hidden shrink-0">
            <div className="p-4.5 border-b border-gray-100 space-y-4 bg-slate-50/30">
               {/* Custom Tab Switcher */}
               <div className="flex p-1 bg-gray-100/80 rounded-2xl border border-gray-100">
                 {['all', 'pending', 'answered'].map((tab) => (
                   <button 
                     key={tab} 
                     onClick={() => setActiveTab(tab)} 
                     className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                       activeTab === tab 
                         ? 'bg-white text-indigo-600 shadow-sm border border-black/5 font-extrabold' 
                         : 'text-gray-400 hover:text-gray-700'
                     }`}
                   >
                     {tab === 'all' ? 'Tous' : tab === 'pending' ? 'Attente' : 'Répondus'}
                   </button>
                 ))}
               </div>
               {/* Elegant Search Bar */}
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Rechercher un patient..." 
                   value={recherche} 
                   onChange={(e) => setRecherche(e.target.value)} 
                   className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100/60 rounded-2xl focus:border-indigo-300 focus:bg-white outline-none text-sm font-medium transition-all" 
                 />
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar division-y division-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                  <p className="font-bold text-xs uppercase tracking-wider">Chargement des patients...</p>
                </div>
              ) : discussionsFiltrees.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-sm">Aucune discussion trouvée</p>
                </div>
              ) : (
                discussionsFiltrees.map((disc) => (
                  <div 
                    key={disc.patient_id} 
                    onClick={() => setDiscussionSelectionnee(disc)} 
                    className={`p-5 cursor-pointer transition-all hover:bg-slate-50/70 border-b border-slate-50 relative flex items-center gap-4 ${
                      discussionSelectionnee?.patient_id === disc.patient_id 
                        ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600 pl-4' 
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100">
                        {disc.patient_nom.charAt(0)}
                      </div>
                      {disc.non_lus > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-xs">
                          {disc.non_lus}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-900 truncate text-sm group-hover:text-indigo-600 transition-colors">
                          {disc.patient_prenom} {disc.patient_nom}
                        </h3>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">
                          {formaterDate(disc.date_envoi)}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${disc.non_lus > 0 ? 'text-indigo-950 font-bold' : 'text-gray-500 font-medium'}`}>
                        {disc.expediteur === 'medecin' ? <span className="text-indigo-600 font-bold">Vous : </span> : ''}
                        {disc.type === 'vocal' ? '🎵 Message vocal' : disc.type === 'image' ? '🖼️ Image reçue' : disc.type === 'file' ? '📂 Document reçu' : disc.dernier_message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Chat Pane */}
          <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-xs border border-gray-100/80 overflow-hidden relative">
            {discussionSelectionnee ? (
              <>
                {/* Active Chat Header */}
                <div className="px-8 py-5.5 bg-white border-b border-gray-100 flex items-center justify-between z-10 shadow-xs shadow-slate-100/30">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-linear-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100">
                      {discussionSelectionnee.patient_nom.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">
                        {discussionSelectionnee.patient_prenom} {discussionSelectionnee.patient_nom}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Patient En Ligne</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages List Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar">
                  {messages.map((msg, idx) => {
                    const isMedecin = msg.expediteur === 'medecin';
                    return (
                      <div key={msg.id || idx} className={`flex ${isMedecin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[70%] rounded-2xl px-5 py-4.5 shadow-xs relative ${
                          isMedecin 
                            ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-indigo-100/40' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-gray-100/40'
                        }`}>
                          
                          {/* Image preview */}
                          {msg.type === 'image' && msg.fichier_url && (
                            <div className="mb-3 rounded-xl overflow-hidden shadow-xs border border-black/5 bg-slate-100">
                              <img 
                                src={getFullUrl(msg.fichier_url)} 
                                alt="Shared" 
                                className="max-w-full max-h-72 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => window.open(getFullUrl(msg.fichier_url), '_blank')} 
                              />
                            </div>
                          )}
                          
                          {/* Custom Vocal Player */}
                          {msg.type === 'vocal' && msg.fichier_url && (
                            <div className={`mb-3 p-3.5 rounded-xl flex items-center gap-4 ${
                              isMedecin ? 'bg-indigo-700/40 border border-indigo-500/25' : 'bg-indigo-50/70 border border-indigo-100/55'
                            }`}>
                              <button 
                                type="button"
                                className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 ${
                                  isMedecin ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                }`}
                                onClick={() => playAudio(msg.fichier_url, msg.id)}
                              >
                                {playingAudio === msg.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                              </button>
                              <div className="flex-1 flex flex-col gap-1.5 min-w-[140px]">
                                <div className="flex justify-between items-center">
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${isMedecin ? 'text-indigo-200' : 'text-indigo-700'}`}>
                                    {playingAudio === msg.id ? 'Lecture...' : 'Vocal Patient'}
                                  </span>
                                  {playingAudio === msg.id && audioRef.current && (
                                    <span className="text-[9px] font-bold tabular-nums opacity-85">
                                      {new Date(audioRef.current.currentTime * 1000).toISOString().substr(14, 5)}
                                    </span>
                                  )}
                                </div>
                                {/* Track */}
                                <div className={`h-1 rounded-full relative overflow-hidden ${isMedecin ? 'bg-indigo-800/60' : 'bg-gray-200'}`}>
                                  <div 
                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ${isMedecin ? 'bg-white' : 'bg-indigo-600'}`} 
                                    style={{ width: `${playingAudio === msg.id ? (audioProgress[msg.id] || 0) : 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* File Document */}
                          {msg.type === 'file' && msg.fichier_url && (
                            <div className={`mb-3 p-3.5 rounded-xl flex items-center gap-4 border ${
                              isMedecin ? 'bg-indigo-700/40 border-indigo-500/25' : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMedecin ? 'bg-indigo-800/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${isMedecin ? 'text-white' : 'text-gray-900'}`}>
                                  Document Joint
                                </p>
                                <a 
                                  href={getFullUrl(msg.fichier_url)} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mt-1 transition-all ${
                                    isMedecin ? 'text-indigo-200 hover:text-white' : 'text-indigo-600 hover:text-indigo-700'
                                  }`}
                                >
                                  <Download className="w-3.5 h-3.5" /> Télécharger
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {/* Content */}
                          {msg.message && <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>}
                          
                          {/* Time and Status */}
                          <div className={`flex items-center justify-end gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-widest ${
                            isMedecin ? 'text-indigo-200/80' : 'text-gray-400'
                          }`}>
                            {new Date(msg.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMedecin && (
                              <CheckCircle2 className={`w-3.5 h-3.5 transition-opacity ${msg.lu ? 'text-green-300' : 'opacity-40'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <audio ref={audioRef} hidden preload="auto" />
                
                {/* Active Chat Input Area */}
                <div className="p-6 bg-white border-t border-gray-100">
                  
                  {/* File preview inside text field */}
                  {attachment && (
                    <div className="mb-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xs border border-indigo-100/50">
                          {attachmentType === 'image' ? <ImageIcon className="w-5 h-5" /> : attachmentType === 'vocal' ? <Mic className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-indigo-900 truncate max-w-[240px]">{attachment.name}</span>
                          <span className="block text-[10px] font-semibold text-indigo-600 capitalize">{attachmentType}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {setAttachment(null); setAttachmentType('text');}} 
                        className="p-2 text-indigo-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={envoyerReponse} className="flex items-end gap-3 bg-slate-50 border border-gray-100 p-2 rounded-3xl focus-within:border-indigo-300 focus-within:bg-white transition-all shadow-xs">
                    <div className="flex items-center pl-1.5 mb-1 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => imageInputRef.current.click()} 
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"
                        title="Envoyer une image"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()} 
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"
                        title="Partager un document"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button 
                        type="button" 
                        onMouseDown={startRecording} 
                        onMouseUp={stopRecording} 
                        onTouchStart={startRecording} 
                        onTouchEnd={stopRecording} 
                        className={`p-2.5 rounded-full transition-all shrink-0 ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200' : 'text-gray-400 hover:text-indigo-600 hover:bg-white'}`}
                        title="Enregistrer un vocal (Maintenir enfoncé)"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <textarea 
                      rows="1" 
                      value={nouveauMessage} 
                      onChange={(e) => setNouveauMessage(e.target.value)} 
                      placeholder={isRecording ? `Enregistrement en cours... ${recordingTime}s` : "Écrivez votre conseil ou avis médical..."} 
                      disabled={isRecording} 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-3 resize-none max-h-32 outline-none text-gray-800" 
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerReponse(); } }} 
                    />
                    
                    <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                    <input type="file" ref={fileInputRef} hidden onChange={(e) => handleFileChange(e, 'file')} />
                    
                    <button 
                      type="submit" 
                      disabled={!nouveauMessage.trim() && !attachment} 
                      className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl shadow-md hover:shadow-lg disabled:shadow-none transition-all shrink-0 active:scale-95"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No discussion selected placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-300">
                <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">Conseils Médicaux</h2>
                <p className="max-w-xs mx-auto mt-3 font-medium text-sm text-gray-500">Sélectionnez un dossier patient dans la liste de gauche pour entamer les échanges.</p>
              </div>
            )}
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </Layout>
  );
}