import { useMemo, useState, useEffect } from 'react';
import { 
  Download, Eye, Search, Check, AlertCircle, Plus, X, 
  TrendingUp, Printer, User, Phone, MapPin, Calendar, 
  DollarSign, CreditCard, Smartphone, Building, FileText,
  ChevronRight, Stethoscope, Clock, Activity
} from 'lucide-react';
import Layout from '../layouts/Layout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUTS_LABEL = {
  'en_attente': 'En attente',
  'payee': 'Payée',
  'annulee': 'Annulée'
};

const STATUTS_CLASSES = {
  'en_attente': 'bg-amber-50 text-amber-600 border-amber-100',
  'payee': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'annulee': 'bg-rose-50 text-rose-600 border-rose-100'
};

const METHODES_PAIEMENT = [
  { value: 'cash', label: 'Espèces', icon: DollarSign, color: 'emerald' },
  { value: 'orange-money', label: 'Orange Money', icon: Smartphone, color: 'orange' },
  { value: 'cheque', label: 'Chèque', icon: CreditCard, color: 'blue' },
  { value: 'banque', label: 'Virement bancaire', icon: Building, color: 'indigo' }
];

export default function ComposantFacturation() {
  const [factures, setFactures] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [typesConsultation, setTypesConsultation] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [modalPatientVisible, setModalPatientVisible] = useState(false);
  const [modalFactureVisible, setModalFactureVisible] = useState(false);
  const [modalDetailsVisible, setModalDetailsVisible] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paiementForm, setPaiementForm] = useState({
    payment_method: 'cash',
    insurance_provider: '',
    bank_name: '',
    bank_account_number: '',
    orange_number: '',
    orange_transaction_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, pRes, cRes, tRes] = await Promise.all([
        fetch(`${API_URL}/api/secretaire/factures`),
        fetch(`${API_URL}/api/secretaire/factures/patients`),
        fetch(`${API_URL}/api/secretaire/factures/consultations`),
        fetch(`${API_URL}/api/secretaire/factures/types-consultation`)
      ]);
      
      const [fData, pData, cData, tData] = await Promise.all([
        fRes.json(), pRes.json(), cRes.json(), tRes.json()
      ]);

      if (fData.success) setFactures(fData.factures || []);
      if (pData.success) setPatients(pData.patients || []);
      if (cData.success) setConsultations(cData.consultations || []);
      if (tData.success) setTypesConsultation(tData.types || []);
    } catch (err) {
      console.error("Erreur fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les patients par recherche
  const patientsFiltres = useMemo(() => {
    if (!recherche) return patients;
    const searchLower = recherche.toLowerCase();
    return patients.filter(p => 
      `${p.nom} ${p.prenom}`.toLowerCase().includes(searchLower) ||
      p.telephone?.includes(searchLower) ||
      p.email?.toLowerCase().includes(searchLower)
    );
  }, [patients, recherche]);

  // Obtenir les consultations d'un patient
  const consultationsPatient = useMemo(() => {
    if (!selectedPatient) return [];
    return consultations.filter(c => c.patient_id === selectedPatient.id)
      .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));
  }, [consultations, selectedPatient]);

  // Vérifier si une consultation a déjà une facture
  const hasFacture = (consultationId) => {
    return factures.some(f => f.consultation_id === consultationId);
  };

  // Récupérer la facture existante pour une consultation
  const getFactureForConsultation = (consultationId) => {
    return factures.find(f => f.consultation_id === consultationId);
  };

  const genererFacture = async () => {
    if (!selectedConsultation) return;
    
    setProcessing(true);
    const consultation = selectedConsultation;
    // Utiliser les infos de type déjà jointes par le backend si possible
    const serviceFinal = consultation.type_nom || "Consultation médicale";
    const montantFinal = consultation.type_prix || 0;
    const typeConsultIdFinal = consultation.id_type_consultation_db || consultation.id_type_consultation || 0;
    
    const factureData = {
      consultation_id: consultation.id,
      patient_id: selectedPatient.id,
      type_consultation_id: typeConsultIdFinal,
      patient_nom: `${selectedPatient.prenom} ${selectedPatient.nom}`,
      service: serviceFinal,
      montant: montantFinal,
      patient_type: 'non-insured',
      payment_method: paiementForm.payment_method,
      insurance_provider: paiementForm.insurance_provider || null,
      bank_name: paiementForm.bank_name || null,
      bank_account_number: paiementForm.bank_account_number || null,
      orange_number: paiementForm.orange_number || null,
      orange_transaction_id: paiementForm.orange_transaction_id || null,
      statut: 'payee'
    };

    try {
      const res = await fetch(`${API_URL}/api/secretaire/factures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factureData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        setModalFactureVisible(false);
        setSelectedConsultation(null);
        setPaiementForm({
          payment_method: 'cash',
          insurance_provider: '',
          bank_name: '',
          bank_account_number: '',
          orange_number: '',
          orange_transaction_id: ''
        });
        // Afficher le reçu immédiatement
        const nouvelleFacture = await fetch(`${API_URL}/api/secretaire/factures/${data.id}`);
        const factureData = await nouvelleFacture.json();
        setSelectedFacture(factureData.facture);
        setModalDetailsVisible(true);
      } else {
        alert(data.message || "Erreur lors de la création de la facture");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur serveur");
    } finally {
      setProcessing(false);
    }
  };

  const imprimerRecu = () => {
    window.print();
  };

  const imprimerFacture = (facture) => {
    setSelectedFacture(facture);
    setModalDetailsVisible(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const marquerPayee = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir marquer cette facture comme payée ?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/secretaire/factures/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'payee' })
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.message || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur serveur");
    }
  };

  const handlePaiementChange = (e) => {
    const { name, value } = e.target;
    setPaiementForm(prev => ({ ...prev, [name]: value }));
  };

  const getTypeConsultationInfo = (typeId) => {
    return typesConsultation.find(t => t.id === typeId);
  };

  const stats = useMemo(() => {
    const total = factures.reduce((acc, f) => acc + Number(f.montant || 0), 0);
    const payee = factures.filter(f => f.statut === 'payee').reduce((acc, f) => acc + Number(f.montant || 0), 0);
    const attente = factures.filter(f => f.statut === 'en_attente').reduce((acc, f) => acc + Number(f.montant || 0), 0);
    return { total, payee, attente };
  }, [factures]);

  // Filtrer les factures pour l'affichage
  const facturesAffichees = useMemo(() => {
    return factures.filter(f => {
      const searchStr = `${f.patient_nom} ${f.id}`.toLowerCase();
      const matchRecherche = searchStr.includes(recherche.toLowerCase());
      const matchFiltre = filtre === 'tous' || f.statut === filtre;
      return matchRecherche && matchFiltre;
    });
  }, [factures, recherche, filtre]);

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Facturation</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Gestion des paiements et édition des reçus
            </p>
          </div>
          <button 
            onClick={() => setModalPatientVisible(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Nouvelle facture
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Émis</p>
                <p className="text-2xl font-black text-slate-900">{stats.total.toLocaleString()} GNF</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Encaissé</p>
                <p className="text-2xl font-black text-emerald-700">{stats.payee.toLocaleString()} GNF</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">En Attente</p>
                <p className="text-2xl font-black text-amber-700">{stats.attente.toLocaleString()} GNF</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLEAU DES FACTURES */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Chercher une facture..." 
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              {['tous', 'en_attente', 'payee'].map(k => (
                <button 
                  key={k} 
                  onClick={() => setFiltre(k)}
                  className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    filtre === k 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-white/50'
                  }`}
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
                  <th className="px-6 py-4">N° Facture</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">Chargement...</td></tr>
                ) : facturesAffichees.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">Aucune facture trouvée</td></tr>
                ) : (
                  facturesAffichees.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-slate-400">#FAC-{f.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{f.patient_nom}</p>
                        <p className="text-xs text-slate-400">{f.patient_prenom} {f.patient_nom_db}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">{f.service}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(f.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {Number(f.montant).toLocaleString()} GNF
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUTS_CLASSES[f.statut]}`}>
                          {STATUTS_LABEL[f.statut]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedFacture(f); setModalDetailsVisible(true); }} 
                            className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                            title="Voir le reçu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {f.statut === 'en_attente' && (
                            <button 
                              onClick={() => marquerPayee(f.id)} 
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                              title="Marquer comme payée"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => imprimerFacture(f)} 
                            className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL SÉLECTION PATIENT */}
        {modalPatientVisible && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Sélectionner un patient</h2>
                  <p className="text-sm text-slate-500">Choisissez un patient pour générer sa facture</p>
                </div>
                <button onClick={() => setModalPatientVisible(false)} className="p-2 hover:bg-slate-200 rounded-xl transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 border-b">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom, prénom, téléphone ou email..." 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patientsFiltres.map(patient => (
                    <div 
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setModalPatientVisible(false);
                        setModalFactureVisible(true);
                        setRecherche('');
                      }}
                      className="border border-slate-200 rounded-2xl p-4 hover:border-emerald-300 hover:shadow-lg cursor-pointer transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center text-emerald-700 font-bold text-lg">
                          {patient.prenom?.[0]}{patient.nom?.[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                            {patient.prenom} {patient.nom}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                            {patient.telephone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {patient.telephone}
                              </span>
                            )}
                            {patient.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {patient.email}
                              </span>
                            )}
                            {patient.quartier && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {patient.quartier}
                              </span>
                            )}
                            {patient.sexe && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" /> {patient.sexe === 'M' ? 'Homme' : 'Femme'}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition" />
                      </div>
                    </div>
                  ))}
                </div>
                {patientsFiltres.length === 0 && !loading && (
                  <div className="text-center py-12 text-slate-400">
                    Aucun patient trouvé
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL CRÉATION FACTURE AVEC CONSULTATIONS */}
        {modalFactureVisible && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b bg-slate-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                      {selectedPatient.prenom?.[0]}{selectedPatient.nom?.[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedPatient.prenom} {selectedPatient.nom}</h2>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                        {selectedPatient.telephone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {selectedPatient.telephone}
                          </span>
                        )}
                        {selectedPatient.quartier && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {selectedPatient.quartier}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setModalFactureVisible(false); setSelectedPatient(null); }} className="p-2 hover:bg-slate-200 rounded-xl transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                    Consultations du patient
                  </h3>
                  
                  {consultationsPatient.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl">
                      <p className="text-slate-400">Aucune consultation trouvée pour ce patient</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consultationsPatient.map(consultation => {
                        const typeInfo = getTypeConsultationInfo(consultation.id_type_consultation);
                        const factureExistante = getFactureForConsultation(consultation.id);
                        const isSelected = selectedConsultation?.id === consultation.id;
                        
                        return (
                          <div 
                            key={consultation.id}
                            onClick={() => !factureExistante && setSelectedConsultation(consultation)}
                            className={`border rounded-2xl p-4 transition-all cursor-pointer ${
                              factureExistante 
                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                : isSelected
                                  ? 'border-emerald-400 bg-emerald-50/30 shadow-md'
                                  : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="flex items-center gap-2 text-sm text-slate-500">
                                    <Clock className="w-4 h-4" />
                                    {new Date(consultation.date_consultation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                            <div className="mt-2">
                              <p className="font-bold text-slate-800">{consultation.type_nom || "Consultation"}</p>
                              <p className="text-emerald-600 font-bold mt-1">{Number(consultation.type_prix || 0).toLocaleString()} GNF</p>
                            </div>
                                {consultation.diagnostic && (
                                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                    <span className="font-medium">Diagnostic:</span> {consultation.diagnostic}
                                  </p>
                                )}
                              </div>
                              {factureExistante ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Facturée
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFacture(factureExistante);
                                      setModalDetailsVisible(true);
                                    }}
                                    className="text-xs text-emerald-600 hover:underline mt-1"
                                  >
                                    Voir reçu
                                  </button>
                                </div>
                              ) : isSelected && (
                                <div className="text-emerald-600">
                                  <Check className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedConsultation && (
                  <div className="border-t pt-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      Mode de paiement
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {METHODES_PAIEMENT.map(method => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaiementForm(prev => ({ ...prev, payment_method: method.value }))}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            paiementForm.payment_method === method.value
                              ? `border-${method.color}-500 bg-${method.color}-50`
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <method.icon className={`w-5 h-5 ${paiementForm.payment_method === method.value ? `text-${method.color}-600` : 'text-slate-400'}`} />
                          <span className={`font-medium ${paiementForm.payment_method === method.value ? `text-${method.color}-700` : 'text-slate-700'}`}>
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Champs spécifiques selon le mode de paiement */}
                    {paiementForm.payment_method === 'orange-money' && (
                      <div className="space-y-3 mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Numéro Orange Money</label>
                          <input
                            type="tel"
                            name="orange_number"
                            value={paiementForm.orange_number}
                            onChange={handlePaiementChange}
                            placeholder="+224 XX XXX XXXX"
                            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">ID Transaction</label>
                          <input
                            type="text"
                            name="orange_transaction_id"
                            value={paiementForm.orange_transaction_id}
                            onChange={handlePaiementChange}
                            placeholder="Référence de la transaction"
                            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {paiementForm.payment_method === 'banque' && (
                      <div className="space-y-3 mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la banque</label>
                          <input
                            type="text"
                            name="bank_name"
                            value={paiementForm.bank_name}
                            onChange={handlePaiementChange}
                            className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de compte</label>
                          <input
                            type="text"
                            name="bank_account_number"
                            value={paiementForm.bank_account_number}
                            onChange={handlePaiementChange}
                            className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={genererFacture}
                        disabled={processing}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Valider et imprimer le reçu
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedConsultation(null)}
                        className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL REÇU */}
        {modalDetailsVisible && selectedFacture && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
              
              <div className="p-6 border-b flex justify-between items-center print:hidden bg-slate-50 rounded-t-[2rem]">
                <h2 className="text-xl font-bold">Reçu de paiement</h2>
                <div className="flex gap-2">
                  <button onClick={imprimerRecu} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm">
                    <Printer className="w-4 h-4" /> Imprimer
                  </button>
                  <button onClick={() => setModalDetailsVisible(false)} className="p-2 hover:bg-slate-200 rounded-xl transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div id="print-area" className="p-10 space-y-8">
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
                  <div>
                    <h1 className="text-4xl font-black text-emerald-600 tracking-tighter">CEMECO</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Clinique Médico-Chirurgicale</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Conakry, République de Guinée</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black uppercase text-slate-900">REÇU</h3>
                    <p className="font-mono text-sm text-slate-500 font-bold mt-1">N° FAC-{selectedFacture.id}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">
                      Date: {new Date(selectedFacture.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient</p>
                    <p className="text-xl font-black text-slate-900">{selectedFacture.patient_nom}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Patient {selectedFacture.patient_type === 'insured' ? 'Assuré' : 'Non Assuré'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut</p>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${STATUTS_CLASSES[selectedFacture.statut]}`}>
                      {STATUTS_LABEL[selectedFacture.statut]}
                    </span>
                  </div>
                </div>

                <div className="border-2 border-slate-50 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="px-6 py-6 font-bold text-slate-800">
                          {selectedFacture.service}
                          <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                            Clinique CEMECO
                          </p>
                        </td>
                        <td className="px-6 py-6 text-right font-black text-xl text-slate-900">
                          {Number(selectedFacture.montant).toLocaleString()} GNF
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-50 p-8 rounded-[2rem]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode de paiement</p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                      {METHODES_PAIEMENT.find(m => m.value === selectedFacture.payment_method)?.label || selectedFacture.payment_method}
                    </p>
                    {selectedFacture.orange_number && (
                      <p className="text-xs text-orange-600">Orange Money: {selectedFacture.orange_number}</p>
                    )}
                    {selectedFacture.bank_name && (
                      <p className="text-xs text-indigo-600">{selectedFacture.bank_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total payé</p>
                    <p className="text-4xl font-black text-emerald-600">
                      {Number(selectedFacture.montant).toLocaleString()} <span className="text-lg">GNF</span>
                    </p>
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-12 text-center border-t border-dashed border-slate-200">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signature du patient</p>
                    <div className="h-16"></div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cachet du secrétariat</p>
                    <div className="h-16 flex items-center justify-center italic text-slate-300 font-black text-5xl opacity-10">
                      CEMECO
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Composant Mail pour les icônes (si non importé)
const Mail = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 7L2 7" />
  </svg>
);