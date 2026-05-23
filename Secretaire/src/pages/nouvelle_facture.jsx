import { useMemo, useState, useEffect } from 'react';
import {
  Download, Eye, Search, Check, AlertCircle, Plus, X,
  TrendingUp, Printer, User, Phone, MapPin, Calendar,
  DollarSign, CreditCard, Smartphone, Building, FileText,
  ChevronRight, Stethoscope, Clock, Activity, Pencil
} from 'lucide-react';
import Layout from '../layouts/Layout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUTS_LABEL = {
  'en_attente': 'En attente',
  'en_cours_validation': 'Validation Admin',
  'payee': 'Payée',
  'annulee': 'Annulée'
};

const STATUTS_CLASSES = {
  'en_attente': 'bg-amber-50 text-amber-600 border-amber-100',
  'en_cours_validation': 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse',
  'payee': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'annulee': 'bg-rose-50 text-rose-600 border-rose-100'
};

const METHODES_PAIEMENT = [
  { value: 'cash', label: 'Espèces', icon: DollarSign, color: 'emerald' },
  { value: 'orange-money', label: 'Orange Money', icon: Smartphone, color: 'orange' },
  { value: 'cheque', label: 'Chèque', icon: CreditCard, color: 'blue' }
];

// Fonction pour grouper les consultations faites le même jour
const grouperConsultationsParJour = (consults, facturesList) => {
  if (!consults || consults.length === 0) return [];
  
  const groupes = {};
  consults.forEach(c => {
    // Clé par jour (ex: "17/05/2026")
    const dateObj = new Date(c.date_consultation);
    const dateKey = dateObj.toLocaleDateString('fr-FR');
    
    if (!groupes[dateKey]) {
      groupes[dateKey] = [];
    }
    groupes[dateKey].push(c);
  });

  return Object.keys(groupes).map(dateKey => {
    const list = groupes[dateKey];
    
    // Trier par date décroissante
    list.sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));
    
    // Somme des montants
    const montantTotal = list.reduce((sum, c) => sum + Number(c.type_prix || 0), 0);
    
    // Services combinés
    const serviceCombine = list.map(c => c.type_nom || "Consultation").join(" + ");
    
    // Récupérer les factures existantes pour toutes les consultations du groupe
    const facturesDuGroupe = list.map(c => facturesList.find(f => f.consultation_id === c.id)).filter(Boolean);
    const aFacture = facturesDuGroupe.length > 0;
    const factureExistante = facturesDuGroupe[0] || null;

    return {
      id: list[0].id, // Référence principale
      consultation_ids: list.map(c => c.id),
      dateKey,
      date_consultation: list[0].date_consultation,
      patient_id: list[0].patient_id,
      type_prix: montantTotal,
      type_nom: serviceCombine,
      diagnostic: list.map(c => c.diagnostic).filter(Boolean).join(" | "),
      aFacture,
      factureExistante,
      consultations: list
    };
  });
};

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
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [validationRef, setValidationRef] = useState('');
  const [validationRequests, setValidationRequests] = useState({ counts: {}, byStatus: {} });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFactureId, setEditingFactureId] = useState(null);
  const [activeTab, setActiveTab] = useState('factures'); // 'factures' ou 'assurances'
  const [versionRecu, setVersionRecu] = useState('patient'); // 'patient' ou 'assurance'

  const [paiementForm, setPaiementForm] = useState({
    patient_type: 'non-insured',
    payment_method: 'cash',
    insurance_provider: '',
    insurance_number: '',
    coverage_rate: 0,
    bank_name: '',
    bank_account_number: '',
    cheque_number: '',
    cheque_holder: '',
    orange_number: '',
    orange_transaction_id: '',
    montant: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchFactureHistory = async (factureId) => {
    if (!factureId) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/secretaire/factures/${factureId}/history`);
      const result = await res.json();
      if (result.success) {
        setHistory(result.history || []);
      } else {
        console.error('Erreur historique facture:', result.message);
        setHistory([]);
      }
    } catch (err) {
      console.error('Erreur historique facture:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFacture?.id) {
      fetchFactureHistory(selectedFacture.id);
      setValidationRef(selectedFacture.validation_ref || '');
    } else {
      setHistory([]);
      setValidationRef('');
    }
  }, [selectedFacture]);

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
      // Charger les demandes de validation / portefeuille assurances
      try {
        const vrRes = await fetch(`${API_URL}/api/secretaire/factures/assurance/validation-requests`);
        const vrJson = await vrRes.json();
        if (vrJson.success) {
          setValidationRequests({ counts: vrJson.counts || {}, byStatus: vrJson.byStatus || {} });
        }
      } catch (err) {
        console.error('Erreur chargement demandes validation:', err);
      }
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

  // Obtenir les consultations d'un patient groupées par jour
  const consultationsPatient = useMemo(() => {
    if (!selectedPatient) return [];
    const filtered = consultations.filter(c => c.patient_id === selectedPatient.id);
    return grouperConsultationsParJour(filtered, factures);
  }, [consultations, selectedPatient, factures]);

  // Vérifier si une consultation a déjà une facture
  const hasFacture = (consultationId) => {
    return factures.some(f => f.consultation_id === consultationId);
  };

  // Récupérer la facture existante pour une consultation
  const getFactureForConsultation = (consultationId) => {
    return factures.find(f => f.consultation_id === consultationId);
  };

  const genererFacture = async () => {
    if (!selectedPatient) return;

    setProcessing(true);
    const consultation = selectedConsultation;
    // Utiliser les infos de type déjà jointes par le backend si possible
    const serviceFinal = consultation?.type_nom || paiementForm.service || "Consultation médicale";
    const typeConsultIdFinal = consultation?.id_type_consultation_db || consultation?.id_type_consultation || 0;

    const existingFact = isEditing ? factures.find(f => f.id === editingFactureId) : null;
    let computedStatut = paiementForm.patient_type === 'insured' ? 'en_attente' : 'payee';
    if (isEditing && existingFact) {
      if (existingFact.patient_type === paiementForm.patient_type) {
        computedStatut = existingFact.statut;
      }
    }

    const factureData = {
      consultation_id: consultation?.id || null,
      patient_id: selectedPatient.id,
      type_consultation_id: typeConsultIdFinal,
      patient_nom: `${selectedPatient.prenom} ${selectedPatient.nom}`,
      service: serviceFinal,
      montant: paiementForm.montant,
      patient_type: paiementForm.patient_type,
      payment_method: paiementForm.payment_method,
      insurance_provider: paiementForm.patient_type === 'insured' ? paiementForm.insurance_provider : null,
      insurance_number: paiementForm.patient_type === 'insured' ? paiementForm.insurance_number : null,
      coverage_rate: paiementForm.patient_type === 'insured' ? Number(paiementForm.coverage_rate) : 0,
      bank_name: paiementForm.payment_method === 'cheque' ? paiementForm.bank_name : null,
      bank_account_number: paiementForm.bank_account_number || null,
      cheque_number: paiementForm.payment_method === 'cheque' ? paiementForm.cheque_number : null,
      cheque_holder: paiementForm.payment_method === 'cheque' ? paiementForm.cheque_holder : null,
      orange_number: paiementForm.payment_method === 'orange-money' ? paiementForm.orange_number : null,
      orange_transaction_id: paiementForm.payment_method === 'orange-money' ? paiementForm.orange_transaction_id : null,
      statut: computedStatut
    };

    try {
      const url = isEditing
        ? `${API_URL}/api/secretaire/factures/${editingFactureId}`
        : `${API_URL}/api/secretaire/factures`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factureData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        setModalFactureVisible(false);
        setSelectedConsultation(null);
        const savedId = isEditing ? editingFactureId : data.id;
        setIsEditing(false);
        setEditingFactureId(null);
        setPaiementForm({
          patient_type: 'non-insured',
          payment_method: 'cash',
          insurance_provider: '',
          insurance_number: '',
          coverage_rate: 0,
          bank_name: '',
          bank_account_number: '',
          cheque_number: '',
          cheque_holder: '',
          orange_number: '',
          orange_transaction_id: '',
          montant: 0
        });

        // Afficher le reçu immédiatement
        const nouvelleFacture = await fetch(`${API_URL}/api/secretaire/factures/${savedId}`);
        const factureDataRes = await nouvelleFacture.json();
        setSelectedFacture(factureDataRes.facture);
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

  const demanderValidation = async (facture) => {
    let ref = validationRef;
    if (!ref || ref.trim() === '') {
      ref = window.prompt("Veuillez saisir la référence du paiement de l'assurance (ex: N° de virement ou chèque) :");
      if (ref === null) return; // Annulé
    }

    try {
      const res = await fetch(`${API_URL}/api/secretaire/factures/${facture.id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'en_cours_validation', validation_ref: ref })
      });
      const data = await res.json();
      if (data.success) {
        setValidationRef(ref);
        setSelectedFacture(prev => prev ? { ...prev, statut: 'en_cours_validation', validation_ref: ref } : prev);
        alert("Demande de validation transmise avec succès à l'administrateur !");
        await fetchData();
      } else {
        alert(data.message || "Erreur lors de la soumission de la demande");
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

  const handleEditClick = (f) => {
    setIsEditing(true);
    setEditingFactureId(f.id);
    const patient = patients.find(p => p.id === f.patient_id);
    setSelectedPatient(patient || { id: f.patient_id, prenom: '', nom: f.patient_nom });
    setSelectedConsultation(f.consultation_id ? {
      id: f.consultation_id,
      type_nom: f.service,
      type_prix: f.montant
    } : null);
    setPaiementForm({
      patient_type: f.patient_type || 'non-insured',
      payment_method: f.payment_method || 'cash',
      insurance_provider: f.insurance_provider || '',
      insurance_number: f.insurance_number || '',
      coverage_rate: f.coverage_rate || 0,
      bank_name: f.bank_name || '',
      bank_account_number: f.bank_account_number || '',
      cheque_number: f.cheque_number || '',
      cheque_holder: f.cheque_holder || '',
      orange_number: f.orange_number || '',
      orange_transaction_id: f.orange_transaction_id || '',
      montant: f.montant,
      service: f.service
    });
    setModalFactureVisible(true);
  };

  const getTypeConsultationInfo = (typeId) => {
    return typesConsultation.find(t => t.id === typeId);
  };

  const stats = useMemo(() => {
    const total = factures.reduce((acc, f) => acc + Number(f.montant || 0), 0);
    const payee = factures.filter(f => f.statut === 'payee').reduce((acc, f) => acc + Number(f.montant || 0), 0);
    const attente = factures.filter(f => f.statut === 'en_attente').reduce((acc, f) => acc + Number(f.montant || 0), 0);
    const validation = factures.filter(f => f.statut === 'en_cours_validation').reduce((acc, f) => acc + Number(f.montant || 0), 0);
    
    // Répartition de la caisse quotidienne (aujourd'hui)
    const aujourdhui = new Date().toISOString().split('T')[0];
    const facturesJour = factures.filter(f => {
      const dateFact = f.date_facture ? new Date(f.date_facture).toISOString().split('T')[0] : '';
      return dateFact === aujourdhui && f.statut === 'payee';
    });
    
    const caisseJour = {
      cash: facturesJour.filter(f => f.payment_method === 'cash').reduce((acc, f) => acc + Number(f.montant_patient || f.montant || 0), 0),
      orangeMoney: facturesJour.filter(f => f.payment_method === 'orange-money').reduce((acc, f) => acc + Number(f.montant_patient || f.montant || 0), 0),
      cheque: facturesJour.filter(f => f.payment_method === 'cheque').reduce((acc, f) => acc + Number(f.montant_patient || f.montant || 0), 0),
      assurance: facturesJour.filter(f => f.patient_type === 'insured').reduce((acc, f) => acc + Number(f.montant_assurance || 0), 0)
    };
    caisseJour.total = caisseJour.cash + caisseJour.orangeMoney + caisseJour.cheque + caisseJour.assurance;
    
    return { total, payee, attente, validation, caisseJour };
  }, [factures]);

  // Statistiques spécifiques pour le suivi des assurances
  const statsAssurances = useMemo(() => {
    const facturesAssurees = factures.filter(f => f.patient_type === 'insured');
    const totalAssurance = facturesAssurees.reduce((acc, f) => acc + Number(f.montant_assurance || 0), 0);
    const recouvrer = facturesAssurees.filter(f => f.statut === 'en_attente').reduce((acc, f) => acc + Number(f.montant_assurance || 0), 0);
    const validation = facturesAssurees.filter(f => f.statut === 'en_cours_validation').reduce((acc, f) => acc + Number(f.montant_assurance || 0), 0);
    const recupere = facturesAssurees.filter(f => f.statut === 'payee').reduce((acc, f) => acc + Number(f.montant_assurance || 0), 0);
    const taux = totalAssurance > 0 ? Math.round((recupere / totalAssurance) * 100) : 0;
    return { totalAssurance, recouvrer, validation, recupere, taux };
  }, [factures]);

  // Filtrer les factures pour l'affichage général
  const facturesAffichees = useMemo(() => {
    return factures.filter(f => {
      const searchStr = `${f.patient_nom} ${f.id}`.toLowerCase();
      const matchRecherche = searchStr.includes(recherche.toLowerCase());
      const matchFiltre = filtre === 'tous' || f.statut === filtre;
      return matchRecherche && matchFiltre;
    });
  }, [factures, recherche, filtre]);

  // Filtrer les factures pour le suivi des assurances
  const facturesAssurancesAffichees = useMemo(() => {
    return factures.filter(f => {
      if (f.patient_type !== 'insured') return false;
      const searchStr = `${f.patient_nom} ${f.insurance_provider} ${f.id}`.toLowerCase();
      const matchRecherche = searchStr.includes(recherche.toLowerCase());
      const matchFiltre = filtre === 'tous' || f.statut === filtre;
      return matchRecherche && matchFiltre;
    });
  }, [factures, recherche, filtre]);

  // Filtrer les factures pour la validation admin
  const facturesValidationAdmin = useMemo(() => {
    return factures.filter(f => {
      if (f.patient_type !== 'insured') return false;
      return f.statut === 'en_cours_validation' || f.statut === 'payee';
    });
  }, [factures]);

  // Statistiques pour la validation admin
  const statsValidationAdmin = useMemo(() => {
    const enValidation = facturesValidationAdmin.filter(f => f.statut === 'en_cours_validation');
    const validees = facturesValidationAdmin.filter(f => f.statut === 'payee');
    
    const montantEnValidation = enValidation.reduce((acc, f) => acc + Number(f.montant_assurance || 0), 0);
    const montantValidee = validees.reduce((acc, f) => acc + Number(f.montant_assurance || 0), 0);
    
    return {
      enValidation: enValidation.length,
      montantEnValidation,
      validees: validees.length,
      montantValidee,
      total: montantEnValidation + montantValidee
    };
  }, [facturesValidationAdmin]);

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

        {/* TABS SELECTION */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 print:hidden overflow-x-auto">
          <button
            onClick={() => { setActiveTab('factures'); setFiltre('tous'); }}
            className={`px-6 py-3 font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'factures'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            Factures Générales
          </button>
          <button
            onClick={() => { setActiveTab('assurances'); setFiltre('tous'); }}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'assurances'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Building className="w-5 h-5" />
            Suivi des Assurances
          </button>
          <button
            onClick={() => { setActiveTab('validation-admin'); setFiltre('tous'); }}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'validation-admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            <Check className="w-5 h-5" />
            Validation Admin
          </button>
        </div>

        {/* STATS CARDS */}
        {activeTab === 'factures' ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Clock className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Validation Admin</p>
                    <p className="text-2xl font-black text-blue-700">{stats.validation.toLocaleString()} GNF</p>
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

            {/* Caisse Journalière Section */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Caisse Journalière (Aujourd'hui)</p>
                <h4 className="text-2xl font-black text-emerald-400 mt-1">{stats.caisseJour.total.toLocaleString()} GNF</h4>
              </div>
              <div className="flex flex-wrap gap-6 text-xs">
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700/50">
                  <span className="text-slate-400 font-bold block mb-1">Espèces</span>
                  <span className="font-black text-white">{stats.caisseJour.cash.toLocaleString()} GNF</span>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700/50">
                  <span className="text-slate-400 font-bold block mb-1">Orange Money</span>
                  <span className="font-black text-white">{stats.caisseJour.orangeMoney.toLocaleString()} GNF</span>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700/50">
                  <span className="text-slate-400 font-bold block mb-1">Chèque</span>
                  <span className="font-black text-white">{stats.caisseJour.cheque.toLocaleString()} GNF</span>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700/50">
                  <span className="text-blue-400 font-bold block mb-1">Assurances</span>
                  <span className="font-black text-blue-300">{stats.caisseJour.assurance.toLocaleString()} GNF</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'assurances' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Dû Assurances</p>
                  <p className="text-2xl font-black text-slate-900">{statsAssurances.totalAssurance.toLocaleString()} GNF</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-3xl border border-amber-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">En Attente de Recouvrement</p>
                  <p className="text-2xl font-black text-amber-700">{statsAssurances.recouvrer.toLocaleString()} GNF</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Clock className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">En Validation Admin</p>
                  <p className="text-2xl font-black text-blue-700">{statsAssurances.validation.toLocaleString()} GNF</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Remboursé par Assurances</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-emerald-700">{statsAssurances.recupere.toLocaleString()} GNF</p>
                    <span className="text-xs font-bold text-emerald-500">({statsAssurances.taux}%)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-4 mt-6">
              <div className="flex gap-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-bold text-amber-700">En attente</p>
                  <p className="text-lg font-black">{validationRequests.counts.en_attente || 0}</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-bold text-blue-600">En cours de validation</p>
                  <p className="text-lg font-black">{validationRequests.counts.en_cours_validation || 0}</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600">Validées (payées)</p>
                  <p className="text-lg font-black">{validationRequests.counts.payee || 0}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {Object.keys(validationRequests.byStatus).length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Aucune demande de validation pour le moment.</p>
                ) : (
                  Object.entries(validationRequests.byStatus).map(([status, list]) => (
                    <div key={status} className="bg-white p-4 rounded-xl border border-slate-100">
                      <h3 className="text-sm font-black mb-3">{status === 'en_attente' ? 'En attente' : status === 'en_cours_validation' ? 'En cours de validation' : status === 'payee' ? 'Validées (payées)' : status}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {list.slice(0,6).map(f => (
                          <div key={f.id} className="p-3 border rounded-lg flex items-center justify-between">
                            <div>
                              <div className="text-sm font-bold">{f.patient_nom} — {f.insurance_provider || '—'}</div>
                              <div className="text-xs text-slate-500">Part assurance: {Number(f.montant_assurance || 0).toLocaleString()} GNF</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button onClick={() => { setSelectedFacture(f); setVersionRecu('assurance'); setModalDetailsVisible(true); }} className="text-xs px-3 py-1 rounded-md bg-blue-600 text-white">Voir</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">En Cours de Validation</p>
                  <p className="text-2xl font-black text-slate-900">{statsValidationAdmin.enValidation}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-3xl border border-purple-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                  <Clock className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Montant en Validation</p>
                  <p className="text-2xl font-black text-purple-700">{statsValidationAdmin.montantEnValidation.toLocaleString()} GNF</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Validées et Payées</p>
                  <p className="text-2xl font-black text-emerald-700">{statsValidationAdmin.validees}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-3xl border border-green-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Total Remboursé</p>
                  <p className="text-2xl font-black text-green-700">{statsValidationAdmin.montantValidee.toLocaleString()} GNF</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENU PRINCIPAL DES ONGLETS */}
        {activeTab === 'factures' ? (
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
                {['tous', 'en_attente', 'en_cours_validation', 'payee'].map(k => (
                  <button
                    key={k}
                    onClick={() => setFiltre(k)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filtre === k
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:bg-white/50'
                      }`}
                  >
                    {k === 'tous' ? 'Toutes' : k === 'payee' ? 'Payées' : k === 'en_attente' ? 'En attente' : 'Validation Admin'}
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
                    <th className="px-6 py-4">Type / Assurance</th>
                    <th className="px-6 py-4">Montant Total</th>
                    <th className="px-6 py-4">Part Patient</th>
                    <th className="px-6 py-4">Part Assurance</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 italic">Chargement...</td></tr>
                  ) : facturesAffichees.length === 0 ? (
                    <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 italic">Aucune facture trouvée</td></tr>
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
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border w-max ${f.patient_type === 'insured'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                              {f.patient_type === 'insured' ? 'Assuré' : 'Non Assuré'}
                            </span>
                            {f.patient_type === 'insured' && (
                              <p className="text-xs text-slate-500 font-bold">
                                {f.insurance_provider} ({f.coverage_rate}%)
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900">
                          {Number(f.montant).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">
                          {Number(f.montant_patient || (f.patient_type === 'insured' ? 0 : f.montant)).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-500">
                          {Number(f.montant_assurance || 0).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUTS_CLASSES[f.statut]}`}>
                            {STATUTS_LABEL[f.statut]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setSelectedFacture(f); setVersionRecu(f.patient_type === 'insured' ? 'assurance' : 'patient'); setModalDetailsVisible(true); }}
                              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                              title="Voir le reçu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(f)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {f.statut === 'en_attente' && (
                              f.patient_type === 'insured' ? (
                                <button
                                  onClick={() => demanderValidation(f)}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 font-black text-[10px]"
                                  title="Demander la validation du remboursement"
                                >
                                  <Check className="w-3.5 h-3.5" /> Demander Validation
                                </button>
                              ) : (
                                <button
                                  onClick={() => marquerPayee(f.id)}
                                  className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                  title="Marquer comme payée"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )
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
        ) : activeTab === 'assurances' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Chercher une facture ou assurance..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                {['tous', 'en_attente', 'payee'].map(k => (
                  <button
                    key={k}
                    onClick={() => setFiltre(k)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filtre === k
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:bg-white/50'
                      }`}
                  >
                    {k === 'tous' ? 'Toutes' : k === 'payee' ? 'Remboursées' : 'En attente'}
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
                    <th className="px-6 py-4">Assureur</th>
                    <th className="px-6 py-4">N° Assurance / Taux</th>
                    <th className="px-6 py-4">Montant Total</th>
                    <th className="px-6 py-4">Part Patient (Payée)</th>
                    <th className="px-6 py-4 text-blue-600">Part Assurance (Dû)</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 italic">Chargement...</td></tr>
                  ) : facturesAssurancesAffichees.length === 0 ? (
                    <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 italic">Aucune facture d'assurance trouvée</td></tr>
                  ) : (
                    facturesAssurancesAffichees.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-bold text-slate-400">#FAC-{f.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{f.patient_nom}</p>
                          <p className="text-xs text-slate-400">{f.patient_prenom} {f.patient_nom_db}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-black uppercase">
                            {f.insurance_provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700">{f.insurance_number}</p>
                          <p className="text-xs text-slate-400 font-medium">Couverture : {f.coverage_rate}%</p>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900">
                          {Number(f.montant).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          {Number(f.montant_patient || 0).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 font-black text-blue-600 bg-blue-50/20">
                          {Number(f.montant_assurance || 0).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUTS_CLASSES[f.statut] || 'bg-slate-100 text-slate-600'}`}>
                            {STATUTS_LABEL[f.statut] || f.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setSelectedFacture(f); setVersionRecu('assurance'); setModalDetailsVisible(true); }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold text-xs flex items-center gap-1"
                              title="Voir la facture assurance"
                            >
                              <Eye className="w-4 h-4" /> Prise en charge
                            </button>
                            {f.statut === 'en_attente' && (
                              <button
                                onClick={() => demanderValidation(f)}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 font-black text-[10px]"
                                title="Demander la validation du remboursement"
                              >
                                <Check className="w-3.5 h-3.5" /> Demander Validation
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedFacture(f); setVersionRecu('assurance'); setModalDetailsVisible(true); setTimeout(() => window.print(), 500); }}
                              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                              title="Imprimer Facture Assurance"
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
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Chercher une facture à valider..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">N° Facture</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Assureur</th>
                    <th className="px-6 py-4">Consultation</th>
                    <th className="px-6 py-4 text-right">Montant Total</th>
                    <th className="px-6 py-4 text-right text-purple-600">Dû Assurance</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4">Réf. Admin</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 italic">Chargement...</td></tr>
                  ) : facturesValidationAdmin.filter(f => 
                    `${f.patient_nom} ${f.insurance_provider} ${f.id}`.toLowerCase().includes(recherche.toLowerCase())
                  ).length === 0 ? (
                    <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 italic">Aucune facture en validation trouvée</td></tr>
                  ) : (
                    facturesValidationAdmin.filter(f => 
                      `${f.patient_nom} ${f.insurance_provider} ${f.id}`.toLowerCase().includes(recherche.toLowerCase())
                    ).map(f => (
                      <tr key={f.id} className={`hover:bg-slate-50/80 transition-all group ${f.statut === 'payee' ? 'bg-emerald-50/30' : 'bg-purple-50/20'}`}>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-bold text-slate-400">#FAC-{f.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{f.patient_nom}</p>
                          <p className="text-xs text-slate-400 font-medium">{f.patient_prenom} {f.patient_nom_db}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-black uppercase">
                            {f.insurance_provider}
                          </span>
                          <p className="text-xs text-slate-400 font-medium mt-1">N° {f.insurance_number}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700">{f.service}</p>
                          <p className="text-xs text-slate-400 font-medium">Couverture: {f.coverage_rate}%</p>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {Number(f.montant).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 text-right font-black text-purple-600 bg-purple-50">
                          {Number(f.montant_assurance || 0).toLocaleString()} GNF
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              f.statut === 'payee'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-purple-50 text-purple-600 border-purple-100 animate-pulse'
                            }`}>
                              {f.statut === 'payee' ? '✅ Payée' : '⏳ En Validation'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {f.validation_ref ? (
                            <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                              {f.validation_ref}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setSelectedFacture(f); setVersionRecu('assurance'); setModalDetailsVisible(true); }}
                              className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all font-bold text-xs flex items-center gap-1"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {f.statut === 'payee' && (
                              <button
                                onClick={() => { setSelectedFacture(f); setVersionRecu('assurance'); setModalDetailsVisible(true); setTimeout(() => window.print(), 500); }}
                                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                                title="Imprimer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {facturesValidationAdmin.length > 0 && (
              <div className="p-6 bg-slate-50/50 border-t text-xs text-slate-500 font-medium">
                <p>
                  <span className="font-bold text-purple-600">{facturesValidationAdmin.filter(f => f.statut === 'en_cours_validation').length}</span> facture(s) en attente de validation | 
                  <span className="font-bold text-emerald-600 ml-2">{facturesValidationAdmin.filter(f => f.statut === 'payee').length}</span> facture(s) validée(s)
                </p>
              </div>
            )}
          </div>
        )}

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
                        setSelectedConsultation(null);
                        setPaiementForm(prev => ({
                          ...prev,
                          montant: 0,
                          service: "",
                        }));
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
                      {consultationsPatient.map((consultation) => {
                        const factureExistante = consultation.factureExistante;
                        const isSelected = selectedConsultation?.id === consultation.id;

                        return (
                          <div
                            key={consultation.id}
                            onClick={() => {
                              if (factureExistante) return;

                              if (!isSelected) {
                                setSelectedConsultation(consultation);
                                setPaiementForm((prev) => ({
                                  ...prev,
                                  montant: Number(consultation.type_prix || 0),
                                  service: consultation.type_nom || "Consultation",
                                }));
                              }
                            }}
                            className={`border rounded-2xl p-4 transition-all cursor-pointer ${factureExistante
                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                : isSelected
                                  ? 'border-green-600 bg-green-100 shadow-md ring-2 ring-green-500/20'
                                  : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                    {consultation.dateKey}
                                  </span>
                                  {consultation.consultations.length > 1 && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      {consultation.consultations.length} Consultations groupées
                                    </span>
                                  )}
                                </div>

                                <div className="mt-3 space-y-2">
                                  {consultation.consultations.map((c) => (
                                    <div key={c.id} className="pl-3 border-l-2 border-slate-200 py-0.5">
                                      <div className="flex justify-between items-center">
                                        <p className="font-semibold text-slate-700 text-sm">{c.type_nom || "Consultation"}</p>
                                        <p className="text-slate-500 text-xs font-mono">{Number(c.type_prix || 0).toLocaleString()} GNF</p>
                                      </div>
                                      {c.diagnostic && (
                                        <p className="text-xs text-slate-400 mt-0.5 italic">
                                          Diagnostic : {c.diagnostic}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-500">Montant total du jour :</span>
                                  <span className="text-emerald-600 font-black text-base">
                                    {Number(consultation.type_prix || 0).toLocaleString()} GNF
                                  </span>
                                </div>
                              </div>

                              {/* Indicateur de sélection */}
                              {!factureExistante && isSelected && (
                                <div className="text-emerald-600 self-center pl-4">
                                  <Check className="w-7 h-7 text-green-600" />
                                </div>
                              )}

                              {factureExistante && (
                                <div className="flex flex-col items-end gap-1 pl-4">
                                  <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1 font-bold">
                                    <Check className="w-3 h-3" /> Facturée
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFacture(factureExistante);
                                      setModalDetailsVisible(true);
                                    }}
                                    className="text-xs text-emerald-600 hover:underline mt-1 font-bold"
                                  >
                                    Voir reçu
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {(selectedConsultation || isEditing) && (
                  <div className="border-t pt-6 space-y-6">
                    {/* MONTANT TOTAL AUTOMATIQUE */}
                    <div className="space-y-1">
                      <label className="block text-sm font-bold text-slate-700">Montant total de la facture (GNF)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          name="montant"
                          value={Number(paiementForm.montant || 0).toLocaleString() + ' GNF'}
                          disabled
                          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/80 cursor-not-allowed outline-none font-black text-slate-900 text-lg"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold italic">
                        * Ce montant est récupéré automatiquement à partir de la consultation sélectionnée.
                      </p>
                    </div>

                    {/* TYPE DE PATIENT */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Type de Patient</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaiementForm(prev => ({ ...prev, patient_type: 'non-insured', coverage_rate: 0 }))}
                          className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${paiementForm.patient_type === 'non-insured'
                              ? 'border-slate-800 bg-slate-900 text-white shadow-md'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <User className="w-5 h-5" />
                          Non Assuré (100% Patient)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaiementForm(prev => ({ ...prev, patient_type: 'insured', coverage_rate: 80 }))}
                          className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${paiementForm.patient_type === 'insured'
                              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <Building className="w-5 h-5" />
                          Patient Assuré
                        </button>
                      </div>
                    </div>

                    {/* SECTION ASSURANCE DYNAMIQUE */}
                    {paiementForm.patient_type === 'insured' && (
                      <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 text-blue-800 font-bold border-b border-blue-100 pb-2">
                          <Building className="w-5 h-5" />
                          <span>Informations d'Assurance</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Numéro d'assurance</label>
                            <input
                              type="text"
                              name="insurance_number"
                              value={paiementForm.insurance_number}
                              onChange={handlePaiementChange}
                              placeholder="Numéro de carte / police"
                              className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Compagnie d'Assurance</label>
                            <select
                              name="insurance_provider"
                              value={paiementForm.insurance_provider}
                              onChange={handlePaiementChange}
                              className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="UGAR">UGAR</option>
                              <option value="ACTIVA">ACTIVA</option>
                              <option value="NSIA">NSIA</option>
                              <option value="LANALA">LANALA</option>
                              <option value="ASK">ASK</option>
                              <option value="VISTA_ASSURANCE">VISTA_ASSURANCE</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Taux de prise en charge (%)</label>
                          <select
                            name="coverage_rate"
                            value={paiementForm.coverage_rate}
                            onChange={handlePaiementChange}
                            className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                          >
                            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(rate => (
                              <option key={rate} value={rate}>{rate} %</option>
                            ))}
                          </select>
                        </div>

                        {/* RÉPARTITION FINANCIÈRE EN TEMPS RÉEL */}
                        <div className="bg-white rounded-2xl p-4 border border-blue-100 flex justify-between gap-4">
                          <div className="text-center flex-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Part Patient ({100 - Number(paiementForm.coverage_rate)}%)</span>
                            <p className="text-lg font-black text-slate-700 mt-1">
                              {((Number(paiementForm.montant) * (100 - Number(paiementForm.coverage_rate))) / 100).toLocaleString()} GNF
                            </p>
                          </div>
                          <div className="w-px bg-slate-100"></div>
                          <div className="text-center flex-1">
                            <span className="text-[10px] uppercase font-bold text-blue-400">Part Assurance ({paiementForm.coverage_rate}%)</span>
                            <p className="text-lg font-black text-blue-600 mt-1">
                              {((Number(paiementForm.montant) * Number(paiementForm.coverage_rate)) / 100).toLocaleString()} GNF
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODE DE PAIEMENT */}
                    <div>
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                        Mode de paiement
                      </h3>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {METHODES_PAIEMENT.map(method => (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => setPaiementForm(prev => ({ ...prev, payment_method: method.value }))}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paiementForm.payment_method === method.value
                                ? `border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm`
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                          >
                            <method.icon className={`w-5 h-5 ${paiementForm.payment_method === method.value ? `text-blue-600` : 'text-slate-400'}`} />
                            <span className="text-xs">{method.label}</span>
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
                        </div>
                      )}

                      {paiementForm.payment_method === 'cheque' && (
                        <div className="space-y-3 mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro du chèque</label>
                            <input
                              type="text"
                              name="cheque_number"
                              value={paiementForm.cheque_number}
                              onChange={handlePaiementChange}
                              placeholder="Ex: CHQ-99238"
                              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la banque</label>
                            <input
                              type="text"
                              name="bank_name"
                              value={paiementForm.bank_name}
                              onChange={handlePaiementChange}
                              placeholder="Ex: BICIGUI"
                              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du titulaire du compte</label>
                            <input
                              type="text"
                              name="cheque_holder"
                              value={paiementForm.cheque_holder}
                              onChange={handlePaiementChange}
                              placeholder="Nom complet"
                              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

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
                            {isEditing ? "Enregistrer les modifications" : "Valider et imprimer le reçu"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConsultation(null);
                          setIsEditing(false);
                          setEditingFactureId(null);
                          setModalFactureVisible(false);
                        }}
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
                <h2 className="text-xl font-bold">Détails du document</h2>
                <div className="flex gap-2">
                  <button onClick={imprimerRecu} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm">
                    <Printer className="w-4 h-4" /> Imprimer
                  </button>
                  <button onClick={() => setModalDetailsVisible(false)} className="p-2 hover:bg-slate-200 rounded-xl transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {selectedFacture.patient_type === 'insured' && (
                <div className="flex p-1 bg-slate-100 rounded-2xl max-w-md mx-auto print:hidden mt-6 mb-2">
                  <button
                    onClick={() => setVersionRecu('patient')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      versionRecu === 'patient'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Reçu Patient (Ticket Modérateur)
                  </button>
                  <button
                    onClick={() => setVersionRecu('assurance')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      versionRecu === 'assurance'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    Facture Assurance (Fonds Restants)
                  </button>
                </div>
              )}

              <div id="print-area" className="p-10 space-y-8">
                {versionRecu === 'assurance' && selectedFacture.patient_type === 'insured' ? (
                  /* STRUCTURE DE LA FACTURE ASSURANCE */
                  <>
                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
                      <div>
                        <h1 className="text-4xl font-black text-blue-600 tracking-tighter">CEMECO</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Clinique Médico-Chirurgicale</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Conakry, République de Guinée</p>
                      </div>
                      <div className="text-right">
                        <h3 className="text-xl font-black uppercase text-slate-900">FACTURE DE TIER-PAYANT</h3>
                        <p className="font-mono text-sm text-slate-500 font-bold mt-1">N° FAC-ASSUR-{selectedFacture.id}</p>
                        <p className="text-xs font-bold text-slate-400 mt-2">
                          Date: {new Date(selectedFacture.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Débiteur (Compagnie d'Assurance)</p>
                        <p className="text-lg font-black text-blue-700 uppercase">{selectedFacture.insurance_provider}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          N° Carte d'Assuré : {selectedFacture.insurance_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient Bénéficiaire</p>
                        <p className="text-lg font-black text-slate-900">{selectedFacture.patient_nom}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          Taux de Prise en Charge : {selectedFacture.coverage_rate}%
                        </p>
                      </div>
                    </div>

                    <div className="border-2 border-slate-50 rounded-3xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                          <tr>
                            <th className="px-6 py-4">Désignation des Prestations</th>
                            <th className="px-6 py-4 text-right">Montant Total</th>
                            <th className="px-6 py-4 text-right text-blue-600">Part Assurance ({selectedFacture.coverage_rate}%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr>
                            <td className="px-6 py-6 font-bold text-slate-800">
                              {selectedFacture.service}
                              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                Actes médicaux à la charge de l'assurance
                              </p>
                            </td>
                            <td className="px-6 py-6 text-right font-bold text-slate-600">
                              {Number(selectedFacture.montant).toLocaleString()} GNF
                            </td>
                            <td className="px-6 py-6 text-right font-black text-xl text-blue-600 bg-blue-50/10">
                              {Number(selectedFacture.montant_assurance || 0).toLocaleString()} GNF
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2rem] space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200/50 pb-6">
                        <div className="space-y-1 flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informations de Remboursement</p>
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                            Conformément à la convention de tiers-payant, veuillez libérer ce montant par virement ou chèque libellé au nom de la <span className="font-bold text-slate-900">Clinique CEMECO</span>.
                          </p>
                          <p className="text-xs font-bold text-blue-700 mt-2">Délai contractuel de règlement : 30 jours.</p>
                        </div>
                        {selectedFacture.validation_ref && (
                          <div className="space-y-1 md:text-right bg-blue-50/50 border border-blue-100 p-4 rounded-2xl max-w-sm">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Rapprochement Admin</p>
                            <p className="text-xs font-bold text-slate-700">Réf: <span className="font-mono font-black">{selectedFacture.validation_ref}</span></p>
                            <p className="text-[10px] font-black text-blue-600 mt-1">
                              {selectedFacture.statut === 'payee' 
                                ? "✅ Remboursement Validé & Encaissé par l'Admin" 
                                : "⏳ Validation Admin en cours"
                              }
                            </p>
                          </div>
                        )}
                          {selectedFacture.statut === 'en_attente' && (
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl max-w-sm">
                              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Action requise</p>
                              <p className="text-xs text-slate-600 mt-2">Cette facture d'assurance doit être transmise à l'administration pour validation.</p>
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mt-4" htmlFor="validationRef">Référence de validation</label>
                              <input
                                id="validationRef"
                                type="text"
                                value={validationRef}
                                onChange={(e) => setValidationRef(e.target.value)}
                                placeholder="N° virement, chèque ou bordereau"
                                className="w-full mt-2 px-4 py-2 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                              />
                              <button
                                onClick={() => demanderValidation(selectedFacture)}
                                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-all"
                              >
                                Envoyer en validation
                              </button>
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-2 text-left w-full md:w-auto">
                          <div className="flex justify-between md:justify-start gap-8 border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Montant Total Consultation :</span>
                            <span className="text-sm font-bold text-slate-600">
                              {Number(selectedFacture.montant).toLocaleString()} GNF
                            </span>
                          </div>
                          <div className="flex justify-between md:justify-start gap-8">
                            <span className="text-xs font-bold text-slate-400 uppercase">Part Ticket Modérateur (Réglée par Patient) :</span>
                            <span className="text-sm font-bold text-slate-800">
                              {Number(selectedFacture.montant_patient || 0).toLocaleString()} GNF
                            </span>
                          </div>
                        </div>
                        <div className="text-right w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Montant dû par l'Assurance</p>
                          <p className="text-4xl font-black text-blue-600">
                            {Number(selectedFacture.montant_assurance || 0).toLocaleString()} <span className="text-lg">GNF</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-12 text-center border-t border-dashed border-slate-200">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Le Médecin / Secrétariat Facturation</p>
                        <div className="h-16 flex items-center justify-center italic text-slate-300 font-black text-5xl opacity-10">
                          CEMECO
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cachet de la Compagnie pour Validation</p>
                        <div className="h-16"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* STRUCTURE DE REÇU PATIENT STANDARD */
                  <>
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

                    <div className="bg-slate-50 p-8 rounded-[2rem] space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200/50 pb-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode de paiement</p>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                            {METHODES_PAIEMENT.find(m => m.value === selectedFacture.payment_method)?.label || selectedFacture.payment_method}
                          </p>
                          {selectedFacture.payment_method === 'orange-money' && selectedFacture.orange_number && (
                            <p className="text-xs text-orange-600 font-semibold">Téléphone Orange Money: {selectedFacture.orange_number}</p>
                          )}
                          {selectedFacture.payment_method === 'cheque' && (
                            <div className="text-xs text-slate-600 space-y-0.5 font-semibold">
                              <p>N° Chèque: {selectedFacture.cheque_number}</p>
                              <p>Banque: {selectedFacture.bank_name}</p>
                              <p>Titulaire: {selectedFacture.cheque_holder}</p>
                            </div>
                          )}
                        </div>
                        {selectedFacture.patient_type === 'insured' && (
                          <div className="space-y-1 md:text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informations Assurance</p>
                            <p className="text-sm font-black text-blue-700 uppercase tracking-tighter">
                              {selectedFacture.insurance_provider}
                            </p>
                            <p className="text-xs text-slate-600 font-semibold">Carte N°: {selectedFacture.insurance_number}</p>
                            <p className="text-xs text-slate-600 font-semibold">Taux de couverture: {selectedFacture.coverage_rate}%</p>
                            {selectedFacture.validation_ref && (
                              <div className="mt-2 bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl text-[10px] text-left md:text-right max-w-xs ml-auto">
                                <p className="font-bold text-slate-700">Réf. Règlement: <span className="font-mono font-black">{selectedFacture.validation_ref}</span></p>
                                <p className="font-black text-blue-600 mt-0.5">
                                  {selectedFacture.statut === 'payee' 
                                    ? "✅ Remboursement Validé" 
                                    : "⏳ Validation Admin en cours"
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        {selectedFacture.patient_type === 'insured' ? (
                          <div className="space-y-2 text-left w-full md:w-auto">
                            <div className="flex justify-between md:justify-start gap-8 border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-400 uppercase">Part Assurance ({selectedFacture.coverage_rate}%) :</span>
                              <span className="text-sm font-black text-blue-600">
                                {Number(selectedFacture.montant_assurance || 0).toLocaleString()} GNF
                              </span>
                            </div>
                            <div className="flex justify-between md:justify-start gap-8">
                              <span className="text-xs font-bold text-slate-400 uppercase">Part Patient ({100 - selectedFacture.coverage_rate}%) :</span>
                              <span className="text-sm font-black text-slate-800">
                                {Number(selectedFacture.montant_patient || 0).toLocaleString()} GNF
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type de prise en charge</p>
                            <p className="text-xs font-bold text-slate-800">Prise en charge patient à 100% (Non-assuré)</p>
                          </div>
                        )}
                        <div className="text-right w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Montant payé par Patient</p>
                          <p className="text-4xl font-black text-emerald-600">
                            {Number(selectedFacture.patient_type === 'insured' ? selectedFacture.montant_patient : selectedFacture.montant).toLocaleString()} <span className="text-lg">GNF</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Historique de validation</h4>
                          <p className="text-[10px] text-slate-400">Suivi des statuts et validations enregistrées pour cette facture.</p>
                        </div>
                        <span className="text-[10px] text-slate-500">{historyLoading ? 'Chargement...' : `${history.length} événement(s)`}</span>
                      </div>
                      {historyLoading ? (
                        <p className="text-xs text-slate-500">Chargement de l'historique...</p>
                      ) : history.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucun historique disponible pour cette facture.</p>
                      ) : (
                        <div className="space-y-3">
                          {history.map((entry) => {
                            const oldStatut = entry.old_value ? JSON.parse(entry.old_value)?.statut : null;
                            const newStatut = entry.new_value ? JSON.parse(entry.new_value)?.statut : null;
                            const summary = entry.note
                              ? entry.note
                              : oldStatut && newStatut && oldStatut !== newStatut
                                ? `${STATUTS_LABEL[oldStatut] || oldStatut} → ${STATUTS_LABEL[newStatut] || newStatut}`
                                : entry.action.replace(/_/g, ' ');
                            return (
                              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{entry.action.replace(/_/g, ' ')}</p>
                                    <p className="text-sm font-bold text-slate-900">{summary}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-500">{new Date(entry.created_at).toLocaleString('fr-FR')}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3 text-[10px] text-slate-600">
                                  <div>Rôle: {entry.user_role || 'N/A'}</div>
                                  <div>Utilisateur: {entry.user_id || 'N/A'}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
                  </>
                )}
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