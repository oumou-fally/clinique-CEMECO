import { Calendar, FileText, Stethoscope, Phone, MapPin, Clock, ArrowRight, Heart, AlertCircle, MessageCircle, RefreshCw, User, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import AppointmentForm from '../components/AppointmentForm'
import AskDoctorForm from '../components/AskDoctorForm'

export default function TableauDeBordPatient() {
  const { user, patientId, isAuthenticated } = useAuth()
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showConsultationForm, setShowConsultationForm] = useState(false)
  
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    stats: { rdv_count: 0, medecin_count: 0, dossier_count: 0 },
    profile: {}
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/patient/dashboard/${patientId}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Erreur dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, [patientId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mb-4" />
          <p className="text-gray-500 font-bold">Initialisation de votre espace santé...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Bonjour, <span className="text-teal-600">{user?.prenom} {user?.nom}</span> ! 👋
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Heureux de vous revoir. Voici le résumé de votre suivi à la clinique.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Patient</p>
            <p className="font-bold text-gray-900">{patientId}</p>
          </div>
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alert / Reminder */}
      {dashboardData.appointments.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white flex items-center justify-between shadow-xl shadow-blue-100 overflow-hidden relative group">
          <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="w-40 h-40" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-black uppercase tracking-widest">Prochain Rendez-vous</p>
              <h3 className="text-xl font-bold mt-1">
                {new Date(dashboardData.appointments[0].date_rendez_vous).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {dashboardData.appointments[0].heure_rendez_vous.substring(0,5)}
              </h3>
              <p className="text-blue-50 text-sm opacity-80">Avec Dr. {dashboardData.appointments[0].medecin_nom}</p>
            </div>
          </div>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition shadow-lg relative z-10">
            Détails
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rendez-vous</p>
          </div>
          <p className="text-4xl font-black text-gray-900">{dashboardData.stats.rdv_count}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Consultations à venir</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Stethoscope className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spécialistes</p>
          </div>
          <p className="text-4xl font-black text-gray-900">{dashboardData.stats.medecin_count}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Médecins consultés</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archives</p>
          </div>
          <p className="text-4xl font-black text-gray-900">{dashboardData.stats.dossier_count}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Dossiers & Comptes-rendus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-600 rounded-full"></div>
              Prochains RDV
            </h2>
            <Link to="/dashboard/planning" className="text-teal-600 font-bold text-sm hover:underline">Voir tout</Link>
          </div>

          <div className="space-y-6">
            {dashboardData.appointments.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold">Aucun rendez-vous prévu</p>
              </div>
            ) : (
              dashboardData.appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm">
                      <p className="text-[10px] font-black text-teal-600 uppercase">
                        {new Date(appointment.date_rendez_vous).toLocaleDateString('fr-FR', { month: 'short' })}
                      </p>
                      <p className="text-2xl font-black text-gray-900">
                        {new Date(appointment.date_rendez_vous).getDate()}
                      </p>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">Dr. {appointment.medecin_nom} {appointment.medecin_prenom}</p>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">{appointment.specialite}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end text-gray-900 font-black mb-1">
                      <Clock className="w-4 h-4 text-teal-600" />
                      {appointment.heure_rendez_vous.substring(0,5)}
                    </div>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest">Confirmé</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => setShowAppointmentForm(true)}
            className="w-full mt-8 py-5 bg-teal-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all flex items-center justify-center gap-3"
          >
            <Calendar className="w-6 h-6" />
            Prendre un nouveau rendez-vous
          </button>
        </div>

        {/* Quick Access & Profile */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              Profil Médical
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-2xl flex justify-between items-center border border-red-100">
                <span className="text-sm font-bold text-red-900">Groupe Sanguin</span>
                <span className="text-lg font-black text-red-600">{dashboardData.profile.groupe_sanguin || 'N/A'}</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Allergies</p>
                <div className="p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700">
                  {dashboardData.profile.allergies || 'Aucune allergie déclarée'}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Antécédents</p>
                <div className="p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 leading-relaxed italic">
                  "{dashboardData.profile.antecedent_personnel || 'Non renseigné'}"
                </div>
              </div>
            </div>
            <Link to="/dashboard/profile" className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-100">
              Compléter mon profil
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/consultations" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition group text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                <MessageCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Conseil</p>
            </Link>
            <Link to="/dashboard/medical-record" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition group text-center">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Dossier</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Forms */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSubmit={() => fetchDashboardData()}
      />

      <AskDoctorForm
        isOpen={showConsultationForm}
        onClose={() => setShowConsultationForm(false)}
      />
    </Layout>
  )
}
