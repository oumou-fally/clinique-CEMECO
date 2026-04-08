import { Settings, Users } from 'lucide-react';

export default function ConfigurationClinique() {
  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl shadow p-8 space-y-8">
        
        {/* Titre */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-600" />
            Configuration de la Clinique
          </h2>
          <p className="text-gray-600 mt-2">Gérez les informations générales de votre établissement</p>
        </div>

        {/* Informations de la Clinique */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
            Informations Générales
          </h3>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de la Clinique
              </label>
              <input
                type="text"
                defaultValue="Clinique Santé Plus"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse Complète
              </label>
              <input
                type="text"
                defaultValue="123 Rue de la Santé, Conakry, Guinée"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  defaultValue="+224 612 34 56 78"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="contact@cliniquesanteplus.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comptes Administrateurs */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Comptes Administrateurs
          </h3>

          <div className="space-y-4">
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="font-semibold text-gray-900">Prof. Elhadj Yaya Baldé</p>
              <p className="text-sm text-gray-600">elhadj.balde@clinic.com</p>
              <p className="text-xs text-green-600 mt-2 font-medium">Administrateur Principal</p>
            </div>

            <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="font-semibold text-gray-900">Dr. Mamadou Bassirou Bah</p>
              <p className="text-sm text-gray-600">mamadou.bah@clinic.com</p>
              <p className="text-xs text-gray-600 mt-2">Administrateur</p>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="pt-6 border-t">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2">
            Enregistrer les Modifications
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Dernière modification : il y a 2 jours
          </p>
        </div>
      </div>
    </div>
  );
}