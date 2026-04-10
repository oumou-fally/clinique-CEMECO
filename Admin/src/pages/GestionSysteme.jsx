import Layout from '../layouts/Layout'
import { Clock, Stethoscope, Settings, ToggleLeft, Save } from 'lucide-react'
import { useState } from 'react'

export default function GestionSysteme() {
  const [horaires, setHoraires] = useState({
    lundi: { debut: '08:00', fin: '17:00', actif: true },
    mardi: { debut: '08:00', fin: '17:00', actif: true },
    mercredi: { debut: '08:00', fin: '17:00', actif: true },
    jeudi: { debut: '08:00', fin: '17:00', actif: true },
    vendredi: { debut: '08:00', fin: '17:00', actif: true },
    samedi: { debut: '09:00', fin: '13:00', actif: false },
    dimanche: { debut: '00:00', fin: '00:00', actif: false }
  })

  const [specialites, setSpecialites] = useState([
    { id: 1, nom: 'Cardiologie', description: 'Maladies du cœur', actif: true },
    { id: 2, nom: 'Dermatologie', description: 'Maladies de la peau', actif: true },
    { id: 3, nom: 'Neurologie', description: 'Maladies du système nerveux', actif: true },
    { id: 4, nom: 'Ophtalmologie', description: 'Maladies des yeux', actif: true },
    { id: 5, nom: 'Pédiatrie', description: 'Médecine des enfants', actif: true },
  ])

  const [comptes, setComptes] = useState([
    { id: 1, nom: 'Professeur Elhadj Yaya Baldé', type: 'admin', statut: 'actif' },
    { id: 2, nom: 'Docteur Mamadou Bassirou Bah', type: 'admin', statut: 'actif' },
    { id: 3, nom: 'Aissatou Baldé', type: 'secretaire', statut: 'actif' },
    { id: 4, nom: 'Docteur Mamadou Diallo', type: 'medecin', statut: 'actif' },
    { id: 5, nom: 'Docteur Thierno Siradjo Baldé', type: 'medecin', statut: 'actif' },
    { id: 6, nom: 'Docteur Thierno Boubacar Barry', type: 'medecin', statut: 'actif' }
  ])

  const [newSpecialite, setNewSpecialite] = useState({ nom: '', description: '' })
  const [showAddSpecialite, setShowAddSpecialite] = useState(false)

  const handleChangeHoraire = (jour, key, value) => {
    setHoraires({
      ...horaires,
      [jour]: { ...horaires[jour], [key]: value }
    })
  }

  const handleToggleSpecialite = (id) => {
    setSpecialites(specialites.map(s => 
      s.id === id ? { ...s, actif: !s.actif } : s
    ))
  }

  const handleToggleCompte = (id) => {
    setComptes(comptes.map(c => 
      c.id === id ? { ...c, statut: c.statut === 'actif' ? 'inactif' : 'actif' } : c
    ))
  }

  const handleAddSpecialite = () => {
    if (newSpecialite.nom.trim()) {
      setSpecialites([
        ...specialites,
        {
          id: specialites.length + 1,
          nom: newSpecialite.nom,
          description: newSpecialite.description,
          actif: true
        }
      ])
      setNewSpecialite({ nom: '', description: '' })
      setShowAddSpecialite(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Système</h1>
          <p className="text-gray-600 mt-1">Configurez les paramètres de votre application clinique</p>
        </div>

        {/* Section Horaires */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Paramètres d'Horaires</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(horaires).map(([jour, info]) => (
                <div key={jour} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="w-24">
                    <p className="font-semibold text-gray-800 capitalize">{jour}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={info.debut}
                      onChange={(e) => handleChangeHoraire(jour, 'debut', e.target.value)}
                      disabled={!info.actif}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                    <span className="text-gray-600">à</span>
                    <input
                      type="time"
                      value={info.fin}
                      onChange={(e) => handleChangeHoraire(jour, 'fin', e.target.value)}
                      disabled={!info.actif}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                  </div>
                  <label className="flex items-center gap-2 ml-auto cursor-pointer">
                    <span className="text-sm text-gray-600">{info.actif ? 'Ouvert' : 'Fermé'}</span>
                    <input
                      type="checkbox"
                      checked={info.actif}
                      onChange={(e) => handleChangeHoraire(jour, 'actif', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              ))}
            </div>
            <button className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
              <Save className="w-4 h-4" />
              Enregistrer les horaires
            </button>
          </div>
        </div>

        {/* Section Spécialités */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b bg-gradient-to-r from-green-50 to-green-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Spécialités Médicales</h2>
            </div>
            <button
              onClick={() => setShowAddSpecialite(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Ajouter
            </button>
          </div>

          {/* Modal d'ajout */}
          {showAddSpecialite && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Nouvelle Spécialité</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom de la spécialité"
                    value={newSpecialite.nom}
                    onChange={(e) => setNewSpecialite({ ...newSpecialite, nom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <textarea
                    placeholder="Description"
                    value={newSpecialite.description}
                    onChange={(e) => setNewSpecialite({ ...newSpecialite, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddSpecialite}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Créer
                    </button>
                    <button
                      onClick={() => setShowAddSpecialite(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-3">
            {specialites.map((spec) => (
              <div key={spec.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{spec.nom}</p>
                  <p className="text-sm text-gray-600 mt-1">{spec.description}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">{spec.actif ? 'Actif' : 'Inactif'}</span>
                  <input
                    type="checkbox"
                    checked={spec.actif}
                    onChange={() => handleToggleSpecialite(spec.id)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Section Gestion des Comptes */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b bg-gradient-to-r from-purple-50 to-purple-100 p-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Activation/Désactivation de Comptes</h2>
          </div>
          <div className="p-6 space-y-3">
            {comptes.map((compte) => (
              <div key={compte.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{compte.nom}</p>
                  <p className="text-sm text-gray-600 mt-1 capitalize">{compte.type}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-sm font-medium ${compte.statut === 'actif' ? 'text-green-600' : 'text-red-600'}`}>
                    {compte.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </span>
                  <ToggleLeft
                    className={`w-5 h-5 cursor-pointer transition ${
                      compte.statut === 'actif' ? 'text-green-600' : 'text-gray-400'
                    }`}
                    onClick={() => handleToggleCompte(compte.id)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
