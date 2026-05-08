import { useState, useEffect, useRef } from 'react'
import { X, Send, User, MessageCircle, AlertCircle, FileText, Image, Mic, Paperclip, Trash2 } from 'lucide-react'
import { DOCTORS } from '../data/clinicData'

export default function AskDoctorForm({ isOpen, onClose, onSubmit, selectedDoctorId, allowedDoctors = null }) {
  const [formData, setFormData] = useState({
    doctor: selectedDoctorId || '',
    subject: '',
    message: '',
    priority: 'normal',
    fichier: null,
    preview: null,
    type: 'text'
  })

  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        fichier: file,
        type: type,
        preview: type === 'image' ? URL.createObjectURL(file) : null
      }))
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks = []
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setFormData(prev => ({
          ...prev,
          fichier: new File([blob], "vocal.webm", { type: 'audio/webm' }),
          type: 'vocal',
          preview: 'vocal'
        }))
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Erreur micro:", err)
      alert("Accès micro refusé ou non supporté")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, fichier: null, preview: null, type: 'text' }))
    setAudioBlob(null)
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
      const submissionData = new FormData()
      submissionData.append('id_medecin', formData.doctor)
      submissionData.append('id_patient', localStorage.getItem('patientId'))
      submissionData.append('expediteur', 'patient')
      submissionData.append('sujet', formData.subject)
      submissionData.append('priorite', formData.priority)
      submissionData.append('message', formData.message)
      submissionData.append('type', formData.type)
      if (formData.fichier) {
        submissionData.append('fichier', formData.fichier)
      }
      
      onSubmit(submissionData)
      setFormData({
        doctor: selectedDoctorId || '',
        subject: '',
        message: '',
        priority: 'normal',
        fichier: null,
        preview: null,
        type: 'text'
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
              rows="4"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Minimum 10 caractères</p>
          </div>

          {/* Attachments UI */}
          <div className="space-y-4">
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <Paperclip className="w-4 h-4 text-purple-600" />
              Pièces jointes (Optionnel)
            </label>
            
            <div className="flex flex-wrap gap-3">
              {/* Image Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition border border-pink-100"
              >
                <Image className="w-4 h-4" />
                <span className="text-xs font-bold">Image</span>
              </button>
              
              {/* File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition border border-blue-100"
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold">Document</span>
              </button>

              {/* Vocal Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition border ${
                  isRecording 
                    ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span className="text-xs font-bold">{isRecording ? 'Arrêter' : 'Vocal'}</span>
              </button>
            </div>

            {/* Hidden Inputs */}
            <input 
              type="file" 
              ref={imageInputRef} 
              hidden 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'image')} 
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              onChange={(e) => handleFileChange(e, 'file')} 
            />

            {/* Preview Area */}
            {formData.fichier && (
              <div className="relative mt-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                {formData.type === 'image' && (
                  <img src={formData.preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                )}
                {formData.type === 'file' && (
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-10 h-10" />
                  </div>
                )}
                {formData.type === 'vocal' && (
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Mic className="w-10 h-10" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-700 truncate">{formData.fichier.name || 'Message Vocal'}</p>
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{formData.type}</p>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
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
