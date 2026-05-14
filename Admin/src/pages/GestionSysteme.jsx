import Layout from '../layouts/Layout'
import { 
  Clock, Stethoscope, Shield, ToggleRight, Save, Activity, Heart, 
  UserCheck, Bell, Info, RefreshCw, CheckCircle2, Globe, Mail, 
  Phone, MapPin, Users, Calendar, ClipboardList, TrendingUp
} from 'lucide-react'
import { useState, useEffect } from 'react'

const ICON_MAP = {
    'Heart': Heart,
    'Activity': Activity,
    'Stethoscope': Stethoscope,
    'Shield': Shield
};

export default function GestionSysteme() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    patients: 0,
    rendezVous: 0,
    dossiers: 0,
    medecins: 0
  })
  const [horaires, setHoraires] = useState({})
  const [specialites, setSpecialites] = useState([])
  const [comptes, setComptes] = useState([])
  const [cliniqueInfo, setCliniqueInfo] = useState({
    nom: 'Cabinet de Cardiologie CEMECO',
    adresse: '',
    telephone: '',
    email: '',
    site_web: ''
  })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Charger les Stats Globales
      const resStats = await fetch(`${API_URL}/api/admin/stats`)
      const dataStats = await resStats.json()
      if (dataStats.success) {
          setStats({
              patients: dataStats.metrics?.patients || 0,
              rendezVous: dataStats.metrics?.todayAppointments || 0,
              dossiers: dataStats.metrics?.medicalRecords || 0,
              medecins: dataStats.metrics?.medecins || 0
          })
      }

      // 2. Charger les infos clinique
      const resInfo = await fetch(`${API_URL}/api/admin/parametres/info`)
      const dataInfo = await resInfo.json()
      if (dataInfo.success) setCliniqueInfo(dataInfo.data)

      // 3. Charger le personnel
      const resPers = await fetch(`${API_URL}/api/personnel`)
      const dataPers = await resPers.json()
      if (dataPers.success) {
        setComptes(dataPers.personnel || [])
      }

      // 4. Charger les horaires
      const resHor = await fetch(`${API_URL}/api/admin/parametres/horaires`)
      const dataHor = await resHor.json()
      if (dataHor.success) {
          const horMap = {};
          dataHor.data.forEach(h => {
              horMap[h.jour] = { debut: h.debut.substring(0, 5), fin: h.fin.substring(0, 5), actif: Boolean(h.actif) };
          });
          setHoraires(horMap);
      }

      // 5. Charger le Plateau Technique (Types de consultation)
      const resSpec = await fetch(`${API_URL}/api/admin/parametres/types-consultation`)
      const dataSpec = await resSpec.json()
      if (dataSpec.success) {
          setSpecialites(dataSpec.data.map(s => ({
              ...s,
              icon: s.nom.toLowerCase().includes('chirurgie') ? Stethoscope : 
                    s.nom.toLowerCase().includes('électro') ? Activity : Heart
          })));
      }

    } catch (error) {
      console.error('Erreur systeme:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
      return (
          <Layout>
              <div className="flex flex-col items-center justify-center h-[70vh] text-indigo-400">
                  <div className="relative">
                      <Heart className="w-16 h-16 animate-pulse" />
                      <RefreshCw className="w-6 h-6 animate-spin absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm" />
                  </div>
                  <p className="font-black uppercase tracking-[0.3em] text-[10px] mt-6">Analyse du Système Médical...</p>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="space-y-10 pb-20 animate-in fade-in duration-700">
        
        {/* Header - Cabinet de Cardiologie */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors duration-1000"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <Heart className="w-10 h-10 text-white fill-current" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{cliniqueInfo.nom}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Centre Spécialisé</span>
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Système Opérationnel
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchData} className="p-4 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-indigo-50">
                        <RefreshCw className="w-6 h-6" />
                    </button>
                    <div className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-200 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Spécialistes</p>
                            <p className="text-2xl font-black">{stats.medecins}</p>
                        </div>
                        <Stethoscope className="w-8 h-8 opacity-40" />
                    </div>
                </div>
            </div>
        </div>

        {/* Stats de Supervision */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Total Patients', value: stats.patients, icon: Users, color: 'bg-blue-600' },
                { label: 'Rendez-vous Jour', value: stats.rendezVous, icon: Calendar, color: 'bg-emerald-600' },
                { label: 'Dossiers Médicaux', value: stats.dossiers, icon: ClipboardList, color: 'bg-amber-600' },
                { label: 'Performance', value: '98%', icon: TrendingUp, color: 'bg-rose-600' }
            ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-black text-gray-900">{s.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
                        <s.icon className="w-6 h-6" />
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Section Identité & Localisation */}
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/30 border border-indigo-50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex items-center gap-4 bg-linear-to-r from-gray-50 to-white">
                    <Globe className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-black text-gray-900">Localisation & Contact</h2>
                </div>
                <div className="p-10 space-y-8">
                    <div className="flex items-start gap-6 group">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Adresse Physique</p>
                            <p className="text-gray-900 font-bold leading-relaxed">{cliniqueInfo.adresse || 'Kipé, Conakry, Guinée'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center gap-6 group">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Téléphone</p>
                                <p className="text-gray-900 font-bold">{cliniqueInfo.telephone || '+224 000 00 00 00'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 group">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-gray-900 font-bold">{cliniqueInfo.email || 'contact@cemeco.gn'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plateau Technique (Spécialités) */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/30 border border-indigo-50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex items-center gap-4 bg-linear-to-r from-gray-50 to-white">
                    <Activity className="w-6 h-6 text-rose-500" />
                    <h2 className="text-2xl font-black text-gray-900">Plateau Technique Cardiologique</h2>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {specialites.map((spec) => (
                        <div key={spec.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl transition-all group flex items-center gap-5">
                            <div className="p-4 bg-white rounded-2xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                                <spec.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-sm">{spec.nom}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Opérationnel</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Sidebar: Horaires & Personnel */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Horaires d'Ouverture */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/30 border border-indigo-50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-linear-to-r from-gray-50 to-white">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-black text-gray-900">Infrastructure Temporelle</h2>
                </div>
                <div className="p-8 space-y-3">
                    {Object.entries(horaires).map(([jour, info]) => (
                        <div key={jour} className={`flex items-center justify-between p-4 rounded-2xl border ${info.actif ? 'bg-indigo-50/20 border-indigo-50' : 'bg-gray-50 border-transparent opacity-50'}`}>
                            <span className="font-black text-gray-900 capitalize text-xs">{jour}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400">{info.actif ? `${info.debut} - ${info.fin}` : 'Fermé'}</span>
                                {info.actif && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Personnel de Garde */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/30 border border-indigo-50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-linear-to-r from-gray-50 to-white">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-black text-gray-900">Équipe Médicale Active</h2>
                </div>
                <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {comptes.map((p) => (
                        <div key={`${p.role}-${p.id}`} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    {p.nom.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-[11px] leading-none">{p.prenom} {p.nom}</p>
                                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1 inline-block">{p.role}</span>
                                </div>
                            </div>
                            <div className="px-2 py-1 bg-white rounded-lg text-[8px] font-black text-emerald-600 border border-emerald-50 uppercase tracking-tighter">Connecté</div>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </Layout>
  )
}
