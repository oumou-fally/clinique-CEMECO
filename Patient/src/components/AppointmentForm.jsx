import { useState } from 'react'
import { X, Calendar, Clock, User, Stethoscope, FileText } from 'lucide-react'

export default function AppointmentForm({ isOpen, onClose, onSubmit, selectedDoctorId }) {
  const [formData, setFormData] = useState({
    doctor: selectedDoctorId || '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    consultationType: 'in-person',
    paymentMethod: '',
    bankName: '',
    bankAccountNumber: '',
    bankRIB: '',
    orangeNumber: '',
    orangeName: '',
    orangeTransactionId: ''
  })

  const [errors, setErrors] = useState({})

  const doctors = [
    { 
      id: 1, 
      name: 'Professeur Elhadji Yaya Baldé', 
      specialty: 'Cardiologue',
      schedule: {
        monday: { available: true, morning: false, afternoon: true, start: 13, end: 17 },
        tuesday: { available: true, morning: false, afternoon: true, start: 13, end: 17 },
        wednesday: { available: true, morning: false, afternoon: true, start: 13, end: 17 },
        thursday: { available: true, morning: false, afternoon: true, start: 13, end: 17 },
        friday: { available: true, morning: false, afternoon: true, start: 13, end: 17 },
        saturday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        sunday: { available: false }
      }
    },
    { 
      id: 2, 
      name: 'Dr. Mamadou Bassirou Bah', 
      specialty: 'Cardiologue',
      schedule: {
        monday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        tuesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        wednesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        thursday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        friday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        saturday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        sunday: { available: false }
      }
    },
    { 
      id: 3, 
      name: 'Dr. Mamadou Diallo', 
      specialty: 'Cardiologue',
      schedule: {
        monday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        tuesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        wednesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        thursday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        friday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        saturday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        sunday: { available: false }
      }
    },
    { 
      id: 4, 
      name: 'Dr. Thierno Boubacar Barry', 
      specialty: 'Cardiologue',
      schedule: {
        monday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        tuesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        wednesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        thursday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        friday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        saturday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        sunday: { available: false }
      }
    },
    { 
      id: 5, 
      name: 'Dr. Thierno Siradjo Baldé', 
      specialty: 'Cardiologue',
      schedule: {
        monday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        tuesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        wednesday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        thursday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        friday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        saturday: { available: true, morning: true, afternoon: true, start: 8, end: 17 },
        sunday: { available: false }
      }
    }
  ]

  const consultationTypes = [
    'Consultation',
    'Électrocardiogramme',
    'Électrocardiographie (cardiaque et vasculaire)',
    'Mesure Ambulatoire de la Pression Artérielle (MAPA)',
    'Polygraphie ventilatoire',
    'Contrôle des pacemakers',
    'Implantation des stimulateurs cardiaques (pacemaker)',
    'Consultation pédiatrique (dossiers de prise en charge : mécénat France)',
    'Chirurgie cardiaque'
  ]

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  const getAvailableTimeSlots = (doctorId, date) => {
    if (!doctorId || !date) return timeSlots

    const doctor = doctors.find(d => d.id === parseInt(doctorId))
    if (!doctor) return timeSlots

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = days[dayOfWeek]

    const daySchedule = doctor.schedule[dayName]
    if (!daySchedule || !daySchedule.available) return []

    const availableSlots = []

    if (daySchedule.morning) {
      // Matinée: 8h-12h
      availableSlots.push(...timeSlots.filter(slot => {
        const [hour] = slot.split(':').map(Number)
        return hour >= 8 && hour < 12
      }))
    }

    if (daySchedule.afternoon) {
      // Après-midi: 13h-17h
      availableSlots.push(...timeSlots.filter(slot => {
        const [hour] = slot.split(':').map(Number)
        return hour >= 13 && hour <= 17
      }))
    }

    return [...new Set(availableSlots)].sort()
  }

  const getDoctorScheduleText = (doctorId) => {
    if (!doctorId) return ''
    const doctor = doctors.find(d => d.id === parseInt(doctorId))
    if (!doctor) return ''

    const schedule = doctor.schedule
    let text = 'Disponibilité: '
    const days = [
      { key: 'monday', name: 'Lundi' },
      { key: 'tuesday', name: 'Mardi' },
      { key: 'wednesday', name: 'Mercredi' },
      { key: 'thursday', name: 'Jeudi' },
      { key: 'friday', name: 'Vendredi' },
      { key: 'saturday', name: 'Samedi' }
    ]

    const availableDays = days.filter(day => schedule[day.key]?.available)
    if (availableDays.length === 0) return 'Non disponible'

    const scheduleText = availableDays.map(day => {
      const sched = schedule[day.key]
      let periods = []
      if (sched.morning) periods.push('8h-12h')
      if (sched.afternoon) periods.push('13h-17h')
      return `${day.name} ${periods.join(' et ')}`
    }).join(', ')

    return text + scheduleText
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

  const validateForm = () => {
    const newErrors = {}
    if (!formData.date) newErrors.date = 'Veuillez sélectionner une date'
    if (!formData.time) newErrors.time = 'Veuillez sélectionner une heure'
    else {
      const availableSlots = getAvailableTimeSlots(formData.doctor, formData.date)
      if (!availableSlots.includes(formData.time)) {
        newErrors.time = 'Cette heure n\'est pas disponible pour ce médecin à cette date'
      }
    }
    if (!formData.reason) newErrors.reason = 'Veuillez sélectionner une raison'

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Veuillez choisir un mode de paiement'
    } else if (formData.paymentMethod === 'banque') {
      if (!formData.bankName.trim()) newErrors.bankName = 'Veuillez entrer le nom de la banque'
      if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Veuillez entrer le numéro de compte'
      if (!formData.bankRIB.trim()) newErrors.bankRIB = 'Veuillez entrer le RIB'
    } else if (formData.paymentMethod === 'orange-money') {
      if (!formData.orangeNumber.trim()) newErrors.orangeNumber = 'Veuillez entrer le numéro Orange Money'
      if (!formData.orangeName.trim()) newErrors.orangeName = 'Veuillez entrer le nom du titulaire'
      if (!formData.orangeTransactionId.trim()) newErrors.orangeTransactionId = 'Veuillez entrer l\'ID de transaction'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({
        doctor: selectedDoctorId || '',
        date: '',
        time: '',
        reason: '',
        notes: '',
        consultationType: 'in-person',
        paymentMethod: '',
        bankName: '',
        bankAccountNumber: '',
        bankRIB: '',
        orangeNumber: '',
        orangeName: '',
        orangeTransactionId: ''
      })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 px-8 py-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Prendre Rendez-vous</h2>
                  <p className="text-blue-100 text-lg mt-1">Réservez votre consultation médicale</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-8 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Médecin */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Médecin</h3>
              </div>

              <div className="space-y-4">
                {formData.doctor && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doctors.find(d => d.id === parseInt(formData.doctor))?.name} - {doctors.find(d => d.id === parseInt(formData.doctor))?.specialty}
                    </p>
                  </div>
                )}

                {formData.doctor && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Planning du médecin</p>
                        <p className="text-sm text-blue-700">{getDoctorScheduleText(formData.doctor)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Date et Heure */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Date et Heure</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Consultation *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200 ${
                      errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-green-400'
                    }`}
                  />
                  {errors.date && <p className="text-red-600 text-sm mt-2">
                    {errors.date}
                  </p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure Préférée *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200 ${
                      errors.time ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    <option value="">-- Choisir une heure --</option>
                    {getAvailableTimeSlots(formData.doctor, formData.date).map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  {formData.doctor && formData.date && getAvailableTimeSlots(formData.doctor, formData.date).length === 0 && (
                    <p className="text-red-600 text-sm mt-2">
                      Ce médecin n'est pas disponible à cette date.
                    </p>
                  )}
                  {errors.time && <p className="text-red-600 text-sm mt-2">
                    {errors.time}
                  </p>}
                </div>
              </div>
            </div>

            {/* Section Type de Consultation */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Type de Consultation</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mode de Consultation
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                      <input
                        type="radio"
                        name="consultationType"
                        value="in-person"
                        checked={formData.consultationType === 'in-person'}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">En Personne</span>
                        <p className="text-sm text-gray-600">Consultation au cabinet</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                      <input
                        type="radio"
                        name="consultationType"
                        value="video"
                        checked={formData.consultationType === 'video'}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Vidéo</span>
                        <p className="text-sm text-gray-600">Consultation en ligne</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                      <input
                        type="radio"
                        name="consultationType"
                        value="phone"
                        checked={formData.consultationType === 'phone'}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Téléphone</span>
                        <p className="text-sm text-gray-600">Consultation téléphonique</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Consultation / Activité *
                  </label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 ${
                      errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <option value="">-- Sélectionner un type de consultation --</option>
                    {consultationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.reason && <p className="text-red-600 text-sm mt-2">
                    {errors.reason}
                  </p>}
                </div>
              </div>
            </div>

            {/* Section Paiement */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Paiement</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement *</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="banque"
                        checked={formData.paymentMethod === 'banque'}
                        onChange={handleChange}
                        className="text-teal-600"
                      />
                      Banque
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="orange-money"
                        checked={formData.paymentMethod === 'orange-money'}
                        onChange={handleChange}
                        className="text-teal-600"
                      />
                      Orange Money
                    </label>
                  </div>
                  {errors.paymentMethod && <p className="text-red-600 text-sm mt-2">{errors.paymentMethod}</p>}
                </div>

                {formData.paymentMethod === 'banque' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la banque *</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all duration-200 ${
                          errors.bankName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-teal-400'
                        }`}
                      />
                      {errors.bankName && <p className="text-red-600 text-sm mt-2">{errors.bankName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de compte *</label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all duration-200 ${
                          errors.bankAccountNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-teal-400'
                        }`}
                      />
                      {errors.bankAccountNumber && <p className="text-red-600 text-sm mt-2">{errors.bankAccountNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">RIB *</label>
                      <input
                        type="text"
                        name="bankRIB"
                        value={formData.bankRIB}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all duration-200 ${
                          errors.bankRIB ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-teal-400'
                        }`}
                      />
                      {errors.bankRIB && <p className="text-red-600 text-sm mt-2">{errors.bankRIB}</p>}
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'orange-money' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Numéro Orange Money *</label>
                      <input
                        type="text"
                        name="orangeNumber"
                        value={formData.orangeNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all duration-200 ${
                          errors.orangeNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-orange-400'
                        }`}
                      />
                      {errors.orangeNumber && <p className="text-red-600 text-sm mt-2">{errors.orangeNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du titulaire *</label>
                      <input
                        type="text"
                        name="orangeName"
                        value={formData.orangeName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all duration-200 ${
                          errors.orangeName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-orange-400'
                        }`}
                      />
                      {errors.orangeName && <p className="text-red-600 text-sm mt-2">{errors.orangeName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID de transaction *</label>
                      <input
                        type="text"
                        name="orangeTransactionId"
                        value={formData.orangeTransactionId}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all duration-200 ${
                          errors.orangeTransactionId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-orange-400'
                        }`}
                      />
                      {errors.orangeTransactionId && <p className="text-red-600 text-sm mt-2">{errors.orangeTransactionId}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Informations Supplémentaires */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Informations Supplémentaires</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes ou Symptômes (Optionnel)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Décrivez brièvement vos symptômes, préoccupations médicales ou toute information importante pour le médecin..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-all duration-200 hover:border-orange-400"
                />
              </div>
            </div>

            {/* Information Importante */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <div className="w-5 h-5 text-blue-600 font-bold text-center">ℹ</div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Informations Importantes</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vous recevrez une confirmation de rendez-vous par email</li>
                    <li>• Veuillez arriver 10 minutes avant l'heure prévue</li>
                    <li>• En cas d'empêchement, annulez au moins 24h à l'avance</li>
                    <li>• Apportez vos examens médicaux récents si nécessaire</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all duration-200 text-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Confirmer le Rendez-vous
              </button>
            </div>
          </form>
        </div>

        {/* Footer avec informations supplémentaires */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-8 py-4 border-t border-gray-300">
          <p className="text-center text-sm text-gray-600">
            Besoin d'aide ? Contactez notre secrétariat au <span className="font-semibold">221 33 849 XX XX</span>
          </p>
        </div>
      </div>
    </div>
  )
}
