import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Eye, Phone, Calendar, FileText, Edit, Trash2, X, Stethoscope, Pill } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import OrdonnanceModal from '../components/OrdonnanceModal'

export default function Patients() {
  const { medecinId, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState([])
  const [selectedRdvDetail, setSelectedRdvDetail] = useState(null)
  const [consultationData, setConsultationData] = useState(null)
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false)

  useEffect(() => {
    if (medecinId) {
      fetchReservations()
    }
  }, [medecinId])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/consultations/reservations/${medecinId}`)
      const data = await res.json()
      if (data.success) {
        setReservations(data.reservations)
      }
    } catch (error) {
      console.error('Erreur fetch reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReservations = reservations.filter(rdv => {
    const fullName = `${rdv.prenom} ${rdv.nom}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || rdv.telephone.includes(searchTerm)
    const matchesDate = !dateFilter || rdv.date_rendez_vous.split('T')[0] === dateFilter
    
    return matchesSearch && matchesDate
  })

  const handleViewDetail = async (rdv) => {
    setSelectedRdvDetail(rdv)
    setConsultationData(null)
    
    if (rdv.statut === 'termine') {
      try {
        const res = await fetch(`/api/consultations/detail/${rdv.id}`)
        const data = await res.json()
        if (data.success) {
          setConsultationData(data.consultation)
        }
      } catch (error) {
        console.error('Erreur fetch detail consultation:', error)
      }
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirme': return 'bg-green-100 text-green-800'
      case 'attente': return 'bg-yellow-100 text-yellow-800'
      case 'annule': return 'bg-red-100 text-red-800'
      case 'termine': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Patients Assignés</h1>
        <p className="text-gray-600 mt-2">Liste des patients ayant un rendez-vous confirmé avec vous</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              className="text-sm text-red-600 font-bold hover:underline"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-bold">Chargement des données...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date & Heure</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Téléphone</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReservations.map((rdv) => (
                  <tr key={rdv.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600 group-hover:scale-110 transition">
                          {rdv.nom.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 capitalize">{rdv.prenom} {rdv.nom}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${rdv.sexe === 'Masculin' ? 'border-blue-200 text-blue-500' : 'border-pink-200 text-pink-500'}`}>
                              {rdv.sexe === 'Masculin' ? 'M' : 'F'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            {rdv.date_naissance ? Math.floor((new Date() - new Date(rdv.date_naissance)) / 31557600000) + ' ans' : 'Âge inconnu'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-700">{new Date(rdv.date_rendez_vous).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400 font-medium">{rdv.heure_rendez_vous.substring(0, 5)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`tel:${rdv.telephone}`}
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <Phone className="w-3 h-3" />
                        {rdv.telephone}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(rdv)}
                          className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-blue-600 transition-all" 
                          title="Voir Détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {rdv.statut === 'confirme' && (
                          <button 
                            onClick={() => window.location.href = `/consultations?rdv=${rdv.id}`}
                            className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-all" 
                            title="Lancer Consultation"
                          >
                            <Stethoscope className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredReservations.length === 0 && (
          <div className="text-center py-20 bg-gray-50/50">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">Aucun patient trouvé pour ces critères.</p>
          </div>
        )}
      </div>

      {/* Modal Détail Réservation (Patient) */}
      {selectedRdvDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`bg-white rounded-3xl shadow-2xl ${consultationData ? 'max-w-3xl' : 'max-w-lg'} w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 transition-all`}>
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 capitalize">{selectedRdvDetail.prenom} {selectedRdvDetail.nom}</h2>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(selectedRdvDetail.statut)}`}>
                    {selectedRdvDetail.statut}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRdvDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Informations de base */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Téléphone</p>
                  <p className="text-gray-900 font-bold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    {selectedRdvDetail.telephone}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Genre</p>
                  <p className="text-gray-900 font-bold capitalize">{selectedRdvDetail.sexe || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Âge</p>
                  <p className="text-gray-900 font-bold">
                    {selectedRdvDetail.date_naissance ? Math.floor((new Date() - new Date(selectedRdvDetail.date_naissance)) / 31557600000) : '--'} ans
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-gray-700 font-medium">{selectedRdvDetail.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Adresse</p>
                  <p className="text-gray-700 font-medium">{selectedRdvDetail.adresse || 'Non renseignée'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Motif Initial de Consultation</p>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-gray-700 font-medium italic">"{selectedRdvDetail.motif}"</p>
                </div>
              </div>

              {/* Rapport Médical si terminé */}
              {consultationData && (
                <div className="pt-6 border-t border-gray-100 space-y-6">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    Rapport de Consultation
                  </h3>
                  
                  {/* Constantes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Tension (PA)</p>
                      <p className="text-blue-900 font-black">{consultationData.pa || '--'}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                      <p className="text-[10px] font-black text-red-400 uppercase mb-1">Fréq. Cardiaque</p>
                      <p className="text-red-900 font-black">{consultationData.fc || '--'} bpm</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                      <p className="text-[10px] font-black text-orange-400 uppercase mb-1">Température</p>
                      <p className="text-orange-900 font-black">{consultationData.temperature || '--'} °C</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                      <p className="text-[10px] font-black text-green-400 uppercase mb-1">Saturation</p>
                      <p className="text-green-900 font-black">{consultationData.saturation || '--'} %</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Poids</p>
                      <p className="text-gray-900 font-black">{consultationData.poids || '--'} kg</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Taille</p>
                      <p className="text-gray-900 font-black">{consultationData.taille || '--'} cm</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                      <p className="text-[10px] font-black text-purple-400 uppercase mb-1">IMC</p>
                      <p className="text-purple-900 font-black">{consultationData.imc || '--'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Fréq. Resp.</p>
                      <p className="text-gray-900 font-black">{consultationData.fr || '--'} c/min</p>
                    </div>
                  </div>

                  {/* Examens */}
                  {(consultationData.biologie || consultationData.ecg || consultationData.rx_pulmonaire || consultationData.ett) && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-1">Examens Complémentaires</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consultationData.biologie && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Biologie</p>
                            <p className="text-gray-700 text-xs">{consultationData.biologie}</p>
                          </div>
                        )}
                        {consultationData.ecg && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">ECG</p>
                            <p className="text-gray-700 text-xs">{consultationData.ecg}</p>
                          </div>
                        )}
                        {consultationData.rx_pulmonaire && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">RX Pulmonaire</p>
                            <p className="text-gray-700 text-xs">{consultationData.rx_pulmonaire}</p>
                          </div>
                        )}
                        {consultationData.ett && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">ETT</p>
                            <p className="text-gray-700 text-xs">{consultationData.ett}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Diagnostic & Traitement */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diagnostic Posé</p>
                      <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {consultationData.diagnostic || 'Non spécifié'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Traitement / Ordonnance</p>
                      <p className="text-blue-900 font-bold bg-blue-50/50 p-4 rounded-2xl border border-blue-100 whitespace-pre-wrap">
                        {consultationData.traitement || 'Aucun traitement noté'}
                      </p>
                    </div>
                  </div>

                  {/* Notes Cliniques */}
                  {consultationData.notes && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Observations Cliniques</p>
                      <p className="text-gray-600 text-sm italic p-4 bg-gray-50 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                        {consultationData.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rendez-vous le</p>
                  <p className="text-gray-900 font-bold">{new Date(selectedRdvDetail.date_rendez_vous).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">À</p>
                  <p className="text-gray-900 font-bold">{selectedRdvDetail.heure_rendez_vous.substring(0, 5)}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-4 sticky bottom-0 bg-white pb-2">
                <button
                  onClick={() => setSelectedRdvDetail(null)}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
                >
                  Fermer
                </button>
                
                <button
                  onClick={() => setShowOrdonnanceModal(true)}
                  className="px-6 py-4 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Pill className="w-5 h-5" />
                  Ordonnance
                </button>

                {consultationData && (
                  <button
                    onClick={() => window.location.href = `/consultations?rdv=${selectedRdvDetail.id}`}
                    className="px-6 py-4 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Modifier
                  </button>
                )}
                {consultationData && (
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    <FileText className="w-5 h-5" />
                    Imprimer
                  </button>
                )}
                {selectedRdvDetail.statut === 'confirme' && (
                  <button
                    onClick={() => window.location.href = `/consultations?rdv=${selectedRdvDetail.id}`}
                    className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3"
                  >
                    <Stethoscope className="w-5 h-5" />
                    Démarrer Consultation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <OrdonnanceModal 
        isOpen={showOrdonnanceModal}
        onClose={() => setShowOrdonnanceModal(false)}
        reservation={selectedRdvDetail}
        medecinId={medecinId}
        doctorName={user?.nomComplet}
      />
    </Layout>
  )
}
