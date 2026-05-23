import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../layouts/Layout';
import { 
  Send, ArrowLeft, CheckCircle2, MessageSquare, 
  Image as ImageIcon, Mic, Paperclip, FileText, Download, Play, Trash2, RefreshCw, Pause
} from 'lucide-react';

export default function ChatPatient() {
  const { patientId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { medecinId } = useParams();
  
  const [medecin, setMedecin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchData = async () => {
    if (!isAuthenticated || !patientId) {
      setError("Session expirée. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    try {
      if (medecinId) {
        // --- MODE CHAT ---
        const resInfo = await fetch(`${API_URL}/api/messagerie/info/medecin/${medecinId}`);
        const dataInfo = await resInfo.json();
        if (dataInfo.success) setMedecin(dataInfo.data);

        const resMsg = await fetch(`${API_URL}/api/messagerie/conversation/${patientId}/${medecinId}`);
        const dataMsg = await resMsg.json();
        if (dataMsg.success) {
          setMessages(dataMsg.data);
          if (dataMsg.data.some(m => m.expediteur === 'medecin' && m.lu === 0)) {
            await fetch(`${API_URL}/api/messagerie/marquer-lu`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_patient: patientId, id_medecin: medecinId, pour_qui: 'patient' })
            });
          }
        }
      } else {
        // --- MODE LISTE ---
        const resDisc = await fetch(`${API_URL}/api/messagerie/patient/${patientId}/discussions`);
        const dataDisc = await resDisc.json();
        if (dataDisc.success) setDiscussions(dataDisc.data);
      }
      setError(null);
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [medecinId, patientId]);

  useEffect(() => {
    if (medecinId) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, medecinId]);

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
        setAttachment(new File([blob], `vocal_${Date.now()}.${ext}`, { type: supportedMime || 'audio/wav' }));
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

  const envoyerMessage = async (e) => {
    if (e) e.preventDefault();
    if (!nouveauMessage.trim() && !attachment) return;

    const formData = new FormData();
    formData.append('id_medecin', medecinId);
    formData.append('id_patient', patientId);
    formData.append('expediteur', 'patient');
    formData.append('message', nouveauMessage);
    formData.append('type', attachmentType);
    if (attachment) formData.append('fichier', attachment);

    try {
      const res = await fetch(`${API_URL}/api/messagerie/envoyer`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setNouveauMessage(''); setAttachment(null); setAttachmentType('text');
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchData();
      }
    } catch (error) { alert("Erreur réseau"); }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL || window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };  // --- RENDU LISTE DES DISCUSSIONS ---
  if (!medecinId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-linear-to-r from-teal-600 via-teal-500 to-emerald-600 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-teal-900/10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_45%)]" />
            <div className="relative z-10 space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Conseils Médicaux</h1>
              <p className="text-teal-50/90 font-medium text-base">Consultez et échangez en direct avec vos médecins traitants de la Clinique CEMECO.</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/doctors')}
              className="relative z-10 mt-6 md:mt-0 px-6 py-3.5 bg-white text-teal-700 hover:text-teal-800 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5 text-teal-600" />
              Nouvelle Discussion
            </button>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {loading && discussions.length === 0 ? (
              <div className="py-24 text-center text-gray-400 bg-white rounded-[2rem] border border-gray-100 shadow-xs">
                <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-teal-500" />
                <p className="font-semibold text-gray-500">Chargement de vos discussions...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Aucune discussion active</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">Vous n'avez pas encore d'échange. Initiez une discussion avec l'un de vos médecins traitants.</p>
                <button 
                  onClick={() => navigate('/dashboard/doctors')} 
                  className="mt-6 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-md active:scale-95"
                >
                  Voir mes médecins
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {discussions.map((disc) => (
                  <div 
                    key={disc.medecin_id} 
                    onClick={() => navigate(`/dashboard/consultations/${disc.medecin_id}`)}
                    className="bg-white p-6 rounded-[2rem] border border-gray-100/80 shadow-xs hover:shadow-md hover:border-teal-100 hover:scale-[1.01] transition-all duration-300 cursor-pointer flex items-center gap-6 group"
                  >
                    {/* Avatar Initials with online status indicator */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-linear-to-br from-teal-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md shadow-teal-100 group-hover:rotate-3 transition-transform">
                        {disc.medecin_nom.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                          Dr. {disc.medecin_prenom} {disc.medecin_nom}
                        </h3>
                        <span className="text-xs font-semibold text-gray-400">
                          {new Date(disc.date_envoi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 uppercase tracking-wider">
                          {disc.medecin_specialite}
                        </span>
                      </div>

                      <p className={`text-sm truncate pt-1 ${disc.non_lus > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                        {disc.expediteur === 'patient' ? <span className="text-teal-600 font-semibold">Vous : </span> : ''}
                        {disc.type === 'vocal' ? '🎵 Message vocal' : disc.type === 'image' ? '🖼️ Image partagée' : disc.type === 'file' ? '📂 Document partagé' : disc.dernier_message}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {disc.non_lus > 0 && (
                      <div className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                        {disc.non_lus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // --- RENDU DU CHAT ---
  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard/consultations')} 
              className="p-3 bg-gray-50 hover:bg-teal-50 text-gray-600 hover:text-teal-600 rounded-2xl transition-all active:scale-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md shadow-teal-100">
                {(medecin?.nom || 'M').charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Dr. {medecin?.prenom} {medecin?.nom}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-1.5 py-0.5 rounded">
                  {medecin?.specialite || 'Spécialiste'}
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En ligne</span>
              </div>
            </div>
          </div>
          {error && <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full font-semibold border border-rose-100 animate-pulse">{error}</span>}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/40 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <RefreshCw className="w-10 h-10 animate-spin mb-4 text-teal-500" />
              <p className="font-semibold text-sm">Chargement de la conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 opacity-80">
              <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-500">Aucun message. Commencez la discussion !</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isPatient = msg.expediteur === 'patient';
              return (
                <div key={msg.id || idx} className={`flex ${isPatient ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-4.5 shadow-xs relative ${
                    isPatient 
                      ? 'bg-linear-to-r from-teal-600 to-emerald-600 text-white rounded-tr-none shadow-teal-100/40' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-gray-100/40'
                  }`}>
                    
                    {/* Share Image */}
                    {msg.type === 'image' && msg.fichier_url && (
                      <div className="mb-3 rounded-xl overflow-hidden shadow-xs border border-black/5 bg-slate-50">
                        <img 
                          src={getFullUrl(msg.fichier_url)} 
                          alt="Shared" 
                          className="max-w-full max-h-72 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => window.open(getFullUrl(msg.fichier_url), '_blank')} 
                        />
                      </div>
                    )}
                    
                    {/* Vocal Player */}
                    {msg.type === 'vocal' && msg.fichier_url && (
                      <div className={`mb-3 p-3.5 rounded-xl flex items-center gap-4 ${
                        isPatient ? 'bg-teal-700/40 border border-teal-500/25' : 'bg-teal-50/70 border border-teal-100/55'
                      }`}>
                        <button 
                          type="button"
                          className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 ${
                            isPatient ? 'bg-white text-teal-600' : 'bg-teal-600 text-white shadow-md shadow-teal-100'
                          }`}
                          onClick={() => { 
                            if (audioRef.current) { 
                              const url = getFullUrl(msg.fichier_url); 
                              if (playingAudio === msg.id) { 
                                audioRef.current.pause(); 
                                setPlayingAudio(null); 
                              } else { 
                                audioRef.current.src = url; 
                                audioRef.current.play()
                                  .then(() => setPlayingAudio(msg.id))
                                  .catch(() => setPlayingAudio(null)); 
                              } 
                            } 
                          }}
                        >
                          {playingAudio === msg.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                        </button>
                        <div className="flex-1 flex flex-col gap-1.5 min-w-[140px]">
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isPatient ? 'text-teal-200' : 'text-teal-700'}`}>
                              {playingAudio === msg.id ? 'Lecture en cours...' : 'Message Vocal'}
                            </span>
                            {playingAudio === msg.id && audioRef.current && (
                              <span className="text-[9px] font-bold tabular-nums opacity-85">
                                {new Date(audioRef.current.currentTime * 1000).toISOString().substr(14, 5)}
                              </span>
                            )}
                          </div>
                          {/* Beautiful Progress Track */}
                          <div className={`h-1 rounded-full relative overflow-hidden ${isPatient ? 'bg-teal-800/60' : 'bg-gray-200'}`}>
                            <div 
                              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ${isPatient ? 'bg-white' : 'bg-teal-600'}`} 
                              style={{ width: `${playingAudio === msg.id ? (audioProgress[msg.id] || 0) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Share Document/File */}
                    {msg.type === 'file' && msg.fichier_url && (
                      <div className={`mb-3 p-3.5 rounded-xl flex items-center gap-4 border ${
                        isPatient ? 'bg-teal-700/40 border-teal-500/25' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPatient ? 'bg-teal-800/40 text-teal-200' : 'bg-teal-100 text-teal-700'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isPatient ? 'text-white' : 'text-gray-900'}`}>
                            Document Joint
                          </p>
                          <a 
                            href={getFullUrl(msg.fichier_url)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mt-1 transition-all ${
                              isPatient ? 'text-teal-200 hover:text-white' : 'text-teal-600 hover:text-teal-700'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" /> Télécharger
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Message Content */}
                    {msg.message && <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>}
                    
                    {/* Message Time and Status */}
                    <div className={`flex items-center justify-end gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-widest ${
                      isPatient ? 'text-teal-200/80' : 'text-gray-400'
                    }`}>
                      {new Date(msg.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isPatient && (
                        <CheckCircle2 className={`w-3.5 h-3.5 transition-opacity ${msg.lu ? 'text-green-300' : 'opacity-40'}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <audio ref={audioRef} hidden preload="auto" onEnded={() => setPlayingAudio(null)} onTimeUpdate={() => { if (audioRef.current && playingAudio && !isNaN(audioRef.current.duration)) { setAudioProgress(prev => ({ ...prev, [playingAudio]: (audioRef.current.currentTime / audioRef.current.duration) * 100 })); } }} onLoadedMetadata={() => { if (audioRef.current && playingAudio && !isNaN(audioRef.current.duration)) { setAudioProgress(prev => ({ ...prev, [playingAudio]: (audioRef.current.currentTime / audioRef.current.duration) * 100 })); } }} onError={() => setPlayingAudio(null)} />

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          
          {/* File Attachment Preview Banner */}
          {attachment && (
            <div className="mb-4 p-3 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-xs border border-teal-100/50">
                  {attachmentType === 'image' ? <ImageIcon className="w-5 h-5" /> : attachmentType === 'vocal' ? <Mic className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-teal-900 truncate max-w-[240px]">{attachment.name}</span>
                  <span className="block text-[10px] font-semibold text-teal-600 capitalize">{attachmentType === 'file' ? 'Document' : attachmentType}</span>
                </div>
              </div>
              <button 
                onClick={() => {setAttachment(null); setAttachmentType('text');}} 
                className="p-2 text-teal-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={envoyerMessage} className="flex items-end gap-3 bg-slate-50 border border-gray-100 p-2 rounded-3xl focus-within:border-teal-300 focus-within:bg-white transition-all shadow-xs">
            <div className="flex items-center pl-1.5 mb-1 shrink-0">
              <button 
                type="button" 
                onClick={() => imageInputRef.current.click()} 
                className="p-2.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded-full transition-all"
                title="Envoyer une image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()} 
                className="p-2.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded-full transition-all"
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
                className={`p-2.5 rounded-full transition-all shrink-0 ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200' : 'text-gray-400 hover:text-teal-600 hover:bg-white'}`}
                title="Enregistrer un vocal (Maintenir enfoncé)"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            <textarea 
              rows="1" 
              value={nouveauMessage} 
              onChange={(e) => setNouveauMessage(e.target.value)} 
              placeholder={isRecording ? `Enregistrement en cours... ${recordingTime}s` : "Écrivez un message à votre médecin..."} 
              disabled={isRecording} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-3 resize-none max-h-32 outline-none text-gray-800" 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerMessage(); } }} 
            />
            
            <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
            <input type="file" ref={fileInputRef} hidden onChange={(e) => handleFileChange(e, 'file')} />
            
            <button 
              type="submit" 
              disabled={!nouveauMessage.trim() && !attachment} 
              className="w-12 h-12 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-300 text-white rounded-2xl shadow-md hover:shadow-lg disabled:shadow-none transition-all shrink-0 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </Layout>
  );
}
