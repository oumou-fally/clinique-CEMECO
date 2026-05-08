import Layout from '../layouts/Layout';
import { AlertCircle, Plus, Search, UserPlus, Eye, Mail, Phone, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function GestionPatients() {
  const [recherche, setRecherche] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Erreur patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const patientsFiltres = patients.filter(patient =>
    (patient.nom + ' ' + patient.prenom).toLowerCase().includes(recherche.toLowerCase()) ||
    patient.email.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-500 font-medium mt-1">Liste complète et dossiers des patients inscrits</p>
          </div>
          <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-[1.5rem] transition-all font-black shadow-lg shadow-blue-100">
            <UserPlus className="w-5 h-5" />
            Nouveau Patient
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Inscrits</p>
            <h3 className="text-3xl font-black text-gray-900">{loading ? '...' : patients.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nouveaux ce mois</p>
            <h3 className="text-3xl font-black text-emerald-600">+12</h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dossiers Complets</p>
            <h3 className="text-3xl font-black text-blue-600">100%</h3>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>
            <div className="text-sm font-bold text-gray-400">
              {patientsFiltres.length} patient{patientsFiltres.length > 1 ? 's' : ''} trouvé{patientsFiltres.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-left">
                  <th className="px-8 py-5 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Identité</th>
                  <th className="px-8 py-5 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Coordonnées</th>
                  <th className="px-8 py-5 font-bold text-gray-700 uppercase text-[10px] tracking-widest">Inscription</th>
                  <th className="px-8 py-5 font-bold text-gray-700 uppercase text-[10px] tracking-widest text-center">RDV</th>
                  <th className="px-8 py-5 font-bold text-gray-700 uppercase text-[10px] tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-8 py-6 h-20 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : patientsFiltres.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-600">
                          {patient.nom.charAt(0)}
                        </div>
                        <span className="font-black text-gray-900 text-lg">{patient.prenom} {patient.nom}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {patient.telephone || 'Non renseigné'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(patient.date_inscription).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black">
                        {patient.consultations}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-black text-sm p-2 hover:bg-white rounded-xl transition-all shadow-sm">
                        <Eye className="w-5 h-5" />
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {patientsFiltres.length === 0 && !loading && (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold italic text-lg">Aucun patient trouvé pour cette recherche.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
out>
  );
}