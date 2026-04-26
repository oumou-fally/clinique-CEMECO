import Layout from '../layouts/Layout';
import { 
  Search, 
  Plus, 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Stethoscope,
  Printer
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RapportsMedicaux() {
  const { medecinId, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (medecinId) {
      fetchReports();
    }
  }, [medecinId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/consultations/historique/${medecinId}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.consultations);
      }
    } catch (error) {
      console.error('Erreur fetch rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const searchString = `${report.patient_nom} ${report.patient_prenom} ${report.diagnostic}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Complété
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FileText className="w-10 h-10 text-blue-600" />
              Archives & Rapports Médicaux
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Consultation des dossiers historiques du <span className="text-blue-600 font-bold">Dr. {user?.nomComplet}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchReports}
              className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all border border-gray-100"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher par patient ou diagnostic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl transition-all font-medium"
            />
          </div>
        </div>

        {/* Liste des rapports */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-20 text-center text-gray-500 font-bold flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Chargement des archives médicales...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-20 text-center">
              <FileText className="w-20 h-20 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-xl">Aucun rapport trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient & Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Diagnostic Principal</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">État</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 font-black group-hover:scale-110 transition">
                            {report.patient_nom.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 capitalize text-lg">{report.patient_prenom} {report.patient_nom}</p>
                            <p className="text-xs text-gray-400 font-bold flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.date_consultation).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-700 max-w-xs truncate">{report.diagnostic || 'Non renseigné'}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase mt-1">Rapport #{report.id}</p>
                      </td>
                      <td className="px-8 py-6">
                        {getStatusBadge()}
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="p-3 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-xl text-gray-400 transition-all shadow-sm"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Détail Rapport */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header Modal */}
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 capitalize">
                    {selectedReport.patient_prenom} {selectedReport.patient_nom}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedReport.date_consultation).toLocaleDateString()}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      Rapport Finalisé
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all shadow-sm border border-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-10 space-y-10 overflow-y-auto">
              {/* Signes Vitaux */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Paramètres Vitaux</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Tension (PA)', value: selectedReport.pa, unit: 'mmHg', bg: 'bg-blue-50', text: 'text-blue-700' },
                    { label: 'Pouls (FC)', value: selectedReport.fc, unit: 'bpm', bg: 'bg-red-50', text: 'text-red-700' },
                    { label: 'Saturation', value: selectedReport.saturation, unit: '%', bg: 'bg-green-50', text: 'text-green-700' },
                    { label: 'Température', value: selectedReport.temperature, unit: '°C', bg: 'bg-orange-50', text: 'text-orange-700' },
                    { label: 'Poids', value: selectedReport.poids, unit: 'kg', bg: 'bg-gray-50', text: 'text-gray-700' },
                    { label: 'Taille', value: selectedReport.taille, unit: 'cm', bg: 'bg-gray-50', text: 'text-gray-700' },
                    { label: 'IMC', value: selectedReport.imc, unit: '', bg: 'bg-purple-50', text: 'text-purple-700' },
                    { label: 'Fréq. Resp.', value: selectedReport.fr, unit: 'c/min', bg: 'bg-gray-50', text: 'text-gray-700' }
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} p-5 rounded-3xl border border-white shadow-sm`}>
                      <p className={`text-[10px] font-black ${item.text} opacity-50 uppercase mb-1`}>{item.label}</p>
                      <p className={`text-xl font-black ${item.text}`}>{item.value || '--'} <span className="text-[10px]">{item.unit}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic et Traitement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-gray-900 pl-3">Diagnostic Posé</p>
                  <div className="bg-gray-900 text-white p-6 rounded-[32px] shadow-xl min-h-[120px]">
                    <p className="font-bold leading-relaxed">{selectedReport.diagnostic || 'Aucun diagnostic spécifié'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Traitement / Ordonnance</p>
                  <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 min-h-[120px]">
                    <p className="text-blue-900 font-bold leading-relaxed whitespace-pre-wrap">{selectedReport.traitement || 'Aucun traitement prescrit'}</p>
                  </div>
                </div>
              </div>

              {/* Examens & Notes */}
              {(selectedReport.biologie || selectedReport.ecg || selectedReport.notes) && (
                <div className="space-y-6">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-4 border-gray-200 pl-3">Notes & Examens</p>
                   <div className="grid grid-cols-1 gap-4">
                     {selectedReport.notes && (
                       <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Observations Cliniques</p>
                         <p className="text-gray-600 font-medium italic whitespace-pre-wrap">"{selectedReport.notes}"</p>
                       </div>
                     )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {selectedReport.biologie && (
                         <div className="p-5 bg-white border border-gray-100 rounded-3xl">
                           <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Biologie</p>
                           <p className="text-xs font-bold text-gray-700">{selectedReport.biologie}</p>
                         </div>
                       )}
                       {selectedReport.ecg && (
                         <div className="p-5 bg-white border border-gray-100 rounded-3xl">
                           <p className="text-[10px] font-black text-gray-400 uppercase mb-2">ECG</p>
                           <p className="text-xs font-bold text-gray-700">{selectedReport.ecg}</p>
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/30">
              <button 
                onClick={() => setSelectedReport(null)}
                className="flex-1 px-8 py-4 bg-white hover:bg-gray-100 text-gray-500 rounded-2xl font-bold transition-all border border-gray-200 shadow-sm"
              >
                Fermer l'aperçu
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                <Printer className="w-5 h-5" />
                Imprimer le Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
