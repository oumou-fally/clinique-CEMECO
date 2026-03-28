import { useState } from 'react'
import { Calendar, Clock, User, Phone, Edit, Trash2, CheckCircle, XCircle, Pause } from 'lucide-react'
import Layout from '../layouts/Layout'

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: 'Jean Dupont',
      doctor: 'Dr. Sophie Martin',
      date: '28/03/2024',
      time: '10:30',
      reason: 'Visite générale',
      status: 'confirmed',
      phone: '06 12 34 56 78'
    },
    {
      id: 2,
      patient: 'Marie Lefevre',
      doctor: 'Dr. Jean Rousseau',
      date: '28/03/2024',
      time: '11:00',
      reason: 'Consultation cardiologie',
      status: 'pending',
      phone: '06 23 45 67 89'
    },
    {
      id: 3,
      patient: 'Pierre Martin',
      doctor: 'Dr. Sophie Martin',
      date: '29/03/2024',
      time: '14:00',
      reason: 'Suivi tension',
      status: 'confirmed',
      phone: '06 34 56 78 90'
    },
    {
      id: 4,
      patient: 'Anne Durand',
      doctor: 'Dr. Marie Durand',
      date: '29/03/2024',
      time: '15:30',
      reason: 'Dermatologie',
      status: 'cancelled',
      phone: '06 45 67 89 01'
    }
  ])

  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé'
      case 'pending':
        return 'En attente'
      case 'cancelled':
        return 'Annulé'
      default:
        return status
    }
  }

  const filteredAppointments =
    filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)

  const handleStatusChange = (id, newStatus) => {
    setAppointments(
      appointments.map((appt) => (appt.id === id ? { ...appt, status: newStatus } : appt))
    )
  }

  const handleDelete = (id) => {
    setAppointments(appointments.filter((appt) => appt.id !== id))
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Rendez-vous</h1>
            <p className="text-gray-600 mt-2">Gérez, confirmez, annulez et reportez les rendez-vous</p>
          </div>
          <button className="bg-linear-to-r from-teal-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition">
            + Nouveau Rendez-vous
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'confirmed', label: 'Confirmés' },
              { id: 'pending', label: 'En attente' },
              { id: 'cancelled', label: 'Annulés' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === f.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Médecin</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date & Heure</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Raison</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{appt.patient}</p>
                        <p className="text-xs text-gray-600">{appt.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{appt.doctor}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{appt.date}</span>
                        <Clock className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="text-gray-700">{appt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{appt.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                        {getStatusLabel(appt.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {appt.status !== 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'confirmed')}
                            title="Confirmer"
                            className="p-2 hover:bg-green-100 rounded-lg transition"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'cancelled')}
                            title="Annuler"
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                          >
                            <XCircle className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                        <button
                          title="Modifier"
                          className="p-2 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm font-medium">Confirmés</p>
            <p className="text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm font-medium">En Attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm font-medium">Annulés</p>
            <p className="text-2xl font-bold text-red-600">
              {appointments.filter((a) => a.status === 'cancelled').length}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
