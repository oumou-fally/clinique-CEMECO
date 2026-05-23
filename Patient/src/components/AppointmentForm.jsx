import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Stethoscope, FileText, CreditCard } from 'lucide-react'

export default function AppointmentForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reasons: [],
    notes: '',
    totalPrice: 0
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

    if (!formData.reasons || formData.reasons.length === 0) {
      newErrors.reasons = 'Au moins un type de consultation est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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

  const toggleReason = (typeNom) => {
    setFormData(prev => {
      const currentReasons = prev.reasons || []
      const isSelected = currentReasons.includes(typeNom)
      const newReasons = isSelected 
        ? currentReasons.filter(r => r !== typeNom)
        : [...currentReasons, typeNom]

      const newTotalPrice = newReasons.reduce((total, reason) => {
        const t = consultationTypes.find(ct => ct.nom === reason)
        return total + (t ? Number(t.prix) : 0)
      }, 0)

      return {
        ...prev,
        reasons: newReasons,
        totalPrice: newTotalPrice
      }
    })

    if (errors.reasons) {
      setErrors(prev => ({
        ...prev,
        reasons: ''
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
      reasons: [],
      notes: '',
      totalPrice: 0
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
                Types de consultation (sélectionnez un ou plusieurs) *
              </div>
            </label>
            {loadingTypes ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">Chargement...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {consultationTypes.map(type => {
                  const isSelected = formData.reasons?.includes(type.nom)
                  return (
                    <button
                      key={type.nom}
                      type="button"
                      onClick={() => toggleReason(type.nom)}
                      className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-200 ease-in-out overflow-hidden group ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600/20' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Optional subtle gradient background for selected state */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                      )}
                      
                      <div className="flex justify-between items-start w-full mb-3 relative z-10">
                        <span className={`font-bold leading-tight pr-2 ${isSelected ? 'text-blue-800' : 'text-gray-800 group-hover:text-blue-700'}`}>
                          {type.nom}
                        </span>
                        <div className={`shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-gray-50 group-hover:border-blue-400'
                        }`}>
                          {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                      
                      <div className="mt-auto relative z-10 flex items-center gap-1.5">
                        <div className={`px-2.5 py-1 rounded-md text-sm font-bold ${
                          isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                        }`}>
                          {new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF' }).format(type.prix)}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {errors.reasons && <p className="text-red-500 text-sm mt-1">{errors.reasons}</p>}
          </div>

          {/* Price Field (Dynamic) */}
          {formData.reasons && formData.reasons.length > 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-teal-200 pb-2">
                  <div className="flex items-center gap-2 text-teal-700">
                    <FileText className="w-5 h-5" />
                    <span className="font-bold">Consultations choisies</span>
                  </div>
                  <div className="text-sm font-semibold text-teal-800 bg-teal-100 px-2 py-1 rounded-full">
                    {formData.reasons.length} sélectionnée(s)
                  </div>
                </div>
                {formData.reasons.map(reason => {
                  const t = consultationTypes.find(ct => ct.nom === reason)
                  return (
                    <div key={reason} className="flex justify-between items-center text-sm">
                      <span className="text-teal-800 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        {reason}
                      </span>
                      <span className="text-teal-700 font-bold">
                        {t ? new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF' }).format(t.prix) : ''}
                      </span>
                    </div>
                  )
                })}
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-teal-200">
                  <div className="flex items-center gap-2 text-teal-700">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider text-sm">Prix Total Estimé</span>
                  </div>
                  <div className="text-2xl font-black text-teal-800">
                    {new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF' }).format(formData.totalPrice)}
                  </div>
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
