import { useState, useMemo } from 'react'
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Star,
  Calendar,
  User,
  X
} from 'lucide-react'
import Layout from '../layouts/Layout'
import { DOCTORS, CLINIC_INFO } from '../data/clinicData'

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const COULEURS_MEDECINS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500'
]

export default function RenseignementMedecin() {
  const [medecinSelectionne, setMedecinSelectionne] = useState(null)

  const medecinsAvecHoraires = useMemo(() => {
    console.log('DOCTORS:', DOCTORS)
    return DOCTORS.map((medecin, index) => ({
      ...medecin,
      couleur: COULEURS_MEDECINS[index % COULEURS_MEDECINS.length],
      horaires: medecin.id === 1 ? {
        // Prof. Elhadj Yaya Baldé
        'Lundi': '12:00 - 17:00',
        'Mardi': '12:00 - 17:00',
        'Mercredi': '12:00 - 17:00',
        'Jeudi': '12:00 - 17:00',
        'Vendredi': '12:00 - 17:00',
        'Samedi': '08:00 - 17:00'
      } : {
        // Autres médecins
        'Lundi': '08:00 - 17:00',
        'Mardi': '08:00 - 17:00',
        'Mercredi': '08:00 - 17:00',
        'Jeudi': '08:00 - 17:00',
        'Vendredi': '08:00 - 17:00',
        'Samedi': '08:00 - 17:00'
      }
    }))
  }, [])

  const ouvrirProfilMedecin = (medecin) => {
    setMedecinSelectionne(medecin)
  }

  const fermerProfilMedecin = () => {
    setMedecinSelectionne(null)
  }

  return (
    <Layout>
      <div className="p-8 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen space-y-8">
        <div className="flex flex-col gap-4 md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Médecins de la Clinique
            </h1>
            <p className="text-slate-600 mt-2">Découvrez notre équipe de cardiologues et leurs horaires de consultation</p>
          </div>
          <div className="rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 p-4 border border-emerald-200">
            <p className="text-sm text-emerald-900 font-medium">
              <strong>🏥 CEMECO - Excellence en Cardiologie</strong>
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              {CLINIC_INFO.hours} • {CLINIC_INFO.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {medecinsAvecHoraires.map((medecin, index) => (
            <div key={medecin.id} className="group">
              <div className="rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => ouvrirProfilMedecin(medecin)}>
                <div className={`bg-linear-to-r ${medecin.couleur} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5" />
                          <span className="text-sm font-medium opacity-90">Cardiologue</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{medecin.name}</h2>
                        <p className="opacity-90 text-sm">Cardiologue</p>
                      </div>
                      <div className="text-4xl opacity-80">
                        {medecin.id === 1 ? '👨‍⚕️' : '👩‍⚕️'}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex flex-col gap-3">
                    {medecin.phone && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <Phone className="w-5 h-5 text-indigo-600" />
                        <a href={`tel:${medecin.phone}`} className="hover:text-indigo-600 transition font-medium">
                          {medecin.phone}
                        </a>
                      </div>
                    )}
                    {medecin.email && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        <a href={`mailto:${medecin.email}`} className="hover:text-indigo-600 transition font-medium truncate">
                          {medecin.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-700">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">Cabinet {medecin.name.split(' ').pop()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-slate-900">Disponibilités</span>
                    </div>
                    <div className="space-y-2">
                      {medecin.id === 1 ? (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Lun-Ven:</span>
                            <span className="font-semibold text-emerald-600">12h-17h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Samedi:</span>
                            <span className="font-semibold text-emerald-600">8h-17h</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Lun-Sam:</span>
                            <span className="font-semibold text-emerald-600">8h-17h</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // attribuerRendezVous(medecin)
                    }}
                    className="w-full rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-md"
                  >
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Attribuer un rendez-vous
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
          <h2 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Informations importantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-4 p-6 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="text-3xl">🏥</div>
              <div>
                <p className="font-bold text-slate-900">Clinique ouverte</p>
                <p className="text-slate-700 text-sm mt-1">Du lundi au samedi, de 8h00 à 17h00. Fermée le dimanche.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="text-3xl">👨‍⚕️</div>
              <div>
                <p className="font-bold text-slate-900">Prof. Elhadj Yaya Baldé</p>
                <p className="text-slate-700 text-sm mt-1">Lundi-vendredi: 12h00 à 17h00 • Samedi: 08h00 à 17h00</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200">
              <div className="text-3xl">👨‍⚕️👩‍⚕️</div>
              <div>
                <p className="font-bold text-slate-900">Autres cardiologues</p>
                <p className="text-slate-700 text-sm mt-1">Lundi-samedi: 08h00 à 17h00</p>
              </div>
            </div>
          </div>
        </div>

        {medecinSelectionne && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className={`bg-linear-to-r ${medecinSelectionne.couleur} p-8 text-white relative`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="w-8 h-8" />
                        <span className="text-lg font-medium">Cardiologue Spécialiste</span>
                      </div>
                      <h2 className="text-4xl font-bold mb-2">{medecinSelectionne.name}</h2>
                      <p className="text-xl opacity-90">Cardiologue</p>
                    </div>
                    <button onClick={fermerProfilMedecin} className="text-white/80 hover:text-white transition">
                      <X className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <User className="w-6 h-6 text-indigo-600" />
                      Informations de contact
                    </h3>
                    <div className="space-y-4">
                      {medecinSelectionne.phone && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                          <Phone className="w-6 h-6 text-indigo-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Téléphone</p>
                            <a href={`tel:${medecinSelectionne.phone}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                              {medecinSelectionne.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {medecinSelectionne.email && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                          <Mail className="w-6 h-6 text-indigo-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Email</p>
                            <a href={`mailto:${medecinSelectionne.email}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                              {medecinSelectionne.email}
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                        <MapPin className="w-6 h-6 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-slate-900">Cabinet</p>
                          <p className="text-slate-700">Cabinet {medecinSelectionne.name.split(' ').pop()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                      Horaires de travail détaillés
                    </h3>
                    <div className="space-y-3">
                      {JOURS_SEMAINE.map((jour) => (
                        <div key={jour} className="flex items-center justify-between p-4 rounded-2xl bg-linear-to-r from-slate-50 to-slate-100">
                          <span className="font-semibold text-slate-900 min-w-32">{jour}</span>
                          <span className={`font-bold text-lg ${
                            medecinSelectionne.horaires[jour] === 'Fermé' ? 'text-slate-500 line-through' : 'text-emerald-600'
                          }`}>
                            {medecinSelectionne.horaires[jour]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {medecinSelectionne.id === 1 && (
                  <div className="rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-blue-600" />
                      <h4 className="text-xl font-bold text-blue-900">Note spéciale</h4>
                    </div>
                    <p className="text-blue-800">
                      Le Professeur Elhadj Yaya Baldé suit un horaire particulier adapté à ses nombreuses responsabilités académiques et hospitalières.
                      Il consulte du lundi au vendredi de 12h00 à 17h00 et le samedi de 08h00 à 17h00.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <button className="flex-1 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-8 py-4 text-white font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition shadow-lg">
                    <Calendar className="w-6 h-6 inline mr-2" />
                    Attribuer un rendez-vous
                  </button>
                  <button onClick={fermerProfilMedecin} className="rounded-2xl bg-slate-200 px-8 py-4 text-slate-700 font-bold text-lg hover:bg-slate-300 transition">
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}