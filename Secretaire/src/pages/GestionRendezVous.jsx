import { useState } from 'react'
import { Calendar, Clock, User, Phone, Edit, Trash2, CheckCircle, XCircle, Pause, X, AlertCircle } from 'lucide-react'
import Layout from '../layouts/Layout'

// Fonction principale renommée en français pour faciliter la compréhension
export default function GestionRendezVous() {

  // =========================
  // PLANNING DES MÉDECINS
  // =========================
  // Structure contenant les horaires de chaque médecin par jour
  const doctorsSchedule = {
    'Professeur Elhadj Yaya Baldé': {
      Lundi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
      Mardi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
      Mercredi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
      Jeudi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
      Vendredi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
      Samedi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:00', end: '17:00' } },
      Dimanche: null
    },
    'Dr. Mamadou Diallo': {
      Lundi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
      Mardi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
      Mercredi: { morning: { start: '08:00', end: '12:00' }, afternoon: null },
      Jeudi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
      Vendredi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
      Samedi: null,
      Dimanche: null
    },
    'Dr. Thierno Siradjo Baldé': {
      Lundi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
      Mardi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
      Mercredi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
      Jeudi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
      Vendredi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
      Samedi: { morning: { start: '08:00', end: '12:00' }, afternoon: null },
      Dimanche: null
    },
    'Dr. Thierno Boubacar Barry': {
      Lundi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
      Mardi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
      Mercredi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
      Jeudi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
      Vendredi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
      Samedi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
      Dimanche: null
    },
    'Dr. Mamadou Bassirou Bah': {
      Lundi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
      Mardi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
      Mercredi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
      Jeudi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
      Vendredi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
      Samedi: null,
      Dimanche: null
    },
    'Dr. Sophie Martin': {
      Lundi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
      Mardi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
      Mercredi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
      Jeudi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
      Vendredi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
      Samedi: null,
      Dimanche: null
    },
    'Dr. Aminata Cissé': {
      Lundi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
      Mardi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
      Mercredi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
      Jeudi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
      Vendredi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
      Samedi: { morning: { start: '08:00', end: '12:00' }, afternoon: null },
      Dimanche: null
    }
  }

  // Liste des jours pour convertir une date en jour de la semaine
  const longDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  // =========================
  // FONCTION DE VÉRIFICATION DES DISPONIBILITÉS
  // =========================
  // Vérifie si un médecin est disponible à une date et heure donnée
  const isTimeAvailable = (doctorName, dateStr, timeStr) => {
    if (!doctorName || !dateStr || !timeStr) return false

    const date = new Date(dateStr)
    const dayName = longDays[date.getDay()]
    const schedule = doctorsSchedule[doctorName]?.[dayName]

    if (!schedule) return false

    const [hours, mins] = timeStr.split(':').map(Number)
    const timeInMinutes = hours * 60 + mins

    // Vérification créneau matin
    if (schedule.morning) {
      const [mStart, mEnd] = schedule.morning.start.split(':').map(Number)
      const morningStart = mStart * 60
      const morningEnd = mEnd * 60
      if (timeInMinutes >= morningStart && timeInMinutes < morningEnd) {
        return true
      }
    }

    // Vérification créneau après-midi
    if (schedule.afternoon) {
      const [aStart, aEnd] = schedule.afternoon.start.split(':').map(Number)
      const afternoonStart = aStart * 60
      const afternoonEnd = aEnd * 60
      if (timeInMinutes >= afternoonStart && timeInMinutes < afternoonEnd) {
        return true
      }
    }

    return false
  }

  // =========================
  // ÉTATS (STATE)
  // =========================
  // Liste des rendez-vous
  const [appointments, setAppointments] = useState([])

  // Filtre actif
  const [filter, setFilter] = useState('all')

  // Gestion des modales
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)

  // Rendez-vous sélectionné
  const [selectedAppt, setSelectedAppt] = useState(null)

  // Champs pour reprogrammation
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  // Message d'erreur
  const [errorMessage, setErrorMessage] = useState('')

  // Formulaire d'ajout
  const [formData, setFormData] = useState({
    patient: '',
    phone: '',
    doctor: '',
    date: '',
    time: '',
    reason: ''
  })

  // =========================
  // GESTION DES CHANGEMENTS DE FORMULAIRE
  // =========================
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // =========================
  // AJOUT D'UN RENDEZ-VOUS
  // =========================
  const handleAddAppointment = () => {
    setErrorMessage('')

    // Vérification des champs obligatoires
    if (!formData.patient || !formData.phone || !formData.doctor || !formData.date || !formData.time || !formData.reason) {
      setErrorMessage('⚠️ Veuillez remplir tous les champs requis.')
      return
    }

    // Vérification disponibilité du médecin
    if (!isTimeAvailable(formData.doctor, formData.date, formData.time)) {
      setErrorMessage('❌ Créneau non disponible')
      return
    }

    // Création du nouveau rendez-vous
    const newAppt = {
      id: Date.now(),
      ...formData,
      status: 'pending'
    }

    setAppointments([...appointments, newAppt])
    setShowModal(false)
    setFormData({ patient: '', phone: '', doctor: '', date: '', time: '', reason: '' })
  }

  // =========================
  // MODIFICATION STATUT
  // =========================
  const handleStatusChange = (id, newStatus) => {
    setAppointments(
      appointments.map((appt) =>
        appt.id === id ? { ...appt, status: newStatus } : appt
      )
    )
  }

  // =========================
  // SUPPRESSION RENDEZ-VOUS
  // =========================
  const handleDeleteAppointment = (id) => {
    setAppointments(appointments.filter((appt) => appt.id !== id))
  }

  // =========================
  // REPROGRAMMATION
  // =========================
  const handleReschedule = (id) => {
    const appt = appointments.find((a) => a.id === id)
    if (!appt) return

    if (!newDate || !newTime) {
      setErrorMessage('Veuillez sélectionner une nouvelle date et heure')
      return
    }

    if (!isTimeAvailable(appt.doctor, newDate, newTime)) {
      setErrorMessage('Créneau non disponible')
      return
    }

    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, date: newDate, time: newTime } : a
      )
    )
    setSelectedAppt(null)
    setNewDate('')
    setNewTime('')
    setErrorMessage('')
  }

  // Liste des médecins disponibles
  const availableDoctors = Object.keys(doctorsSchedule)

  // Filtrage des rendez-vous
  const filteredAppointments = appointments.filter((appt) => {
    if (filter === 'all') return true
    return appt.status === filter
  })

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Rendez-vous
            </h1>
            <p className="text-gray-600 mt-2">
              Organisez et gérez les consultations médicales
            </p>
          </div>
          <button
            onClick={() => {
              setModalType('add')
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau RDV
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tous', count: appointments.length },
              { key: 'pending', label: 'En attente', count: appointments.filter(a => a.status === 'pending').length },
              { key: 'confirmed', label: 'Confirmé', count: appointments.filter(a => a.status === 'confirmed').length },
              { key: 'completed', label: 'Terminé', count: appointments.filter(a => a.status === 'completed').length },
              { key: 'cancelled', label: 'Annulé', count: appointments.filter(a => a.status === 'cancelled').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Rendez-vous ({filteredAppointments.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun rendez-vous trouvé
              </div>
            ) : (
              filteredAppointments.map((appt) => (
                <div key={appt.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {appt.time}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appt.patient}</h3>
                          <p className="text-gray-600">{appt.doctor}</p>
                          <p className="text-sm text-gray-500">{appt.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{appt.date}</p>
                        <p className="text-sm text-gray-500">{appt.phone}</p>
                      </div>

                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                          appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppt(appt)
                            setModalType('reschedule')
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Reprogrammer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {modalType === 'add' ? 'Nouveau Rendez-vous' : 'Reprogrammer Rendez-vous'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                {modalType === 'add' ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleAddAppointment(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient
                      </label>
                      <input
                        type="text"
                        name="patient"
                        value={formData.patient}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Médecin
                      </label>
                      <select
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionner un médecin</option>
                        {availableDoctors.map((doctor) => (
                          <option key={doctor} value={doctor}>
                            {doctor}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motif
                      </label>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Créer RDV
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Rendez-vous actuel: {selectedAppt?.patient} - {selectedAppt?.date} à {selectedAppt?.time}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouvelle Date
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouvelle Heure
                      </label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleReschedule(selectedAppt.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Reprogrammer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
