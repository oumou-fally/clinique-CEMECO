import { useState, useEffect } from 'react'
import { 
  ArrowRight, BarChart3, Calendar, CreditCard, 
  FileText, Shield, Settings, Users, Activity, 
  Clock, ChevronRight, TrendingUp, DollarSign,
  Briefcase, Heart, PieChart, Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../layouts/Layout'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getHeaders = () => {
    const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
    return {
      'Content-Type': 'application/json',
      'x-admin-role': adminData.role || ''
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        headers: getHeaders()
      })
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Erreur dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatGNF = (val) => {
    return new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0 }).format(val || 0)
  }

  return (
    <Layout>
      <div className="space-y-8 pb-20 bg-slate-50/50 min-h-screen p-2 rounded-[3rem]">
        
        {/* TOP BAR / WELCOME */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Système Opérationnel
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Tableau de Bord <span className="text-blue-600">Admin</span>
            </h1>
            <p className="text-slate-500 font-medium">Bienvenue, {user?.nomComplet || user?.name}. Pilotage global de la clinique CEMECO.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
            {['overview', 'medical', 'financial'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'overview' ? 'Général' : tab === 'medical' ? 'Médical' : 'Finances'}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse">Analyse des flux de données...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+4%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{data?.kpis?.totalPatients}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Aujourd'hui</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rendez-vous</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{data?.kpis?.rdvAujourdhui}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-orange-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Médecins Actifs</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{data?.kpis?.totalMedecins}</h3>
                  </div>

                  <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-100 text-white relative overflow-hidden">
                    <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4">Chiffre d'Affaires</p>
                    <h3 className="text-2xl font-black">{formatGNF(data?.kpis?.revenuTotal)}</h3>
                    <p className="text-[10px] text-white/50 mt-4 italic">Total encaissé cumulé</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-blue-600" />
                        Activité du Flux
                      </h2>
                      <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Voir tout</button>
                    </div>
                    <div className="space-y-6">
                      {data?.recentActivity?.map((act, i) => (
                        <div key={i} className="flex items-center justify-between group p-4 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              act.type === 'Nouvelle Facture' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {act.type === 'Nouvelle Facture' ? <DollarSign size={20} /> : <Calendar size={20} />}
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{act.sujet}</p>
                              <p className="text-xs text-slate-400 font-bold">{act.type} • {act.info}</p>
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-slate-300 uppercase">{new Date(act.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient Type Distribution */}
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                      <PieChart className="text-blue-400" /> Profil Patients
                    </h3>
                    <div className="space-y-10">
                      <div className="relative h-48 flex items-center justify-center">
                        <div className="absolute inset-0 border-[16px] border-blue-600/20 rounded-full" />
                        <div 
                          className="absolute inset-0 border-[16px] border-blue-500 rounded-full" 
                          style={{ clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)` }}
                        />
                        <div className="text-center">
                          <p className="text-4xl font-black">{data?.kpis?.totalPatients}</p>
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Inscrits</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl">
                          <p className="text-2xl font-black text-blue-400">{data?.patientDistribution?.assures}</p>
                          <p className="text-[10px] font-black text-white/50 uppercase">Assurés</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl">
                          <p className="text-2xl font-black text-slate-400">{data?.patientDistribution?.nonAssures}</p>
                          <p className="text-[10px] font-black text-white/50 uppercase">Particuliers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* MEDICAL TAB */}
            {activeTab === 'medical' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Activity className="text-emerald-500" /> Performance Médecins
                  </h3>
                  <div className="space-y-8">
                    {data?.medicalAnalysis?.topMedecins?.map((m, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="font-black text-slate-900">Dr. {m.prenom} {m.nom}</p>
                            <p className="text-xs text-slate-400 font-bold">{m.specialite}</p>
                          </div>
                          <p className="text-sm font-black text-blue-600">{m.nb_consultations} rdv</p>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${(m.nb_consultations / (data?.medicalAnalysis?.topMedecins[0]?.nb_consultations || 1)) * 100}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col justify-center items-center text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-6">
                    <Heart size={40} className="animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Qualité de Soins</h3>
                  <p className="text-slate-500 max-w-xs mt-2 font-medium">L'analyse médicale montre une augmentation de 12% de la complétion des dossiers ce mois-ci.</p>
                  <button className="mt-8 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all text-sm">
                    Rapport de Qualité
                  </button>
                </div>
              </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <TrendingUp className="text-blue-600" /> Revenus par Service
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.financialAnalysis?.revenusParType?.map((rev, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rev.nom}</p>
                        <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{formatGNF(rev.total)}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 italic">{rev.nb} factures émises</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black mb-4">Objectif Mensuel</h3>
                    <p className="text-blue-100 font-medium opacity-80">Suivi de la performance financière globale de la clinique.</p>
                  </div>
                  <div className="space-y-6 mt-12">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-black">
                        <span>Progression</span>
                        <span>82%</span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full w-[82%]" />
                      </div>
                    </div>
                    <button className="w-full py-4 bg-white text-blue-900 font-black rounded-2xl hover:bg-blue-50 transition-all text-sm">
                      Détails Finances
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QUICK ACTIONS FOOTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/dashboard/users" className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Personnel</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Gérer les comptes</p>
                </div>
              </Link>
              <Link to="/dashboard/finance" className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Factures</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Historique complet</p>
                </div>
              </Link>
              <Link to="/dashboard/system" className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <Settings size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Paramètres</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Configuration</p>
                </div>
              </Link>
            </div>

          </div>
        )}
      </div>
    </Layout>
  )
}
