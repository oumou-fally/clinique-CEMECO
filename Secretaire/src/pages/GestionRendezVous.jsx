import { useMemo, useState } from 'react'
import { CheckCircle, Plus, Trash2, XCircle, ArrowRightCircle, Clock, MapPin } from 'lucide-react'
import Layout from '../layouts/Layout'
import { DOCTORS, getDoctorById, getAvailableDoctors, getTimeSlots } from '../data/clinicData'

const STATUTS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé'
}

const COULEURS_STATUTS = {
  pending: 'bg-amber-100 text-amber-800 border-l-4 border-amber-500',
  confirmed: 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500',
  cancelled: 'bg-rose-100 text-rose-800 border-l-4 border-rose-500'
}

const RDV_INITIAUX = [
  {
    id: 1,
    patient: 'Fatoumata Bah',
    phone: '624 56 78 90',
    doctorId: 1,
    date: '2026-04-11',
    time: '14:30',
    reason: 'Contrôle cardiaque',
    status: 'pending',
    room: 'Salle 301'
  },
  {
    id: 2,
    patient: 'Sekou Cissé',
    phone: '624 12 34 56',
    doctorId: 2,
    date: '2026-04-11',
    time: '09:00',
    reason: 'Électrocardiogramme',
    status: 'confirmed',
    room: 'Salle 302'
  }
]

const MOTIFS_CONSULTATION = [
  'Contrôle cardiaque',
  'Traitement de l\'hypertension',
  'Électrocardiogramme',
  'Échocardiogramme',
  'Consultation préventive',
  'Suivi post-opératoire'
]

const INITIAL_FORM = {
  patient: '',
  phone: '',
  doctorId: '',
  date: '',
  time: '',
  reason: ''
}

export default function GestionRendezVous() {
  const [rendezVous, setRendezVous] = useState(RDV_INITIAUX)
  const [filtre, setFiltre] = useState('tous')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [modalType, setModalType] = useState('ajouter')
  const [selectedRdv, setSelectedRdv] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [messageErreur, setMessageErreur] = useState('')
  const [dateReport, setDateReport] = useState('')
  const [heureReport, setHeureReport] = useState('')

  const rendezVousFiltres = useMemo(
    () =>
      rendezVous.filter((rdv) => filtre === 'tous' || rdv.status === filtre),
    [rendezVous, filtre]
  )

  const medecinsDisponibles = useMemo(
    () => (formData.date ? getAvailableDoctors(formData.date) : DOCTORS),
    [formData.date]
  )

  const creneauxDisponibles = useMemo(
    () => (formData.doctorId && formData.date ? getTimeSlots(Number(formData.doctorId), formData.date) : []),
    [formData.doctorId, formData.date]
  )

  const ouvrirModal = (type, rdv = null) => {
    setModalType(type)
    setSelectedRdv(rdv)
    setMessageErreur('')
    setModalOuvert(true)

    if (type === 'reporter' && rdv) {
      setDateReport(rdv.date)
      setHeureReport(rdv.time)
    } else {
      setFormData(INITIAL_FORM)
      setDateReport('')
      setHeureReport('')
    }
  }

  const fermerModal = () => {
    setModalOuvert(false)
    setSelectedRdv(null)
    setFormData(INITIAL_FORM)
    setMessageErreur('')
    setDateReport('')
    setHeureReport('')
  }

  const gererChangement = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const ajouterRendezVous = () => {
    if (Object.values(formData).some((value) => !value)) {
      setMessageErreur('Veuillez remplir tous les champs du formulaire')
      return
    }

    if (!creneauxDisponibles.includes(formData.time)) {
      setMessageErreur('Le créneau sélectionné n\'est pas disponible')
      return
    }

    const nouveauRdv = {
      id: Date.now(),
      ...formData,
      doctorId: Number(formData.doctorId),
      status: 'pending',
      room: `Salle ${300 + Math.floor(Math.random() * 20)}`
    }

    setRendezVous((prev) => [nouveauRdv, ...prev])
    fermerModal()
  }

  const reporterRendezVous = () => {
    if (!selectedRdv || !dateReport || !heureReport) {
      setMessageErreur('Veuillez indiquer la nouvelle date et heure')
      return
    }

    const creneaux = getTimeSlots(selectedRdv.doctorId, dateReport)
    if (!creneaux.includes(heureReport)) {
      setMessageErreur('Le créneau choisi n\'est pas disponible')
      return
    }

    setRendezVous((prev) =>
      prev.map((rdv) =>
        rdv.id === selectedRdv.id
          ? { ...rdv, date: dateReport, time: heureReport, status: 'pending' }
          : rdv
      )
    )
    fermerModal()
  }

  const confirmerRendezVous = (id) => {
    setRendezVous((prev) => prev.map((rdv) => (rdv.id === id ? { ...rdv, status: 'confirmed' } : rdv)))
  }

  const annulerRendezVous = (id) => {
    setRendezVous((prev) => prev.map((rdv) => (rdv.id === id ? { ...rdv, status: 'cancelled' } : rdv)))
  }

  const supprimerRendezVous = (id) => {
    setRendezVous((prev) => prev.filter((rdv) => rdv.id !== id))
  }

  const obtenirNomMedecin = (id) => getDoctorById(id)?.name || 'Médecin inconnu'

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-emerald-50 to-teal-50 min-h-screen">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Gestion des rendez-vous</h1>
            <p className="text-slate-600 mt-2">Organisez et gérez les rendez-vous des patients</p>
          </div>
          <button
            onClick={() => ouvrirModal('ajouter')}
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition"
          >
            <Plus className="w-5 h-5" /> Nouveau RDV
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card bg-white p-6 border-l-4 border-slate-400 shadow-md">
            <p className="text-sm font-semibold text-slate-600">Total</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{rendezVous.length}</p>
          </div>
          <div className="card bg-white p-6 border-l-4 border-emerald-500 shadow-md">
            <p className="text-sm font-semibold text-emerald-700">Confirmés</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{rendezVous.filter((rdv) => rdv.status === 'confirmed').length}</p>
          </div>
          <div className="card bg-white p-6 border-l-4 border-amber-500 shadow-md">
            <p className="text-sm font-semibold text-amber-700">Attente</p>
            <p className="mt-3 text-3xl font-bold text-amber-600">{rendezVous.filter((rdv) => rdv.status === 'pending').length}</p>
          </div>
          <div className="card bg-white p-6 border-l-4 border-rose-500 shadow-md">
            <p className="text-sm font-semibold text-rose-700">Annulés</p>
            <p className="mt-3 text-3xl font-bold text-rose-600">{rendezVous.filter((rdv) => rdv.status === 'cancelled').length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-md border border-slate-200">
          {['tous', 'pending', 'confirmed', 'cancelled'].map((option) => (
            <button
              key={option}
              onClick={() => setFiltre(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filtre === option ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {option === 'tous' ? 'Tous' : STATUTS[option]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {rendezVousFiltres.length === 0 ? (
            <div className="card p-12 text-center bg-white">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Aucun rendez-vous trouvé</p>
            </div>
          ) : (
            rendezVousFiltres.map((rdv) => (
              <div key={rdv.id} className={`card p-6 rounded-2xl border-2 bg-white ${COULEURS_STATUTS[rdv.status]}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-slate-900">{rdv.patient}</p>
                    <p className="text-sm text-slate-600 mt-1">👨‍⚕️ {obtenirNomMedecin(rdv.doctorId)}</p>
                    <p className="text-sm text-slate-500 mt-1">📋 {rdv.reason}</p>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{rdv.date} {rdv.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">{rdv.room}</span>
                    </div>
                  </div>

                  <span className={`badge px-4 py-2 rounded-full font-semibold`}>{STATUTS[rdv.status]}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {rdv.status === 'pending' && (
                    <button onClick={() => confirmerRendezVous(rdv.id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-700 transition">
                      <CheckCircle className="w-4 h-4" /> Confirmer
                    </button>
                  )}
                  <button onClick={() => ouvrirModal('reporter', rdv)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition">
                    <ArrowRightCircle className="w-4 h-4" /> Reporter
                  </button>
                  {rdv.status !== 'cancelled' && (
                    <button onClick={() => annulerRendezVous(rdv.id)} className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-white text-sm font-semibold hover:bg-rose-600 transition">
                      <XCircle className="w-4 h-4" /> Annuler
                    </button>
                  )}
                  <button onClick={() => supprimerRendezVous(rdv.id)} className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-slate-700 text-sm font-semibold hover:bg-slate-300 transition ml-auto">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {modalOuvert && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {modalType === 'ajouter' ? 'Nouveau rendez-vous' : 'Reporter'}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {modalType === 'ajouter' ? 'Créez un nouveau rendez-vous' : 'Choisissez une nouvelle date'}
                  </p>
                </div>
                <button onClick={fermerModal} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {messageErreur && <div className="m-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200">⚠️ {messageErreur}</div>}

              <div className="p-6 space-y-5">
                {modalType === 'ajouter' ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Patient *</label>
                        <input name="patient" value={formData.patient} onChange={gererChangement} placeholder="Nom complet" className="mt-2 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Téléphone *</label>
                        <input name="phone" value={formData.phone} onChange={gererChangement} placeholder="+224 6XX XX XX XX" className="mt-2 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Date *</label>
                        <input type="date" name="date" value={formData.date} onChange={gererChangement} className="mt-2 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Médecin *</label>
                        <select name="doctorId" value={formData.doctorId} onChange={gererChangement} className="mt-2 rounded-xl">
                          <option value="">Sélectionner</option>
                          {medecinsDisponibles.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Heure *</label>
                        <select name="time" value={formData.time} onChange={gererChangement} className="mt-2 rounded-xl">
                          <option value="">Sélectionner</option>
                          {creneauxDisponibles.map((creneau) => (
                            <option key={creneau} value={creneau}>
                              {creneau}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Motif *</label>
                        <select name="reason" value={formData.reason} onChange={gererChangement} className="mt-2 rounded-xl">
                          <option value="">Sélectionner</option>
                          {MOTIFS_CONSULTATION.map((motif) => (
                            <option key={motif} value={motif}>
                              {motif}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button onClick={fermerModal} className="rounded-xl border-2 border-slate-300 px-5 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition">
                        Annuler
                      </button>
                      <button onClick={ajouterRendezVous} className="rounded-xl bg-emerald-600 px-5 py-2 text-white font-semibold hover:bg-emerald-700 transition">
                        Créer
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl bg-slate-100 p-4 border border-slate-300">
                      <p className="text-sm text-slate-600 font-medium">Patient : {selectedRdv?.patient}</p>
                      <p className="text-sm text-slate-600 font-medium mt-1">Médecin : {obtenirNomMedecin(selectedRdv?.doctorId)}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Nouvelle date *</label>
                        <input type="date" value={dateReport} onChange={(e) => setDateReport(e.target.value)} className="mt-2 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Nouvelle heure *</label>
                        <input type="time" value={heureReport} onChange={(e) => setHeureReport(e.target.value)} className="mt-2 rounded-xl" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button onClick={fermerModal} className="rounded-xl border-2 border-slate-300 px-5 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition">
                        Annuler
                      </button>
                      <button onClick={reporterRendezVous} className="rounded-xl bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700 transition">
                        Reporter
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
