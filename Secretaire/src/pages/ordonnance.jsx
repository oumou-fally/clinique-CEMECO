import { DOCTORS, GUINEAN_PATIENTS } from '../data/clinicData'

const medicalRecords = [
  {
    id: 1,
    date: '15/03/2026',
    type: 'Bilan Sanguin',
    doctor: DOCTORS[0].name,
    status: 'Reçu',
    results: ['Hémoglobine: 14.5 g/dL', 'Leucocytes: 7200 /µL', 'Plaquettes: 250K /µL']
  },
  {
    id: 2,
    date: '01/03/2026',
    type: 'Radiographie Thorax',
    doctor: DOCTORS[2].name,
    status: 'Confirmé',
    results: ['Poumons normaux', 'Cœur normal']
  },
  {
    id: 3,
    date: '18/02/2026',
    type: 'ECG',
    doctor: DOCTORS[3].name,
    status: 'Reçu',
    results: ['Rythme cardiaque régulier', 'Pas d\'anomalies']
  },
  {
    id: 4,
    date: '05/02/2026',
    type: 'Consultation Générale',
    doctor: DOCTORS[4].name,
    status: 'Reçu',
    results: ['Tension: 120/80', 'Poids: 75 kg', 'Taille: 180 cm']
  }
]

const prescriptions = [
  {
    id: 1,
    date: '15/03/2026',
    medicine: 'Aspirine 500mg',
    quantity: '30 comprimés',
    doctor: DOCTORS[0].name
  },
  {
    id: 2,
    date: '01/03/2026',
    medicine: 'Vitamine C 1000mg',
    quantity: '30 comprimés',
    doctor: DOCTORS[2].name
  },
  {
    id: 3,
    date: '18/02/2026',
    medicine: 'Ibuprofène 400mg',
    quantity: '20 comprimés',
    doctor: DOCTORS[1].name
  }
]

export default function Ordonnance() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ordonnances et Examens</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Examens Médicaux</h2>
          <div className="space-y-2">
            {medicalRecords.map(record => (
              <div key={record.id} className="bg-white p-4 rounded-lg shadow">
                <p><strong>Date:</strong> {record.date}</p>
                <p><strong>Type:</strong> {record.type}</p>
                <p><strong>Médecin:</strong> {record.doctor}</p>
                <p><strong>Statut:</strong> {record.status}</p>
                <p><strong>Résultats:</strong> {record.results.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Prescriptions</h2>
          <div className="space-y-2">
            {prescriptions.map(prescription => (
              <div key={prescription.id} className="bg-white p-4 rounded-lg shadow">
                <p><strong>Date:</strong> {prescription.date}</p>
                <p><strong>Médicament:</strong> {prescription.medicine}</p>
                <p><strong>Quantité:</strong> {prescription.quantity}</p>
                <p><strong>Médecin:</strong> {prescription.doctor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}