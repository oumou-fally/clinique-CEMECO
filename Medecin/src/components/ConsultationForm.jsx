import { ArrowLeft, Save } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ConsultationForm({ 
  onSave, 
  onClose, 
  initialData = null 
}) {
  const defaultFormData = {
    nom: '',
    prenom: '',
    age: '',
    phone: '',
    provenance: '',
    date: '',
    time: '',
    duration: '30 min',
    type: 'Consultation',
    status: 'Programmé',
    room: '',
    
    // Constantes / Signes vitaux
    pa: '',      // Pression Artérielle
    fc: '',      // Fréquence Cardiaque
    fr: '',      // Fréquence Respiratoire
    temperature: '',
    saturation: '',
    poids: '',
    taille: '',
    imc: '',
    
    // Examens complémentaires
    biologie: '',
    ecg: '',
    rxPulmonaire: '',
    ett: '',
    
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  }

  const [formData, setFormData] = useState({ ...defaultFormData, ...initialData })

  // Mise à jour lorsque initialData change (mode édition ou pré-remplissage)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    } else {
      setFormData(defaultFormData)
    }
  }, [initialData])

  const handleSave = () => {
    // Calcul automatique de l'IMC si poids et taille sont renseignés
    if (formData.poids && formData.taille) {
      const tailleEnM = parseFloat(formData.taille) / 100
      const imcCalcule = (parseFloat(formData.poids) / (tailleEnM * tailleEnM)).toFixed(1)
      formData.imc = imcCalcule
    }
    
    onSave(formData)
  }

  const isEditing = initialData !== null

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Modifier' : 'Nouvelle'} Consultation
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ==================== Informations Patient ==================== */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informations Patient</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Nom de famille"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
          <input
            type="text"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Prénom"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Âge</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Âge (ans)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="06 12 34 56 78"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Provenance</label>
          <input
            type="text"
            value={formData.provenance}
            onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Domicile, Hôpital, Urgence..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Heure</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* ==================== Constantes Vitales ==================== */}
        <div className="lg:col-span-3 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Constantes Vitales</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">PA (mmHg)</label>
          <input
            type="text"
            value={formData.pa}
            onChange={(e) => setFormData({ ...formData, pa: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="120/80"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">FC (bpm)</label>
          <input
            type="text"
            value={formData.fc}
            onChange={(e) => setFormData({ ...formData, fc: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="72"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">FR (c/min)</label>
          <input
            type="text"
            value={formData.fr}
            onChange={(e) => setFormData({ ...formData, fr: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="18"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Température (°C)</label>
          <input
            type="text"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="37.2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Saturation O₂ (%)</label>
          <input
            type="text"
            value={formData.saturation}
            onChange={(e) => setFormData({ ...formData, saturation: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="98"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.poids}
            onChange={(e) => setFormData({ ...formData, poids: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="70"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Taille (cm)</label>
          <input
            type="number"
            value={formData.taille}
            onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="170"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">IMC</label>
          <input
            type="text"
            value={formData.imc}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
            placeholder="Calcul automatique"
          />
        </div>

        {/* ==================== Examens Complémentaires ==================== */}
        <div className="lg:col-span-3 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Examens Complémentaires</h2>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Biologie</label>
          <textarea
            value={formData.biologie}
            onChange={(e) => setFormData({ ...formData, biologie: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="NFS, CRP, ionogramme, glycémie..."
            rows="2"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">ECG</label>
          <textarea
            value={formData.ecg}
            onChange={(e) => setFormData({ ...formData, ecg: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Description ou résultat de l'ECG"
            rows="2"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">RX Pulmonaire</label>
          <textarea
            value={formData.rxPulmonaire}
            onChange={(e) => setFormData({ ...formData, rxPulmonaire: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Résultat de la radiographie pulmonaire"
            rows="2"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">ETT (Échographie Transthoracique)</label>
          <textarea
            value={formData.ett}
            onChange={(e) => setFormData({ ...formData, ett: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Résultat de l'échographie cardiaque"
            rows="2"
          />
        </div>

        {/* ==================== Motif et Conclusion ==================== */}
        <div className="lg:col-span-3 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Motif et Conclusion</h2>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Symptômes</label>
          <textarea
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Décrivez les symptômes du patient"
            rows="3"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnostic</label>
          <textarea
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Diagnostic posé"
            rows="3"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Traitement</label>
          <textarea
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Traitement prescrit"
            rows="3"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notes Additionnelles</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Autres remarques..."
            rows="2"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
        >
          <Save className="w-5 h-5" />
          Enregistrer la consultation
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}