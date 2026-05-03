import Layout from '../layouts/Layout'
import { Search, Filter, Plus, Eye, Phone, Calendar, FileText, Edit, Trash2, X, Stethoscope, Pill, Users } from 'lucide-react'
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
      const res = await fetch(`/api/medecin/consultations/reservations/${medecinId}`)
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

  // Grouper par patient pour n'afficher chaque personne qu'une seule fois
  const uniquePatients = reservations.reduce((acc, current) => {
    const x = acc.find(item => item.patient_id === current.patient_id)
    if (!x) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])

  const filteredPatients = uniquePatients.filter(p => {
    const fullName = `${p.prenom} ${p.nom}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || (p.telephone && p.telephone.includes(searchTerm))
  })

  const handleViewDetail = async (rdv) => {
    setSelectedRdvDetail(rdv)
    setConsultationData(null)
    
    if (rdv.statut === 'termine') {
      try {
        const res = await fetch(`/api/medecin/consultations/detail/${rdv.id}`)
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
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Ma Patientèle
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Historique complet des patients que vous avez consultés</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patients Consultés</p>
            <p className="text-2xl font-black text-gray-900">{uniquePatients.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
          />
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
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Dernière Visite</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest text-center">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600 group-hover:scale-110 transition">
                          {p.nom ? p.nom.charAt(0) : '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 capitalize">{p.prenom || ''} {p.nom || 'Patient'}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${p.sexe === 'Masculin' ? 'border-blue-200 text-blue-500' : 'border-pink-200 text-pink-500'}`}>
                              {p.sexe === 'Masculin' ? 'M' : 'F'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            {p.date_naissance ? Math.floor((new Date() - new Date(p.date_naissance)) / 31557600000) + ' ans' : 'Âge inconnu'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-700">{p.date_rendez_vous ? new Date(p.date_rendez_vous).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Dernier passage</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`tel:${p.telephone}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {p.telephone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.statut === 'termine' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {p.statut === 'termine' ? 'Suivi' : 'Consulté'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetail(p)}
                          className="p-2 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all" 
                          title="Fiche Patient"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => window.location.href = `/dashboard/consultations`}
                          className="p-2 hover:bg-purple-50 rounded-xl text-gray-400 hover:text-purple-600 transition-all" 
                          title="Historique des soins"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredPatients.length === 0 && (
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
                    onClick={() => window.location.href = `/dashboard/consultations?rdv=${selectedRdvDetail.id}`}
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
                    onClick={() => window.location.href = `/dashboard/consultations?rdv=${selectedRdvDetail.id}`}
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
