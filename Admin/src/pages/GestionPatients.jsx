import Layout from '../layouts/Layout';
import { AlertCircle, Plus, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function GestionPatients() {
  const [recherche, setRecherche] = useState('');

  const patients = [
    { id: 1, nom: 'Aminata Diallo', email: 'aminata.diallo@example.com', telephone: '07 01 02 03 04', statut: 'Actif' },
    { id: 2, nom: 'Fatoumata Bah', email: 'fatoumata.bah@example.com', telephone: '07 05 06 07 08', statut: 'Actif' },
    { id: 3, nom: 'Mariama Traoré', email: 'mariama.traore@example.com', telephone: '07 09 10 11 12', statut: 'Actif' },
    { id: 4, nom: 'Mmady Sacko', email: 'mmady.sacko@example.com', telephone: '07 13 14 15 16', statut: 'Inactif' },
  ];

  // Filtrage des patients selon la recherche
  const patientsFiltres = patients.filter(patient =>
    patient.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    patient.email.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-600 mt-1">Suivi et gestion complète des patients de la clinique</p>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition font-medium">
            <UserPlus className="w-5 h-5" />
            Nouveau Patient
          </button>
        </div>

        {/* Message d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800">
            Cette page sera bientôt enrichie avec des fonctionnalités avancées : recherche avancée, 
            filtres, dossiers médicaux complets et historique des consultations.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow">
          {/* Barre de recherche et actions */}
          <div className="p-6 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un patient (nom ou email)..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="text-sm text-gray-500">
              {patientsFiltres.length} patient{patientsFiltres.length > 1 ? 's' : ''} trouvé{patientsFiltres.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Tableau des patients */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Nom Complet</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Téléphone</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patientsFiltres.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-medium text-gray-900">{patient.nom}</td>
                    <td className="px-6 py-5 text-gray-600">{patient.email}</td>
                    <td className="px-6 py-5 text-gray-600">{patient.telephone}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${
                          patient.statut === 'Actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {patient.statut}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-blue-600 hover:text-blue-700 mr-4">
                        Voir dossier
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {patientsFiltres.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Aucun patient trouvé correspondant à votre recherche.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}