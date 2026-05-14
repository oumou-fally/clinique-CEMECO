import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { 
  Send, ArrowLeft, CheckCircle2, MessageSquare, 
  Image as ImageIcon, Mic, Paperclip, FileText, Download, Play, Trash2, RefreshCw, Pause
} from 'lucide-react';

export default function ChatPatient() {
  const { medecinId } = useParams();
  const navigate = useNavigate();
  const patientId = localStorage.getItem('patientId');
  
  const [medecin, setMedecin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Charger les infos du médecin et les messages
  const fetchData = async () => {
    if (!patientId || !medecinId) return;
    try {
      // Charger les messages
      const resMsg = await fetch(`${API_URL}/api/messagerie/conversation/${patientId}/${medecinId}`);
      const dataMsg = await resMsg.json();
      if (dataMsg.success) {
        setMessages(dataMsg.data);
        
        // Marquer comme lu
        const nonLus = dataMsg.data.some(m => m.expediteur === 'medecin' && m.lu === 0);
        if (nonLus) {
          await fetch(`${API_URL}/api/messagerie/marquer-lu`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_patient: patientId, id_medecin: medecinId, pour_qui: 'patient' })
          });
        }
      }

      // Charger les infos du médecin
      const resDisc = await fetch(`${API_URL}/api/messagerie/patient/${patientId}/discussions`);
      const dataDisc = await resDisc.json();
      if (dataDisc.success) {
        const disc = dataDisc.data.find(d => d.medecin_id === parseInt(medecinId));
        if (disc) setMedecin(disc);
      }
    } catch (error) {
      console.error('Erreur chargement chat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [medecinId, patientId]);

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
        setAttachment(new File([blob], "vocal_patient.webm", { type: 'audio/webm' }));
        setAttachmentType('vocal');
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Accès au microphone refusé. Veuillez vérifier vos paramètres.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const envoyerMessage = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim() && !attachment) return;

    const formData = new FormData();
    formData.append('id_medecin', medecinId);
    formData.append('id_patient', patientId);
    formData.append('expediteur', 'patient');
    formData.append('message', nouveauMessage);
    formData.append('type', attachmentType);
    if (attachment) {
      formData.append('fichier', attachment);
    }

    try {
      const res = await fetch(`${API_URL}/api/messagerie/envoyer`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNouveauMessage('');
        setAttachment(null);
        setAttachmentType('text');
        fetchData();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-50 bg-white/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-teal-50 text-teal-600 rounded-2xl transition-all active:scale-90">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-teal-100">
              {medecin?.medecin_nom?.charAt(0) || 'M'}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Dr. {medecin?.medecin_prenom} {medecin?.medecin_nom}
              </h2>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{medecin?.medecin_specialite || 'Spécialiste'}</p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <RefreshCw className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">Chargement de la conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 opacity-50">
              <MessageSquare className="w-16 h-16 mb-4" />
              <p className="font-bold">Aucun message. Commencez la discussion !</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isPatient = msg.expediteur === 'patient';
              return (
                <div key={msg.id || idx} className={`flex ${isPatient ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] rounded-[2rem] px-6 py-4 shadow-sm relative ${
                    isPatient 
                      ? 'bg-teal-600 text-white rounded-tr-none shadow-teal-100' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-gray-100'
                  }`}>
                    {msg.type === 'image' && msg.fichier_url && (
                      <div className="mb-3 rounded-xl overflow-hidden shadow-md">
                        <img 
                          src={getFullUrl(msg.fichier_url)} 
                          alt="Shared" 
                          className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(getFullUrl(msg.fichier_url), '_blank')}
                        />
                      </div>
                    )}

                    {msg.type === 'vocal' && msg.fichier_url && (
                      <div className={`mb-3 p-4 rounded-[1.5rem] flex items-center gap-4 ${isPatient ? 'bg-teal-700/50' : 'bg-teal-50/50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 ${isPatient ? 'bg-white text-teal-600' : 'bg-teal-600 text-white shadow-md'}`}>
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
                                 console.log('Playing audio:', url);
                                 audioRef.current.src = url;
                                 audioRef.current.load();
                                 audioRef.current.play()
                                   .then(() => setPlayingAudio(msg.id))
                                   .catch(err => {
                                     console.error('Audio playback error:', err);
                                     alert("Impossible de lire ce fichier audio. Le format n'est peut-être pas supporté par votre navigateur ou le fichier est manquant.");
                                     setPlayingAudio(null);
                                   });
                               }
                             }} />
                           )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                           <div className="h-1 bg-gray-200/30 rounded-full relative overflow-hidden">
                              <div className={`absolute top-0 left-0 h-full bg-current opacity-50 ${playingAudio === msg.id ? 'animate-progress' : 'w-0'}`}></div>
                           </div>
                           <p className={`text-[8px] font-black uppercase tracking-tighter ${isPatient ? 'text-teal-200' : 'text-teal-600'}`}>Message Vocal</p>
                        </div>
                      </div>
                    )}

                    {msg.type === 'file' && msg.fichier_url && (
                      <div className={`mb-3 p-4 rounded-2xl flex items-center gap-4 border ${isPatient ? 'bg-teal-700/50 border-teal-400' : 'bg-gray-50 border-gray-200'}`}>
                        <FileText className={`w-8 h-8 ${isPatient ? 'text-teal-200' : 'text-teal-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isPatient ? 'text-white' : 'text-gray-900'}`}>Document</p>
                          <a 
                            href={getFullUrl(msg.fichier_url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-1 ${isPatient ? 'text-teal-200 hover:text-white' : 'text-teal-600 hover:text-teal-700'}`}
                          >
                            <Download className="w-3 h-3" /> Télécharger
                          </a>
                        </div>
                      </div>
                    )}

                    {msg.message && (
                      <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>
                    )}
                    <div className={`flex items-center justify-end gap-2 mt-2 text-[9px] font-black uppercase tracking-widest ${isPatient ? 'text-teal-200' : 'text-gray-400'}`}>
                      {new Date(msg.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isPatient && (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${msg.lu ? 'text-green-300' : 'opacity-40'}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Global Audio Reference */}
        <audio 
          ref={audioRef} 
          hidden 
          onEnded={() => setPlayingAudio(null)} 
          onError={() => { alert("Erreur lors de la lecture de l'audio"); setPlayingAudio(null); }}
        />

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-50">
          {attachment && (
            <div className="mb-4 p-3 bg-teal-50 rounded-2xl border border-teal-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                  {attachmentType === 'image' ? <ImageIcon className="w-5 h-5" /> : attachmentType === 'vocal' ? <Mic className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <span className="text-xs font-bold text-teal-900 truncate max-w-[200px]">{attachment.name}</span>
              </div>
              <button onClick={() => {setAttachment(null); setAttachmentType('text');}} className="text-teal-400 hover:text-red-500 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={envoyerMessage} className="flex items-end gap-3 bg-gray-100 p-2 rounded-[2rem] border border-transparent focus-within:border-teal-300 focus-within:bg-white transition-all shadow-sm">
            <div className="flex items-center gap-1 pl-2 mb-1.5">
              <button type="button" onClick={() => imageInputRef.current.click()} className="p-3 text-gray-400 hover:text-teal-600 hover:bg-white rounded-full transition-all">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-gray-400 hover:text-teal-600 hover:bg-white rounded-full transition-all">
                <Paperclip className="w-5 h-5" />
              </button>
              <button 
                type="button" 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-teal-600 hover:bg-white'}`}
                title="Maintenir pour enregistrer"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows="1"
              value={nouveauMessage}
              onChange={(e) => setNouveauMessage(e.target.value)}
              placeholder="Écrivez à votre médecin..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-3 resize-none max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  envoyerMessage(e);
                }
              }}
            />

            <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
            <input type="file" ref={fileInputRef} hidden onChange={(e) => handleFileChange(e, 'file')} />

            <button
              type="submit"
              disabled={!nouveauMessage.trim() && !attachment}
              className="w-12 h-12 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-2xl shadow-xl transition-all shrink-0 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[9px] text-gray-400 mt-3 text-center font-bold uppercase tracking-widest">Maintenez le micro pour enregistrer un message vocal</p>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        .animate-progress { animation: progress 3s linear infinite; }
      `}} />
    </Layout>
  );
}
