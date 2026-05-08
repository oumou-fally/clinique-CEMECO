import Layout from '../layouts/Layout'
import { Calendar, FileText, BarChart3, Eye, Download, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Supervision() {
  const [searchRendezVous, setSearchRendezVous] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur supervision:', error)
    } finally {
      setLoading(false)
    }
  }

  const statistiques = [
    { label: 'Total Rendez-vous', value: stats?.reservations?.length || '0', icon: Calendar, color: 'blue' },
    { label: 'Dossiers Médicaux', value: stats?.metrics?.medicalRecords || '0', icon: FileText, color: 'green' },
    { label: 'Patients Inscrits', value: stats?.metrics?.patients || '0', icon: BarChart3, color: 'purple' },
    { label: 'Médecins Actifs', value: stats?.metrics?.medecins || '0', icon: Eye, color: 'orange' },
  ]

  const rendezvousFiltres = (stats?.reservations || []).filter(rv => {
    const matchSearch = (rv.patient_nom + ' ' + rv.patient_prenom).toLowerCase().includes(searchRendezVous.toLowerCase()) ||
                        rv.medecin_nom.toLowerCase().includes(searchRendezVous.toLowerCase())
    const matchStatut = filterStatut === 'tous' || rv.statut === filterStatut
    return matchSearch && matchStatut
  })

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Confirmé': return 'bg-green-100 text-green-800'
      case 'En attente': return 'bg-yellow-100 text-yellow-800'
      case 'Annulé': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervision Globale</h1>
          <p className="text-gray-600 mt-1">Données synchronisées en temps réel depuis la base de données</p>
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
              <div key={index} className={`bg-white rounded-xl shadow p-6 border-l-4 ${colorMap[stat.color]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black mt-2 text-gray-900">{loading ? '...' : stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-20" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Rendez-vous */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="border-b bg-gray-50/50 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Tous les Rendez-vous
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par patient ou médecin..."
                  value={searchRendezVous}
                  onChange={(e) => setSearchRendezVous(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-6 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                <option value="tous">Tous les statuts</option>
                <option value="Confirmé">Confirmés</option>
                <option value="En attente">En attente</option>
                <option value="Annulé">Annulés</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Patient</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Médecin</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Date & Heure</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Statut</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rendezvousFiltres.map((rv) => (
                    <tr key={rv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{rv.patient_prenom} {rv.patient_nom}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">Dr. {rv.medecin_nom}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-bold">{new Date(rv.date_reservation).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-400">{rv.heure}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${getStatutColor(rv.statut)}`}>
                          {rv.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rendezvousFiltres.length === 0 && !loading && (
              <div className="text-center py-10">
                <p className="text-gray-400 font-medium italic">Aucun rendez-vous ne correspond à vos critères.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dossiers Médicaux */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="border-b bg-gray-50/50 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Récapitulatif des Dossiers Patients
            </h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Patient</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Téléphone</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Date Inscription</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest text-center">Consultations</th>
                    <th className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.patients?.map((dossier) => (
                    <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{dossier.prenom} {dossier.nom}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{dossier.telephone || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(dossier.date_inscription).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black">
                          {dossier.consultations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-600 hover:text-emerald-700 p-2 hover:bg-emerald-50 rounded-lg transition-all">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
