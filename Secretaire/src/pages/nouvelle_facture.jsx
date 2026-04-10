import { X } from 'lucide-react'

export default function Nouvelle_Facture({
  showModal,
  onClose,
  formData,
  onFormChange,
  onAddInvoice
}) {
  if (!showModal) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      style={{
        backgroundImage: "url('/images/facture-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Nouvelle Facture</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CHAMPS DE BASE */}
        <input
          type="text"
          name="patient"
          placeholder="Nom du patient"
          value={formData.patient}
          onChange={onFormChange}
          className="w-full border p-2 rounded-lg mb-3"
        />

        <input
          type="text"
          name="service"
          placeholder="Service"
          value={formData.service}
          onChange={onFormChange}
          className="w-full border p-2 rounded-lg mb-3"
        />

        <input
          type="number"
          name="amount"
          placeholder="Montant"
          value={formData.amount}
          onChange={onFormChange}
          className="w-full border p-2 rounded-lg mb-3"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={onFormChange}
          className="w-full border p-2 rounded-lg mb-3"
        />

        {/* TYPE PATIENT */}
        <select
          name="patientType"
          value={formData.patientType}
          onChange={onFormChange}
          className="w-full border p-2 rounded-lg mb-3"
        >
          <option value="">Type de patient</option>
          <option value="insured">Patient assuré</option>
          <option value="non-insured">Patient non assuré</option>
        </select>

        {/* PATIENT ASSURÉ */}
        {formData.patientType === 'insured' && (
          <div className="space-y-3 mb-3">
            <input
              type="text"
              name="insuranceProvider"
              placeholder="Nom de l'assurance"
              value={formData.insuranceProvider}
              onChange={onFormChange}
              className="w-full border p-2 rounded-lg"
            />

            <div className="p-3 bg-green-50 text-green-700 rounded-lg">
              ✅ Facture prise en charge par l’assurance
            </div>
          </div>
        )}

        {/* PATIENT NON ASSURÉ */}
        {formData.patientType === 'non-insured' && (
          <div className="space-y-3 mb-3">

            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={onFormChange}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Mode de paiement</option>
              <option value="banque">Banque</option>
              <option value="orange-money">Orange Money</option>
            </select>

            {/* BANQUE */}
            {formData.paymentMethod === 'banque' && (
              <>
                <input
                  name="bankName"
                  placeholder="Nom de la banque"
                  value={formData.bankName}
                  onChange={onFormChange}
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  name="bankAccountNumber"
                  placeholder="Numéro de compte"
                  value={formData.bankAccountNumber}
                  onChange={onFormChange}
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  name="bankRIB"
                  placeholder="RIB"
                  value={formData.bankRIB}
                  onChange={onFormChange}
                  className="w-full border p-2 rounded-lg"
                />
              </>
            )}

            {/* ORANGE MONEY */}
            {formData.paymentMethod === 'orange-money' && (
              <>
                <input
                  name="orangeNumber"
                  placeholder="Numéro Orange Money"
                  value={formData.orangeNumber}
                  onChange={onFormChange}
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  name="orangeName"
                  placeholder="Nom du titulaire"
                  value={formData.orangeName}
                  onChange={onFormChange}
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  name="orangeTransactionId"
                  placeholder="ID transaction"
                  value={formData.orangeTransactionId}
                  onChange={onFormChange}
                  className="w-full border p-2 rounded-lg"
                />
              </>
            )}

          </div>
        )}

        {/* BOUTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Annuler
          </button>

          <button
            onClick={onAddInvoice}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            Enregistrer
          </button>
        </div>

      </div>
    </div>
  )
}