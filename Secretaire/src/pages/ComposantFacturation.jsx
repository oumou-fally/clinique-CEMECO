import { useMemo, useState } from 'react'
import { Download, Eye, Search, Check, AlertCircle, Plus, X, TrendingUp } from 'lucide-react'
import Layout from '../layouts/Layout'

const FACTURES_INITIALES = [
  {
    id: 'FAC-2026-001',
    patient: 'Aminata Diallo',
    amount: 125000,
    status: 'paid',
    patientType: 'insured',
    insuranceProvider: 'CNAM',
    paymentMethod: 'banque',
    bankName: 'Banque Malienne de Solidarité',
    date: '2026-04-09'
  },
  {
    id: 'FAC-2026-002',
    patient: 'Sekou Cissé',
    amount: 87000,
    status: 'pending',
    patientType: 'non-insured',
    paymentMethod: 'orange-money',
    date: '2026-04-10'
  },
  {
    id: 'FAC-2026-003',
    patient: 'Fatoumata Bah',
    amount: 91000,
    status: 'overdue',
    patientType: 'insured',
    insuranceProvider: 'NSR Banque',
    paymentMethod: 'banque',
    bankName: 'Banque Commerciale du Sénégal',
    date: '2026-04-08'
  }
]

const BANQUES_ASSUREURS = [
  'UGAR_ACTIVA',
  'NSIA',
  'LANALA',
  'ASK',
  'VISTA_ASSURANCE'
]

const TYPES_PAIEMENT_NON_ASSURE = [
  'orange-money',
  'carte-bancaire',
  'cheque',
  'especes'
]

const TYPES_PAIEMENT_LABELS = {
  'orange-money': 'Orange Money',
  'carte-bancaire': 'Carte bancaire',
  'cheque': 'Chèque',
  'especes': 'Espèces'
}

const STATUTS_LABEL = {
  paid: 'Payée',
  pending: 'En attente',
  overdue: 'Retard'
}

const STATUTS_CLASSES = {
  paid: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  overdue: 'bg-rose-100 text-rose-800'
}

const STATUTS_ICONE = {
  paid: <Check className="w-5 h-5 text-emerald-600" />,
  pending: <AlertCircle className="w-5 h-5 text-amber-600" />,
  overdue: <AlertCircle className="w-5 h-5 text-rose-600" />
}

const FILTRES = [
  { key: 'all', label: 'Tous' },
  { key: 'paid', label: 'Payées' },
  { key: 'pending', label: 'En attente' },
  { key: 'overdue', label: 'Retard' }
]

const FORMULAIRE_INITIAL = {
  patient: '',
  service: 'Consultation cardiaque',
  amount: '',
  date: '',
  patientType: '',
  insuranceProvider: '',
  bankPercentage: 10,
  paymentMethod: '',
  bankName: '',
  orangeNumber: '',
  orangeName: '',
  cardNumber: '',
  cardName: ''
}

export default function ComposantFacturation() {
  const [factures, setFactures] = useState(FACTURES_INITIALES)
  const [filtre, setFiltre] = useState('all')
  const [recherche, setRecherche] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [factureForm, setFactureForm] = useState(FORMULAIRE_INITIAL)
  const [erreur, setErreur] = useState('')

  const facturesAffichees = useMemo(
    () =>
      factures.filter((invoice) => {
        const matchesFilter = filtre === 'all' || invoice.status === filtre
        const matchesSearch =
          invoice.patient.toLowerCase().includes(recherche.toLowerCase()) ||
          invoice.id.toLowerCase().includes(recherche.toLowerCase())
        return matchesFilter && matchesSearch
      }),
    [factures, filtre, recherche]
  )

  const montantTotal = facturesAffichees.reduce((sum, invoice) => sum + invoice.amount, 0)
  const montantPayee = facturesAffichees
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const montantAttente = facturesAffichees
    .filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  const gererChangement = (e) => {
    const { name, value } = e.target
    setFactureForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'patientType' && value === 'non-insured') {
      setFactureForm((prev) => ({ ...prev, paymentMethod: 'orange-money' }))
    }
  }

  const ouvrirModal = () => {
    setModalVisible(true)
    setErreur('')
  }

  const fermerModal = () => {
    setModalVisible(false)
    setFactureForm(FORMULAIRE_INITIAL)
    setErreur('')
  }

  const enregistrerFacture = () => {
    if (!factureForm.patient || !factureForm.amount || !factureForm.date || !factureForm.patientType) {
      setErreur('Veuillez renseigner tous les champs obligatoires.')
      return
    }

    if (factureForm.patientType === 'insured' && (!factureForm.insuranceProvider || !factureForm.bankName)) {
      setErreur('Veuillez sélectionner l\'assureur et la banque.')
      return
    }

    if (factureForm.patientType === 'non-insured' && !factureForm.paymentMethod) {
      setErreur('Veuillez sélectionner un mode de paiement.')
      return
    }

    if (factureForm.patientType === 'non-insured' && factureForm.paymentMethod === 'orange-money' && !factureForm.orangeNumber) {
      setErreur('Veuillez renseigner le numéro Orange Money.')
      return
    }

    if (factureForm.patientType === 'non-insured' && factureForm.paymentMethod === 'carte-bancaire' && (!factureForm.cardNumber || !factureForm.cardName)) {
      setErreur('Veuillez renseigner les informations de la carte bancaire.')
      return
    }

    const nouvelleFacture = {
      id: `FAC-${Date.now()}`,
      patient: factureForm.patient,
      service: factureForm.service,
      amount: Number(factureForm.amount),
      date: factureForm.date,
      status: 'pending',
      patientType: factureForm.patientType,
      insuranceProvider: factureForm.insuranceProvider,
      bankPercentage: factureForm.patientType === 'insured' ? factureForm.bankPercentage : null,
      paymentMethod: factureForm.paymentMethod,
      bankName: factureForm.bankName,
      orangeNumber: factureForm.orangeNumber,
      orangeName: factureForm.orangeName,
      cardNumber: factureForm.cardNumber,
      cardName: factureForm.cardName
    }

    setFactures((prev) => [nouvelleFacture, ...prev])
    fermerModal()
  }

  const marquerPayee = (id) => {
    setFactures((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, status: 'paid' } : invoice)))
  }

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-linear-to-br from-blue-50 via-emerald-50 to-teal-50 min-h-screen">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Facturation</h1>
            <p className="text-slate-600 mt-2">Gérez les factures, paiements et traitements d'assurance</p>
          </div>
          <button onClick={ouvrirModal} className="inline-flex items-center gap-3 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition">
            <Plus className="w-5 h-5" /> Nouvelle facture
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card bg-white p-6 border-l-4 border-slate-400 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total des factures</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{montantTotal.toLocaleString('fr-FR')} GNF</p>
              </div>
              <TrendingUp className="w-12 h-12 text-slate-300" />
            </div>
          </div>
          <div className="card bg-white p-6 border-l-4 border-emerald-500 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">Montant payé</p>
                <p className="mt-3 text-3xl font-bold text-emerald-600">{montantPayee.toLocaleString('fr-FR')} GNF</p>
              </div>
              <Check className="w-12 h-12 text-emerald-300" />
            </div>
          </div>
          <div className="card bg-white p-6 border-l-4 border-amber-500 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">À percevoir</p>
                <p className="mt-3 text-3xl font-bold text-amber-600">{montantAttente.toLocaleString('fr-FR')} GNF</p>
              </div>
              <AlertCircle className="w-12 h-12 text-amber-300" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-md border border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher patient ou facture..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-12 pr-4"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTRES.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFiltre(option.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filtre === option.key ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Facture</th>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Montant</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {facturesAffichees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                facturesAffichees.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{invoice.id}</td>
                    <td className="px-6 py-4 text-slate-700">{invoice.patient}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{invoice.amount.toLocaleString('fr-FR')} GNF</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 badge ${STATUTS_CLASSES[invoice.status]} px-3 py-1 rounded-full`}>
                        {STATUTS_ICONE[invoice.status]} {STATUTS_LABEL[invoice.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex flex-wrap gap-2">
                      <button className="rounded-lg bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="rounded-lg bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 transition">
                        <Download className="w-4 h-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button onClick={() => marquerPayee(invoice.id)} className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700 transition">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {modalVisible && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-200 bg-linear-to-r from-emerald-50 to-teal-50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Nouvelle facture</h2>
                  <p className="text-sm text-slate-600 mt-1">Créez une facture pour le patient</p>
                </div>
                <button onClick={fermerModal} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {erreur && <div className="m-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200">⚠️ {erreur}</div>}

              <div className="p-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Patient *</label>
                    <input name="patient" value={factureForm.patient} onChange={gererChangement} placeholder="Nom du patient" className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Service *</label>
                    <select name="service" value={factureForm.service} onChange={gererChangement} className="mt-2">
                      <option value="Consultation cardiaque">Consultation cardiaque</option>
                      <option value="Électrocardiogramme">Électrocardiogramme</option>
                      <option value="Échocardiogramme">Échocardiogramme</option>
                      <option value="Holter">Holter</option>
                      <option value="IRM cardiaque">IRM cardiaque</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Montant (GNF) *</label>
                    <input type="number" name="amount" value={factureForm.amount} onChange={gererChangement} placeholder="Montant" className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Date *</label>
                    <input type="date" name="date" value={factureForm.date} onChange={gererChangement} className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Type de patient *</label>
                    <select name="patientType" value={factureForm.patientType} onChange={gererChangement} className="mt-2">
                      <option value="">Sélectionner</option>
                      <option value="insured">Patient assuré</option>
                      <option value="non-insured">Patient non assuré</option>
                    </select>
                  </div>
                </div>

                {factureForm.patientType === 'insured' && (
                  <>
                    <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                      <p className="text-sm font-semibold text-emerald-900">🏥 Patient Assuré</p>
                      <p className="text-xs text-emerald-700 mt-1">La banque prend un pourcentage de la facture (10% à 100%) et envoie un chèque à l'administrateur.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Assureur *</label>
                        <select name="insuranceProvider" value={factureForm.insuranceProvider} onChange={gererChangement} className="mt-2">
                          <option value="">Sélectionner un assureur</option>
                          {BANQUES_ASSUREURS.map((assureur) => (
                            <option key={assureur} value={assureur}>
                              {assureur}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Pourcentage pris par la banque *</label>
                        <select name="bankPercentage" value={factureForm.bankPercentage} onChange={gererChangement} className="mt-2">
                          <option value={10}>10%</option>
                          <option value={20}>20%</option>
                          <option value={30}>30%</option>
                          <option value={40}>40%</option>
                          <option value={50}>50%</option>
                          <option value={60}>60%</option>
                          <option value={70}>70%</option>
                          <option value={80}>80%</option>
                          <option value={90}>90%</option>
                          <option value={100}>100%</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {factureForm.patientType === 'non-insured' && (
                  <>
                    <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200">
                      <p className="text-sm font-semibold text-amber-900">💳 Patient Non Assuré</p>
                      <p className="text-xs text-amber-700 mt-1">Choisissez le mode de paiement souhaité.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Mode de paiement *</label>
                        <select name="paymentMethod" value={factureForm.paymentMethod} onChange={gererChangement} className="mt-2">
                          <option value="">Sélectionner un mode</option>
                          {TYPES_PAIEMENT_NON_ASSURE.map((type) => (
                            <option key={type} value={type}>
                              {TYPES_PAIEMENT_LABELS[type]}
                            </option>
                          ))}
                        </select>
                      </div>
                      {factureForm.paymentMethod === 'orange-money' && (
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Numéro Orange Money *</label>
                          <input name="orangeNumber" value={factureForm.orangeNumber} onChange={gererChangement} placeholder="+224 6XX XX XX XX" className="mt-2" />
                        </div>
                      )}
                      {factureForm.paymentMethod === 'carte-bancaire' && (
                        <>
                          <div>
                            <label className="text-sm font-semibold text-slate-700">Numéro de carte *</label>
                            <input name="cardNumber" value={factureForm.cardNumber} onChange={gererChangement} placeholder="XXXX XXXX XXXX XXXX" className="mt-2" />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-slate-700">Titulaire de la carte *</label>
                            <input name="cardName" value={factureForm.cardName} onChange={gererChangement} placeholder="Nom du titulaire" className="mt-2" />
                          </div>
                        </>
                      )}
                    </div>
                    {factureForm.paymentMethod === 'orange-money' && (
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Titulaire Orange Money</label>
                        <input name="orangeName" value={factureForm.orangeName} onChange={gererChangement} placeholder="Nom du titulaire" className="mt-2" />
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={fermerModal} className="rounded-xl border-2 border-slate-300 px-5 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition">
                    Annuler
                  </button>
                  <button onClick={enregistrerFacture} className="rounded-xl bg-emerald-600 px-5 py-2 text-white font-semibold hover:bg-emerald-700 transition">
                    Créer facture
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
