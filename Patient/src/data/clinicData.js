// CEMECO Cabinet de Cardiologie - Clinic Data
// Kipé, près de Heroes Coffee - En face de Plaza Diamond

// ============================================
// CLINIC INFORMATION
// ============================================
export const CLINIC_INFO = {
  name: 'CEMECO',
  fullName: 'CEMECO Cabinet de Cardiologie',
  location: 'Kipé, près de Heroes Coffee - En face de Plaza Diamond',
  hours: {
    weekday: '8h00 - 17h00', // Monday to Saturday
    weekend: 'Fermé le dimanche',
    openDays: 'Lundi à Samedi'
  }
}

// ============================================
// DOCTORS - 5 Physicians
// ============================================
export const DOCTORS = [
  {
    id: 3,
    name: 'Baldé Elhadj Yaya Professeur',
    specialty: 'Cardiologue',
    phone: '224 33 849 96 18',
    email: 'elhadj.yaya.balde@clinic.com',
    location: 'CEMECO Cabinet de Cardiologie - Kipé',
    rating: 4.9,
    reviews: 175,
    availability: 'Lun-Ven: 13:00-17:00 (Après-midi), Sam: 08:00-17:00',
    schedule: {
      monday: { available: true, morning: false, afternoon: true, start: '13:00', end: '17:00' },
      tuesday: { available: true, morning: false, afternoon: true, start: '13:00', end: '17:00' },
      wednesday: { available: true, morning: false, afternoon: true, start: '13:00', end: '17:00' },
      thursday: { available: true, morning: false, afternoon: true, start: '13:00', end: '17:00' },
      friday: { available: true, morning: false, afternoon: true, start: '13:00', end: '17:00' },
      saturday: { available: true, morning: true, afternoon: true, start: '08:00', end: '17:00' },
      sunday: { available: false }
    }
  },
  {
    id: 4,
    name: 'Bah Mamadou Bassirou Docteur',
    specialty: 'Cardiologue',
    phone: '224 33 849 96 18',
    email: 'mamadou.bassirou.bah@clinic.com',
    location: 'CEMECO Cabinet de Cardiologie - Kipé',
    rating: 4.8,
    reviews: 165,
    availability: 'Lun-Sam: 08:30-17:00',
    schedule: {
      monday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      tuesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      wednesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      thursday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      friday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      saturday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      sunday: { available: false }
    }
  },
  {
    id: 5,
    name: 'Diallo Mamadou Docteur',
    specialty: 'Cardiologue',
    phone: '224 33 849 96 18',
    email: 'mamadou.diallo@clinic.com',
    location: 'CEMECO Cabinet de Cardiologie - Kipé',
    rating: 4.7,
    reviews: 145,
    availability: 'Lun-Sam: 08:30-17:00',
    schedule: {
      monday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      tuesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      wednesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      thursday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      friday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      saturday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      sunday: { available: false }
    }
  },
  {
    id: 6,
    name: 'Baldé Thierno Siradjo Docteur',
    specialty: 'Cardiologue',
    phone: '224 33 849 96 18',
    email: 'thierno.sirardjo.balde@clinic.com',
    location: 'CEMECO Cabinet de Cardiologie - Kipé',
    rating: 4.6,
    reviews: 150,
    availability: 'Lun-Sam: 08:30-17:00',
    schedule: {
      monday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      tuesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      wednesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      thursday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      friday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      saturday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      sunday: { available: false }
    }
  },
  {
    id: 7,
    name: 'Barry Thierno Boubacar Docteur',
    specialty: 'Cardiologue',
    phone: '224 33 849 96 18',
    email: 'thierno.boubacar.barry@clinic.com',
    location: 'CEMECO Cabinet de Cardiologie - Kipé',
    rating: 4.7,
    reviews: 158,
    availability: 'Lun-Sam: 08:30-17:00',
    schedule: {
      monday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      tuesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      wednesday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      thursday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      friday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      saturday: { available: true, morning: true, afternoon: true, start: '08:30', end: '17:00' },
      sunday: { available: false }
    }
  }
]

// ============================================
// GUINEAN PATIENT NAMES
// ============================================
export const GUINEAN_PATIENTS = [
  { id: 1, name: 'Aminata Diallo', email: 'patient1@clinic.com' },
  { id: 2, name: 'Fatoumata Bah', email: 'patient2@clinic.com' },
  { id: 3, name: 'Mariama Traoré', email: 'patient3@clinic.com' },
  { id: 4, name: 'Mmady Sacko', email: 'patient@clinic.com' },
  { id: 5, name: 'Sekou Cisse', email: 'patient5@clinic.com' },
  { id: 6, name: 'Kindy Camara', email: 'patient6@clinic.com' },
  { id: 7, name: 'Sory Diallo', email: 'patient7@clinic.com' },
  { id: 8, name: 'Hawa Bah', email: 'patient8@clinic.com' },
  { id: 9, name: 'Ouma Toure', email: 'patient9@clinic.com' },
  { id: 10, name: 'Rougui Baye', email: 'patient10@clinic.com' }
]

// Helper function to get doctor by ID
export const getDoctorById = (id) => {
  return DOCTORS.find(d => d.id === id)
}

// Helper function to get available doctors for a specific date
export const getAvailableDoctors = (dateString) => {
  const date = new Date(dateString)
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = days[dayOfWeek]

  return DOCTORS.filter(doctor => doctor.schedule[dayName]?.available)
}

// Helper function to get time slots for a specific doctor and date
export const getTimeSlots = (doctorId, dateString) => {
  const doctor = getDoctorById(doctorId)
  if (!doctor) return []

  const date = new Date(dateString)
  const dayOfWeek = date.getDay()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = days[dayOfWeek]

  const daySchedule = doctor.schedule[dayName]
  if (!daySchedule || !daySchedule.available) return []

  // Generate time slots
  const slots = []
  const [startHour, startMin] = daySchedule.start.split(':').map(Number)
  const [endHour, endMin] = daySchedule.end.split(':').map(Number)

  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === endHour - 1 && min > 0) break
      slots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }
  }

  return slots
}
