import { useState } from 'react';
import Layout from '../layouts/Layout';
import { 
  Plus, Search, MessageSquare, Eye, Trash2, Save, 
  ArrowLeft, Clock, User 
} from 'lucide-react';

export default function GestionConseilsMedicaux() {
  const [recherche, setRecherche] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [conseilSelectionne, setConseilSelectionne] = useState(null);

  const [conseils, setConseils] = useState([
    {
      id: 1,
      patient: 'Baldé Oumou',
      sujet: 'Hypertension et alimentation',
      conseil: 'Réduisez votre consommation de sel et privilégiez les aliments riches en potassium comme les bananes et les épinards.',
      date: '2026-04-15',
      vues: 245,
      reponses: 3,
      statut: 'responded',
      categorie: 'Nutrition'
    },
    {
      id: 2,
      patient: 'Barry Yaya',
      sujet: 'Exercice physique après intervention',
      conseil: 'Commencez graduellement avec 15 minutes de marche légère par jour pendant la première semaine.',
      date: '2026-04-13',
      vues: 189,
      reponses: 5,
      statut: 'responded',
      categorie: 'Exercice'
    },
    {
      id: 3,
      patient: 'Bah Fatoumata',
      sujet: 'Prévention du diabète',
      conseil: 'Maintenez un poids santé, mangez équilibré avec beaucoup de fibres.',
      date: '2026-04-10',
      vues: 412,
      reponses: 8,
      statut: 'responded',
      categorie: 'Prévention'
    },
    {
      id: 4,
      patient: 'Diakité Kadiatou',
      sujet: 'Gestion du stress',
      conseil: 'Pratiquez la respiration profonde 5 minutes par jour et dormez suffisamment.',
      date: '2026-04-08',
      vues: 156,
      reponses: 1,
      statut: 'pending',
      categorie: 'Bien-être'
    }
  ]);

  const [formData, setFormData] = useState({
    patient: '',
    sujet: '',
    conseil: '',
    categorie: 'Prévention',
    statut: 'pending',
    date: new Date().toISOString().split('T')[0]
  });

  // Filtrage
  const conseilsFiltres = conseils.filter(c =>
    c.patient.toLowerCase().includes(recherche.toLowerCase()) ||
    c.sujet.toLowerCase().includes(recherche.toLowerCase())
  );

  const getStatutBadge = (statut) => {
    return statut === 'responded' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatutLabel = (statut) => {
    return statut === 'responded' ? 'Répondu' : 'En attente';
  };

  const ouvrirNouveauConseil = () => {
    setFormData({
      patient: '',
      sujet: '',
      conseil: '',
      categorie: 'Prévention',
      statut: 'pending',
      date: new Date().toISOString().split('T')[0]
    });
    setConseilSelectionne(null);
    setShowForm(true);
  };

  const ouvrirModification = (conseil) => {
    setFormData(conseil);
    setConseilSelectionne(conseil.id);
    setShowForm(true);
  };

  const sauvegarderConseil = () => {
    if (conseilSelectionne) {
      // Modification
      setConseils(conseils.map(c => 
        c.id === conseilSelectionne 
          ? { ...formData, id: conseilSelectionne, vues: c.vues, reponses: c.reponses }
          : c
      ));
    } else {
      // Création
      setConseils([...conseils, {
        ...formData,
        id: Date.now(),
        vues: 0,
        reponses: 0
      }]);
    }
    setShowForm(false);
    setConseilSelectionne(null);
  };

  const supprimerConseil = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce conseil ?')) {
      setConseils(conseils.filter(c => c.id !== id));
    }
  };

  const voirDiscussion = (id) => {
    alert(`Ouverture du fil de discussion pour le conseil #${id} (à implémenter)`);
  };

  return (
    <Layout>
      {!showForm ? (
        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                Conseils Médicaux
              </h1>
              <p className="text-gray-600 mt-1">Conseils et suivi à distance des patients</p>
            </div>

            <button
              onClick={ouvrirNouveauConseil}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Nouveau Conseil
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par patient ou sujet..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Liste des conseils */}
          <div className="space-y-4">
            {conseilsFiltres.map((conseil) => (
              <div
                key={conseil.id}
                onClick={() => ouvrirModification(conseil)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-6 border-l-4 border-purple-500 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                        {conseil.patient.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{conseil.patient}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {conseil.date}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{conseil.sujet}</h3>
                    <p className="text-gray-700 line-clamp-3 mb-4">{conseil.conseil}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {conseil.vues} vues
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> {conseil.reponses} réponses
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {conseil.categorie}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3" onClick={e => e.stopPropagation()}>
                    <span className={`px-4 py-1 rounded-full text-xs font-semibold ${getStatutBadge(conseil.statut)}`}>
                      {getStatutLabel(conseil.statut)}
                    </span>

                    <button
                      onClick={(e) => { e.stopPropagation(); voirDiscussion(conseil.id); }}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Discuter
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); supprimerConseil(conseil.id); }}
                      className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {conseilsFiltres.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun conseil trouvé</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================== FORMULAIRE ==================== */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {conseilSelectionne ? 'Modifier le Conseil' : 'Nouveau Conseil Médical'}
              </h1>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Patient</label>
                <input
                  type="text"
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Nom du patient"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sujet / Titre</label>
                <input
                  type="text"
                  value={formData.sujet}
                  onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Ex: Gestion de la tension artérielle"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option>Prévention</option>
                    <option>Nutrition</option>
                    <option>Exercice</option>
                    <option>Bien-être</option>
                    <option>Hygiène</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="pending">En attente</option>
                    <option value="responded">Répondu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Conseil Médical</label>
                <textarea
                  value={formData.conseil}
                  onChange={(e) => setFormData({ ...formData, conseil: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-y"
                  placeholder="Écrivez le conseil détaillé ici..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={sauvegarderConseil}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <Save className="w-5 h-5" />
                Enregistrer le Conseil
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 py-3.5 rounded-xl font-semibold transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}