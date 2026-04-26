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
  Stethoscope
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import OrdonnanceModal from '../components/OrdonnanceModal'

export default function Prescriptions() {
  const { medecinId, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [ordonnances, setOrdonnances] = useState([])
  const [selectedOrdForModal, setSelectedOrdForModal] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (medecinId) {
      fetchOrdonnances()
    }
  }, [medecinId])

  const fetchOrdonnances = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/consultations/ordonnances/medecin/${medecinId}`)
      const data = await res.json()
      if (data.success) {
        // Grouper les médicaments par réservation
        const grouped = data.ordonnances.reduce((acc, curr) => {
          if (!acc[curr.id_reservation]) {
            acc[curr.id_reservation] = {
              id: curr.id_reservation,
              patient: `${curr.patient_prenom} ${curr.patient_nom}`,
              prenom: curr.patient_prenom,
              nom: curr.patient_nom,
              date: curr.date_ordination,
              medicaments: []
            }
          }
          acc[curr.id_reservation].medicaments.push({
            nom: curr.nom_medicament,
            dosage: curr.dosage
          })
          return acc
        }, {})
        setOrdonnances(Object.values(grouped))
      }
    } catch (error) {
      console.error('Erreur fetch ordonnances:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrdonnances = ordonnances.filter(ord => 
    ord.patient.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenOrdonnance = (ord) => {
    setSelectedOrdForModal(ord)
    setShowModal(true)
  }

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-4">
              <Pill className="w-10 h-10 text-orange-600 bg-orange-50 p-2 rounded-2xl" />
              Mes Prescriptions
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Historique de vos ordonnances pour le <span className="text-orange-600 font-bold">Dr. {user?.nomComplet}</span></p>
          </div>
          <button 
            onClick={fetchOrdonnances}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all border border-gray-100"
          >
            Actualiser
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl transition-all font-medium"
            />
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold">Chargement de vos archives...</p>
            </div>
          ) : filteredOrdonnances.length === 0 ? (
            <div className="col-span-full bg-white p-20 rounded-[40px] text-center border border-gray-100">
              <History className="w-20 h-20 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-xl">Aucune prescription trouvée</p>
            </div>
          ) : (
            filteredOrdonnances.map((ord) => (
              <div 
                key={ord.id}
                onClick={() => handleOpenOrdonnance(ord)}
                className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</p>
                    <h3 className="text-xl font-black text-gray-900 capitalize">{ord.patient}</h3>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <User className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {new Date(ord.date).toLocaleDateString()}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-50">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Prescription ({ord.medicaments.length})</p>
                     <ul className="space-y-1">
                       {ord.medicaments.slice(0, 3).map((m, i) => (
                         <li key={i} className="text-xs font-bold text-gray-700 truncate">• {m.nom}</li>
                       ))}
                       {ord.medicaments.length > 3 && (
                         <li className="text-[10px] text-gray-400 font-bold italic">+{ord.medicaments.length - 3} autres...</li>
                       )}
                     </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between text-orange-600 font-bold text-sm">
                  <span>Voir / Modifier</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Ordonnance */}
      <OrdonnanceModal 
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          fetchOrdonnances()
        }}
        reservation={selectedOrdForModal}
        medecinId={medecinId}
        doctorName={user?.nomComplet}
      />
    </Layout>
  )
}
