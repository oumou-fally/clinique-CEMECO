import { X } from 'lucide-react'

// =========================
// LISTE DES BANQUES / ASSURANCES
// =========================
const fournisseursAssurance = [
  'UGAR_ACTIVA',
  'NSIA',
  'LANALA',
  'ASK',
  'VISTA_ASSURANCE'
]

// =========================
// COMPOSANT : FORMULAIRE FACTURE
// =========================
export default function ComposantFormulaireFacture({ 
  showModal, 
  onClose, 
  formData, 
  onFormChange, 
  onAddInvoice 
}) {

  return (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

        {/* ========================= */}
        {/* CONTENEUR MODAL */}
        {/* ========================= */}
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">

          {/* ========================= */}
          {/* EN-TÊTE DU FORMULAIRE */}
          {/* ========================= */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nouvelle Facture</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* ========================= */}
          {/* CHAMPS DU FORMULAIRE */}
          {/* ========================= */}
          <div className="space-y-4">

            {/* ========================= */}
            {/* PATIENT */}
            {/* ========================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              <input
                type="text"
                name="patient"
                value={formData.patient}
                onChange={onFormChange}
                placeholder="Nom du patient"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* ========================= */}
            {/* SERVICE */}
            {/* ========================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <input
                type="text"
                name="service"
                value={formData.service}
                onChange={onFormChange}
                placeholder="Ex: Consultation cardiologie"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* ========================= */}
            {/* MONTANT */}
            {/* ========================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant (GNF)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onFormChange}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* ========================= */}
            {/* DATE */}
            {/* ========================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* ========================= */}
            {/* TYPE DE PATIENT */}
            {/* ========================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de patient</label>

              <div className="flex flex-col md:flex-row gap-4">

                {/* Non assuré */}
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="patientType"
                    value="uninsured"
                    checked={formData.patientType === 'uninsured'}
                    onChange={onFormChange}
                  />
                  Patient non assuré
                </label>

                {/* Assuré */}
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="patientType"
                    value="insured"
                    checked={formData.patientType === 'insured'}
                    onChange={onFormChange}
                  />
                  Patient assuré
                </label>

              </div>

              <p className="text-sm text-gray-500 mt-2">
                Choisissez le type de patient avant d’enregistrer la facture.
                Pour les patients assurés, la facture sera envoyée directement à la banque.
              </p>
            </div>

            {/* ========================= */}
            {/* CAS : PATIENT ASSURÉ */}
            {/* ========================= */}
            {formData.patientType === 'insured' ? (
              <div className="space-y-4">

                {/* Choix assurance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choisir la banque</label>
                  <select
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={onFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">Sélectionnez une assurance</option>
                    {fournisseursAssurance.map((provider) => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                {/* Information assurance */}
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-900">
                  <p className="font-semibold">Envoi à la banque assurance</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Une fois validée, la facture sera envoyée à la banque sélectionnée.
                    Le dépôt sera effectué sur le compte bancaire de l'administrateur <strong>Elhadj Yaya Baldé</strong>.
                  </p>
                </div>

              </div>
            ) : (
              <>
                {/* ========================= */}
                {/* MODE DE PAIEMENT */}
                {/* ========================= */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>

                  <div className="flex items-center gap-4">

                    {/* Banque */}
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="banque"
                        checked={formData.paymentMethod === 'banque'}
                        onChange={onFormChange}
                      />
                      Compte bancaire
                    </label>

                    {/* Orange Money */}
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="orange-money"
                        checked={formData.paymentMethod === 'orange-money'}
                        onChange={onFormChange}
                      />
                      Orange Money
                    </label>

                  </div>
                </div>

                {/* ========================= */}
                {/* CAS : PAIEMENT BANQUE */}
                {/* ========================= */}
                {formData.paymentMethod === 'banque' && (
                  <div className="space-y-3">
                    <div>
                      <label>Nom de la banque</label>
                      <input type="text" name="bankName" value={formData.bankName} onChange={onFormChange} />
                    </div>
                  </div>
                )}

                {/* ========================= */}
                {/* CAS : ORANGE MONEY */}
                {/* ========================= */}
                {formData.paymentMethod === 'orange-money' && (
                  <div className="space-y-3">
                    <div>
                      <label>Numéro Orange Money</label>
                      <input type="text" name="orangeNumber" value={formData.orangeNumber} onChange={onFormChange} />
                    </div>
                  </div>
                )}

              </>
            )}

            {/* ========================= */}
            {/* ACTIONS */}
            {/* ========================= */}
            <div className="flex gap-3 pt-4">

              {/* Annuler */}
              <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
                Annuler
              </button>

              {/* Ajouter */}
              <button onClick={onAddInvoice} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">
                Ajouter
              </button>

            </div>

          </div>
        </div>
      </div>
    )
  )
}