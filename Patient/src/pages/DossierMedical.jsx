import { useState, useEffect, useRef } from 'react'
import Layout from '../layouts/Layout'
import { FileText, Download, Eye, Filter, Search, Loader2, X, Printer, Activity, ClipboardList, Beaker, Pill } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Composant de la page dossier médical (nom en français pour faciliter la recherche)
export default function DossierMedical() {
  const { patientId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [patientInfo, setPatientInfo] = useState(null)
  const [activeTab, setActiveTab] = useState('examens') // 'examens', 'ordonnances', 'vaccinations'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    const fetchDossier = async () => {
      if (!patientId) return

      try {
        const response = await fetch(`http://localhost:3000/api/patient/dossier/${patientId}`)
        const data = await response.json()

        if (data.success) {
          setMedicalRecords(data.data.consultations)
          setPrescriptions(data.data.ordonnances)
          setPatientInfo(data.data.patient)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du dossier:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDossier()
  }, [patientId])

  // Filtrage des données
  const filteredRecords = medicalRecords.filter(record => 
    (record.motif || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.medecin_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.diagnostic || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPrescriptions = prescriptions.filter(p => 
    p.medicaments.some(m => m.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.medecin_nom || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Chargement de votre dossier médical...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>

      {/* Titre de la page */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Dossier Médical</h1>
          <p className="text-gray-600 mt-2">Consultez tous vos examens médicaux et ordonnances</p>
        </div>
        {patientInfo && (
          <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-sm shadow-sm">
            <p className="font-bold text-teal-800 text-base">{patientInfo.prenom} {patientInfo.nom}</p>
            <p className="text-teal-600">{patientInfo.email} | {patientInfo.telephone}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="bg-white px-2 py-1 rounded border border-teal-100">{patientInfo.commune}</span>
              <span className="bg-white px-2 py-1 rounded border border-teal-100">{patientInfo.quartier}</span>
              <span className="bg-white px-2 py-1 rounded border border-teal-100">{patientInfo.sexe === 'M' ? 'Homme' : 'Femme'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Résumé des dernières constantes */}
      {medicalRecords.length > 0 && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Dernière Tension</p>
            <p className="text-xl font-bold text-teal-600">{medicalRecords[0].pa || '--'}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Fréq. Cardiaque</p>
            <p className="text-xl font-bold text-teal-600">{medicalRecords[0].fc || '--'} <span className="text-xs">bpm</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Poids</p>
            <p className="text-xl font-bold text-teal-600">{medicalRecords[0].poids || '--'} <span className="text-xs">kg</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">IMC</p>
            <p className="text-xl font-bold text-teal-600">{medicalRecords[0].imc || '--'}</p>
          </div>
        </div>
      )}

      {/* Onglets (navigation interne) */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('examens')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'examens' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Examens Médicaux
        </button>
        <button 
          onClick={() => setActiveTab('ordonnances')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'ordonnances' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Ordonnances
        </button>
        <button 
          onClick={() => setActiveTab('vaccinations')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'vaccinations' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Vaccinations
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'examens' ? "Rechercher une consultation ou un diagnostic..." : "Rechercher un médicament ou un docteur..."}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des examens */}
      {activeTab === 'examens' && (
        <div className="space-y-4 mb-8">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-teal-500">

                {/* En-tête de chaque examen */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{record.motif || 'Consultation de cardiologie'}</h3>
                      <p className="text-sm text-gray-600 mt-1">Dr. {record.medecin_prenom} {record.medecin_nom} ({record.medecin_specialite})</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(record.date_consultation).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Statut */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800`}>
                    Terminé
                  </span>
                </div>

                {/* Résultats médicaux */}
                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Tension (PA)</p>
                    <p className="text-sm font-semibold">{record.pa || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fréq. Cardiaque</p>
                    <p className="text-sm font-semibold">{record.fc || '--'} bpm</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Température</p>
                    <p className="text-sm font-semibold">{record.temperature || '--'} °C</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Saturation</p>
                    <p className="text-sm font-semibold">{record.saturation || '--'} %</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Poids</p>
                    <p className="text-sm font-semibold">{record.poids || '--'} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Taille</p>
                    <p className="text-sm font-semibold">{record.taille || '--'} cm</p>
                  </div>
                </div>

                {record.diagnostic && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Diagnostic:</p>
                    <p className="text-sm text-blue-700">{record.diagnostic}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedRecord(record)
                      setIsModalOpen(true)
                    }}
                    className="flex-1 py-2 px-4 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir en détail
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedRecord(record)
                      setTimeout(() => window.print(), 100)
                    }}
                    className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-lg shadow">
              <p className="text-gray-500">Aucun examen médical trouvé.</p>
            </div>
          )}
        </div>
      )}

      {/* Section ordonnances */}
      {activeTab === 'ordonnances' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes Ordonnances</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Médicaments</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prescripteur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{new Date(prescription.date_ordination).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <ul className="space-y-1">
                          {Array.isArray(prescription.medicaments) ? (
                            prescription.medicaments.map((med, idx) => (
                              <li key={idx} className="bg-teal-50 text-teal-800 px-3 py-1 rounded-md text-sm flex justify-between">
                                <span className="font-bold">{med.nom}</span>
                                <span className="italic">{med.dosage}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500 text-xs italic">Aucun médicament listé</li>
                          )}
                        </ul>
                        {prescription.dosage && (
                          <div className="mt-2 text-xs text-teal-700 bg-teal-50 p-1 rounded inline-block">
                            Dosage: {prescription.dosage}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Dr. {prescription.medecin_prenom} {prescription.medecin_nom}
                        <div className="text-xs text-gray-400 mt-1">{prescription.medecin_specialite}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => {
                              // Trouver la consultation associée pour afficher le détail complet
                              const relatedConsultation = medicalRecords.find(r => r.id === prescription.id_consultation)
                              if (relatedConsultation) {
                                setSelectedRecord(relatedConsultation)
                                setIsModalOpen(true)
                              }
                            }}
                            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Voir détail
                          </button>
                          <button 
                            onClick={() => window.print()}
                            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Télécharger
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      Aucune ordonnance trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section vaccinations (placeholder) */}
      {activeTab === 'vaccinations' && (
        <div className="bg-white p-12 text-center rounded-lg shadow">
          <p className="text-gray-500">Aucune information de vaccination disponible.</p>
        </div>
      )}

      {/* MODAL DE DÉTAILS */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Détail du Dossier Médical</h2>
                  <p className="text-sm text-gray-500">Consultation du {new Date(selectedRecord.date_consultation).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
                  title="Imprimer / PDF"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenu Modal */}
            <div className="p-6 space-y-8" id="printable-area">
              
              {/* Infos Patient & Médecin */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Informations Médecin</h3>
                  <p className="font-bold text-gray-900 text-lg">Dr. {selectedRecord.medecin_prenom} {selectedRecord.medecin_nom}</p>
                  <p className="text-teal-600 font-medium">{selectedRecord.medecin_specialite}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Motif de consultation</h3>
                  <p className="font-bold text-gray-900">{selectedRecord.motif || 'Non spécifié'}</p>
                </div>
              </div>

              {/* Constantes Vitales */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Constantes Vitales</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Tension (PA)</p>
                    <p className="font-bold text-gray-900">{selectedRecord.pa || '--'}</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Fréq. Cardiaque</p>
                    <p className="font-bold text-gray-900">{selectedRecord.fc || '--'} bpm</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Fréq. Respiratoire</p>
                    <p className="font-bold text-gray-900">{selectedRecord.fr || '--'} cpm</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Température</p>
                    <p className="font-bold text-gray-900">{selectedRecord.temperature || '--'} °C</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Saturation O2</p>
                    <p className="font-bold text-gray-900">{selectedRecord.saturation || '--'} %</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Poids</p>
                    <p className="font-bold text-gray-900">{selectedRecord.poids || '--'} kg</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Taille</p>
                    <p className="font-bold text-gray-900">{selectedRecord.taille || '--'} cm</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">IMC</p>
                    <p className="font-bold text-gray-900">{selectedRecord.imc || '--'}</p>
                  </div>
                </div>
              </section>

              {/* Analyse Clinique */}
              <section className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Analyse Clinique</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-xs font-bold text-orange-800 uppercase mb-1">Symptômes</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRecord.symptomes || 'Aucun symptôme renseigné'}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 uppercase mb-1">Diagnostic</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap font-semibold">{selectedRecord.diagnostic || 'En attente de diagnostic'}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-800 uppercase mb-1">Traitement</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRecord.traitement || 'Aucun traitement spécifié'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Beaker className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Examens & Notes</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Biologie</p>
                      <p className="text-sm text-gray-700">{selectedRecord.biologie || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">ECG / Rythme</p>
                      <p className="text-sm text-gray-700">{selectedRecord.ecg || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Imagerie (RX/ETT)</p>
                      <p className="text-sm text-gray-700">
                        {selectedRecord.rx_pulmonaire ? `RX: ${selectedRecord.rx_pulmonaire}` : ''}
                        {selectedRecord.rx_pulmonaire && selectedRecord.ett ? ' | ' : ''}
                        {selectedRecord.ett ? `ETT: ${selectedRecord.ett}` : ''}
                        {!selectedRecord.rx_pulmonaire && !selectedRecord.ett ? 'N/A' : ''}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 italic">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Notes complém.</p>
                      <p className="text-sm text-gray-600">{selectedRecord.notes || 'Aucune note particulière'}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Ordonnance associée */}
              {prescriptions.some(p => p.id_consultation === selectedRecord.id) && (
                <section className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Pill className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Ordonnance Associée</h3>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                    <div className="grid md:grid-cols-2 gap-4">
                      {prescriptions
                        .filter(p => p.id_consultation === selectedRecord.id)
                        .map(p => (
                          <div key={p.id} className="space-y-4">
                            <div className="space-y-2">
                              {p.medicaments.map((med, idx) => (
                                <div key={idx} className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                                  <span className="font-bold text-gray-900">{med.nom}</span>
                                  <span className="text-teal-600 italic font-medium">{med.dosage}</span>
                                </div>
                              ))}
                            </div>
                            {p.dosage && (
                              <p className="text-sm text-teal-800 bg-white p-3 rounded-lg border border-teal-100">
                                <span className="font-bold">Consigne globale:</span> {p.dosage}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Footer Modal */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Fermer
              </button>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger le Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style d'impression (pour le téléchargement PDF via print) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
        }
      `}} />

    </Layout>
  )
}
