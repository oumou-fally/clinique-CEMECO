import { useState, useEffect } from 'react'
import { Phone, Mail, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react'
import Layout from '../layouts/Layout'

export default function Medecins() {
  const [medecins, setMedecins] = useState([])
  const [absences, setAbsences] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, absRes] = await Promise.all([
          fetch(`${API_URL}/api/personnel?role=medecin`),
          fetch(`${API_URL}/api/disponibilites`)
        ])
        const medData = await medRes.json()
        const absData = await absRes.json()
        setMedecins(medData.personnel || [])
        setAbsences(absData)
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const estAbsentAujourdhui = (medecinId) => {
    const today = new Date().toISOString().split('T')[0]
    return absences.find(abs => 
      abs.medecin_id === medecinId && 
      today >= abs.date_debut && 
      today <= abs.date_fin
    )
  }

  const medecinsFiltres = medecins.filter(m => 
    `${m.prenom} ${m.nom}`.toLowerCase().includes(recherche.toLowerCase())
  )

  const specialties = ['Tous', 'Cardiologie']

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Médecins</h1>
        <p className="text-gray-600 mt-2">Gérez les profils et vérifiez la disponibilité en temps réel.</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un médecin..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medecinsFiltres.map((doctor) => {
            const absence = estAbsentAujourdhui(doctor.id)
            return (
              <div key={doctor.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow relative overflow-hidden">
                {absence && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white px-6 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-2xl">
                    Absent : {absence.type}
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900">Dr. {doctor.prenom} {doctor.nom}</h3>
                <p className="text-teal-600 font-semibold">Cardiologue</p>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <p className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" /> {doctor.telephone || 'Non renseigné'}
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" /> {doctor.email}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {absence ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-bold text-amber-600">Actuellement indisponible</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-600">Disponible aujourd'hui</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}