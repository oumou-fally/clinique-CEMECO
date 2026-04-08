import Layout from '../layouts/Layout'
import { Settings, Bell, Lock, User, LogOut, Save } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Composant de la page paramètres du compte (nom en français)
export default function ParametresCompte() {
  
  // Récupération de l'utilisateur connecté et fonction de déconnexion
  const { user, logout } = useAuth()

  // État du formulaire des informations personnelles
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    insuranceNumber: user?.insuranceNumber || ''
  })

  // État des préférences de notifications
  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    resultNotifications: true,
    newsEmail: false,
    smsNotifications: true
  })

  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Gestion du toggle des notifications
  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Layout>

      {/* Titre de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres du Compte</h1>
        <p className="text-gray-600 mt-2">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Menu latéral */}
        <div className="bg-white rounded-lg shadow h-fit">
          <div className="p-6 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-600 font-semibold">
              <User className="w-5 h-5" />
              Profil Personnel
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">
              <Lock className="w-5 h-5" />
              Sécurité
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">
              <Settings className="w-5 h-5" />
              Préférences
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-teal-600" />
              Informations Personnelles
            </h2>

            <div className="space-y-6">

              {/* Prénom et Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Téléphone et Date de naissance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date de Naissance</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Assurance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro d'Assurance (Mutuelle)</label>
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
                </button>
                <button className="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-teal-600" />
              Préférences de Notification
            </h2>

            {/* Options de notifications */}
            <div className="space-y-4">
              {/* Chaque bloc représente un type de notification avec toggle */}
            </div>
          </div>

          {/* Zone de danger */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LogOut className="w-6 h-6 text-red-600" />
              Zone de Danger
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Déconnexion</h3>
                <p className="text-sm text-gray-600 mb-4">Vous serez déconnecté de votre compte</p>
                <button
                  onClick={logout}
                  className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
