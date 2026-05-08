import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { 
  Search, MessageSquare, Send, ArrowLeft, Clock, User, 
  CheckCircle2, AlertCircle, RefreshCw, Filter,
  Image as ImageIcon, Mic, Paperclip, FileText, Download, Play, Plus, X, Trash2
} from 'lucide-react';

export default function Consultations() {
  const navigate = useNavigate();
  const { medecinId: activeMedecinId } = useParams();
  const patientId = localStorage.getItem('patientId');

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, answered
  
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Charger les discussions
  const fetchDiscussions = async (showLoading = false) => {
    if (!patientId) return;
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`/api/messagerie/patient/${patientId}/discussions`);
      const data = await response.json();
      if (data.success) {
        setDiscussions(data.data);
        // Si un medecinId est dans l'URL, on le sélectionne
        if (activeMedecinId) {
          const disc = data.data.find(d => d.medecin_id === parseInt(activeMedecinId));
          if (disc) setSelectedDiscussion(disc);
        }
      }
    } catch (error) {
      console.error('Erreur discussions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les messages
  const fetchMessages = async (medecinId) => {
    if (!patientId || !medecinId) return;
    try {
      const response = await fetch(`/api/messagerie/conversation/${patientId}/${medecinId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        
        // Marquer comme lu
        const aDesMessagesNonLus = data.data.some(m => m.expediteur === 'medecin' && m.lu === 0);
        if (aDesMessagesNonLus) {
          await fetch('/api/messagerie/marquer-lu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_patient: patientId, id_medecin: medecinId, pour_qui: 'patient' })
          });
          // Update local discussions count if needed
        }
      }
    } catch (error) {
      console.error('Erreur messages:', error);
    }
  };

  useEffect(() => {
    fetchDiscussions(true);
    const interval = setInterval(() => fetchDiscussions(), 10000);
    return () => clearInterval(interval);
  }, [patientId]);

  useEffect(() => {
    let interval;
    if (selectedDiscussion) {
      fetchMessages(selectedDiscussion.medecin_id);
      interval = setInterval(() => fetchMessages(selectedDiscussion.medecin_id), 4000);
    }
    return () => clearInterval(interval);
  }, [selectedDiscussion]);

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
    if (!selectedDiscussion) return;

    const formData = new FormData();
    formData.append('id_medecin', selectedDiscussion.medecin_id);
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
        fetchMessages(selectedDiscussion.medecin_id);
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const filteredDiscussions = discussions.filter(d => {
    const nomComplet = `Dr. ${d.medecin_prenom} ${d.medecin_nom}`.toLowerCase();
    const matchesSearch = nomComplet.includes(searchTerm.toLowerCase()) || 
                          (d.dernier_message && d.dernier_message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'pending') return matchesSearch && d.expediteur === 'patient';
    if (activeTab === 'answered') return matchesSearch && d.expediteur === 'medecin';
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
        {/* En-tête de la Messagerie */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-teal-600" />
              Centre de Conseils
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Échangez en toute confidentialité avec vos médecins traitants</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchDiscussions(true)}
              className={`p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 transition ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/dashboard/doctors')}
              className="flex items-center gap-2 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-100 transition active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Question
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          {/* Sidebar Conversations */}
          <div className="w-full md:w-[380px] flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden shrink-0">
            <div className="p-4 border-b border-gray-50 space-y-4">
              <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                {['all', 'pending', 'answered'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === tab ? 'bg-white text-teal-600 shadow-sm border border-teal-50' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'all' ? 'Tous' : tab === 'pending' ? 'Attente' : 'Réponses'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un médecin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-gray-300 opacity-50">
                  <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-bold uppercase tracking-tighter">Chargement...</p>
                </div>
              ) : filteredDiscussions.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-bold text-sm">Aucun échange trouvé</p>
                </div>
              ) : (
                filteredDiscussions.map((disc) => (
                  <div
                    key={disc.medecin_id}
                    onClick={() => setSelectedDiscussion(disc)}
                    className={`p-5 cursor-pointer transition-all hover:bg-teal-50/50 group relative ${
                      selectedDiscussion?.medecin_id === disc.medecin_id ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    {selectedDiscussion?.medecin_id === disc.medecin_id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600 rounded-r-full shadow-[2px_0_10px_rgba(20,184,166,0.4)]"></div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform shadow-sm">
                          {disc.medecin_nom.charAt(0)}
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
                            Dr. {disc.medecin_prenom} {disc.medecin_nom}
                          </h3>
                          <span className="text-[10px] font-black text-gray-400 uppercase">
                            {new Date(disc.date_envoi).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{disc.medecin_specialite}</p>
                        <p className={`text-xs truncate leading-relaxed ${disc.non_lus > 0 ? 'text-teal-900 font-black' : 'text-gray-500 font-medium'}`}>
                          {disc.expediteur === 'patient' ? 'Vous : ' : ''}{disc.dernier_message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
            {selectedDiscussion ? (
              <>
                {/* Header Chat */}
                <div className="px-8 py-6 bg-white border-b border-gray-50 flex items-center justify-between z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-teal-100">
                      {selectedDiscussion.medecin_nom.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">
                        Dr. {selectedDiscussion.medecin_prenom} {selectedDiscussion.medecin_nom}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">En ligne</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                  {messages.map((msg, idx) => {
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
                  })}
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
                      placeholder="Écrivez votre message..."
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-32 h-32 bg-teal-50 rounded-[3rem] flex items-center justify-center mb-8 animate-bounce duration-[4000ms]">
                  <MessageSquare className="w-16 h-16 text-teal-600 opacity-50" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Vos Conseils Médicaux</h2>
                <p className="text-gray-500 mt-4 max-w-sm text-lg font-medium leading-relaxed">
                  Sélectionnez un médecin sur la gauche pour voir l'historique de vos échanges ou poser une question.
                </p>
                <div className="mt-12 p-8 bg-gradient-to-br from-teal-500 to-green-600 rounded-[2.5rem] shadow-2xl text-white max-w-sm relative overflow-hidden group cursor-pointer hover:scale-105 transition-all" onClick={() => navigate('/dashboard/doctors')}>
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-32 h-32" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Besoin d'aide ?</p>
                  <p className="text-xl font-bold leading-tight">Envoyez une nouvelle demande à un spécialiste</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
