import { CreditCard, Download, Eye, Filter, Search, Check, Clock, AlertCircle, Plus } from 'lucide-react'

// =========================
// COMPOSANT : GESTION DE LA FACTURATION
// =========================
export default function ComposantFacturation({ 
  invoices, 
  filter, 
  onFilterChange, 
  searchTerm, 
  onSearchChange, 
  onNewInvoiceClick,
  onMarkPaidByBank
}) {

  // =========================
  // GESTION DES STATUTS (COULEURS)
  // =========================
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // =========================
  // LIBELLÉ DU STATUT
  // =========================
  const getStatusLabel = (status, patientType) => {
    if (patientType === 'insured' && status === 'pending') {
      return 'En attente banque'
    }

    switch (status) {
      case 'paid':
        return 'Payée'
      case 'pending':
        return 'En attente'
      case 'overdue':
        return 'Retard'
      default:
        return status
    }
  }

  // =========================
  // ICÔNE DU STATUT
  // =========================
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <Check className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  // =========================
  // FILTRAGE DES FACTURES
  // =========================
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesFilter = filter === 'all' || invoice.status === filter
    const matchesSearch =
      invoice.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // =========================
  // CALCUL DES MONTANTS
  // =========================
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  // =========================
  // GESTION DES ASSURANCES / BANQUES
  // =========================
  const insuredInvoices = invoices.filter((inv) => inv.patientType === 'insured')

  const paidInsuranceBanks = Array.from(
    new Set(
      insuredInvoices
        .filter((inv) => inv.status === 'paid')
        .map((inv) => inv.insuranceProvider)
    )
  )

  const pendingInsuranceBanks = Array.from(
    new Set(
      insuredInvoices
        .filter((inv) => inv.status !== 'paid')
        .map((inv) => inv.insuranceProvider)
    )
  )

  return (
    <div className="space-y-6">

      {/* ========================= */}
      {/* EN-TÊTE */}
      {/* ========================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturation en Ligne</h1>
          <p className="text-gray-600 mt-2">Gérez les factures et les paiements</p>
        </div>

        {/* Bouton nouvelle facture */}
        <button 
          onClick={onNewInvoiceClick}
          className="bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvelle Facture
        </button>
      </div>

      {/* ========================= */}
      {/* RÉSUMÉ FINANCIER */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Total */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {totalAmount.toFixed(2)} GNF
          </p>
        </div>

        {/* Payées */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Payées</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {paidAmount.toFixed(2)} GNF
          </p>
        </div>

        {/* En attente */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">À Percevoir</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {pendingAmount.toFixed(2)} GNF
          </p>
        </div>

      </div>

      {/* ========================= */}
      {/* RECHERCHE + FILTRES */}
      {/* ========================= */}
      <div className="bg-white rounded-xl shadow-md p-4">

        <div className="flex flex-col md:flex-row gap-4">

          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue'].map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === f
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ========================= */}
      {/* TABLE DES FACTURES */}
      {/* ========================= */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">Facture</th>
              <th className="px-6 py-4 text-left">Patient</th>
              <th className="px-6 py-4 text-left">Montant</th>
              <th className="px-6 py-4 text-left">Statut</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b">
                <td className="px-6 py-4">{invoice.id}</td>
                <td className="px-6 py-4">{invoice.patient}</td>
                <td className="px-6 py-4">{invoice.amount.toFixed(2)} GNF</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invoice.status)}
                    <span className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status, invoice.patientType)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2">
                    <Download className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  )
}