import { useState } from 'react'
import { CreditCard, Download, Eye, Filter, Search, Check, Clock, AlertCircle } from 'lucide-react'
import Layout from '../layouts/Layout'

export default function Billing() {
  const [invoices, setInvoices] = useState([
    {
      id: 'FAC-001',
      patient: 'Jean Dupont',
      date: '25/03/2024',
      amount: 150.00,
      status: 'paid',
      service: 'Visite générale'
    },
    {
      id: 'FAC-002',
      patient: 'Marie Lefevre',
      date: '26/03/2024',
      amount: 200.00,
      status: 'pending',
      service: 'Consultation cardiologie'
    },
    {
      id: 'FAC-003',
      patient: 'Pierre Martin',
      date: '27/03/2024',
      amount: 120.00,
      status: 'paid',
      service: 'Visite de suivi'
    },
    {
      id: 'FAC-004',
      patient: 'Anne Durand',
      date: '28/03/2024',
      amount: 180.00,
      status: 'pending',
      service: 'Dermatologie'
    },
    {
      id: 'FAC-005',
      patient: 'Luc Bernard',
      date: '28/03/2024',
      amount: 250.00,
      status: 'overdue',
      service: 'Bilan complet'
    }
  ])

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

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

  const getStatusLabel = (status) => {
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

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesFilter = filter === 'all' || invoice.status === filter
    const matchesSearch =
      invoice.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facturation en Ligne</h1>
            <p className="text-gray-600 mt-2">Gérez les factures et les paiements</p>
          </div>
          <button className="bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition">
            + Nouvelle Facture
          </button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalAmount.toFixed(2)}€</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Payées</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{paidAmount.toFixed(2)}€</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">À Percevoir</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{pendingAmount.toFixed(2)}€</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un patient ou une facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'paid', label: 'Payées' },
                { id: 'pending', label: 'En attente' },
                { id: 'overdue', label: 'Retard' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filter === f.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Facture
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{invoice.id}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{invoice.patient}</td>
                    <td className="px-6 py-4 text-gray-700">{invoice.service}</td>
                    <td className="px-6 py-4 text-gray-700">{invoice.date}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{invoice.amount.toFixed(2)}€</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          title="Voir"
                          className="p-2 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          title="Télécharger"
                          className="p-2 hover:bg-green-100 rounded-lg transition"
                        >
                          <Download className="w-5 h-5 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Exporter les Données</h2>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition">
              📊 PDF
            </button>
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition">
              📈 Excel
            </button>
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition">
              📄 CSV
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
