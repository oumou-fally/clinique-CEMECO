import Layout from '../layouts/Layout'
import { Clock, Stethoscope, Shield, ToggleRight, Save, Activity, Heart, UserCheck, Bell, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function GestionSysteme() {
  const [loading, setLoading] = useState(true)
  const [horaires, setHoraires] = useState({
    lundi: { debut: '08:00', fin: '18:00', actif: true },
    mardi: { debut: '08:00', fin: '18:00', actif: true },
    mercredi: { debut: '08:00', fin: '18:00', actif: true },
    jeudi: { debut: '08:00', fin: '18:00', actif: true },
    vendredi: { debut: '08:00', fin: '18:00', actif: true },
    samedi: { debut: '09:00', fin: '13:00', actif: true },
    dimanche: { debut: '00:00', fin: '00:00', actif: false }
  })

  // Spécialités corrigées pour une clinique de cardiologie
  const [specialites, setSpecialites] = useState([
    { id: 1, nom: 'Cardiologie Clinique', description: 'Consultations et suivis cardiaques standards', icon: Heart },
    { id: 2, nom: 'Rhythmologie', description: 'Troubles du rythme et pacemakers', icon: Activity },
    { id: 3, nom: 'Chirurgie Cardiaque', description: 'Interventions chirurgicales lourdes', icon: Stethoscope },
    { id: 4, nom: 'Cardiologie Vasculaire', description: 'Pathologies des vaisseaux et artères', icon: Activity },
  ])

  const [comptes, setComptes] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/personnel')
      const data = await res.json()
      if (data.success) {
        setComptes([
          ...data.medecins.map(m => ({ ...m, type: 'Médecin', id: m.id_medecin })),
          ...data.secretaires.map(s => ({ ...s, type: 'Secrétaire', id: s.id_secretaire }))
        ])
      }
    } catch (error) {
      console.error('Erreur systeme:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeHoraire = (jour, key, value) => {
    setHoraires(prev => ({
      ...prev,
      [jour]: { ...prev[jour], [key]: value }
    }))
  }

  return (
    <Layout>
      <div className="space-y-12 pb-24">
        {/* Header Premium */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 -z-10"></div>
          
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Configuration Système</h1>
          <div className="flex items-center gap-2 mt-4 text-gray-500 font-medium">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Panneau de contrôle de la Clinique Médico-Chirurgicale de Cardiologie (CEMECO)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Section Horaires - Col 7 */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Horaires d'Ouverture</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Disponibilité globale</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all font-black text-xs shadow-lg shadow-blue-100">
                  <Save className="w-4 h-4" /> Appliquer
                </button>
              </div>
              
              <div className="p-10 space-y-4">
                {Object.entries(horaires).map(([jour, info]) => (
                  <div key={jour} className={`flex items-center justify-between p-6 rounded-3xl transition-all ${info.actif ? 'bg-white border border-gray-100 shadow-sm' : 'bg-gray-50 opacity-60'}`}>
                    <div className="flex items-center gap-6">
                      <span className="w-24 font-black text-gray-900 capitalize tracking-tight">{jour}</span>
                      <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-2xl">
                        <input
                          type="time"
                          value={info.debut}
                          onChange={(e) => handleChangeHoraire(jour, 'debut', e.target.value)}
                          disabled={!info.actif}
                          className="bg-transparent border-none focus:ring-0 font-black text-gray-900 px-3"
                        />
                        <span className="text-gray-300 font-black">/</span>
                        <input
                          type="time"
                          value={info.fin}
                          onChange={(e) => handleChangeHoraire(jour, 'fin', e.target.value)}
                          disabled={!info.actif}
                          className="bg-transparent border-none focus:ring-0 font-black text-gray-900 px-3"
                        />
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={info.actif}
                        onChange={(e) => handleChangeHoraire(jour, 'actif', e.target.checked)}
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Spécialités Cardiologiques */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Spécialités Cliniques</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Focus Cardiologie CEMECO</p>
                </div>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                {specialites.map((spec) => (
                  <div key={spec.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-white rounded-2xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                        <spec.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-gray-900">{spec.nom}</h4>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{spec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Comptes & Sécurité - Col 5 */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Accès Personnel</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Contrôle des comptes</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />)
                ) : comptes.map((compte) => (
                  <div key={compte.id} className="flex items-center justify-between p-5 bg-gray-50 hover:bg-white rounded-[2rem] border border-transparent hover:border-gray-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {compte.nom.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{compte.prenom} {compte.nom}</p>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{compte.type}</span>
                      </div>
                    </div>
                    <button className="p-3 bg-white rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                      <ToggleRight className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification System */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
              <div className="relative z-10">
                <Bell className="w-12 h-12 mb-6 text-blue-200" />
                <h3 className="text-2xl font-black mb-2">Alertes Système</h3>
                <p className="text-blue-100 text-sm font-medium">Configurez les seuils d'alertes pour les rendez-vous et les urgences cardiaques.</p>
                <button className="mt-8 w-full bg-white text-blue-600 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl">
                  Gérer les Notifications
                </button>
              </div>
              <Info className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
