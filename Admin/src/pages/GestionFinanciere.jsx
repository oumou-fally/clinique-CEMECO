import Layout from '../layouts/Layout'
import { 
  CreditCard, TrendingUp, FileText, Download, 
  DollarSign, Calendar, Search, ArrowUpRight, 
  ArrowDownRight, PieChart, Activity, Wallet,
  Smartphone, Building, Banknote, User, Check, X, Eye, Printer, Clock
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

export default function GestionFinanciere() {
  const [recherche, setRecherche] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('tous')
  const [debut, setDebut] = useState('')
  const [fin, setFin] = useState('')
  const [activeTab, setActiveTab] = useState('general') // 'general', 'validation', 'creances'
  const [processing, setProcessing] = useState(false)
  const [selectedFacture, setSelectedFacture] = useState(null)
  const [modalDetailsVisible, setModalDetailsVisible] = useState(false)
  const [versionRecu, setVersionRecu] = useState('assurance')
  const [selectedInsurerClaims, setSelectedInsurerClaims] = useState(null)
  const [factureHistory, setFactureHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [assurancePayees, setAssurancePayees] = useState([])
  const [assurancePayeesLoading, setAssurancePayeesLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const getHeaders = () => {
    const adminData = JSON.parse(localStorage.getItem('admin_user') || '{}')
    return {
      'Content-Type': 'application/json',
      'x-admin-role': adminData.role || ''
    }
  }

  useEffect(() => {
    const calculerDates = () => {
      const aujourdhui = new Date();
      const y = aujourdhui.getFullYear();
      const m = aujourdhui.getMonth();

      switch (periode) {
        case 'ce_mois': {
          const d = new Date(y, m, 1);
          setDebut(d.toISOString().split('T')[0]);
          setFin(aujourdhui.toISOString().split('T')[0]);
          break;
        }
        case 'mois_dernier': {
          const dStart = new Date(y, m - 1, 1);
          const dEnd = new Date(y, m, 0);
          setDebut(dStart.toISOString().split('T')[0]);
          setFin(dEnd.toISOString().split('T')[0]);
          break;
        }
        case '3_derniers_mois': {
          const dStart = new Date(y, m - 3, 1);
          setDebut(dStart.toISOString().split('T')[0]);
          setFin(aujourdhui.toISOString().split('T')[0]);
          break;
        }
        case 'tous': {
          setDebut('');
          setFin('');
          break;
        }
        default:
          break;
      }
    };
    calculerDates();
  }, [periode]);

  const fetchFinances = async () => {
    setLoading(true)
    try {
      let url = `${API_URL}/api/admin/finances`
      if (debut && fin) {
        url += `?debut=${debut}&fin=${fin}`
      }
      const res = await fetch(url, {
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

  useEffect(() => {
    if (periode === 'personnalise' && (!debut || !fin)) return;
    fetchFinances();
    fetchAssurancePayees();
  }, [debut, fin, periode]);

  const fetchAssurancePayees = async () => {
    setAssurancePayeesLoading(true)
    try {
      let url = `${API_URL}/api/admin/finances/assurances/payees`
      if (debut && fin) {
        url += `?debut=${debut}&fin=${fin}`
      }
      const res = await fetch(url, {
        headers: getHeaders()
      })
      const result = await res.json()
      if (result.success) {
        setAssurancePayees(result.factures || [])
      } else {
        console.error('Erreur factures assurance payées:', result.message)
        setAssurancePayees([])
      }
    } catch (err) {
      console.error('Erreur factures assurance payées:', err)
      setAssurancePayees([])
    } finally {
      setAssurancePayeesLoading(false)
    }
  }

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedFacture?.id) {
        setFactureHistory([])
        return
      }
      setHistoryLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/secretaire/factures/${selectedFacture.id}/history`, {
          headers: getHeaders()
        })
        const result = await res.json()
        if (result.success) {
          setFactureHistory(result.history || [])
        } else {
          console.error('Erreur chargement historique:', result.message)
          setFactureHistory([])
        }
      } catch (err) {
        console.error('Erreur chargement historique:', err)
        setFactureHistory([])
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [selectedFacture])

  const validerRemboursement = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir valider cet encaissement d'assurance ? Cela ajustera la comptabilité comme payée.")) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/finances/${id}/valider`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        alert("Encaissement validé avec succès !");
        await fetchFinances();
      } else {
        alert(result.message || "Erreur lors de la validation");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    } finally {
      setProcessing(false);
    }
  };

  const rejeterRemboursement = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter cette demande de remboursement ? La facture retournera en attente côté secrétaire.")) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/finances/${id}/rejeter`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        alert("Demande rejetée avec succès.");
        await fetchFinances();
      } else {
        alert(result.message || "Erreur lors du rejet");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    } finally {
      setProcessing(false);
    }
  };

  const transactionsFiltrees = useMemo(() => {
    if (!data?.paiements) return []
    return data.paiements.filter(p => {
      const matchSearch = p.patient.toLowerCase().includes(recherche.toLowerCase()) || 
                          p.service.toLowerCase().includes(recherche.toLowerCase())
      const matchStatut = filterStatut === 'tous' || p.statut === filterStatut
      return matchSearch && matchStatut
    })
  }, [data, recherche, filterStatut])

  const facturesEnValidation = useMemo(() => {
    if (!data?.paiements) return []
    return data.paiements.filter(p => p.statut === 'en_cours_validation')
  }, [data])

  const assurancesPortefeuille = useMemo(() => {
    if (!data?.paiements) return [];
    const facturesAssur = data.paiements.filter(p => p.patient_type === 'insured');
    const grouped = {};
    
    facturesAssur.forEach(f => {
      const prov = f.insurance_provider || 'Inconnu';
      if (!grouped[prov]) {
        grouped[prov] = {
          nom: prov,
          totalEmis: 0,
          totalRecouvre: 0,
          totalEnAttente: 0,
          totalEnValidation: 0,
          factures: []
        };
      }
      const amt = Number(f.montant_assurance || 0);
      grouped[prov].totalEmis += amt;
      if (f.statut === 'payee') {
        grouped[prov].totalRecouvre += amt;
      } else if (f.statut === 'en_cours_validation') {
        grouped[prov].totalEnValidation += amt;
      } else if (f.statut === 'en_attente') {
        grouped[prov].totalEnAttente += amt;
      }
      grouped[prov].factures.push(f);
    });
    
    return Object.values(grouped);
  }, [data]);

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'payee': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'en_attente': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'en_cours_validation': return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse font-black'
      case 'annulee': return 'bg-rose-100 text-rose-700 border-rose-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getMethodeIcon = (methode) => {
    switch (methode) {
      case 'cash': return <DollarSign className="w-4 h-4 text-emerald-600" />
      case 'orange-money': return <Smartphone className="w-4 h-4 text-orange-600" />
      case 'cheque': return <CreditCard className="w-4 h-4 text-blue-600" />
      default: return <Wallet className="w-4 h-4 text-slate-400" />
    }
  }

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-GN', { 
      style: 'currency', 
      currency: 'GNF', 
      minimumFractionDigits: 0 
    }).format(montant || 0)
  }

  const imprimerRelanceAssurance = (insurerGroup) => {
    setSelectedInsurerClaims(insurerGroup);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const imprimerFacture = (facture) => {
    setSelectedFacture(facture)
    setVersionRecu(facture.patient_type === 'insured' ? 'assurance' : 'patient')
    setModalDetailsVisible(true)
    setTimeout(() => {
      window.print()
    }, 500)
  }

  return (
    <Layout>
      <div className="space-y-10 pb-20 bg-slate-50 min-h-screen p-8 rounded-[3rem] print-container">
        
        {/* Printable Official Header */}
        <div className="print-only mb-10 p-6 border-b-2 border-slate-900 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">CLINIQUE CARDIOLOGIQUE CEMECO</h1>
              <p className="text-xs text-slate-500 font-bold mt-1">Pilotage Financier & Gestion des Assurances</p>
              <p className="text-[10px] text-slate-400 font-bold">Conakry, République de Guinée</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-900">RAPPORT FINANCIER DE SYNTHÈSE</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Généré le : {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
              <p className="text-[10px] text-slate-500 font-bold">Période : {
                periode === 'tous' ? 'Tous les temps' :
                periode === 'ce_mois' ? 'Ce mois (Mois en cours)' :
                periode === 'mois_dernier' ? 'Mois dernier' :
                periode === '3_derniers_mois' ? '3 derniers mois' :
                `Du ${new Date(debut).toLocaleDateString('fr-FR')} au ${new Date(fin).toLocaleDateString('fr-FR')}`
              }</p>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .print-only { display: none; }
          @media print {
            aside, .lg\\:hidden, div.fixed, button, select, input, .no-print, .modal-backdrop {
              display: none !important;
            }
            div.lg\\:ml-64, div.lg\\:ml-20, main.lg\\:ml-64 {
              margin-left: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            main {
              margin-left: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            body, html {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-container {
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 0 !important;
            }
            .print-only {
              display: block !important;
            }
            tr {
              page-break-inside: avoid !important;
            }
          }
        `}} />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="text-blue-600 w-10 h-10" />
              Pilotage Financier
            </h1>
            <p className="text-slate-500 font-medium mt-1">Supervision des encaissements, recouvrements et validation des assurances en temps réel.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <select 
                value={periode} 
                onChange={(e) => setPeriode(e.target.value)}
                className="bg-transparent border-none text-sm font-black text-slate-700 outline-none cursor-pointer focus:ring-0"
              >
                <option value="tous">Tous les temps</option>
                <option value="ce_mois">Mois en cours</option>
                <option value="mois_dernier">Mois dernier</option>
                <option value="3_derniers_mois">3 derniers mois</option>
                <option value="personnalise">Période personnalisée</option>
              </select>
            </div>

            {periode === 'personnalise' && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                <input 
                  type="date" 
                  value={debut} 
                  onChange={(e) => setDebut(e.target.value)} 
                  className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-bold">au</span>
                <input 
                  type="date" 
                  value={fin} 
                  onChange={(e) => setFin(e.target.value)} 
                  className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none focus:ring-0 cursor-pointer"
                />
              </div>
            )}

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Rapport de Synthèse
            </button>
          </div>
        </div>

        {/* KPI Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 no-print">
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <TrendingUp className="w-16 h-16 text-slate-950" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenus Encaissés (Patients + Assur.)</p>
            <h3 className="text-xl font-black text-slate-900">{loading ? '...' : formatMontant(data?.kpis?.totalRevenus)}</h3>
            <p className="mt-3 text-[9px] text-emerald-600 font-black tracking-wider flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> {data?.kpis?.nbFacturesPayees || 0} factures payées
            </p>
          </div>

          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <User className="w-16 h-16 text-slate-950" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Direct (Part Patient)</p>
            <h3 className="text-xl font-black text-slate-900">{loading ? '...' : formatMontant(data?.kpis?.totalRevenusPatient)}</h3>
            <p className="mt-3 text-[9px] text-slate-400 font-bold">Frais directs perçus à la caisse</p>
          </div>

          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <Building className="w-16 h-16 text-slate-950" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tiers-Payant (Part Assurances Remboursée)</p>
            <h3 className="text-xl font-black text-slate-900">{loading ? '...' : formatMontant(data?.kpis?.totalRevenusAssurance)}</h3>
            <p className="mt-3 text-[9px] text-blue-600 font-bold">Remboursements perçus et validés</p>
            <p className="mt-2 text-[10px] text-slate-500 font-semibold">{assurancePayeesLoading ? 'Chargement...' : `${assurancePayees.length} facture(s) payée(s) par assurance`}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[2rem] shadow-xl shadow-blue-100 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <Clock className="w-16 h-16 text-white animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">Attente Validation Admin</p>
            <h3 className="text-xl font-black text-white">{loading ? '...' : formatMontant(data?.kpis?.totalValidation)}</h3>
            <p className="mt-3 text-[9px] text-white/80 font-black tracking-wider uppercase">
              {data?.kpis?.nbFacturesValidation || 0} demande(s) en attente
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-[2rem] shadow-xl shadow-orange-100 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <Wallet className="w-16 h-16 text-white" />
            </div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">Créances non Recouvrées</p>
            <h3 className="text-xl font-black text-white">{loading ? '...' : formatMontant(data?.kpis?.totalEnAttente)}</h3>
            <p className="mt-3 text-[9px] text-white/80 font-bold">{data?.kpis?.nbFacturesAttente || 0} factures en attente</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 p-1.5 bg-slate-200/60 rounded-3xl w-max no-print">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'general'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-300/40'
              }`}
          >
            <Activity className="w-4 h-4" /> Flux & Analyses
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 relative cursor-pointer ${activeTab === 'validation'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-300/40'
              }`}
          >
            <Clock className="w-4 h-4" /> Demandes de Validation
            {data?.kpis?.nbFacturesValidation > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {data.kpis.nbFacturesValidation}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('creances')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'creances'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-300/40'
              }`}
          >
            <Building className="w-4 h-4" /> Portefeuille Assurances
          </button>
        </div>

        {/* Tab Switch Rendering */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transactions List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Flux de Trésorerie</h2>
                  <div className="flex gap-2 no-print">
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
                      className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                    >
                      <option value="tous">Tous les statuts</option>
                      <option value="payee">Payées</option>
                      <option value="en_attente">En attente</option>
                      <option value="en_cours_validation">Validation Admin</option>
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
                        <th className="pb-4 text-center no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="py-4 h-12 bg-slate-50 rounded-lg"></td></tr>)
                      ) : transactionsFiltrees.length === 0 ? (
                        <tr><td colSpan="6" className="py-8 text-center text-slate-400 italic">Aucune transaction trouvée</td></tr>
                      ) : transactionsFiltrees.map((p) => (
                        <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 pl-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{p.patient}</p>
                                {p.patient_type === 'insured' && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-blue-200">
                                    {p.insurance_provider} ({p.coverage_rate}%)
                                  </span>
                                )}
                              </div>
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
                            {p.methode === 'cheque' && p.cheque_number && (
                              <p className="text-[9px] text-purple-600 font-bold mt-0.5">Chq: {p.cheque_number} ({p.bank_name})</p>
                            )}
                            {p.methode === 'orange-money' && p.orange_transaction_id && (
                              <p className="text-[9px] text-orange-500 font-bold mt-0.5">Ref: {p.orange_transaction_id}</p>
                            )}
                          </td>
                          <td className="py-5">
                            <p className="font-black text-slate-900">{formatMontant(p.montant)}</p>
                            {p.patient_type === 'insured' && (
                              <div className="text-[9px] font-bold space-y-0.5 mt-0.5">
                                <p className="text-slate-500">Patient: {formatMontant(p.montant_patient)}</p>
                                <p className="text-blue-600">Assur.: {formatMontant(p.montant_assurance)}</p>
                              </div>
                            )}
                          </td>
                          <td className="py-5">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatutColor(p.statut)}`}>
                              {p.statut === 'en_cours_validation' ? 'Validation Admin' : p.statut?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-5 text-center no-print">
                            <button
                              onClick={() => { setSelectedFacture(p); setVersionRecu(p.patient_type === 'insured' ? 'assurance' : 'patient'); setModalDetailsVisible(true); }}
                              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all inline-flex items-center justify-center cursor-pointer active:scale-90"
                              title="Voir / Imprimer le reçu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Side Analytics */}
            <div className="space-y-8 no-print">
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
                          style={{ width: `${(r.montant / (data?.kpis?.totalRevenus || 1)) * 100 * 2}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Distribution */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <PieChart className="text-blue-400" /> Méthodes (Encaissements)
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
                      <span className="text-sm font-black">
                        {data?.kpis?.totalRevenusPatient > 0 ? Math.round((m.total / data.kpis.totalRevenusPatient) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance Claims Distribution */}
              {data?.assurances && data.assurances.length > 0 && (
                <div className="bg-blue-950 rounded-[2.5rem] p-8 text-white border border-blue-900/50">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Building className="text-blue-400 animate-pulse" /> Répartition Assurances
                  </h3>
                  <div className="space-y-6">
                    {data.assurances.map((a, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Building className="w-4 h-4 text-blue-300" />
                          </div>
                          <span className="text-sm font-bold">{a.assurance}</span>
                        </div>
                        <span className="text-sm font-black">
                          {data?.kpis?.totalRevenusAssurance > 0 ? Math.round((a.total / data.kpis.totalRevenusAssurance) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Validation Pending Approvals */}
        {activeTab === 'validation' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 no-print">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Demandes de Validation de Remboursement</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">Audit comptable et confirmation des virements/chèques émis par les assureurs.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 pl-2">Facture</th>
                    <th className="pb-4">Patient / Compagnie</th>
                    <th className="pb-4">Prestation</th>
                    <th className="pb-4">Référence de Règlement</th>
                    <th className="pb-4 text-right">Montant Assurance</th>
                    <th className="pb-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facturesEnValidation.length === 0 ? (
                    <tr><td colSpan="6" className="py-12 text-center text-slate-400 italic font-bold">Aucune demande de validation en attente.</td></tr>
                  ) : facturesEnValidation.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pl-2">
                        <span className="font-mono font-bold text-slate-400">#FAC-{f.id}</span>
                      </td>
                      <td className="py-5">
                        <p className="font-black text-slate-900">{f.patient}</p>
                        <p className="text-xs text-blue-600 font-bold">{f.insurance_provider} ({f.coverage_rate}%)</p>
                      </td>
                      <td className="py-5">
                        <p className="text-sm font-semibold text-slate-700">{f.service}</p>
                      </td>
                      <td className="py-5">
                        <span className="bg-blue-50 text-blue-800 font-mono font-black text-xs px-3 py-1.5 rounded-xl border border-blue-100">
                          {f.validation_ref || 'Non fournie'}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <p className="font-black text-slate-900">{formatMontant(f.montant_assurance)}</p>
                        <p className="text-[9px] text-slate-400 font-bold">Total: {formatMontant(f.montant)}</p>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => validerRemboursement(f.id)}
                            disabled={processing}
                            className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all cursor-pointer active:scale-90"
                            title="Approuver l'encaissement"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejeterRemboursement(f.id)}
                            disabled={processing}
                            className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer active:scale-90"
                            title="Rejeter la demande"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedFacture(f); setVersionRecu('assurance'); setModalDetailsVisible(true); }}
                            className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all cursor-pointer active:scale-90"
                            title="Visualiser la facture de tiers-payant"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Portefeuille Assurances */}
        {activeTab === 'creances' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 no-print">
            <div className="mb-6 flex justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Suivi des Créances par Compagnie d'Assurance</h2>
                <p className="text-slate-500 text-xs font-semibold mt-1">Solde global, montants recouvrés, encaissements en validation et relance des assureurs.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 pl-2">Assureur</th>
                    <th className="pb-4 text-right">Total Emis</th>
                    <th className="pb-4 text-right">Recouvré (Validé)</th>
                    <th className="pb-4 text-right">En cours de validation</th>
                    <th className="pb-4 text-right">Solde restant dû</th>
                    <th className="pb-4 text-center">Taux</th>
                    <th className="pb-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assurancesPortefeuille.length === 0 ? (
                    <tr><td colSpan="7" className="py-12 text-center text-slate-400 italic font-bold">Aucune créance enregistrée pour le moment.</td></tr>
                  ) : assurancesPortefeuille.map((ap, i) => {
                    const soldeDu = ap.totalEnAttente + ap.totalEnValidation;
                    const tauxRecouvrement = ap.totalEmis > 0 ? Math.round((ap.totalRecouvre / ap.totalEmis) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                              <Building className="w-5 h-5" />
                            </div>
                            <span className="font-black text-slate-900 text-sm">{ap.nom}</span>
                          </div>
                        </td>
                        <td className="py-5 text-right font-bold text-slate-700">{formatMontant(ap.totalEmis)}</td>
                        <td className="py-5 text-right font-black text-emerald-600">{formatMontant(ap.totalRecouvre)}</td>
                        <td className="py-5 text-right font-black text-blue-600">{formatMontant(ap.totalEnValidation)}</td>
                        <td className="py-5 text-right font-black text-rose-600">{formatMontant(ap.totalEnAttente)}</td>
                        <td className="py-5 text-center">
                          <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-black border ${tauxRecouvrement >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {tauxRecouvrement}%
                          </span>
                        </td>
                        <td className="py-5 text-center">
                          <button
                            onClick={() => imprimerRelanceAssurance(ap)}
                            className="px-4 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5 mx-auto cursor-pointer active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5" /> Imprimer Relance
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Printable Relance d'Assurance Letterhead */}
        {selectedInsurerClaims && (
          <div className="print-only p-8 bg-white text-black font-sans min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">CLINIQUE CARDIOLOGIQUE CEMECO</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Conakry, République de Guinée | Tél: +224 622 00 00 00</p>
                <p className="text-xs text-slate-400 font-medium">Banque: BICIGUI S.A. | IBAN: GN76 0001 0203 0405 0607 08</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ÉTAT DE CRÉANCE POUR TIERS-PAYANT</p>
                <p className="text-lg font-black text-slate-900 mt-2">Compagnie : {selectedInsurerClaims.nom}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">Date d'émission : {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  Madame, Monsieur,<br /><br />
                  Veuillez trouver ci-dessous l'état détaillé des créances dues par votre compagnie **{selectedInsurerClaims.nom}** pour les prestations médicales fournies aux assurés affiliés à votre organisme au sein de notre établissement.
                </p>
              </div>

              {/* Invoices List Table */}
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Détail des factures en attente de règlement</h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2">N° Facture</th>
                      <th className="py-2">Patient (Assuré)</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Prestation</th>
                      <th className="py-2 text-right">Montant Total</th>
                      <th className="py-2 text-right">Part Assurance ({selectedInsurerClaims.factures[0]?.coverage_rate}%)</th>
                      <th className="py-2 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInsurerClaims.factures.map((f) => (
                      <tr key={f.id} className="py-2">
                        <td className="py-3 font-mono font-bold">#FAC-{f.id}</td>
                        <td className="py-3 font-bold">{f.patient}</td>
                        <td className="py-3">{new Date(f.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-3 font-medium">{f.service}</td>
                        <td className="py-3 text-right">{formatMontant(f.montant)}</td>
                        <td className="py-3 text-right font-black text-blue-700">{formatMontant(f.montant_assurance)}</td>
                        <td className="py-3 text-center capitalize font-bold">{f.statut.replace('_', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary and Financials */}
              <div className="flex justify-end pt-6">
                <div className="w-96 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Total Prestations :</span>
                    <span className="text-slate-900">{formatMontant(selectedInsurerClaims.factures.reduce((acc, f) => acc + Number(f.montant || 0), 0))}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-600">Total Réglé par Assurés :</span>
                    <span className="text-emerald-700">{formatMontant(selectedInsurerClaims.factures.reduce((acc, f) => acc + Number(f.montant_patient || 0), 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 text-blue-800">
                    <span>Total Dû par l'Assureur :</span>
                    <span>{formatMontant(selectedInsurerClaims.totalEnAttente + selectedInsurerClaims.totalEnValidation)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="pt-8 space-y-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Instructions de Règlement</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Nous vous prions de bien vouloir procéder au règlement de la somme de **{formatMontant(selectedInsurerClaims.totalEnAttente + selectedInsurerClaims.totalEnValidation)}** par virement bancaire sur notre compte ouvert à la BICIGUI S.A. sous 30 jours à réception du présent état, en précisant les numéros de factures en référence.
                </p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-12 text-xs">
                <div className="text-center w-48">
                  <p className="font-bold text-slate-400 mb-12">Le Responsable Comptable</p>
                  <p className="font-black text-slate-800">S. Camara</p>
                  <div className="text-[9px] text-slate-400 mt-1 italic">Signé électroniquement</div>
                </div>
                <div className="text-center w-48">
                  <p className="font-bold text-slate-400 mb-12">Le Directeur de la Clinique</p>
                  <p className="font-black text-slate-800">Dr. M. Soumah</p>
                  <div className="text-[9px] text-slate-400 mt-1 italic">Cachet & Signature officiels</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice detailed modal view */}
        {modalDetailsVisible && selectedFacture && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-300 modal-backdrop">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Facture de Tiers-Payant</h3>
                  <p className="text-xs text-slate-400 font-semibold">N° FAC-{selectedFacture.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedFacture.patient_type === 'insured' && (
                    <div className="flex p-0.5 bg-slate-200/80 rounded-xl">
                      <button
                        onClick={() => setVersionRecu('patient')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${versionRecu === 'patient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                      >
                        Patient
                      </button>
                      <button
                        onClick={() => setVersionRecu('assurance')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${versionRecu === 'assurance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                      >
                        Assurance
                      </button>
                    </div>
                  )}
                  <button onClick={() => setModalDetailsVisible(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all cursor-pointer">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">CLINIQUE CARDIOLOGIQUE CEMECO</h2>
                    <p className="text-xs text-slate-500">Conakry, Guinée</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">DATE</p>
                    <p className="text-sm font-black text-slate-700">{new Date(selectedFacture.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <p className="font-black text-slate-400 uppercase mb-2">Facturé à</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedFacture.patient}</p>
                    <p className="text-slate-500 mt-1">Patient {selectedFacture.patient_type === 'insured' ? 'Assuré' : 'Non Assuré'}</p>
                  </div>
                  {selectedFacture.patient_type === 'insured' && (
                    <div>
                      <p className="font-black text-slate-400 uppercase mb-2">Organisme de Couverture</p>
                      <p className="font-black text-blue-700 text-sm">{selectedFacture.insurance_provider}</p>
                      <p className="text-slate-500 mt-1">Prise en charge: {selectedFacture.coverage_rate}%</p>
                    </div>
                  )}
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                      <tr>
                        <th className="p-4">Prestation médicale</th>
                        <th className="p-4 text-right">Montant Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-100">
                        <td className="p-4 font-bold text-slate-800">{selectedFacture.service}</td>
                        <td className="p-4 text-right font-black text-slate-900">{formatMontant(selectedFacture.montant)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="w-80 ml-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                  {versionRecu === 'patient' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">Montant Prestations:</span>
                        <span className="font-bold text-slate-800">{formatMontant(selectedFacture.montant)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>Prise en charge ({selectedFacture.coverage_rate}%):</span>
                        <span>- {formatMontant(selectedFacture.montant_assurance)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 text-slate-900">
                        <span>Net à Payer (Patient):</span>
                        <span>{formatMontant(selectedFacture.montant_patient)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">Montant Prestations:</span>
                        <span className="font-bold text-slate-800">{formatMontant(selectedFacture.montant)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Réglement direct du patient:</span>
                        <span>- {formatMontant(selectedFacture.montant_patient)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 text-blue-800">
                        <span>Net dû par l'Assureur:</span>
                        <span>{formatMontant(selectedFacture.montant_assurance)}</span>
                      </div>
                    </>
                  )}
                </div>

                {selectedFacture.statut === 'en_cours_validation' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-blue-800">Demande de validation en attente d'audit</p>
                      <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Référence fournie: {selectedFacture.validation_ref}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { validerRemboursement(selectedFacture.id); setModalDetailsVisible(false); }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all shadow-md cursor-pointer"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => { rejeterRemboursement(selectedFacture.id); setModalDetailsVisible(false); }}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-700 transition-all shadow-md cursor-pointer"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Historique de validation</h4>
                      <p className="text-[10px] text-slate-400">Suivi complet des actions sur la facture.</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{historyLoading ? 'Chargement...' : `${factureHistory.length} événement(s)`}</span>
                  </div>
                  {historyLoading ? (
                    <p className="text-xs text-slate-500">Chargement de l'historique...</p>
                  ) : factureHistory.length === 0 ? (
                    <p className="text-xs text-slate-400">Aucun historique disponible pour cette facture.</p>
                  ) : (
                    <div className="space-y-3">
                      {factureHistory.map((entry) => {
                        const oldStatut = entry.old_value ? JSON.parse(entry.old_value)?.statut : null
                        const newStatut = entry.new_value ? JSON.parse(entry.new_value)?.statut : null
                        const summary = entry.note
                          ? entry.note
                          : oldStatut && newStatut && oldStatut !== newStatut
                            ? `${STATUTS_LABEL[oldStatut] || oldStatut} → ${STATUTS_LABEL[newStatut] || newStatut}`
                            : entry.action.replace(/_/g, ' ')
                        return (
                          <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide text-slate-400">{entry.action.replace(/_/g, ' ')}</p>
                                <p className="text-sm font-bold text-slate-900">{summary}</p>
                              </div>
                              <p className="text-[10px] text-slate-500">{new Date(entry.created_at).toLocaleString('fr-FR')}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3 text-[10px] text-slate-600">
                              <div>Rôle: {entry.user_role || 'N/A'}</div>
                              <div>Utilisateur: {entry.user_id || 'N/A'}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex justify-end gap-2">
                <button
                  onClick={() => { setModalDetailsVisible(false); imprimerFacture(selectedFacture); }}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Imprimer Reçu
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
