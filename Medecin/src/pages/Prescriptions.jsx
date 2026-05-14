import Layout from '../layouts/Layout'
import { 
  Search, 
  Plus, 
  Eye, 
  Pill, 
  Calendar, 
  User, 
  Printer, 
  History, 
  FileText, 
  ChevronRight,
  Stethoscope,
  ArrowRight,
  Download,
  Filter,
  Edit
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import OrdonnanceModal from '../components/OrdonnanceModal'

export default function Prescriptions() {
  const { medecinId, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [consultations, setConsultations] = useState([])
  const [ordonnanceMap, setOrdonnanceMap] = useState({})
  const [selectedOrdForModal, setSelectedOrdForModal] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('edit')
  const [filterType, setFilterType] = useState('all') // 'all', 'prescribed', 'pending'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchData = useCallback(async () => {
    if (!medecinId) return
    try {
      setLoading(true)
      
      // Fetch History
      const resHist = await fetch(`${API_URL}/api/medecin/consultations/historique/${medecinId}`)
      const dataHist = await resHist.json()
      
      // Fetch All Ordonnances
      const resOrd = await fetch(`${API_URL}/api/medecin/consultations/ordonnances/medecin/${medecinId}`)
      const dataOrd = await resOrd.json()

      if (dataHist.success) {
        setConsultations(dataHist.consultations)
      }

      if (dataOrd.success) {
        const map = {}
        dataOrd.ordonnances.forEach((ord) => {
          // Utiliser l'ID de réservation comme clé pour correspondre à la liste principale
          const key = ord.id_reservation || ord.id_consultation
          map[key] = {
            ...ord,
            medicaments: Array.isArray(ord.medicaments) ? ord.medicaments : (typeof ord.medicaments === 'string' ? JSON.parse(ord.medicaments) : [])
          }
        })
        setOrdonnanceMap(map)
      }
    } catch (error) {
      console.error('Erreur fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [medecinId, API_URL])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredConsultations = consultations.filter(consult => {
    const fullName = `${consult.patient_prenom} ${consult.patient_nom}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || (consult.motif || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const hasOrd = !!ordonnanceMap[consult.id]
    if (filterType === 'prescribed') return matchesSearch && hasOrd
    if (filterType === 'pending') return matchesSearch && !hasOrd
    return matchesSearch
  })

  const handleOpenOrdonnance = (consult, mode = 'edit') => {
    setSelectedOrdForModal({
      id: consult.id, // Ici consult.id est l'ID de consultation
      prenom: consult.patient_prenom,
      nom: consult.patient_nom,
      date: consult.date_rendez_vous,
      consultationId: consult.id
    })
    setModalMode(mode)
    setShowModal(true)
  }

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-100">
                <Pill className="w-8 h-8 text-white" />
              </div>
              Gestion des Ordonnances
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Historique complet des prescriptions délivrées à vos patients.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connecté</span>
             </div>
             <p className="px-4 text-sm font-black text-gray-700">Dr. {user?.nomComplet}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-2 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher par nom de patient ou motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border-transparent focus:ring-4 focus:ring-orange-50 rounded-[2rem] shadow-sm border border-gray-100 font-medium text-gray-700 transition-all"
            />
          </div>
          
          <div className="xl:col-span-2 flex p-1.5 bg-gray-100 rounded-[2rem]">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'prescribed', label: 'Prescrites' },
              { id: 'pending', label: 'À faire' }
            ].map(type => (
              <button 
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`flex-1 px-6 py-3 rounded-[1.6rem] text-xs font-black uppercase tracking-widest transition-all ${filterType === type.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prescription List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Chargement des archives...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <History className="w-12 h-12 text-orange-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Aucune archive trouvée</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">Vous n'avez pas encore de consultations enregistrées correspondant à ces critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredConsultations.map((consult) => {
              const ordonnance = ordonnanceMap[consult.id]
              const hasOrd = !!ordonnance
              
              return (
                <div 
                  key={consult.id}
                  className="group bg-white rounded-[3rem] border border-gray-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-orange-100 group-hover:scale-110 transition-transform duration-500">
                            <User className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900 capitalize group-hover:text-orange-600 transition-colors">
                              {consult.patient_prenom} {consult.patient_nom}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                               <Calendar className="w-3 h-3 text-gray-400" />
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                 {new Date(consult.date_rendez_vous).toLocaleDateString()}
                               </span>
                            </div>
                          </div>
                       </div>
                       <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${hasOrd ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                         {hasOrd ? 'PRESCRIT' : 'À FAIRE'}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100/50">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Stethoscope className="w-3 h-3" /> Diagnostic & Motif
                          </p>
                          <p className="text-sm font-bold text-gray-700 line-clamp-2">
                            {consult.diagnostic || consult.motif || 'Aucune note disponible'}
                          </p>
                       </div>

                       {hasOrd && (
                         <div className="space-y-3">
                           <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-4">Médicaments Prescrits</p>
                           <div className="space-y-2">
                             {ordonnance.medicaments.slice(0, 2).map((med, idx) => (
                               <div key={idx} className="flex justify-between items-center bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50">
                                  <span className="text-sm font-black text-orange-900">{med.nom}</span>
                                  <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-1 rounded-lg shadow-sm">{med.dosage}</span>
                               </div>
                             ))}
                             {ordonnance.medicaments.length > 2 && (
                               <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
                                 + {ordonnance.medicaments.length - 2} autres médicaments
                               </p>
                             )}
                           </div>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="p-8 pt-0 mt-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleOpenOrdonnance(consult, 'edit')}
                        className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${hasOrd ? 'bg-orange-600 text-white shadow-orange-100 hover:bg-orange-700' : 'bg-gray-900 text-white shadow-gray-100 hover:bg-black'}`}
                      >
                        {hasOrd ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {hasOrd ? 'Modifier' : 'Prescrire'}
                      </button>
                      <button 
                        onClick={() => handleOpenOrdonnance(consult, 'print')}
                        disabled={!hasOrd}
                        className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${hasOrd ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'}`}
                      >
                        <Printer className="w-4 h-4" />
                        Imprimer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Ordonnance Modal */}
        <OrdonnanceModal 
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            fetchData()
          }}
          reservation={selectedOrdForModal}
          medecinId={medecinId}
          doctorName={user?.nomComplet}
          mode={modalMode}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}} />
    </Layout>
  )
}
