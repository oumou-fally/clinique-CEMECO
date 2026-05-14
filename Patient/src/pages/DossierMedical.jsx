import { useState, useEffect, useRef } from 'react'
import Layout from '../layouts/Layout'
import { FileText, Download, Eye, Search, Loader2, X, Printer, Activity, ClipboardList, Beaker, Pill } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function DossierMedical() {
  const { patientId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [patientInfo, setPatientInfo] = useState(null)
  const [activeTab, setActiveTab] = useState('examens')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchDossier = async () => {
      if (!patientId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:3000/api/patient/dossier/${patientId}`)
        if (!response.ok) throw new Error('Erreur réseau')
        const data = await response.json()

        if (data.success && data.data) {
          setMedicalRecords(data.data.consultations || [])
          setPrescriptions(data.data.ordonnances || [])
          setPatientInfo(data.data.patient || null)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du dossier:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDossier()
  }, [patientId])

  const filteredRecords = (medicalRecords || []).filter(record =>
    (record.motif || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.medecin_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.diagnostic || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPrescriptions = (prescriptions || []).filter(p => {
    const meds = Array.isArray(p.medicaments) ? p.medicaments : []
    return meds.some(m => (m.nom || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.medecin_nom || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

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
      {/* Titre */}
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

      {/* Résumé des constantes */}
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

      {/* Onglets */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('examens')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${activeTab === 'examens' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Examens Médicaux
        </button>
        <button
          onClick={() => setActiveTab('ordonnances')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${activeTab === 'ordonnances' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Ordonnances
        </button>
        <button
          onClick={() => setActiveTab('vaccinations')}
          className={`pb-3 px-4 border-b-2 font-semibold transition ${activeTab === 'vaccinations' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Vaccinations
        </button>
      </div>

      {/* Barre de recherche */}
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{record.motif || 'Consultation médicale'}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Dr. {record.medecin_prenom || ''} {record.medecin_nom}
                        {record.medecin_specialite && ` (${record.medecin_specialite})`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {record.date_consultation ? new Date(record.date_consultation).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Terminé</span>
                </div>

                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div><p className="text-xs text-gray-500">Tension</p><p className="font-semibold">{record.pa || '--'}</p></div>
                  <div><p className="text-xs text-gray-500">FC</p><p className="font-semibold">{record.fc || '--'} bpm</p></div>
                  <div><p className="text-xs text-gray-500">Temp.</p><p className="font-semibold">{record.temperature || '--'} °C</p></div>
                  <div><p className="text-xs text-gray-500">Sat.</p><p className="font-semibold">{record.saturation || '--'} %</p></div>
                  <div><p className="text-xs text-gray-500">Poids</p><p className="font-semibold">{record.poids || '--'} kg</p></div>
                  <div><p className="text-xs text-gray-500">Taille</p><p className="font-semibold">{record.taille || '--'} cm</p></div>
                </div>

                {record.diagnostic && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800">Diagnostic :</p>
                    <p className="text-sm text-blue-700">{record.diagnostic}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedRecord(record); setIsModalOpen(true) }}
                    className="flex-1 py-2 px-4 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Voir en détail
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setTimeout(() => window.print(), 100);
                    }}
                    className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Télécharger PDF
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

      {/* Ordonnances */}
      {activeTab === 'ordonnances' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes Ordonnances</h2>
          {/* ... (tableau inchangé) ... */}
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
                      <td className="px-6 py-4 text-sm">{new Date(prescription.date_ordination).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <ul className="space-y-1">
                          {Array.isArray(prescription.medicaments) ? prescription.medicaments.map((med, idx) => (
                            <li key={idx} className="bg-teal-50 text-teal-800 px-3 py-1 rounded-md text-sm flex justify-between">
                              <span>{med?.nom}</span>
                              <span className="italic">{med?.dosage}</span>
                            </li>
                          )) : <li className="text-gray-500">Aucun médicament</li>}
                        </ul>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Dr. {prescription.medecin_prenom} {prescription.medecin_nom}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            const related = medicalRecords.find(r => r.id === prescription.id_consultation)
                            if (related) {
                              setSelectedRecord(related)
                              setIsModalOpen(true)
                            }
                          }}
                          className="text-teal-600 hover:text-teal-700 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Aucune ordonnance trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vaccinations' && (
        <div className="bg-white p-12 text-center rounded-lg shadow">
          <p className="text-gray-500">Aucune information de vaccination disponible.</p>
        </div>
      )}

      {/* ====================== MODAL DÉTAIL (Aperçu) ====================== */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-teal-600" />
                <div>
                  <h2 className="text-xl font-bold">Détail de la Consultation</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedRecord.date_consultation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded-full">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            {/* Contenu de la modal (Similaire au print mais interactif) */}
            <div className="p-8 space-y-6">
              {/* Contenu simplifié pour l'aperçu écran */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Médecin</p>
                  <p className="font-bold">Dr. {selectedRecord.medecin_prenom} {selectedRecord.medecin_nom}</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-xl text-teal-800">
                  <p className="text-xs font-bold text-teal-600 uppercase mb-1">Motif</p>
                  <p className="font-bold">{selectedRecord.motif}</p>
                </div>
              </div>
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-teal-600" /> Constantes</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div><p className="text-xs text-gray-500">Tension</p><p className="font-bold text-lg">{selectedRecord.pa || '--'}</p></div>
                  <div><p className="text-xs text-gray-500">FC</p><p className="font-bold text-lg">{selectedRecord.fc || '--'}</p></div>
                  <div><p className="text-xs text-gray-500">Temp.</p><p className="font-bold text-lg">{selectedRecord.temperature || '--'}°</p></div>
                  <div><p className="text-xs text-gray-500">Poids</p><p className="font-bold text-lg">{selectedRecord.poids || '--'}kg</p></div>
                </div>
              </div>
              <div className="space-y-4">
                <div><h4 className="font-bold text-blue-800 mb-1">Diagnostic</h4><p className="p-4 bg-blue-50 rounded-lg">{selectedRecord.diagnostic || 'Non renseigné'}</p></div>
                <div><h4 className="font-bold text-emerald-800 mb-1">Traitement</h4><p className="p-4 bg-emerald-50 rounded-lg">{selectedRecord.traitement || 'Non renseigné'}</p></div>
              </div>
            </div>
            {/* Footer Modal */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Fermer</button>
              <button onClick={() => window.print()} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
                <Printer className="w-4 h-4" /> Imprimer / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ZONE D'IMPRESSION (Invisible sur écran, Petit format) ==================== */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999]" id="printable-area">
        {selectedRecord && (
          <div className="p-6 text-[10pt] leading-tight space-y-3 max-w-[19cm] mx-auto border-2 border-double border-gray-300 h-auto">
            {/* Header Officiel Réduit */}
            <div className="border-b-2 border-teal-800 pb-3 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-teal-800">CLINIQUE CEMECO</h1>
                <p className="text-sm font-bold text-teal-700">Cabinet de cardiologie</p>
                <p className="text-[8pt] text-gray-500 mt-1">conakry, Guinée • +224 612 37 45 85 • contact@cemeco.sn</p>
              </div>
              <div className="text-right border-l-2 border-gray-200 pl-4">
                <p className="text-[7pt] font-bold uppercase text-gray-400">N° Dossier</p>
                <p className="text-xl font-black text-teal-800">#{selectedRecord.id}</p>
                <p className="text-[8pt] font-medium mt-1">Date: {new Date(selectedRecord.date_consultation).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Infos Patient/Médecin Réduites */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="uppercase text-[7pt] font-bold text-gray-400 mb-1">Identité Patient</p>
                {patientInfo && (
                  <>
                    <p className="text-sm font-bold">{patientInfo.prenom} {patientInfo.nom}</p>
                    <p className="text-[8pt] text-gray-600">{patientInfo.sexe === 'M' ? 'Homme' : 'Femme'} • {patientInfo.telephone}</p>
                  </>
                )}
              </div>
              <div className="border border-teal-100 bg-teal-50/20 rounded-lg p-3">
                <p className="uppercase text-[7pt] font-bold text-teal-700 mb-1">Médecin Examinateur</p>
                <p className="text-sm font-bold">Dr. {selectedRecord.medecin_prenom} {selectedRecord.medecin_nom}</p>
                <p className="text-[8pt] text-teal-700 font-medium">{selectedRecord.medecin_specialite}</p>
              </div>
            </div>

            {/* Constantes Réduites */}
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="uppercase text-[7pt] font-bold text-gray-400 mb-2">Paramètres Cliniques</p>
              <div className="grid grid-cols-4 gap-y-2 gap-x-4 text-[9pt]">
                <div className="flex justify-between"><span>TA:</span> <b>{selectedRecord.pa || '--'}</b></div>
                <div className="flex justify-between"><span>FC:</span> <b>{selectedRecord.fc || '--'}</b></div>
                <div className="flex justify-between"><span>T°:</span> <b>{selectedRecord.temperature || '--'}°C</b></div>
                <div className="flex justify-between"><span>Sat:</span> <b>{selectedRecord.saturation || '--'}%</b></div>
                <div className="flex justify-between"><span>Poids:</span> <b>{selectedRecord.poids || '--'}kg</b></div>
                <div className="flex justify-between"><span>Taille:</span> <b>{selectedRecord.taille || '--'}cm</b></div>
                <div className="flex justify-between col-span-2"><span>IMC:</span> <b>{selectedRecord.imc || '--'}</b></div>
              </div>
            </div>

            {/* Diagnostic/Traitement Réduits */}
            <div className="space-y-3">
              <div className="bg-gray-50 border-l-2 border-teal-600 p-3">
                <p className="uppercase text-[7pt] font-bold text-gray-400 mb-1">Motif & Diagnostic</p>
                <p className="text-[9pt]"><b>Motif:</b> {selectedRecord.motif || 'Consultation générale'}</p>
                <p className="text-[9pt] mt-1 text-blue-900 font-bold"><b>Diagnostic:</b> {selectedRecord.diagnostic || 'Non renseigné'}</p>
              </div>

              <div className="p-3 border border-emerald-100 rounded-lg bg-emerald-50/10">
                <p className="uppercase text-[7pt] font-bold text-emerald-700 mb-1">Traitement & Observations</p>
                <p className="text-[9pt] leading-snug">{selectedRecord.traitement || 'Aucun traitement spécifié.'}</p>
              </div>
            </div>

            {/* Examens Paracliniques Compacts */}
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="uppercase text-[7pt] font-bold text-gray-400 mb-2">Résultats d'examens</p>
              <div className="space-y-1 text-[8pt]">
                <div className="flex border-b border-gray-50 pb-1"><span className="w-24 font-bold">Biologie:</span> <span>{selectedRecord.biologie || '—'}</span></div>
                <div className="flex border-b border-gray-50 pb-1"><span className="w-24 font-bold">ECG:</span> <span>{selectedRecord.ecg || '—'}</span></div>
                <div className="flex"><span className="w-24 font-bold">Imagerie:</span> <span>{selectedRecord.rx_pulmonaire || ''} {selectedRecord.ett ? `| ETT: ${selectedRecord.ett}` : '—'}</span></div>
              </div>
            </div>

            {/* Ordonnance Compacte */}
            {prescriptions.some(p => p.id_consultation === selectedRecord.id) && (
              <div className="mt-4 border-t border-gray-300 pt-4">
                <p className="uppercase text-[8pt] font-black text-teal-800 mb-2">Ordonnance</p>
                <div className="border-2 border-teal-800 rounded-lg p-3 bg-white">
                  {(prescriptions || [])
                    .filter(p => p.id_consultation === selectedRecord.id)
                    .map(p => (
                      <div key={p.id}>
                        {Array.isArray(p.medicaments) && p.medicaments.map((med, idx) => (
                          <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0 text-[9pt]">
                            <span className="font-bold italic underline">{med?.nom}</span>
                            <span className="text-teal-800 font-bold">{med?.dosage}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Footer Signature Compact */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-[7pt] text-gray-400 font-medium">
              <div>Émis par CEMECO le {new Date().toLocaleString('fr-FR')}</div>
              <div className="text-center w-48 border-t border-gray-300 pt-2 font-bold text-gray-600">
                Signature & Cachet du Médecin
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles d'impression Ajustés */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          html, body { 
            height: 100%; 
            overflow: hidden; 
            background: white !important; 
            -webkit-print-color-adjust: exact; 
          }
          .no-print { display: none !important; }
          #printable-area { 
            visibility: visible !important; 
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: hidden !important;
          }
          * { -webkit-print-color-adjust: exact; }
        }
      `}} />
    </Layout>
  )
}