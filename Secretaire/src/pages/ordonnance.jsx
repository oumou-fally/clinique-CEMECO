import { useState, useEffect } from 'react'
import { Search, Printer, Pill, User, Calendar, FileText, ChevronRight, Stethoscope } from 'lucide-react'

export default function Ordonnance() {
  const [ordonnances, setOrdonnances] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrdonnance, setSelectedOrdonnance] = useState(null)

  useEffect(() => {
    fetchOrdonnances()
  }, [])

  const fetchOrdonnances = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/consultations/ordonnances/all')
      const data = await res.json()
      if (data.success) {
        // Grouper les médicaments par réservation pour afficher une seule carte par ordonnance
        const grouped = data.ordonnances.reduce((acc, curr) => {
          if (!acc[curr.id_reservation]) {
            acc[curr.id_reservation] = {
              id: curr.id_reservation,
              patient: `${curr.patient_prenom} ${curr.patient_nom}`,
              medecin: `Dr. ${curr.medecin_prenom} ${curr.medecin_nom}`,
              date: curr.date_ordination,
              medicaments: []
            }
          }
          acc[curr.id_reservation].medicaments.push({
            nom: curr.nom_medicament,
            dosage: curr.dosage
          })
          return acc
        }, {})
        setOrdonnances(Object.values(grouped))
      }
    } catch (error) {
      console.error('Erreur fetch ordonnances:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrdonnances = ordonnances.filter(ord => 
    ord.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.medecin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePrint = (ord) => {
    setSelectedOrdonnance(ord)
    setTimeout(() => {
      window.print()
    }, 300)
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl">
              <Pill className="w-8 h-8 text-orange-600" />
            </div>
            Gestion des Ordonnances
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Consultez et imprimez les prescriptions médicales validées</p>
        </div>
        <button 
          onClick={fetchOrdonnances}
          className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all border border-gray-100"
        >
          Actualiser
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex gap-4 items-center print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher par patient ou médecin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl transition-all font-medium"
          />
        </div>
      </div>

      {/* Liste des Ordonnances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
        {loading ? (
          <div className="col-span-full p-20 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold">Récupération des prescriptions...</p>
          </div>
        ) : filteredOrdonnances.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-[40px] text-center border border-gray-100">
            <FileText className="w-20 h-20 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-xl">Aucune ordonnance trouvée</p>
          </div>
        ) : (
          filteredOrdonnances.map((ord) => (
            <div 
              key={ord.id}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</p>
                  <h3 className="text-xl font-black text-gray-900 capitalize">{ord.patient}</h3>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <User className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  {new Date(ord.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                  <Stethoscope className="w-4 h-4 text-blue-400" />
                  {ord.medecin}
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-50">
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Médicaments ({ord.medicaments.length})</p>
                   <ul className="space-y-1">
                     {ord.medicaments.slice(0, 2).map((m, i) => (
                       <li key={i} className="text-xs font-bold text-gray-700 truncate">• {m.nom}</li>
                     ))}
                     {ord.medicaments.length > 2 && (
                       <li className="text-[10px] text-gray-400 font-bold italic">+{ord.medicaments.length - 2} autres...</li>
                     )}
                   </ul>
                </div>
              </div>

              <button 
                onClick={() => handlePrint(ord)}
                className="w-full py-4 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-200 group-hover:shadow-orange-200"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
            </div>
          ))
        )}
      </div>

      {/* Zone d'impression (Masquée à l'écran, visible seulement au print) */}
      {selectedOrdonnance && (
        <div className="hidden print:block bg-white p-0">
          <div className="border-b-2 border-gray-900 pb-8 text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">Clinique CEMECO</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Service des Ordonnances & Pharmacie</p>
            <div className="mt-8 flex justify-between text-left px-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Prescrit par</p>
                <p className="font-bold text-gray-900 text-lg">{selectedOrdonnance.medecin}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Date d'émission</p>
                <p className="font-bold text-gray-900">{new Date(selectedOrdonnance.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Patient</p>
            <p className="text-3xl font-black text-gray-900 capitalize border-b-2 border-gray-100 pb-4">{selectedOrdonnance.patient}</p>
          </div>

          <div className="space-y-8 min-h-[400px]">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-gray-900 pl-4 mb-6">Ordonnance Médicale</p>
            {selectedOrdonnance.medicaments.map((med, index) => (
              <div key={index} className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xl font-black text-gray-900">{med.nom}</p>
                  <p className="text-gray-500 font-bold italic mt-1">{med.dosage}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex justify-between items-end">
            <div className="text-gray-300 text-[10px] italic">
              Cette ordonnance est valable pour une durée de 3 mois.
            </div>
            <div className="text-right">
              <p className="font-black text-gray-400 uppercase text-[10px] mb-12">Cachet de la Clinique & Signature</p>
              <div className="w-64 h-32 border-2 border-dashed border-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}