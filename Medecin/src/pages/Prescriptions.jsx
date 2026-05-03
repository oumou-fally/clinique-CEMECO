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
  const [consultations, setConsultations] = useState([])
  const [ordonnanceMap, setOrdonnanceMap] = useState({})
  const [selectedOrdForModal, setSelectedOrdForModal] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (medecinId) {
      fetchConsultations()
      fetchOrdonnances()
    }
  }, [medecinId])

  const fetchOrdonnances = async () => {
    try {
      const res = await fetch(`/api/medecin/consultations/ordonnances/medecin/${medecinId}`)
      const data = await res.json()
      if (data.success) {
        const map = {}
        data.ordonnances.forEach((ord) => {
          map[ord.id_consultation] = {
            ...ord,
            medicaments: Array.isArray(ord.medicaments) ? ord.medicaments : []
          }
        })
        setOrdonnanceMap(map)
      }
    } catch (error) {
      console.error('Erreur fetch ordonnances:', error)
    }
  }

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/medecin/consultations/historique/${medecinId}`)
      const data = await res.json()
      if (data.success) {
        setConsultations(data.consultations)
      }
    } catch (error) {
      console.error('Erreur fetch consultations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(consult => {
    const fullName = `${consult.patient_prenom} ${consult.patient_nom}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || (consult.motif || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleOpenOrdonnance = (consult) => {
    setSelectedOrdForModal({
      id: consult.id,
      prenom: consult.patient_prenom,
      nom: consult.patient_nom,
      date: consult.date_rendez_vous,
      consultationId: consult.id
    })
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
            onClick={() => {
              fetchOrdonnances()
              fetchConsultations()
            }}
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
          ) : filteredConsultations.length === 0 ? (
            <div className="col-span-full bg-white p-20 rounded-[40px] text-center border border-gray-100">
              <History className="w-20 h-20 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-xl">Aucune consultation enregistrée</p>
            </div>
          ) : (
            filteredConsultations.map((consult) => {
              const ordonnance = ordonnanceMap[consult.id]
              const hasOrdonnance = !!ordonnance
              const createdAt = ordonnance?.date_ordination ? new Date(ordonnance.date_ordination).toLocaleDateString() : null
              const consultationDate = consult.date_consultation ? new Date(consult.date_consultation).toLocaleString() : 'Date de consultation non renseignée'
              const appointmentDate = consult.date_rendez_vous ? new Date(consult.date_rendez_vous).toLocaleDateString() : 'Date de rendez-vous non renseignée'
              const appointmentTime = consult.heure_rendez_vous || 'Heure non précisée'

              return (
                <div 
                  key={`consult-${consult.id}`}
                  className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</div>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] uppercase tracking-widest">ID {consult.id}</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 capitalize">{consult.patient_prenom} {consult.patient_nom}</h3>
                      <p className="text-sm text-gray-500 max-w-xl">{consult.motif || 'Motif non renseigné'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                      <User className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid gap-3 mb-8 rounded-[30px] bg-slate-50 p-6 border border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span className="font-semibold">Rendez-vous :</span>
                      <span>{appointmentDate} • {appointmentTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Stethoscope className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">Consultation :</span>
                      <span>{consultationDate}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-white p-4 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Diagnostic</p>
                        <p className="text-sm text-gray-700 min-h-12">{consult.diagnostic || 'Aucun diagnostic enregistré'}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Traitement</p>
                        <p className="text-sm text-gray-700 min-h-12">{consult.traitement || 'Aucun traitement enregistré'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center text-xs font-bold uppercase tracking-widest mb-4">
                    <span className={`px-3 py-2 rounded-full ${hasOrdonnance ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {hasOrdonnance ? 'Ordonnance créée' : 'Aucune ordonnance'}
                    </span>
                    {createdAt && (
                      <span className="px-3 py-2 rounded-full bg-blue-100 text-blue-700">Le {createdAt}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenOrdonnance(consult)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all"
                  >
                    <Pill className="w-4 h-4" />
                    {hasOrdonnance ? 'Modifier l’ordonnance' : 'Créer l’ordonnance'}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal Ordonnance */}
      <OrdonnanceModal 
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          fetchOrdonnances()
          fetchConsultations()
        }}
        reservation={selectedOrdForModal}
        medecinId={medecinId}
        doctorName={user?.nomComplet}
      />
    </Layout>
  )
}
