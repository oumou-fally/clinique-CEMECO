import { useMemo, useState, useEffect } from 'react'
import { CheckCircle, Plus, Trash2, XCircle, ArrowRightCircle, Clock, MapPin, AlertCircle, Calendar, User, Search, Mail, Phone, X } from 'lucide-react'
import Layout from '../layouts/Layout'
import ModalRendezVous from '../components/ModalRendezVous'
import { useAuth } from '../context/AuthContext'
import { DOCTORS, getDoctorById, getAvailableDoctors, getTimeSlots } from '../data/clinicData'

const STATUTS = {
  attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé'
}

const COULEURS_STATUTS = {
  attente: 'border-orange-200 bg-orange-50',
  confirme: 'border-emerald-200 bg-emerald-50',
  annule: 'border-rose-200 bg-rose-50'
}

const MOTIFS_CONSULTATION = [
  'Contrôle cardiaque',
  'Traitement de l\'hypertension',
  'Électrocardiogramme',
  'Échocardiogramme',
  'Consultation préventive',
  'Suivi post-opératoire'
]

const INITIAL_FORM = {
  nom: '',
  prenom: '',
  date_naissance: '',
  sexe: 'M',
  telephone: '',
  email: '',
  adresse: '',
  motif: '',
  date_rendez_vous: '',
  heure_rendez_vous: '',
  id_medecin: ''
}

export default function GestionRendezVous() {
  const { user } = useAuth()
  const [rendezVous, setRendezVous] = useState([])
  const [filtre, setFiltre] = useState('tous')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [modalType, setModalType] = useState('ajouter')
  const [selectedRdv, setSelectedRdv] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [messageErreur, setMessageErreur] = useState('')
  const [absences, setAbsences] = useState([])
  const [medecins, setMedecins] = useState([])

  const API_URL = '' // Utilise le proxy Vite en développement

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('🔄 Tentative de récupération des données depuis:', API_URL);
      const [resRes, absRes, medRes] = await Promise.all([
        fetch(`${API_URL}/api/reservations`),
        fetch(`${API_URL}/api/disponibilites`),
        fetch(`${API_URL}/api/personnel?role=medecin`)
      ])

      if (!resRes.ok || !absRes.ok || !medRes.ok) {
        throw new Error('Erreur lors de la récupération des données (HTTP Error)');
      }

      const resData = await resRes.json()
      const absData = await absRes.json()
      const medData = await medRes.json()

      console.log('📦 Données reçues:', { res: resData, abs: absData, med: medData });

      setRendezVous(Array.isArray(resData.reservations) ? resData.reservations : [])
      setAbsences(Array.isArray(absData) ? absData : [])
      setMedecins(Array.isArray(medData.personnel) ? medData.personnel : [])
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error)
      setMessageErreur('Impossible de charger les données. Vérifiez la connexion au serveur.')
    }
  }

  const handleRefresh = () => {
    fetchData()
  }

  const rendezVousFiltres = useMemo(
    () =>
      Array.isArray(rendezVous) ? rendezVous.filter((rdv) => filtre === 'tous' || rdv.statut === filtre) : [],
    [rendezVous, filtre]
  )

  const medecinsDisponibles = useMemo(
    () => Array.isArray(medecins) ? medecins : [],
    [medecins]
  )

  const creneauxDisponibles = useMemo(
    () => {
      return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
    },
    []
  )

  const ouvrirModal = (type, rdv = null) => {
    console.log('🔓 Ouverture du modal:', type, rdv);
    setModalType(type)
    if (type === 'reporter' && rdv) {
      setSelectedRdv(rdv)
      setFormData({
        ...INITIAL_FORM,
        id_medecin: rdv.id_medecin,
        date_rendez_vous: rdv.date_rendez_vous.split('T')[0],
        heure_rendez_vous: rdv.heure_rendez_vous
      })
    } else {
      setSelectedRdv(null)
      setFormData(INITIAL_FORM)
    }
    setModalOuvert(true)
  }

  const fermerModal = () => {
    setModalOuvert(false)
    setMessageErreur('')
    setFormData(INITIAL_FORM)
  }

  const gererChangement = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const obtenirNomMedecin = (id) => {
    const med = medecins.find(m => m.id === Number(id))
    return med ? `${med.prenom} ${med.nom}` : 'Non assigné'
  }

  const estDisponible = (medecinId, date) => {
    if (!medecinId) return true
    return !absences.some(abs =>
      abs.medecin_id === Number(medecinId) &&
      date >= abs.date_debut &&
      date <= abs.date_fin
    )
  }

  const ajouterRendezVous = async () => {
    const required = ['nom', 'prenom', 'date_naissance', 'sexe', 'telephone', 'motif', 'date_rendez_vous', 'heure_rendez_vous', 'id_medecin']
    if (required.some(key => !formData[key])) {
      setMessageErreur('Veuillez remplir tous les champs obligatoires (*)')
      return
    }

    if (!estDisponible(formData.id_medecin, formData.date_rendez_vous)) {
      setMessageErreur(`Le médecin sélectionné est absent à cette date.`)
      return
    }

    const payload = {
      ...formData,
      id_secretaire: user?.id
    }

    console.log('📤 Envoi de la réservation:', payload);

    if (!payload.id_secretaire) {
      setMessageErreur('Erreur d\'authentification : ID secrétaire manquant. Veuillez vous reconnecter.')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
        fermerModal()
      } else {
        setMessageErreur(data.message)
      }
    } catch (error) {
      console.error('Erreur creation:', error)
      setMessageErreur('Erreur de connexion au serveur')
    }
  }

  const changerStatut = async (id, statut) => {
    try {
      const res = await fetch(`${API_URL}/api/reservations/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut })
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Erreur changement statut:', error)
    }
  }

  const supprimerRendezVous = async (id) => {
    if (!confirm('Supprimer définitivement ce rendez-vous ?')) return
    try {
      const res = await fetch(`${API_URL}/api/reservations/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }


  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-emerald-50 to-teal-50 min-h-screen">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Gestion des rendez-vous</h1>
            <p className="text-slate-600 mt-2">Organisez et gérez les rendez-vous des patients</p>
          </div>
          <div className="flex gap-3 relative z-10">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3 text-slate-600 font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 transition"
            >
              <Clock className="w-5 h-5" /> Rafraîchir
            </button>
            <button
              onClick={() => ouvrirModal('ajouter')}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition"
            >
              <Plus className="w-5 h-5" /> Nouveau RDV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Total RDV</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{rendezVous.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-2xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-slate-400 tracking-wider">En attente</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {rendezVous.filter((r) => r.statut === 'attente').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Confirmés</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {rendezVous.filter((r) => r.statut === 'confirme').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 p-3 rounded-2xl">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Annulés</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {rendezVous.filter((r) => r.statut === 'annule').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 px-2">
            {['tous', 'attente', 'confirme', 'annule'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${filtre === f
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {f === 'tous' ? 'Tous les RDV' : STATUTS[f]}
              </button>
            ))}
          </div>
          <div className="relative group px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              className="w-full md:w-64 pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {rendezVousFiltres.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">Aucun rendez-vous trouvé.</p>
            </div>
          ) : (
            rendezVousFiltres.map((rdv) => (
              <div key={rdv.id} className={`group relative bg-white rounded-[2rem] p-6 shadow-sm border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${COULEURS_STATUTS[rdv.statut]}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <User className="w-8 h-8 text-teal-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-xl text-slate-900">{rdv.prenom} {rdv.nom}</h3>
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 ${rdv.statut === 'confirme' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          rdv.statut === 'annule' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                            'bg-orange-100 text-orange-700 border-orange-200'
                          }`}>
                          {STATUTS[rdv.statut]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(rdv.date_rendez_vous).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {rdv.heure_rendez_vous}</div>
                        <div className="flex items-center gap-1.5"><Search className="w-4 h-4 text-teal-500" /> <span className="text-slate-700">Dr. {obtenirNomMedecin(rdv.id_medecin)}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {rdv.statut === 'attente' && (
                      <>
                        <button onClick={() => changerStatut(rdv.id, 'confirme')} className="p-3 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white border-2 border-emerald-100 rounded-2xl transition-all shadow-sm"><CheckCircle className="w-6 h-6" /></button>
                        <button onClick={() => ouvrirModal('reporter', rdv)} className="p-3 bg-white text-blue-600 hover:bg-blue-600 hover:text-white border-2 border-blue-100 rounded-2xl transition-all shadow-sm"><ArrowRightCircle className="w-6 h-6" /></button>
                      </>
                    )}
                    <button onClick={() => changerStatut(rdv.id, 'annule')} className="p-3 bg-white text-rose-600 hover:bg-rose-600 hover:text-white border-2 border-rose-100 rounded-2xl transition-all shadow-sm"><XCircle className="w-6 h-6" /></button>
                    <button onClick={() => supprimerRendezVous(rdv.id)} className="p-3 bg-white text-slate-400 hover:bg-slate-600 hover:text-white border-2 border-slate-100 rounded-2xl transition-all shadow-sm"><Trash2 className="w-6 h-6" /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <ModalRendezVous
          modalOuvert={modalOuvert}
          modalType={modalType}
          selectedRdv={selectedRdv}
          formData={formData}
          setFormData={setFormData}
          gererChangement={gererChangement}
          fermerModal={fermerModal}
          ajouterRendezVous={ajouterRendezVous}
          creneauxDisponibles={creneauxDisponibles}
          medecins={medecins}
          estDisponible={estDisponible}
          messageErreur={messageErreur}
          onReporter={async () => {
            try {
              const res = await fetch(`${API_URL}/api/reservations/${selectedRdv.id}/reporter`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id_medecin: formData.id_medecin,
                  date_rendez_vous: formData.date_rendez_vous,
                  heure_rendez_vous: formData.heure_rendez_vous
                })
              })
              if (res.ok) {
                fetchData()
                fermerModal()
              }
            } catch (error) {
              console.error('Erreur report:', error)
            }
          }}
        />
      </div>
    </Layout>
  )
}
