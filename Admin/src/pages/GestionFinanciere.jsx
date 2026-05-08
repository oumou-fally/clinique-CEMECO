import Layout from '../layouts/Layout'
import { 
  CreditCard, TrendingUp, FileText, Download, 
  DollarSign, Calendar, Search, ArrowUpRight, 
  ArrowDownRight, PieChart, Activity, Wallet,
  Smartphone, Building, Banknote, User
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

export default function GestionFinanciere() {
  const [recherche, setRecherche] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    fetchFinances()
  }, [])

  const getHeaders = () => {
    const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
    return {
      'Content-Type': 'application/json',
      'x-admin-role': adminData.role || ''
    }
  }

  const fetchFinances = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/finances`, {
        headers: getHeaders()
      })
      const result = await res.json()
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Erreur finances:', error)
    } finally {
      setLoading(false)
    }
  }

  const transactionsFiltrees = useMemo(() => {
    if (!data?.paiements) return []
    return data.paiements.filter(p => {
      const matchSearch = p.patient.toLowerCase().includes(recherche.toLowerCase()) || 
                          p.service.toLowerCase().includes(recherche.toLowerCase())
      const matchStatut = filterStatut === 'tous' || p.statut === filterStatut
      return matchSearch && matchStatut
    })
  }, [data, recherche, filterStatut])

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'payee': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'en_attente': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'annulee': return 'bg-rose-100 text-rose-700 border-rose-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getMethodeIcon = (methode) => {
    switch (methode) {
      case 'cash': return <Banknote className="w-4 h-4" />
      case 'orange-money': return <Smartphone className="w-4 h-4 text-orange-500" />
      case 'banque': return <Building className="w-4 h-4 text-blue-500" />
      case 'cheque': return <FileText className="w-4 h-4 text-purple-500" />
      default: return <Wallet className="w-4 h-4" />
    }
  }

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-GN', { 
      style: 'currency', 
      currency: 'GNF', 
      minimumFractionDigits: 0 
    }).format(montant || 0)
  }

  return (
    <Layout>
      <div className="space-y-10 pb-20 bg-slate-50 min-h-screen p-8 rounded-[3rem]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="text-blue-600 w-10 h-10" />
              Pilotage Financier
            </h1>
            <p className="text-slate-500 font-medium mt-1">Supervision des encaissements et analyses budgétaires en temps réel.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-4 rounded-2xl transition-all font-black text-sm shadow-sm">
              <Download className="w-5 h-5" /> Export PDF
            </button>
            <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl transition-all font-black text-sm shadow-xl shadow-slate-200">
              <Calendar className="w-5 h-5" /> Rapport Périodique
            </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform">
              <DollarSign className="w-20 h-20" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Chiffre d'Affaires</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : formatMontant(data?.kpis?.totalRevenus)}</h3>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-emerald-500 text-xs font-black flex items-center">
                <ArrowUpRight className="w-4 h-4" /> +15.4%
              </span>
              <span className="text-[10px] text-slate-400 font-bold">vs mois dernier</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recettes du Jour</p>
            <h3 className="text-2xl font-black text-blue-600">{loading ? '...' : formatMontant(data?.kpis?.revenusJour)}</h3>
            <p className="mt-4 text-[10px] text-slate-400 font-bold italic">{data?.kpis?.nbVentesJour} transactions aujourd'hui</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recouvrement Attendu</p>
            <h3 className="text-2xl font-black text-amber-600">{loading ? '...' : formatMontant(data?.kpis?.totalEnAttente)}</h3>
            <p className="mt-4 text-[10px] text-slate-400 font-bold italic">{data?.kpis?.nbFacturesAttente} factures en attente</p>
          </div>

          <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 opacity-20">
              <TrendingUp className="w-24 h-24 text-white" />
            </div>
            <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-4">Taux de Paiement</p>
            <h3 className="text-2xl font-black text-white">
              {data?.kpis ? Math.round((data.kpis.nbFacturesPayees / (data.kpis.nbFacturesPayees + data.kpis.nbFacturesAttente)) * 100) : 0}%
            </h3>
            <p className="mt-4 text-[10px] text-white/70 font-bold">Performance de collecte</p>
          </div>
        </div>

        {/* Charts and Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-900">Flux de Trésorerie</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Patient, service..." 
                      className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      value={recherche}
                      onChange={(e) => setRecherche(e.target.value)}
                    />
                  </div>
                  <select 
                    className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                  >
                    <option value="tous">Tous les statuts</option>
                    <option value="payee">Payées</option>
                    <option value="en_attente">En attente</option>
                    <option value="annulee">Annulées</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="pb-4 pl-2">Patient / Service</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Méthode</th>
                      <th className="pb-4">Montant</th>
                      <th className="pb-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="py-4 h-12 bg-slate-50 rounded-lg"></td></tr>)
                    ) : transactionsFiltrees.map((p) => (
                      <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-2">
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{p.patient}</p>
                            <p className="text-xs text-slate-400 font-bold">{p.service}</p>
                          </div>
                        </td>
                        <td className="py-5">
                          <p className="text-xs font-bold text-slate-600">{new Date(p.date).toLocaleDateString('fr-FR')}</p>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                            {getMethodeIcon(p.methode)}
                            <span className="capitalize">{p.methode?.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <p className="font-black text-slate-900">{formatMontant(p.montant)}</p>
                        </td>
                        <td className="py-5">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatutColor(p.statut)}`}>
                            {p.statut?.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Analytics */}
          <div className="space-y-8">
            {/* Revenue per Month (Visual Mini Chart) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Tendance
              </h3>
              <div className="space-y-4">
                {data?.revenus?.map((r, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">{r.mois}</span>
                      <span className="text-slate-900">{formatMontant(r.montant)}</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${(r.montant / data.kpis.totalRevenus) * 100 * 2}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods Distribution */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <PieChart className="text-blue-400" /> Méthodes
              </h3>
              <div className="space-y-6">
                {data?.methodes?.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        {getMethodeIcon(m.methode)}
                      </div>
                      <span className="text-sm font-bold capitalize">{m.methode?.replace('-', ' ')}</span>
                    </div>
                    <span className="text-sm font-black">{Math.round((m.total / data.kpis.totalRevenus) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
