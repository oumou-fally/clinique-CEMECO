import { useState, useEffect } from 'react'
import { X, Send, User, MessageCircle, AlertCircle, FileText } from 'lucide-react'
import { DOCTORS } from '../data/clinicData'

export default function AskDoctorForm({ isOpen, onClose, onSubmit, selectedDoctorId, allowedDoctors = null }) {
  const [formData, setFormData] = useState({
    doctor: selectedDoctorId || '',
    subject: '',
    message: '',
    priority: 'normal',
    attachments: []
  })

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      doctor: selectedDoctorId || ''
    }))
  }, [selectedDoctorId])

  const [errors, setErrors] = useState({})

  // If allowedDoctors is provided, filter the list
  const doctors = allowedDoctors && allowedDoctors.length > 0 
    ? DOCTORS.filter(d => allowedDoctors.includes(d.name))
    : DOCTORS

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!selectedDoctorId && !formData.doctor) newErrors.doctor = 'Veuillez sélectionner un médecin'
    if (!formData.subject.trim()) newErrors.subject = 'Veuillez entrer un sujet'
    if (!formData.message.trim()) newErrors.message = 'Veuillez entrer votre message'
    if (formData.message.trim().length < 10) newErrors.message = 'Le message doit contenir au moins 10 caractères'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({
        doctor: selectedDoctorId || '',
        subject: '',
        message: '',
        priority: 'normal',
        attachments: []
      })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-linear-to-br from-purple-50/60 via-pink-50/60 to-indigo-50/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-purple-100">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-purple-600 to-purple-700 px-6 py-6 flex items-center justify-between border-b rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Demander un Conseil Médical</h2>
            <p className="text-purple-100 text-sm mt-1">Posez vos questions à un médecin qui vous a consulté</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Doctors Selection */}
          <div>
            {selectedDoctorId ? (
              <div>
                <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Médecin
                </label>
                <p className="text-sm text-gray-900">
                  {doctors.find(d => d.id === parseInt(selectedDoctorId))?.name} - {doctors.find(d => d.id === parseInt(selectedDoctorId))?.specialty}
                </p>
              </div>
            ) : (
              <div>
                <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Sélectionnez un Médecin *
                </label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                    errors.doctor ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Choisir un médecin --</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
                {errors.doctor && <p className="text-red-500 text-sm mt-1">{errors.doctor}</p>}
              </div>
            )}
          </div>

          {/* Priority and Subject */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subject */}
            <div className="md:col-span-3">
              <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                Sujet *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Exemple: Conseils sur l'hypertension"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                Priorité
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="low">Basse</option>
                <option value="normal">Normal</option>
                <option value="high">Urgent</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Votre Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Décrivez votre problème de santé ou posez votre question en détail..."
              rows="6"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Minimum 10 caractères</p>
          </div>

          {/* Important Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Important</p>
                <p className="text-sm text-amber-800 mt-1">
                  Pour les urgences médicales, veuillez appeler directement le 15 (SAMU) ou vous rendre aux urgences. 
                  Les demandes reçoivent généralement une réponse dans les 24-48 heures.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Info */}
          <div className="flex items-start gap-2">
            <input 
              type="checkbox" 
              id="privacy"
              className="w-4 h-4 text-purple-600 rounded mt-1" 
              required
            />
            <label htmlFor="privacy" className="text-sm text-gray-600">
              Je comprends que mes données médicales seront traitées de manière confidentielle conformément à la loi RGPD
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer la Question
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
