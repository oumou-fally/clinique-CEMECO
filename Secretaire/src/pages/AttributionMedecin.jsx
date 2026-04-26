import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../layouts/Layout'
import { User, Calendar, Clock, CheckCircle, Search, Stethoscope, ArrowLeft, AlertTriangle, Users, ChevronRight } from 'lucide-react'

export default function AttributionMedecin() {
  const navigate = useNavigate()

  // ---- Données ----
  const [reservations, setReservations] = useState([])
  const [medecins, setMedecins] = useState([])
  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')

  // ---- Mode guidé (depuis Disponibilités) ----
  const [rdvEnCours, setRdvEnCours] = useState(null)
  const [medecinChoisi, setMedecinChoisi] = useState(null) // objet médecin complet

  // ---- Attribution manuelle ----
  const [selectedMedecin, setSelectedMedecin] = useState({})

  // ---- UI feedback ----
  const [success, setSuccess] = useState('')
  const [loadingAttrib, setLoadingAttrib] = useState(false)

  const API_URL = ''

  // ======================================================
  // 🔄 INIT
  // ======================================================
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resRes, medRes, planRes] = await Promise.all([
        fetch(`${API_URL}/api/reservations`),
        fetch(`${API_URL}/api/personnel?role=medecin`),
        fetch(`${API_URL}/api/medecin/planning/all/global`)
      ])
      const resData = await resRes.json()
      const medData = await medRes.json()
      const planData = await planRes.json()

      const allMedecins = medData.personnel || []
      const allPlanning = planData.planning || []

      setReservations((resData.reservations || []).filter(r => r.statut === 'attente' || r.statut === 'confirme'))
      setMedecins(allMedecins)
      setPlanning(allPlanning)

      // Charger le contexte du localStorage APRÈS avoir les médecins
      const storedRdv = localStorage.getItem('rdv_selection')
      const storedMedId = localStorage.getItem('medecin_selection')
      if (storedRdv) {
        const parsedRdv = JSON.parse(storedRdv)
        setRdvEnCours(parsedRdv)

        if (storedMedId) {
          // Chercher d'abord dans planning (qui a le nom du médecin), sinon dans personnel
          const planEntry = allPlanning.find(p => String(p.id_medecin) === String(storedMedId))
          if (planEntry) {
            setMedecinChoisi({
              id: planEntry.id_medecin,
              nom: planEntry.medecin_nom,
              prenom: planEntry.medecin_prenom,
              specialite: planEntry.specialite
            })
          } else {
            const medEntry = allMedecins.find(m => String(m.id) === String(storedMedId))
            if (medEntry) setMedecinChoisi(medEntry)
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement attribution:', error)
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // ✅ ATTRIBUER (guidé ou manuel)
  // ======================================================
  const handleAttribuer = async (reservationId, medecinId) => {
    if (!medecinId) {
      alert('Veuillez sélectionner un médecin')
      return
    }
    setLoadingAttrib(true)
    try {
      const res = await fetch(`${API_URL}/api/reservations/${reservationId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_medecin: medecinId })
      })

      if (res.ok) {
        // Nettoyer le localStorage si mode guidé
        localStorage.removeItem('rdv_selection')
        localStorage.removeItem('medecin_selection')
        setRdvEnCours(null)
        setMedecinChoisi(null)
        setSuccess('Rendez-vous attribué avec succès ! Le médecin a reçu une notification.')
        setTimeout(() => setSuccess(''), 5000)
        fetchData()
      } else {
        alert('Erreur lors de l\'attribution')
      }
    } catch (error) {
      console.error('Erreur attribution:', error)
    } finally {
      setLoadingAttrib(false)
    }
  }

  const reservationsFiltrees = reservations.filter(r =>
    `${r.patient_prenom || r.prenom || ''} ${r.patient_nom || r.nom || ''}`.toLowerCase().includes(recherche.toLowerCase())
  )

  const getNomPatient = (r) => `${r.patient_prenom || r.prenom || ''} ${r.patient_nom || r.nom || ''}`

  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-teal-600" />
              Attribution des Médecins
            </h1>
            <p className="text-gray-500 mt-1.5 font-medium">
              {rdvEnCours
                ? 'Attribution guidée — médecin pré-sélectionné depuis les disponibilités'
                : 'Attribuez un médecin aux demandes de rendez-vous en attente'}
            </p>
          </div>
          {rdvEnCours && (
            <button
              onClick={() => {
                localStorage.removeItem('rdv_selection')
                localStorage.removeItem('medecin_selection')
                setRdvEnCours(null)
                setMedecinChoisi(null)
              }}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Annuler l'attribution guidée
            </button>
          )}
        </div>

        {/* FEEDBACK SUCCESS */}
        {success && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex items-center gap-3 text-emerald-800 font-semibold shadow-sm">
            <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Chargement des données...</p>
          </div>
        ) : (
          <>
            {/* ====================================== */}
            {/* MODE GUIDÉ : RDV + MÉDECIN PRÉ-CHOISI */}
            {/* ====================================== */}
            {rdvEnCours && (
              <div className="bg-white rounded-[2rem] border-2 border-teal-400 shadow-xl shadow-teal-50 overflow-hidden">

                {/* Bandeau titre */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-5 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white/80" />
                  <h2 className="text-white font-bold text-lg">Attribution guidée prête à être confirmée</h2>
                </div>

                <div className="p-8 grid lg:grid-cols-2 gap-8">

                  {/* Carte Patient / RDV */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Patient & Rendez-vous
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                      <h3 className="text-2xl font-extrabold text-gray-900">
                        {rdvEnCours.patient_prenom || rdvEnCours.prenom} {rdvEnCours.patient_nom || rdvEnCours.nom}
                      </h3>
                      {rdvEnCours.motif && (
                        <p className="text-gray-500 italic">"{rdvEnCours.motif}"</p>
                      )}
                      <div className="flex flex-wrap gap-4 pt-1">
                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
                          <Calendar className="w-4 h-4 text-teal-500" />
                          {rdvEnCours.date_rendez_vous ? new Date(rdvEnCours.date_rendez_vous).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}
                        </span>
                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
                          <Clock className="w-4 h-4 text-teal-500" />
                          {rdvEnCours.heure_rendez_vous?.substring(0, 5) || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Carte Médecin choisi */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5" /> Médecin sélectionné
                    </p>
                    {medecinChoisi ? (
                      <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-black text-xl shrink-0">
                          {(medecinChoisi.prenom || '?')[0]}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-lg">
                            Dr. {medecinChoisi.prenom} {medecinChoisi.nom}
                          </p>
                          <p className="text-teal-600 font-semibold text-sm">{medecinChoisi.specialite || 'Médecin'}</p>
                        </div>
                        <CheckCircle className="ml-auto w-6 h-6 text-teal-500 shrink-0" />
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3 text-amber-700">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="font-semibold text-sm">Aucun médecin sélectionné depuis les disponibilités. Retournez sélectionner un médecin.</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bouton principal d'attribution */}
                <div className="px-8 pb-8">
                  <button
                    disabled={!medecinChoisi || loadingAttrib}
                    onClick={() => handleAttribuer(rdvEnCours.id, medecinChoisi?.id)}
                    className="w-full py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-black text-lg rounded-2xl shadow-xl shadow-teal-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loadingAttrib ? (
                      <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Attribution en cours...</>
                    ) : (
                      <><CheckCircle className="w-6 h-6" /> Confirmer l'attribution</>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                    Le médecin recevra une notification avec les détails du rendez-vous.
                  </p>
                </div>
              </div>
            )}

            {/* ====================================== */}
            {/* MODE NORMAL : LISTE COMPLÈTE           */}
            {/* ====================================== */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  Toutes les demandes en attente
                  <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{reservations.length}</span>
                </h2>
                <div className="relative w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un patient..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-teal-400 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {reservationsFiltrees.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-200">
                  <CheckCircle className="w-14 h-14 text-emerald-100 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Toutes les demandes ont été traitées !</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reservationsFiltrees.map((resv) => {
                    const isHighlighted = rdvEnCours && rdvEnCours.id === resv.id
                    return (
                      <div
                        key={resv.id}
                        className={`rounded-[1.75rem] p-6 border-2 transition-all ${isHighlighted ? 'bg-teal-50 border-teal-300' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'}`}
                      >
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">

                          {/* Info patient */}
                          <div className="flex-1 space-y-1.5">
                            <div className="text-xs font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">
                              <User className="w-3 h-3" />
                              {resv.statut === 'confirme' ? 'Confirmé — à attribuer' : 'En attente'}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{getNomPatient(resv)}</h3>
                            {resv.motif && <p className="text-gray-500 text-sm italic">"{resv.motif}"</p>}
                            <div className="flex gap-4 pt-1 flex-wrap">
                              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {new Date(resv.date_rendez_vous).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {resv.heure_rendez_vous?.substring(0,5)}
                              </span>
                            </div>
                          </div>

                          {/* Sélection médecin */}
                          <div className="w-full lg:w-80 space-y-2.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Choisir le médecin</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <select
                                  className="w-full rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-teal-400 px-3 py-3 outline-none font-semibold text-sm appearance-none"
                                  value={selectedMedecin[resv.id] || ''}
                                  onChange={(e) => setSelectedMedecin({ ...selectedMedecin, [resv.id]: e.target.value })}
                                >
                                  <option value="">Sélectionner...</option>
                                  {medecins.map(m => (
                                    <option key={m.id} value={m.id}>
                                      Dr. {m.prenom} {m.nom}
                                    </option>
                                  ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                              </div>
                              <button
                                onClick={() => handleAttribuer(resv.id, selectedMedecin[resv.id])}
                                disabled={!selectedMedecin[resv.id] || loadingAttrib}
                                className="px-5 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl font-bold text-sm shadow-lg shadow-teal-100 transition-all active:scale-95"
                              >
                                Attribuer
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </Layout>
  )
}