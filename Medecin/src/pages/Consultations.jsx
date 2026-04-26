import Layout from '../layouts/Layout'
import ConsultationForm from '../components/ConsultationForm'
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Video, 
  X, 
  Save, 
  ArrowLeft, 
  Stethoscope, 
  Pill,
  Eye,
  Calendar,
  History
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import OrdonnanceModal from '../components/OrdonnanceModal'

export default function Consultations() {
  const { medecinId, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedRdv, setSelectedRdv] = useState(null)
  const [reservations, setReservations] = useState([])
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false)
  
  useEffect(() => {
    if (medecinId) {
      fetchReservations()
    }
  }, [medecinId])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const rdvId = params.get('rdv')
    if (rdvId && reservations.length > 0) {
      const rdv = reservations.find(r => r.id === parseInt(rdvId))
      if (rdv) {
        if (rdv.statut === 'termine') {
          fetchExistingConsultation(rdv)
        } else {
          handleOpenForm(rdv)
        }
      }
    }
  }, [reservations])

  const fetchExistingConsultation = async (rdv) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/consultations/detail/${rdv.id}`)
      const data = await res.json()
      if (data.success) {
        const consult = data.consultation
        setSelectedRdv({
          ...rdv,
          symptoms: consult.symptomes,
          diagnosis: consult.diagnostic,
          treatment: consult.traitement,
          notes: consult.notes,
          pa: consult.pa,
          fc: consult.fc,
          fr: consult.fr,
          temperature: consult.temperature,
          saturation: consult.saturation,
          poids: consult.poids,
          taille: consult.taille,
          imc: consult.imc,
          biologie: consult.biologie,
          ecg: consult.ecg,
          rxPulmonaire: consult.rx_pulmonaire,
          ett: consult.ett,
          isEdit: true,
          id_consultation: consult.id
        })
        setShowModal(true)
      }
    } catch (error) {
      console.error('Erreur fetch consultation existante:', error)
      handleOpenForm(rdv)
    } finally {
      setLoading(false)
    }
  }

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

  const handleOpenForm = (rdv) => {
    if (rdv?.statut === 'termine') {
      fetchExistingConsultation(rdv)
    } else {
      setSelectedRdv(rdv)
      setShowModal(true)
    }
  }

  const handleCloseForm = () => {
    setShowModal(false)
    setSelectedRdv(null)
    // On nettoie l'URL
    window.history.pushState({}, '', '/consultations')
    fetchReservations()
  }

  const handleSaveConsultation = async (consultData) => {
    try {
      const payload = {
        id_reservation: selectedRdv.id,
        id_medecin: medecinId,
        pa: consultData.pa,
        fc: consultData.fc,
        fr: consultData.fr,
        temperature: consultData.temperature,
        saturation: consultData.saturation,
        poids: consultData.poids,
        taille: consultData.taille,
        imc: consultData.imc,
        biologie: consultData.biologie,
        ecg: consultData.ecg,
        rx_pulmonaire: consultData.rxPulmonaire,
        ett: consultData.ett,
        symptomes: consultData.symptoms,
        diagnostic: consultData.diagnosis,
        traitement: consultData.treatment,
        notes: consultData.notes
      }

      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        alert('Consultation enregistrée avec succès')
        handleCloseForm()
      }
    } catch (error) {
      console.error('Erreur sauvegarde consultation:', error)
    }
  }

  const filteredReservations = reservations.filter(rdv => {
    const fullName = `${rdv.prenom} ${rdv.nom}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || rdv.telephone.includes(searchTerm)
    
    if (selectedTab === 'all') return matchesSearch
    return matchesSearch && rdv.statut === selectedTab
  })

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirme': return 'bg-green-100 text-green-700 border-green-200'
      case 'attente': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'termine': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'annule': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        {!showModal ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Stethoscope className="w-10 h-10 text-blue-600" />
                  Mes Consultations
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                  Gérez vos rendez-vous et le suivi de vos patients
                </p>
              </div>
              <button 
                onClick={() => handleOpenForm()}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Consultation
              </button>
            </div>

            {/* Barre de Recherche et Filtres */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Rechercher un patient par nom ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl transition-all font-medium"
                />
              </div>
              <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl">
                {[
                  { id: 'all', label: 'Tout' },
                  { id: 'confirme', label: 'Confirmés' },
                  { id: 'termine', label: 'Terminés' },
                  { id: 'attente', label: 'En attente' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedTab === tab.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des Consultations */}
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold">Synchronisation avec la base de données...</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl shadow-sm text-center border border-gray-100">
                <History className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-xl">Aucune consultation trouvée</p>
                <p className="text-gray-300">Modifiez vos filtres ou lancez une nouvelle recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredReservations.map((rdv) => (
                  <div 
                    key={rdv.id} 
                    onClick={() => handleOpenForm(rdv)}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {rdv.nom.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-gray-900 capitalize">{rdv.prenom} {rdv.nom}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusBadge(rdv.statut)}`}>
                              {rdv.statut}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-bold text-gray-400">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-300" />
                              {new Date(rdv.date_rendez_vous).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-300" />
                              {rdv.heure_rendez_vous.substring(0, 5)}
                            </span>
                            <span className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-300" />
                              {rdv.telephone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRdv(rdv);
                            setShowOrdonnanceModal(true);
                          }}
                          className="px-6 py-3 bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-600 rounded-2xl font-bold transition-all flex items-center gap-2"
                        >
                          <Pill className="w-4 h-4" />
                          Ordonnance
                        </button>
                        
                        {rdv.statut === 'termine' ? (
                          <button className="p-4 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-400 rounded-2xl transition-all">
                            <Eye className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                          >
                            <Stethoscope className="w-4 h-4" />
                            Consulter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <ConsultationForm 
            initialData={selectedRdv ? {
              nom: selectedRdv.nom,
              prenom: selectedRdv.prenom,
              phone: selectedRdv.telephone,
              date: selectedRdv.date_rendez_vous.split('T')[0],
              time: selectedRdv.heure_rendez_vous.substring(0, 5),
              status: selectedRdv.statut,
              symptoms: selectedRdv.symptoms || selectedRdv.motif,
              age: selectedRdv.date_naissance ? Math.floor((new Date() - new Date(selectedRdv.date_naissance)) / 31557600000) : '',
              pa: selectedRdv.pa || '',
              fc: selectedRdv.fc || '',
              fr: selectedRdv.fr || '',
              temperature: selectedRdv.temperature || '',
              saturation: selectedRdv.saturation || '',
              poids: selectedRdv.poids || '',
              taille: selectedRdv.taille || '',
              imc: selectedRdv.imc || '',
              biologie: selectedRdv.biologie || '',
              ecg: selectedRdv.ecg || '',
              rxPulmonaire: selectedRdv.rxPulmonaire || '',
              ett: selectedRdv.ett || '',
              diagnosis: selectedRdv.diagnosis || '',
              treatment: selectedRdv.treatment || '',
              notes: selectedRdv.notes || ''
            } : null}
            onSave={handleSaveConsultation}
            onClose={handleCloseForm}
          />
        )}
        
        <OrdonnanceModal 
          isOpen={showOrdonnanceModal}
          onClose={() => setShowOrdonnanceModal(false)}
          reservation={selectedRdv}
          medecinId={medecinId}
          doctorName={user?.nomComplet}
        />
      </div>
    </Layout>
  )
}
