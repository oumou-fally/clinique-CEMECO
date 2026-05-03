import { useState, useEffect } from 'react'
import Layout from '../layouts/Layout'
import { MessageCircle, Send, CheckCircle, Clock, AlertCircle, Plus, Filter, Search, RefreshCw } from 'lucide-react'
import AskDoctorForm from '../components/AskDoctorForm'
import { DOCTORS } from '../data/clinicData'

export default function Consultations() {
  const [showAskForm, setShowAskForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const patientId = localStorage.getItem('patientId')

  const fetchDiscussions = async (showLoading = false) => {
    if (!patientId) return;
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`http://localhost:3000/api/messagerie/patient/${patientId}/discussions`);
      const data = await response.json();
      if (data.success) {
        setDiscussions(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement messagerie:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDiscussions(true);
    const interval = setInterval(fetchDiscussions, 10000);
    return () => clearInterval(interval);
  }, [patientId]);

  const handleConsultationSubmit = async (formData) => {
    try {
      const response = await fetch('http://localhost:3000/api/messagerie/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_medecin: formData.doctor,
          id_patient: patientId,
          expediteur: 'patient',
          sujet: formData.subject,
          priorite: formData.priority,
          message: formData.message
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Votre question a été envoyée avec succès au médecin.');
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
    }
    setShowAskForm(false);
  }

  const filteredConsultations = discussions.filter(d => {
    const matchesSearch =
      (d.sujet && d.sujet.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.medecin_nom && d.medecin_nom.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === 'pending') return matchesSearch && d.expediteur === 'patient'
    if (activeTab === 'answered') return matchesSearch && d.expediteur === 'medecin'
    return matchesSearch
  })

  const ConsultationCard = ({ consultation }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 border-teal-500 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{consultation.sujet || 'Conseil Médical'}</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              consultation.expediteur === 'medecin' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {consultation.expediteur === 'medecin' ? 'Répondu' : 'En attente'}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            Dr. {consultation.medecin_prenom} {consultation.medecin_nom}
          </p>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase">
          {new Date(consultation.date_envoi).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
          <p className="text-sm text-gray-700 leading-relaxed italic">"{consultation.dernier_message}"</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
        {consultation.expediteur === 'patient' ? (
          <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            <span>Réponse attendue</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle className="w-4 h-4" />
            <span>Réponse reçue</span>
          </div>
        )}
        <button 
          onClick={() => alert('Ouverture du chat...')}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-teal-100"
        >
          Voir la conversation
        </button>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mes Conseils Médicaux</h1>
          <p className="text-gray-500 font-medium mt-1">Retrouvez vos échanges avec nos spécialistes</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchDiscussions(true)}
            className={`p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 transition ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAskForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-100 transition"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Question
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="font-black text-blue-900 uppercase text-xs tracking-widest">Assistance Médicale</p>
          <p className="text-sm text-blue-800 mt-1 font-medium leading-relaxed">
            Vos questions sont traitées par nos cardiologues. Une réponse est généralement apportée sous 24h. 
            <span className="font-black"> Pour toute urgence vitale, contactez immédiatement le SAMU.</span>
          </p>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par médecin ou sujet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition font-medium"
          />
        </div>
        <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm shrink-0">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'pending', label: 'En attente' },
            { id: 'answered', label: 'Répondues' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-teal-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="font-bold">Chargement de vos échanges...</p>
          </div>
        ) : filteredConsultations.length > 0 ? (
          filteredConsultations.map(consultation => (
            <ConsultationCard key={consultation.medecin_id} consultation={consultation} />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Aucun échange trouvé</h3>
            <p className="text-gray-500 mt-2 font-medium max-w-xs mx-auto">
              Posez votre première question à nos spécialistes en cliquant sur le bouton "Nouvelle Question".
            </p>
          </div>
        )}
      </div>

      {/* Stats Quick View */}
      {!loading && discussions.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Échanges</p>
            <p className="text-3xl font-black text-gray-900">{discussions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Réponses Reçues</p>
            <p className="text-3xl font-black text-teal-600">{discussions.filter(d => d.expediteur === 'medecin').length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">En Attente</p>
            <p className="text-3xl font-black text-amber-600">{discussions.filter(d => d.expediteur === 'patient').length}</p>
          </div>
        </div>
      )}

      {/* Ask Doctor Form Modal */}
      <AskDoctorForm
        isOpen={showAskForm}
        onClose={() => setShowAskForm(false)}
        onSubmit={handleConsultationSubmit}
      />
    </Layout>
  )
}
