import Layout from '../layouts/Layout'
import { CreditCard, TrendingUp, FileText, Download, DollarSign, Calendar, Search } from 'lucide-react'
import { useState } from 'react'

export default function GestionFinanciere() {
  const [recherche, setRecherche] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')

  const paiements = [
    { id: 1, patient: 'Aminata Diallo', montant: 50000, date: '2026-04-08', statut: 'Payé', methode: 'Espèces' },
    { id: 2, patient: 'Fatoumata Bah', montant: 75000, date: '2026-04-07', statut: 'En attente', methode: 'Cheque' },
    { id: 3, patient: 'Mariama Traoré', montant: 120000, date: '2026-04-06', statut: 'Payé', methode: 'Virement' },
    { id: 4, patient: 'Mmady Sacko', montant: 45000, date: '2026-04-05', statut: 'Retard', methode: 'Espèces' },
    { id: 5, patient: 'Sekou Cisse', montant: 95000, date: '2026-04-04', statut: 'Payé', methode: 'Carte' },
  ]

  const revenus = [
    { mois: 'Janvier', montant: 2450000, consultations: 89 },
    { mois: 'Février', montant: 2680000, consultations: 96 },
    { mois: 'Mars', montant: 2890000, consultations: 104 },
    { mois: 'Avril (partiel)', montant: 1250000, consultations: 45 },
  ]

  const paiementsFiltres = paiements.filter(p => {
    const matchSearch = p.patient.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filterStatut === 'tous' || p.statut === filterStatut
    return matchSearch && matchStatut
  })

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-100 text-green-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Retard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalRevenu = paiements
    .filter(p => p.statut === 'Payé')
    .reduce((sum, p) => sum + p.montant, 0)

  const totalEnAttente = paiements
    .filter(p => p.statut === 'En attente')
    .reduce((sum, p) => sum + p.montant, 0)

  const totalRetard = paiements
    .filter(p => p.statut === 'Retard')
    .reduce((sum, p) => sum + p.montant, 0)

  const formatMontant = (montant) => {
    return montant.toLocaleString('fr-GN', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0 })
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Financière</h1>
          <p className="text-gray-600 mt-1">Suivi des paiements et génération de rapports financiers</p>
        </div>

        {/* KPIs Financiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow border-l-4 border-green-500 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Montant Payé</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatMontant(totalRevenu)}</p>
                <p className="text-xs text-gray-600 mt-2">{paiements.filter(p => p.statut === 'Payé').length} paiements</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow border-l-4 border-yellow-500 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Attente</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{formatMontant(totalEnAttente)}</p>
                <p className="text-xs text-gray-600 mt-2">{paiements.filter(p => p.statut === 'En attente').length} paiements</p>
              </div>
              <CreditCard className="w-10 h-10 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow border-l-4 border-red-500 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Retard</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{formatMontant(totalRetard)}</p>
                <p className="text-xs text-gray-600 mt-2">{paiements.filter(p => p.statut === 'Retard').length} paiements</p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-200" />
            </div>
          </div>
        </div>

        {/* Tableau des paiements */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Gestion des Paiements
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Filtres */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par patient..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="tous">Tous les statuts</option>
                <option value="Payé">Payés</option>
                <option value="En attente">En attente</option>
                <option value="Retard">En retard</option>
              </select>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Montant</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Méthode</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Statut</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paiementsFiltres.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{p.patient}</td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">{formatMontant(p.montant)}</td>
                      <td className="px-4 py-4 text-gray-600">{p.date}</td>
                      <td className="px-4 py-4 text-gray-600">{p.methode}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(p.statut)}`}>
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto">
                          <FileText className="w-4 h-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paiementsFiltres.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun paiement trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Rapports Financiers */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b bg-gradient-to-r from-purple-50 to-purple-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Rapports Financiers par Mois
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {revenus.map((revenu, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {revenu.mois}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{formatMontant(revenu.montant)}</p>
                    </div>
                    <button className="text-purple-600 hover:text-purple-700 p-2 bg-purple-100 rounded-lg transition">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Consultations : <span className="font-semibold text-gray-900">{revenu.consultations}</span></p>
                    <p className="mt-1">Montant/consultation : <span className="font-semibold text-gray-900">{formatMontant(revenu.montant / revenu.consultations)}</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions d'export */}
            <div className="mt-8 pt-6 border-t flex gap-4">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
                <Download className="w-4 h-4" />
                Exporter en PDF
              </button>
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
                <Download className="w-4 h-4" />
                Exporter en Excel
              </button>
              <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition">
                <Download className="w-4 h-4" />
                Exporter en CSV
              </button>
            </div>
          </div>
        </div>

        {/* Résumé annuel */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Résumé Annuel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-blue-200 text-sm mb-2">Revenu Total</p>
              <p className="text-3xl font-bold">9,270,000 GNF</p>
              <p className="text-blue-200 text-sm mt-2">↑ 15% par rapport à l'année dernière</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-2">Consultations Totales</p>
              <p className="text-3xl font-bold">334</p>
              <p className="text-blue-200 text-sm mt-2">Moyenne : 27,8 par mois</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-2">Taux de Recouvrement</p>
              <p className="text-3xl font-bold">89.2%</p>
              <p className="text-blue-200 text-sm mt-2">↓ 2% par rapport à 2025</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
