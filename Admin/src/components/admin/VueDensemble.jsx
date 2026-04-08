import { Activity, CheckCircle, Clock } from 'lucide-react';

export default function VueDensemble({ journalActivites }) {

  // Fonction pour afficher le badge de statut
  const getBadgeStatut = (statut) => {
    const configs = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
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

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: '👥', label: 'Patients Actifs', valeur: '1,234', evolution: '+12%', couleur: 'blue' },
          { icon: '📅', label: 'Rendez-vous Aujourd\'hui', valeur: '23', evolution: '+5%', couleur: 'green' },
          { icon: '👨‍⚕️', label: 'Personnel', valeur: '12', evolution: '0%', couleur: 'purple' },
          { icon: '💰', label: 'Revenus (Mois)', valeur: '45.2K€', evolution: '+23%', couleur: 'orange' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.valeur}</p>
                <p className="mt-1 text-sm text-green-600 font-semibold">{stat.evolution}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.couleur}-100 text-${stat.couleur}-600`}>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activités Récentes */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Activités Récentes
        </h2>

        <div className="space-y-3">
          {journalActivites.slice(0, 5).map((activite) => (
            <div 
              key={activite.id} 
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                {activite.statut === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{activite.activite}</p>
                  <p className="text-sm text-gray-600">
                    {activite.utilisateur} • {activite.date}
                  </p>
                </div>
              </div>
              {getBadgeStatut(activite.statut)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}