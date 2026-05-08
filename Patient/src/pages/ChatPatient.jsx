import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { 
  Send, ArrowLeft, CheckCircle2, MessageSquare, 
  Image as ImageIcon, Mic, Paperclip, FileText, Download, Play, Trash2, RefreshCw
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

  // Charger les infos du médecin et les messages
  const fetchData = async () => {
    if (!patientId || !medecinId) return;
    try {
      // Charger les messages
      const resMsg = await fetch(`/api/messagerie/conversation/${patientId}/${medecinId}`);
      const dataMsg = await resMsg.json();
      if (dataMsg.success) {
        setMessages(dataMsg.data);
        
        // Marquer comme lu
        const nonLus = dataMsg.data.some(m => m.expediteur === 'medecin' && m.lu === 0);
        if (nonLus) {
          await fetch('/api/messagerie/marquer-lu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_patient: patientId, id_medecin: medecinId, pour_qui: 'patient' })
          });
        }
      }

      // Charger les infos du médecin via la liste des discussions (simple way)
      const resDisc = await fetch(`/api/messagerie/patient/${patientId}/discussions`);
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

    setNouveauMessage('');
    setAttachment(null);
    setAttachmentType('text');

    try {
      const response = await fetch('/api/messagerie/envoyer', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-50 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard/consultations')}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition"
            >
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
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
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
                      ? 'bg-teal-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.type === 'image' && msg.fichier_url && (
                      <div className="mb-3 rounded-xl overflow-hidden shadow-md">
                        <img 
                          src={`${msg.fichier_url}`} 
                          alt="Shared" 
                          className="max-w-full h-auto cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(`${msg.fichier_url}`, '_blank')}
                        />
                      </div>
                    )}

                    {msg.type === 'vocal' && msg.fichier_url && (
                      <div className={`mb-3 p-3 rounded-2xl flex items-center gap-3 ${isPatient ? 'bg-teal-500' : 'bg-teal-50'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPatient ? 'bg-white text-teal-600' : 'bg-teal-600 text-white'}`}>
                          <Play className="w-5 h-5" />
                        </div>
                        <audio controls className="h-8 max-w-[150px] md:max-w-[200px]">
                          <source src={`${msg.fichier_url}`} type="audio/webm" />
                        </audio>
                      </div>
                    )}

                    {msg.type === 'file' && msg.fichier_url && (
                      <div className={`mb-3 p-4 rounded-2xl flex items-center gap-4 border ${isPatient ? 'bg-teal-700/50 border-teal-400' : 'bg-gray-50 border-gray-200'}`}>
                        <FileText className={`w-8 h-8 ${isPatient ? 'text-teal-200' : 'text-teal-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isPatient ? 'text-white' : 'text-gray-900'}`}>Document</p>
                          <a 
                            href={`${msg.fichier_url}`} 
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

          <form onSubmit={envoyerMessage} className="flex items-end gap-3 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 focus-within:border-teal-300 focus-within:bg-white transition-all">
            <div className="flex items-center gap-1 pl-2 mb-2">
              <button type="button" onClick={() => imageInputRef.current.click()} className="p-2.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded-full transition">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => fileInputRef.current.click()} className="p-2.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded-full transition">
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`p-2.5 rounded-full transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-teal-600 hover:bg-white'}`}>
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
              className="w-12 h-12 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-2xl shadow-lg transition-all shrink-0 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
