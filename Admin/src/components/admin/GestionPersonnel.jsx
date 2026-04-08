import { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function GestionPersonnel({ membresPersonnel, setMembresPersonnel }) {

  const [afficherFormAjout, setAfficherFormAjout] = useState(false);
  const [nouveauMembre, setNouveauMembre] = useState({
    nom: '',
    role: 'Médecin',
    specialite: ''
  });

  /** Ajouter un nouveau membre du personnel */
  const ajouterPersonnel = () => {
    if (nouveauMembre.nom && nouveauMembre.specialite) {
      const nouveauId = Math.max(0, ...membresPersonnel.map(m => m.id)) + 1;

      setMembresPersonnel([
        ...membresPersonnel,
        {
          id: nouveauId,
          nom: nouveauMembre.nom,
          role: nouveauMembre.role,
          specialite: nouveauMembre.specialite,
          statut: 'active'
        }
      ]);

      // Réinitialiser le formulaire
      setNouveauMembre({ nom: '', role: 'Médecin', specialite: '' });
      setAfficherFormAjout(false);
    }
  };

  /** Supprimer un membre */
  const supprimerPersonnel = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce membre ?')) {
      setMembresPersonnel(membresPersonnel.filter(membre => membre.id !== id));
    }
  };

  /** Badge de statut */
  const getBadgeStatut = (statut) => {
    const configs = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactif' }
    };

    const config = configs[statut] || configs.active;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion du Personnel</h2>
        <button
          onClick={() => setAfficherFormAjout(!afficherFormAjout)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {afficherFormAjout && (
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter un Nouveau Membre</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <input
              type="text"
              placeholder="Nom complet"
              value={nouveauMembre.nom}
              onChange={(e) => setNouveauMembre({ ...nouveauMembre, nom: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            
            <select
              value={nouveauMembre.role}
              onChange={(e) => setNouveauMembre({ ...nouveauMembre, role: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Médecin">Médecin</option>
              <option value="Infirmière">Infirmière</option>
              <option value="Technicien">Technicien</option>
              <option value="Administratif">Administratif</option>
            </select>

            <input
              type="text"
              placeholder="Spécialité / Service"
              value={nouveauMembre.specialite}
              onChange={(e) => setNouveauMembre({ ...nouveauMembre, specialite: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={ajouterPersonnel}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Ajouter le membre
            </button>
            <button
              onClick={() => setAfficherFormAjout(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Tableau du personnel */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Nom</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Rôle</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Spécialité</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Statut</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {membresPersonnel.map((membre) => (
              <tr key={membre.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{membre.nom}</td>
                <td className="px-6 py-4 text-gray-600">{membre.role}</td>
                <td className="px-6 py-4 text-gray-600">{membre.specialite}</td>
                <td className="px-6 py-4">{getBadgeStatut(membre.statut)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 p-2 mr-2">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => supprimerPersonnel(membre.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {membresPersonnel.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Aucun membre du personnel trouvé.
          </div>
        )}
      </div>
    </div>
  );
}