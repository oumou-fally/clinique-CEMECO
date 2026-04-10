import Layout from '../layouts/Layout'
import { Calendar, FileText, BarChart3, Eye, Download, Search } from 'lucide-react'
import { useState } from 'react'

export default function Supervision() {
  const [searchRendezVous, setSearchRendezVous] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')

  const rendezVous = [
    { id: 1, patient: 'Aminata Diallo', medecin: 'Dr. Mamadou Diallo', date: '2026-04-10', heure: '10:30', statut: 'Confirmé' },
    { id: 2, patient: 'Fatoumata Bah', medecin: 'Dr. Thierno Siradjo Baldé', date: '2026-04-10', heure: '11:00', statut: 'En attente' },
    { id: 3, patient: 'Mariama Traoré', medecin: 'Dr. Mamadou Bassirou Bah', date: '2026-04-11', heure: '14:00', statut: 'Confirmé' },
    { id: 4, patient: 'Mmady Sacko', medecin: 'Dr. Mamadou Diallo', date: '2026-04-12', heure: '15:30', statut: 'Annulé' },
    { id: 5, patient: 'Sekou Cisse', medecin: 'Dr. Thierno Siradjo Baldé', date: '2026-04-13', heure: '09:00', statut: 'Confirmé' },
  ]

  const dossiersMedicaux = [
    { id: 1, patient: 'Aminata Diallo', telephone: '07 01 02 03 04', dateInscription: '2025-01-15', consultations: 3 },
    { id: 2, patient: 'Fatoumata Bah', telephone: '07 05 06 07 08', dateInscription: '2025-02-20', consultations: 1 },
    { id: 3, patient: 'Mariama Traoré', telephone: '07 09 10 11 12', dateInscription: '2025-01-10', consultations: 5 },
    { id: 4, patient: 'Mmady Sacko', telephone: '07 13 14 15 16', dateInscription: '2025-03-05', consultations: 2 },
    { id: 5, patient: 'Sekou Cisse', telephone: '07 17 18 19 20', dateInscription: '2025-02-01', consultations: 4 },
  ]

  const statistiques = [
    { label: 'Total Rendez-vous', value: '156', icon: Calendar, color: 'blue' },
    { label: 'Dossiers Médicaux', value: '1,234', icon: FileText, color: 'green' },
    { label: 'Consultations', value: '892', icon: BarChart3, color: 'purple' },
    { label: 'Taux Conformité', value: '98.5%', icon: Eye, color: 'orange' },
  ]

  const rendezvousFiltres = rendezVous.filter(rv => {
    const matchSearch = rv.patient.toLowerCase().includes(searchRendezVous.toLowerCase()) ||
                        rv.medecin.toLowerCase().includes(searchRendezVous.toLowerCase())
    const matchStatut = filterStatut === 'tous' || rv.statut === filterStatut
    return matchSearch && matchStatut
  })

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Confirmé':
        return 'bg-green-100 text-green-800'
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Annulé':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervision Globale</h1>
          <p className="text-gray-600 mt-1">Visualisez tous les rendez-vous, dossiers médicaux et statistiques</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistiques.map((stat, index) => {
            const Icon = stat.icon
            const colorMap = {
              blue: 'bg-blue-100 text-blue-600 border-l-blue-500',
              green: 'bg-green-100 text-green-600 border-l-green-500',
              purple: 'bg-purple-100 text-purple-600 border-l-purple-500',
              orange: 'bg-orange-100 text-orange-600 border-l-orange-500'
            }
            return (
              <div key={index} className={`bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${colorMap[stat.color]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-20" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Rendez-vous */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Tous les Rendez-vous
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Filtres */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par patient ou médecin..."
                  value={searchRendezVous}
                  onChange={(e) => setSearchRendezVous(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="tous">Tous les statuts</option>
                <option value="Confirmé">Confirmés</option>
                <option value="En attente">En attente</option>
                <option value="Annulé">Annulés</option>
              </select>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Médecin</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Heure</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Statut</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rendezvousFiltres.map((rv) => (
                    <tr key={rv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{rv.patient}</td>
                      <td className="px-4 py-4 text-gray-600">{rv.medecin}</td>
                      <td className="px-4 py-4 text-gray-600">{rv.date}</td>
                      <td className="px-4 py-4 text-gray-600">{rv.heure}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(rv.statut)}`}>
                          {rv.statut}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto">
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rendezvousFiltres.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun rendez-vous trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Dossiers Médicaux */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b bg-gradient-to-r from-green-50 to-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Accès aux Dossiers Médicaux (Lecture)
            </h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Téléphone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date Inscription</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Consultations</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dossiersMedicaux.map((dossier) => (
                    <tr key={dossier.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{dossier.patient}</td>
                      <td className="px-4 py-4 text-gray-600">{dossier.telephone}</td>
                      <td className="px-4 py-4 text-gray-600">{dossier.dateInscription}</td>
                      <td className="px-4 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {dossier.consultations}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-green-600 hover:text-green-700 flex items-center gap-1 ml-auto">
                          <Eye className="w-4 h-4" />
                          Consulter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Statistiques Détaillées
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <p className="text-gray-700 font-medium">Rendez-vous cette semaine</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">32</p>
              <p className="text-sm text-gray-600 mt-2">↑ 8% par rapport à la semaine dernière</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <p className="text-gray-700 font-medium">Patients actifs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">1,234</p>
              <p className="text-sm text-gray-600 mt-2">↑ 12% depuis le mois dernier</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <p className="text-gray-700 font-medium">Taux de satisfaction</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">4.8/5</p>
              <p className="text-sm text-gray-600 mt-2">Basé sur 456 avis</p>
            </div>
          </div>

          <button className="mt-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition">
            <Download className="w-4 h-4" />
            Générer Rapport Complet
          </button>
        </div>
      </div>
    </Layout>
  )
}
