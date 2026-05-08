import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Stethoscope, FileText, CreditCard } from 'lucide-react'

export default function AppointmentForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    notes: '',
    price: ''
  })

  const [errors, setErrors] = useState({})
  const [consultationTypes, setConsultationTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  const API_URL = 'http://localhost:3000'

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/patient/types-consultation`)
        const data = await response.json()
        if (data.success) {
          setConsultationTypes(data.data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des types de consultation:', error)
      } finally {
        setLoadingTypes(false)
      }
    }

    if (isOpen) {
      fetchTypes()
    }
  }, [isOpen])

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.date) {
      newErrors.date = 'La date est requise'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.date = 'La date doit être dans le futur'
      }
    }

    if (!formData.time) {
      newErrors.time = 'L\'heure est requise'
    }

    if (!formData.reason) {
      newErrors.reason = 'Le type de consultation est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'reason') {
      const selectedType = consultationTypes.find(t => t.nom === value)
      setFormData(prev => ({
        ...prev,
        [name]: value,
        price: selectedType ? selectedType.prix : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
    setFormData({
      date: '',
      time: '',
      reason: '',
      notes: '',
      price: ''
    })
  }

  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-linear-to-br from-blue-50/60 via-indigo-50/60 to-purple-50/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-blue-100">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-xl font-bold">Demander un rendez-vous</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-800 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Information Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-semibold mb-1">💬 Important</p>
            <p>La secrétaire examinera votre demande et vous confirmera votre rendez-vous avec le médecin assigné et l'horaire.</p>
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date du rendez-vous *
              </div>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={getMinDate()}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Time Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Heure préférée *
              </div>
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Sélectionner une heure --</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>

          {/* Reason/Consultation Type Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Type de consultation *
              </div>
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              disabled={loadingTypes}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              } ${loadingTypes ? 'bg-gray-50' : ''}`}
            >
              <option value="">{loadingTypes ? 'Chargement...' : '-- Sélectionner un type --'}</option>
              {consultationTypes.map(type => (
                <option key={type.nom} value={type.nom}>
                  {type.nom}
                </option>
              ))}
            </select>
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
          </div>

          {/* Price Field (Dynamic) */}
          {formData.price && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-teal-700">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-bold">Prix de la consultation</span>
                </div>
                <div className="text-xl font-black text-teal-800">
                  {new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF' }).format(formData.price)}
                </div>
              </div>
            </div>
          )}

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes additionnelles (optionnel)
              </div>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Décrivez vos symptômes ou précisions supplémentaires..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium"
            >
              Soumettre la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
