import { X, Plus, CreditCard, Smartphone, Banknote, Landmark, CheckCircle2 } from 'lucide-react'

// =========================
// CONSTANTES ET CONFIGURATION
// =========================
const ASSURANCES = [
  'UGAR_ACTIVA',
  'NSIA',
  'LANALA',
  'ASK',
  'VISTA_ASSURANCE'
]

const MODES_PAIEMENT = [
  { id: 'cash', label: 'Espèces', icon: Banknote, color: 'emerald' },
  { id: 'cheque', label: 'Chèque', icon: CheckCircle2, color: 'blue' },
  { id: 'banque', label: 'Virement / Carte', icon: Landmark, color: 'indigo' },
  { id: 'orange-money', label: 'Orange Money', icon: Smartphone, color: 'orange' }
]

// =========================
// COMPOSANT : FORMULAIRE PROFESSIONNEL
// =========================
export default function ComposantFormulaireFacture({ 
  showModal, 
  onClose, 
  formData, 
  onFormChange, 
  onAddInvoice,
  patients = [],
  typesConsultation = []
}) {

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
        
        {/* HEADER PREMIUM */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouvelle Facture</h2>
              <p className="text-sm font-medium text-slate-500">Génération automatique de document financier</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* SECTION 1 : PATIENT & SERVICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sélection du Patient</label>
              <select
                name="patient_id"
                value={formData.patient_id || ''}
                onChange={onFormChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold text-slate-700"
              >
                <option value="">Choisir un patient...</option>
                {patients.length > 0 ? (
                  patients.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))
                ) : (
                  <option disabled>Aucun patient trouvé</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type de Consultation</label>
              <select
                name="type_consultation_id"
                value={formData.type_consultation_id || ''}
                onChange={onFormChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold text-slate-700"
              >
                <option value="">Choisir un service...</option>
                {typesConsultation.length > 0 ? (
                  typesConsultation.map(t => (
                    <option key={t.id} value={t.id}>{t.nom} — {Number(t.prix).toLocaleString()} GNF</option>
                  ))
                ) : (
                  <option disabled>Aucun service trouvé</option>
                )}
              </select>
            </div>
          </div>

          {/* SECTION 2 : FINANCES & DATE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Montant à régler (GNF)</label>
              <div className="relative">
                <input
                  type="text"
                  name="montant"
                  value={formData.montant ? Number(formData.montant).toLocaleString() : '0'}
                  readOnly
                  className="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl font-black text-2xl text-emerald-600 shadow-sm outline-none"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">GNF</div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date d'émission</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onFormChange}
                className="w-full px-5 py-4 bg-white border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
              />
            </div>
          </div>

          {/* SECTION 3 : STATUT & PAIEMENT */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Profil de prise en charge</label>
            <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => onFormChange({ target: { name: 'patientType', value: 'non-insured' }})}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${formData.patientType === 'non-insured' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Patient non assuré
              </button>
              <button
                type="button"
                onClick={() => onFormChange({ target: { name: 'patientType', value: 'insured' }})}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${formData.patientType === 'insured' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Patient assuré
              </button>
            </div>
          </div>

          {/* DÉTAILS PAIEMENT : ASSURÉ */}
          {formData.patientType === 'insured' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <Landmark className="w-5 h-5" />
                  <span className="font-black text-xs uppercase tracking-wider">Informations Assurance</span>
                </div>
                <select
                  name="insuranceProvider"
                  value={formData.insuranceProvider || ''}
                  onChange={onFormChange}
                  className="w-full px-5 py-4 bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                >
                  <option value="">Sélectionner l'organisme...</option>
                  {ASSURANCES.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                </select>
                <p className="text-[10px] text-blue-500 font-medium px-2 uppercase tracking-tight leading-relaxed">
                  * La facture sera marquée "En attente" et envoyée au portail de l'assurance pour validation.
                </p>
              </div>
            </div>
          )}

          {/* DÉTAILS PAIEMENT : NON ASSURÉ */}
          {formData.patientType === 'non-insured' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mode de règlement immédiat</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MODES_PAIEMENT.map((mode) => {
                    const Icon = mode.icon
                    const isActive = formData.paymentMethod === mode.id
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => onFormChange({ target: { name: 'paymentMethod', value: mode.id }})}
                        className={`flex flex-col items-center gap-3 p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${
                          isActive 
                          ? `bg-${mode.color}-50 border-${mode.color}-500 text-${mode.color}-600 shadow-sm` 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? `text-${mode.color}-600` : 'text-slate-300'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{mode.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Champs dynamiques selon le mode */}
              <div className="grid grid-cols-1 gap-4">
                {formData.paymentMethod === 'orange-money' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="orangeNumber"
                      value={formData.orangeNumber || ''}
                      onChange={onFormChange}
                      placeholder="Numéro de téléphone (OM)"
                      className="w-full px-5 py-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none font-bold text-orange-700"
                    />
                    <input
                      type="text"
                      name="orange_transaction_id"
                      value={formData.orange_transaction_id || ''}
                      onChange={onFormChange}
                      placeholder="ID Transaction Orange"
                      className="w-full px-5 py-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none font-bold text-orange-700"
                    />
                  </div>
                )}
                {formData.paymentMethod === 'banque' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName || ''}
                      onChange={onFormChange}
                      placeholder="Nom de la banque émettrice"
                      className="w-full px-5 py-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl outline-none font-bold text-indigo-700"
                    />
                    <input
                      type="text"
                      name="bank_account_number"
                      value={formData.bank_account_number || ''}
                      onChange={onFormChange}
                      placeholder="N° de Carte ou Virement"
                      className="w-full px-5 py-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl outline-none font-bold text-indigo-700"
                    />
                  </div>
                )}
                {formData.paymentMethod === 'cheque' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName || ''}
                      onChange={onFormChange}
                      placeholder="Banque émettrice du chèque"
                      className="w-full px-5 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-bold text-blue-700"
                    />
                    <input
                      type="text"
                      name="orange_transaction_id"
                      value={formData.orange_transaction_id || ''}
                      onChange={onFormChange}
                      placeholder="Numéro du Chèque"
                      className="w-full px-5 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-bold text-blue-700"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 border-2 border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white hover:border-slate-300 transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={onAddInvoice} 
              className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Finaliser & Enregistrer
            </button>
          </div>

      </div>
    </div>
  )
}