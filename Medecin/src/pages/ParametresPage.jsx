import Layout from '../layouts/Layout'
import { Settings, Bell, Lock, User, LogOut, Save } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Composant principal : page de configuration du compte utilisateur (médecin/patient selon le contexte)
export default function ParametresPage() {

  // ===================== AUTHENTIFICATION =====================
  // Récupération des infos utilisateur + fonction de déconnexion
  const { user, logout } = useAuth()

  // ===================== ETAT DU FORMULAIRE =====================
  // Stocke les informations personnelles du profil
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    insuranceNumber: user?.insuranceNumber || ''
  })

  // ===================== ETAT DES NOTIFICATIONS =====================
  // Permet d'activer/désactiver les préférences utilisateur
  const [notifications, setNotifications] = useState({
    appointmentReminders: true, // rappels de rendez-vous
    resultNotifications: true,   // notifications résultats
    newsEmail: false,            // infolettre
    smsNotifications: true       // notifications SMS
  })

  // ===================== GESTION DES CHAMPS =====================
  // Mise à jour des champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Basculer une option de notification (true/false)
  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <Layout>

      {/* ===================== EN-TETE ===================== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres du Compte</h1>
        <p className="text-gray-600 mt-2">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===================== MENU LATÉRAL ===================== */}
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

        {/* ===================== CONTENU PRINCIPAL ===================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ===================== INFORMATIONS PERSONNELLES ===================== */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-teal-600" />
              Informations Personnelles
            </h2>

            <div className="space-y-6">

              {/* Nom et prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
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
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              {/* Téléphone et date naissance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date de Naissance</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
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
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              {/* Assurance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro d'Assurance</label>
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-lg flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Enregistrer
                </button>
                <button className="py-3 px-6 border rounded-lg">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          {/* ===================== NOTIFICATIONS ===================== */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-teal-600" />
              Préférences de Notification
            </h2>

            {/* Chaque bloc correspond à une option activable */}
            <div className="space-y-4">

              <div className="flex justify-between items-center border p-4 rounded-lg">
                <p>Rappels de rendez-vous</p>
                <input type="checkbox" checked={notifications.appointmentReminders} onChange={() => handleNotificationChange('appointmentReminders')} />
              </div>

              <div className="flex justify-between items-center border p-4 rounded-lg">
                <p>Résultats d'examens</p>
                <input type="checkbox" checked={notifications.resultNotifications} onChange={() => handleNotificationChange('resultNotifications')} />
              </div>

              <div className="flex justify-between items-center border p-4 rounded-lg">
                <p>Notifications SMS</p>
                <input type="checkbox" checked={notifications.smsNotifications} onChange={() => handleNotificationChange('smsNotifications')} />
              </div>

              <div className="flex justify-between items-center border p-4 rounded-lg">
                <p>Infolettre</p>
                <input type="checkbox" checked={notifications.newsEmail} onChange={() => handleNotificationChange('newsEmail')} />
              </div>
            </div>
          </div>

          {/* ===================== ZONE DE DANGER ===================== */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <LogOut className="w-6 h-6 text-red-600" />
              Zone de Danger
            </h2>

            {/* Déconnexion */}
            <button onClick={logout} className="bg-red-600 text-white px-6 py-3 rounded-lg">
              Se déconnecter
            </button>
          </div>

        </div>
      </div>
    </Layout>
  )
}
