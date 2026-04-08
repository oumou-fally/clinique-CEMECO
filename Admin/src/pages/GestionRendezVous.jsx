import Layout from '../layouts/Layout';
import { AlertCircle, Calendar, Plus } from 'lucide-react';

export default function GestionRendezVous() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Rendez-vous</h1>
            <p className="text-gray-600 mt-1">
              Planification, suivi et organisation des consultations
            </p>
          </div>

          {/* Bouton pour créer un nouveau rendez-vous (à activer plus tard) */}
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition font-medium">
            <Plus className="w-5 h-5" />
            Nouveau Rendez-vous
          </button>
        </div>

        {/* Message d'information - Page en développement */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900">Page en cours de développement</p>
            <p className="text-blue-800 text-sm mt-1">
              Cette section sera bientôt équipée d’un calendrier interactif complet 
              (FullCalendar ou React Big Calendar), avec la possibilité de gérer 
              tous les rendez-vous de la clinique.
            </p>
          </div>
        </div>

        {/* Zone placeholder du calendrier */}
        <div className="bg-white rounded-xl shadow p-8">
          <div className="h-[520px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
            <Calendar className="w-20 h-20 text-gray-400 mb-6" />
            
            <h3 className="text-2xl font-medium text-gray-500 mb-2">
              Calendrier des Rendez-vous
            </h3>
            
            <p className="text-gray-400 text-center max-w-md">
              Le calendrier interactif sera intégré ici.<br />
              Vous pourrez visualiser, créer et gérer les rendez-vous facilement.
            </p>
          </div>
        </div>

        {/* Section future : Rendez-vous du jour */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Rendez-vous d'aujourd’hui
          </h2>
          <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
            <p className="text-gray-400">La liste des rendez-vous du jour apparaîtra ici</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}