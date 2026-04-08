import { CheckCircle, Clock, Activity } from 'lucide-react';

export default function JournalActivites({ journalActivites }) {

  /** Fonction pour afficher le badge de statut */
  const getBadgeStatut = (statut) => {
    const configs = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Complété' },
      'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En cours' }
    };

    const config = configs[statut] || configs.completed;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  // Statistiques rapides des activités
  const activitesCompletees = journalActivites.filter(a => a.statut === 'completed').length;
  const activitesEnCours = journalActivites.filter(a => a.statut === 'in-progress').length;
  const totalActivites = journalActivites.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Journal d'Activités</h2>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold text-sm">Activités Complétées</p>
              <p className="text-4xl font-bold text-green-900 mt-2">{activitesCompletees}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 font-semibold text-sm">Activités en Cours</p>
              <p className="text-4xl font-bold text-yellow-900 mt-2">{activitesEnCours}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-semibold text-sm">Total Activités</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{totalActivites}</p>
            </div>
            <Activity className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Liste détaillée des activités */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Historique des Activités</h3>
        </div>

        <div className="divide-y">
          {journalActivites.map((activite) => (
            <div key={activite.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {activite.statut === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  ) : (
                    <Clock className="w-6 h-6 text-yellow-600 mt-1" />
                  )}

                  <div>
                    <p className="font-semibold text-gray-900">{activite.activite}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Par : <span className="font-medium">{activite.utilisateur}</span>
                    </p>
                    <p className="text-sm text-gray-500">Date : {activite.date}</p>
                  </div>
                </div>

                <div>
                  {getBadgeStatut(activite.statut)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {journalActivites.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Aucune activité enregistrée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}