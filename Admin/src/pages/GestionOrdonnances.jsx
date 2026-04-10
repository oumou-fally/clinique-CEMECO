import { useState } from 'react';
import Layout from '../layouts/Layout';
import { 
  FileText, Search, Download, Eye, Trash2, Plus, 
  Calendar, User, Filter 
} from 'lucide-react';

export default function GestionOrdonnances() {
  const [ordonnances, setOrdonnances] = useState([
    {
      id: 1,
      patientNom: 'Aminata Diallo',
      patientID: 'P001',
      date: '2026-03-28',
      medicament: 'Amoxicilline 500mg',
      dosage: '1 comprimé x 3/jour',
      duree: '7 jours',
      medecin: 'Dr. Mamadou Diallo',
      statut: 'Active'
    },
    {
      id: 2,
      patientNom: 'Fatoumata Bah',
      patientID: 'P002',
      date: '2026-03-27',
      medicament: 'Métoprolol 50mg',
      dosage: '1 comprimé matin et soir',
      duree: 'Continu',
      medecin: 'Dr. Thierno Boubacar Barry',
      statut: 'Active'
    },
    {
      id: 3,
      patientNom: 'Mariama Traoré',
      patientID: 'P003',
      date: '2026-03-26',
      medicament: 'Ibuprofène 400mg',
      dosage: '1 comprimé toutes les 6h',
      duree: '5 jours',
      medecin: 'Dr. Mamadou Diallo',
      statut: 'Expirée'
    },
    {
      id: 4,
      patientNom: 'Mmady Sacko',
      patientID: 'P004',
      date: '2026-03-25',
      medicament: 'Atorvastatine 20mg',
      dosage: '1 comprimé le soir',
      duree: 'Continu',
      medecin: 'Dr. Thierno Siradjo Baldé',
      statut: 'Active'
    },
    {
      id: 5,
      patientNom: 'Sekou Cisse',
      patientID: 'P005',
      date: '2026-03-24',
      medicament: 'Salbutamol',
      dosage: '2 bouffées si besoin',
      duree: 'Selon besoin',
      medecin: 'Dr. Mamadou Diallo',
      statut: 'Active'
    }
  ]);

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('all');

  // Filtrage des ordonnances
  const ordonnancesFiltrees = ordonnances.filter(ord => {
    const correspondRecherche = 
      ord.patientNom.toLowerCase().includes(recherche.toLowerCase()) ||
      ord.patientID.toLowerCase().includes(recherche.toLowerCase()) ||
      ord.medicament.toLowerCase().includes(recherche.toLowerCase());

    const correspondStatut = filtreStatut === 'all' || ord.statut === filtreStatut;

    return correspondRecherche && correspondStatut;
  });

  const getStatutBadge = (statut) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Expirée: 'bg-red-100 text-red-800',
      Annulée: 'bg-gray-100 text-gray-800'
    };
    return styles[statut] || 'bg-gray-100 text-gray-800';
  };

  const supprimerOrdonnance = (id) => {
    if (confirm('Voulez-vous vraiment supprimer cette ordonnance ?')) {
      setOrdonnances(ordonnances.filter(ord => ord.id !== id));
    }
  };

  const ordonnancesActives = ordonnances.filter(o => o.statut === 'Active').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Gestion des Ordonnances
            </h1>
            <p className="text-gray-600 mt-1">Suivi et gestion des prescriptions médicales</p>
          </div>

          <button className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition font-medium">
            <Plus className="w-5 h-5" />
            Nouvelle Ordonnance
          </button>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom patient, ID ou médicament..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Active">Active</option>
                <option value="Expirée">Expirée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <p className="text-3xl font-bold text-blue-900">{ordonnancesFiltrees.length}</p>
                <p className="text-sm text-blue-700">Ordonnances trouvées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des ordonnances */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Médicament</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Dosage</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Durée</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Médecin</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordonnancesFiltrees.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-medium text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {ord.patientNom}
                    </td>
                    <td className="px-6 py-5 font-mono text-gray-600">{ord.patientID}</td>
                    <td className="px-6 py-5 text-gray-600">{ord.date}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{ord.medicament}</td>
                    <td className="px-6 py-5 text-gray-600">{ord.dosage}</td>
                    <td className="px-6 py-5 text-gray-600">{ord.duree}</td>
                    <td className="px-6 py-5 text-gray-600">{ord.medecin}</td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1 rounded-full text-xs font-semibold ${getStatutBadge(ord.statut)}`}>
                        {ord.statut}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir détails">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Télécharger">
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => supprimerOrdonnance(ord.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ordonnancesFiltrees.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune ordonnance trouvée</p>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Ordonnances Actives</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{ordonnancesActives}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Ordonnances Expirées</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {ordonnances.filter(o => o.statut === 'Expirée').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Ordonnances</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{ordonnances.length}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}