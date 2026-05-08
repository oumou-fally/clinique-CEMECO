import { useMemo, useState, useEffect } from 'react'
import { Download, Eye, Search, Check, AlertCircle, Plus, X, TrendingUp, Printer } from 'lucide-react'
import Layout from '../layouts/Layout'
import ComposantFormulaireFacture from './ComposantFormulaire'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const STATUTS_LABEL = {
  'en_attente': 'En attente',
  'payee': 'Payée',
  'annulee': 'Annulée'
}

const STATUTS_CLASSES = {
  'en_attente': 'bg-amber-50 text-amber-600 border-amber-100',
  'payee': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'annulee': 'bg-rose-50 text-rose-600 border-rose-100'
}

const FORMULAIRE_INITIAL = {
  patient_id: '',
  type_consultation_id: '',
  patient_nom: '',
  service: '',
  montant: '',
  date: new Date().toISOString().split('T')[0],
  patientType: 'non-insured',
  paymentMethod: 'cash',
  insuranceProvider: '',
  bankName: '',
  bank_account_number: '',
  orangeNumber: '',
  orange_transaction_id: ''
}

export default function ComposantFacturation() {
  const [factures, setFactures] = useState([])
  const [patients, setPatients] = useState([])
  const [typesConsultation, setTypesConsultation] = useState([])
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDetailsVisible, setModalDetailsVisible] = useState(false)
  const [selectedFacture, setSelectedFacture] = useState(null)
  const [factureForm, setFactureForm] = useState(FORMULAIRE_INITIAL)
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [fRes, pRes, tRes] = await Promise.all([
        fetch(`${API_URL}/api/secretaire/factures`),
        fetch(`${API_URL}/api/secretaire/patients`),
        fetch(`${API_URL}/api/secretaire/types-consultation`)
      ])
      
      const [fData, pData, tData] = await Promise.all([
        fRes.json(), pRes.json(), tRes.json()
      ])

      if (fData.success) setFactures(fData.factures || [])
      if (pData.success) setPatients(pData.patients || [])
      if (tData.success) setTypesConsultation(tData.types || [])
    } catch (err) {
      console.error("Erreur fetch:", err)
    } finally {
      setLoading(false)
    }
  }

  const facturesAffichees = useMemo(() => {
    return factures.filter(f => {
      const searchStr = `${f.patient_nom} ${f.id}`.toLowerCase()
      const matchRecherche = searchStr.includes(recherche.toLowerCase())
      const matchFiltre = filtre === 'tous' || f.statut === filtre
      return matchRecherche && matchFiltre
    })
  }, [factures, recherche, filtre])

  const stats = useMemo(() => {
    const total = factures.reduce((acc, f) => acc + Number(f.montant || 0), 0)
    const payee = factures.filter(f => f.statut === 'payee').reduce((acc, f) => acc + Number(f.montant || 0), 0)
    const attente = factures.filter(f => f.statut === 'en_attente').reduce((acc, f) => acc + Number(f.montant || 0), 0)
    return { total, payee, attente }
  }, [factures])

  const gererChangement = (e) => {
    const { name, value } = e.target
    setFactureForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'patient_id') {
        const p = patients.find(item => item.id == value)
        updated.patient_nom = p ? `${p.prenom} ${p.nom}` : ''
      }
      if (name === 'type_consultation_id') {
        const t = typesConsultation.find(item => item.id == value)
        updated.service = t ? t.nom : ''
        updated.montant = t ? t.prix : ''
      }
      return updated
    })
  }

  const enregistrerFacture = async () => {
    if (!factureForm.patient_id || !factureForm.type_consultation_id) {
      setErreur('Informations manquantes')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/secretaire/factures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...factureForm, statut: 'en_attente' })
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
        setModalVisible(false)
        setFactureForm(FORMULAIRE_INITIAL)
      } else {
        setErreur(data.message)
      }
    } catch (err) {
      setErreur('Erreur serveur')
    }
  }

  const marquerPayee = async (id) => {
    if (!window.confirm("Valider le paiement de cette facture ?")) return
    try {
      const res = await fetch(`${API_URL}/api/secretaire/factures/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'payee' })
      })
      const data = await res.json()
      if (data.success) fetchData()
    } catch (err) {
      alert("Erreur de mise à jour")
    }
  }

  const imprimerRecu = () => {
    window.print()
  }

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tableau de Facturation</h1>
            <p className="text-sm text-slate-500 font-medium italic">Gestion des règlements patients</p>
          </div>
          <button 
            onClick={() => setModalVisible(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition"
          >
            <Plus className="w-5 h-5" /> Créer Facture
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600"><TrendingUp /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Émis</p>
                <p className="text-xl font-black">{stats.total.toLocaleString()} GNF</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white"><Check /></div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Encaissé</p>
                <p className="text-xl font-black text-emerald-700">{stats.payee.toLocaleString()} GNF</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white"><AlertCircle /></div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">En Attente</p>
                <p className="text-xl font-black text-amber-700">{stats.attente.toLocaleString()} GNF</p>
              </div>
            </div>
          </div>
        </div>

        {/* LISTE DES FACTURES */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Chercher un patient..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              {['tous', 'en_attente', 'payee'].map(k => (
                <button 
                  key={k} 
                  onClick={() => setFiltre(k)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${filtre === k ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {k === 'tous' ? 'Toutes' : k === 'payee' ? 'Payées' : 'En attente'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">ID Facture</th>
                  <th className="px-6 py-4">Patient & Service</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">Chargement...</td></tr>
                ) : facturesAffichees.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-400">#FAC-{f.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{f.patient_prenom} {f.patient_nom_db || f.patient_nom}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{f.service}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">{Number(f.montant).toLocaleString()} GNF</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUTS_CLASSES[f.statut]}`}>
                        {STATUTS_LABEL[f.statut]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedFacture(f); setModalDetailsVisible(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        {f.statut === 'en_attente' && (
                          <button onClick={() => marquerPayee(f.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODALS */}
        <ComposantFormulaireFacture 
          showModal={modalVisible}
          onClose={() => setModalVisible(false)}
          formData={factureForm}
          onFormChange={gererChangement}
          onAddInvoice={enregistrerFacture}
          patients={patients}
          typesConsultation={typesConsultation}
        />

        {modalDetailsVisible && selectedFacture && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-full print:shadow-none print:rounded-none">
              
              {/* Actions Header (Caché à l'impression) */}
              <div className="p-6 border-b flex justify-between items-center print:hidden">
                <h2 className="text-xl font-bold">Reçu de paiement</h2>
                <div className="flex gap-2">
                  <button onClick={imprimerRecu} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm"><Printer className="w-4 h-4" /> Imprimer</button>
                  <button onClick={() => setModalDetailsVisible(false)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X /></button>
                </div>
              </div>

              {/* CONTENU DU REÇU (ZONE IMPRIMABLE) */}
              <div id="print-area" className="p-10 space-y-8">
                
                {/* Logo & Clinique */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
                  <div>
                    <h1 className="text-4xl font-black text-emerald-600 tracking-tighter">CEMECO</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Clinique Médico-Chirurgicale</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Conakry, République de Guinée<br/>Tél: +224 622 00 00 00</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black uppercase text-slate-900">REÇU</h3>
                    <p className="font-mono text-sm text-slate-500 font-bold mt-1">N° FAC-{selectedFacture.id}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tighter">Date: {new Date(selectedFacture.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {/* Infos Client */}
                <div className="grid grid-cols-2 gap-8 py-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Facturé à :</p>
                    <p className="text-xl font-black text-slate-900">{selectedFacture.patient_prenom} {selectedFacture.patient_nom_db || selectedFacture.patient_nom}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1">Patient {selectedFacture.patient_type === 'insured' ? 'Assuré' : 'Non Assuré'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut de règlement :</p>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${STATUTS_CLASSES[selectedFacture.statut]}`}>
                      {STATUTS_LABEL[selectedFacture.statut]}
                    </span>
                  </div>
                </div>

                {/* Table des Services */}
                <div className="border-2 border-slate-50 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Désignation de l'acte médical</th>
                        <th className="px-6 py-4 text-right">Montant (GNF)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="px-6 py-6 font-bold text-slate-800">
                          {selectedFacture.service}
                          <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">Prestation réalisée à la Clinique CEMECO</p>
                        </td>
                        <td className="px-6 py-6 text-right font-black text-xl text-slate-900">
                          {Number(selectedFacture.montant).toLocaleString()} GNF
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totaux & Paiement */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-50 p-8 rounded-[2rem]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode de paiement utilisé :</p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{selectedFacture.payment_method?.replace('-', ' ')}</p>
                    {selectedFacture.insurance_provider && <p className="text-xs font-bold text-emerald-600">Assurance : {selectedFacture.insurance_provider}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Payé :</p>
                    <p className="text-4xl font-black text-emerald-600">{Number(selectedFacture.montant).toLocaleString()} <span className="text-lg">GNF</span></p>
                  </div>
                </div>

                {/* Signature / Cachet */}
                <div className="pt-12 grid grid-cols-2 gap-12 text-center border-t border-dashed border-slate-200">
                  <div className="space-y-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-2 decoration-emerald-100 underline-offset-4">Signature Patient</p>
                    <div className="h-20"></div>
                  </div>
                  <div className="space-y-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-2 decoration-emerald-100 underline-offset-4">Cachet Secrétariat</p>
                    <div className="h-20 flex items-center justify-center italic text-slate-300 font-black text-4xl opacity-10 rotate-12">CEMECO</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
