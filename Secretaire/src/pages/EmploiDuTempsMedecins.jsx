import { useState } from 'react'
import { Calendar, Clock, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../layouts/Layout'

// Composant : Gestion de l'emploi du temps des médecins
export default function EmploiDuTempsMedecins() {

  // Médecin sélectionné par l'utilisateur
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  // Date actuelle utilisée pour afficher la semaine
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 28))

  // ================= Données des médecins =================
  const doctors = [
    // Chaque médecin contient son nom, spécialité et planning hebdomadaire
    {
      id: 1,
      name: 'Professeur Elhadj Yaya Baldé',
      specialty: 'Médecine Interne',
      schedule: {
        Lundi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
        Mardi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
        Mercredi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
        Jeudi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
        Vendredi: { morning: null, afternoon: { start: '13:00', end: '17:00' } },
        Samedi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:00', end: '17:00' } },
        Dimanche: null
      }
    },
    {
      id: 2,
      name: 'Dr. Mamadou Diallo',
      specialty: 'Cardiologie',
      schedule: {
        Lundi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
        Mardi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
        Mercredi: { morning: { start: '08:00', end: '12:00' }, afternoon: null },
        Jeudi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
        Vendredi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '14:00', end: '18:00' } },
        Samedi: null,
        Dimanche: null
      }
    },
    {
      id: 3,
      name: 'Dr. Thierno Siradjo Baldé',
      specialty: 'Pédiatrie',
      schedule: {
        Lundi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
        Mardi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
        Mercredi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
        Jeudi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
        Vendredi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
        Samedi: { morning: { start: '08:00', end: '12:00' }, afternoon: null },
        Dimanche: null
      }
    },
    {
      id: 4,
      name: 'Dr. Thierno Boubacar Barry',
      specialty: 'Ophtalmologie',
      schedule: {
        Lundi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
        Mardi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
        Mercredi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
        Jeudi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
        Vendredi: { morning: null, afternoon: { start: '14:00', end: '18:00' } },
        Samedi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
        Dimanche: null
      }
    },
    {
      id: 5,
      name: 'Dr. Mamadou Bassirou Bah',
      specialty: 'Dermatologie',
      schedule: {
        Lundi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
        Mardi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
        Mercredi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
        Jeudi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
        Vendredi: { morning: { start: '08:30', end: '12:30' }, afternoon: null },
        Samedi: null,
        Dimanche: null
      }
    },
    {
      id: 6,
      name: 'Dr. Sophie Martin',
      specialty: 'Gynécologie',
      schedule: {
        Lundi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
        Mardi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
        Mercredi: { morning: { start: '09:00', end: '13:00' }, afternoon: null },
        Jeudi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
        Vendredi: { morning: { start: '09:00', end: '13:00' }, afternoon: { start: '14:30', end: '17:30' } },
        Samedi: null,
        Dimanche: null
      }
    },
    {
      id: 7,
      name: 'Dr. Aminata Cissé',
      specialty: 'Médecine Générale',
      schedule: {
        Lundi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
        Mardi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
        Mercredi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
        Jeudi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
        Vendredi: { morning: { start: '08:00', end: '12:00' }, afternoon: { start: '13:30', end: '17:30' } },
        Samedi: { morning: { start: '08:00', end: '12:00' }, afternoon: null },
        Dimanche: null
      }
    }
  ]

  // Jours abrégés et complets
  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const longDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  // ================= Fonctions utilitaires =================

  // Retourne les jours travaillés d'un médecin
  const getWorkingDays = (schedule) =>
    Object.entries(schedule)
      .filter(([day, hours]) => hours !== null)
      .map(([day]) => day)

  // Récupère les créneaux uniques (matin ou après-midi)
  const getUniqueSessions = (schedule, period) => {
    const sessions = new Set()
    Object.values(schedule).forEach((day) => {
      if (day && day[period]) sessions.add(`${day[period].start} - ${day[period].end}`)
    })
    return sessions.size ? Array.from(sessions).join(' / ') : 'Non disponible'
  }

  // Formate un créneau horaire
  const formatSession = (session) => {
    if (!session) return 'Non disponible'
    return `${session.start} - ${session.end}`
  }

  // Retourne le nom du jour à partir d'une date
  const getDayName = (date) => longDays[date.getDay()]

  // Retourne la disponibilité d'un jour
  const getDayAvailability = (daySchedule) => {
    if (!daySchedule) return 'Non disponible'
    const { morning, afternoon } = daySchedule

    if (morning && afternoon) {
      const start = morning.start
      const end = afternoon.end
      return `${start} - ${end}`
    }

    if (morning) return formatSession(morning)
    if (afternoon) return formatSession(afternoon)
    return 'Non disponible'
  }

  // Génère les dates d'une semaine à partir d'une date donnée
  const generateWeekDates = (date) => {
    const dates = []
    let current = new Date(date)
    let dayOfWeek = current.getDay()

    // Revenir au lundi de la semaine
    current.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    // Générer les 7 jours de la semaine
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const weekDates = generateWeekDates(currentDate)

  // Médecin actuellement sélectionné
  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor)

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* ================= En-tête ================= */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Emploi de Temps des Médecins
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les horaires et disponibilités
            </p>
          </div>

          {/* Bouton ajouter un horaire */}
          <button className="bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter Horaire
          </button>
        </div>

        {/* ================= Sélection du médecin ================= */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sélectionnez un Médecin
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor.id)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedDoctor === doctor.id
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-linear-to-br from-teal-500 to-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                    {doctor.name[4]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doctor.name}</p>
                    <p className="text-xs text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ================= Détails du médecin sélectionné ================= */}
        {selectedDoctorData && (
          <>
            <div className="bg-linear-to-r from-teal-600 to-green-600 text-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold mb-4">
                {selectedDoctorData.name}
              </h3>

              {/* Informations générales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-teal-100 text-sm">Spécialité</p>
                  <p className="font-semibold">{selectedDoctorData.specialty}</p>
                </div>
              </div>
            </div>

            {/* ================= Vue calendrier semaine ================= */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">

                {/* Navigation semaine */}
                <button
                  onClick={() => {
                    const prevWeek = new Date(currentDate)
                    prevWeek.setDate(prevWeek.getDate() - 7)
                    setCurrentDate(prevWeek)
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    const nextWeek = new Date(currentDate)
                    nextWeek.setDate(nextWeek.getDate() + 7)
                    setCurrentDate(nextWeek)
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

              </div>

              {/* Grille des jours */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, idx) => {
                  const dayName = getDayName(date)
                  const daySchedule = selectedDoctorData?.schedule?.[dayName]

                  return (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        {daysOfWeek[date.getDay()]}
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        {date.getDate()}/{date.getMonth() + 1}
                      </p>

                      <div className="mt-3">
                        <div className="text-xs p-2 rounded font-semibold">
                          {getDayAvailability(daySchedule)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ================= Indisponibilités ================= */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Congés et Indisponibilités
              </h2>

              {/* Liste des indisponibilités */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Congés annuels</p>
                  </div>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Ajouter indisponibilité */}
              <button className="w-full mt-4 border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600">
                + Ajouter une indisponibilité
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}