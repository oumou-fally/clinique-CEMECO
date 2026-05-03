import { useState, useEffect } from 'react'
import Layout from '../layouts/Layout'
import { Star, MapPin, Phone, Mail, Calendar, MessageCircle, Search, Filter, RefreshCw, UserPlus } from 'lucide-react'
import AskDoctorForm from '../components/AskDoctorForm'
import AppointmentForm from '../components/AppointmentForm'

export default function Medecins() {
  const [showAskForm, setShowAskForm] = useState(false)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [mesMedecins, setMesMedecins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const patientId = localStorage.getItem('patientId')

  const fetchMesMedecins = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/patient/medecins/${patientId}/mes-medecins`);
      const data = await response.json();
      if (data.success) {
        setMesMedecins(data.data);
      }
    } catch (error) {
      console.error('Erreur récupération médecins:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMesMedecins();
  }, [patientId]);

  const filteredDoctors = mesMedecins.filter(doc => 
    `${doc.nom} ${doc.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mes Médecins Traitants</h1>
          <p className="text-gray-500 font-medium mt-1">Spécialistes vous ayant déjà consulté</p>
        </div>
        <button 
          onClick={fetchMesMedecins}
          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 transition shadow-sm"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8 relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher parmi vos médecins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition font-medium"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <RefreshCw className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">Chargement de votre équipe médicale...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm px-6">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="w-10 h-10 text-teal-600 opacity-20" />
          </div>
          <h3 className="text-xl font-black text-gray-900">Aucun médecin trouvé</h3>
          <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">
            {searchTerm 
              ? "Aucun de vos médecins ne correspond à cette recherche." 
              : "Vous n'avez pas encore effectué de consultation à la clinique CEMECO."}
          </p>
          {!searchTerm && (
            <button className="mt-8 px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition">
              Découvrir nos spécialistes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all group">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 to-green-600 p-8 text-white relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Star className="w-32 h-32" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <h3 className="text-2xl font-black">{doctor.nom} {doctor.prenom}</h3>
                    <p className="text-teal-50 font-bold uppercase tracking-widest text-[10px] mt-1">{doctor.specialty}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-black">{doctor.rating}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Clinique</p>
                      <p className="text-sm font-bold text-gray-700">Kipé, Conakry</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Disponibilité</p>
                      <p className="text-sm font-bold text-gray-700">Lun - Sam</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-gray-500 hover:text-teal-600 transition cursor-pointer">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 hover:text-teal-600 transition cursor-pointer">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{doctor.email}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor)
                      setShowAppointmentForm(true)
                    }}
                    className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Reprogrammer
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor)
                      setShowAskForm(true)
                    }}
                    className="flex-1 py-4 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Conseil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AskDoctorForm
        isOpen={showAskForm}
        onClose={() => {
          setShowAskForm(false)
          setSelectedDoctor(null)
        }}
        selectedDoctorId={selectedDoctor?.id}
        onSubmit={async (formData) => {
          try {
            const response = await fetch('http://localhost:3000/api/messagerie/envoyer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id_medecin: selectedDoctor?.id || formData.doctor,
                id_patient: patientId,
                expediteur: 'patient',
                sujet: formData.subject,
                priorite: formData.priority,
                message: formData.message
              })
            });
            const data = await response.json();
            if (data.success) {
              alert('Votre question a été envoyée avec succès.');
            }
          } catch (error) {
            console.error('Erreur envoi:', error);
          }
          setShowAskForm(false);
          setSelectedDoctor(null);
        }}
      />

      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false)
          setSelectedDoctor(null)
        }}
        selectedDoctorId={selectedDoctor?.id}
        onSubmit={(formData) => {
          alert('Demande de reprogrammation envoyée au Dr. ' + selectedDoctor?.nom);
          setShowAppointmentForm(false)
          setSelectedDoctor(null)
        }}
      />
    </Layout>
  )
}

function Stethoscope(props) {
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
      <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z" />
      <path d="M10 2v2" />
      <path d="M7 2v2" />
      <path d="M3 14c0-3 3-6 7-6s7 3 7 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3Z" />
      <path d="M15 8h2a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2h-2" />
    </svg>
  )
}
