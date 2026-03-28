import { useState } from 'react'
import { Calendar, Clock, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../layouts/Layout'

export default function Schedule() {
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 28))

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sophie Martin',
      specialty: 'Médecin Généraliste',
      workingDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      schedule: {
        morning: { start: '09:00', end: '12:30' },
        afternoon: { start: '14:00', end: '18:00' }
      }
    },
    {
      id: 2,
      name: 'Dr. Jean Rousseau',
      specialty: 'Cardiologue',
      workingDays: ['Lundi', 'Mercredi', 'Vendredi'],
      schedule: {
        morning: { start: '08:00', end: '12:00' },
        afternoon: { start: '14:00', end: '17:00' }
      }
    },
    {
      id: 3,
      name: 'Dr. Marie Durand',
      specialty: 'Dermatologue',
      workingDays: ['Mardi', 'Mercredi', 'Jeudi', 'Samedi'],
      schedule: {
        morning: { start: '09:00', end: '13:00' },
        afternoon: { start: '15:00', end: '19:00' }
      }
    }
  ]

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const generateWeekDates = (date) => {
    const dates = []
    let current = new Date(date)
    let dayOfWeek = current.getDay()
    // Start from Monday
    current.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const weekDates = generateWeekDates(currentDate)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emploi de Temps des Médecins</h1>
            <p className="text-gray-600 mt-2">Gérez les horaires et disponibilités</p>
          </div>
          <button className="bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter Horaire
          </button>
        </div>

        {/* Doctor Selection */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélectionnez un Médecin</h2>
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

        {selectedDoctor && (
          <>
            {/* Selected Doctor Info */}
            {(() => {
              const doctor = doctors.find((d) => d.id === selectedDoctor)
              return (
                <div className="bg-linear-to-r from-teal-600 to-green-600 text-white rounded-xl shadow-md p-6">
                  <h3 className="text-2xl font-bold mb-4">{doctor.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-teal-100 text-sm">Spécialité</p>
                      <p className="font-semibold">{doctor.specialty}</p>
                    </div>
                    <div>
                      <p className="text-teal-100 text-sm">Jours de Travail</p>
                      <p className="font-semibold text-sm">{doctor.workingDays.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-teal-100 text-sm">Matin</p>
                      <p className="font-semibold">
                        {doctor.schedule.morning.start} - {doctor.schedule.morning.end}
                      </p>
                    </div>
                    <div>
                      <p className="text-teal-100 text-sm">Après-midi</p>
                      <p className="font-semibold">
                        {doctor.schedule.afternoon.start} - {doctor.schedule.afternoon.end}
                      </p>
                    </div>
                  </div>
                </div>
            )}
            )}

            {/* Calendar View */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Semaine</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-700 min-w-[150px] text-center">
                    {weekDates[0].toLocaleDateString('fr-FR', {
                      month: 'long',
                      day: 'numeric'
                    })}{' '}
                    -{' '}
                    {weekDates[6].toLocaleDateString('fr-FR', {
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Week Schedule Grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {daysOfWeek[date.getDay()]}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {date.getDate()}/{date.getMonth() + 1}
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs bg-blue-100 text-blue-700 p-2 rounded font-semibold">
                        09:00 - 12:30
                      </div>
                      <div className="text-xs bg-green-100 text-green-700 p-2 rounded font-semibold">
                        14:00 - 18:00
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hors Disponibilités */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Congés et Indisponibilités</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Congés annuels</p>
                    <p className="text-sm text-gray-600">01/07/2024 - 15/07/2024</p>
                  </div>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Formation professionnelle</p>
                    <p className="text-sm text-gray-600">10/04/2024</p>
                  </div>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button className="w-full mt-4 border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600 hover:border-gray-400 transition font-semibold">
                + Ajouter une indisponibilité
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
