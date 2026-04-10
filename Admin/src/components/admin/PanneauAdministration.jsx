import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../layouts/Layout';
import { Lock } from 'lucide-react';

import VueDensemble from './VueDensemble';
import GestionPersonnel from './GestionPersonnel';
import JournalActivites from './JournalActivites';
import ConfigurationClinique from './ConfigurationClinique';

export default function PanneauAdministration() {
  const { user } = useAuth();
  const [ongletActif, setOngletActif] = useState('overview');

  // Données partagées entre les composants
  const [membresPersonnel, setMembresPersonnel] = useState([
    { id: 1, nom: 'Professeur Elhadj Yaya Baldé', role: 'Médecin', statut: 'active', specialite: 'Cardiologie' },
    { id: 2, nom: 'Docteur Mamadou Bassirou Bah', role: 'Médecin', statut: 'active', specialite: 'Cardiologie' },
    { id: 3, nom: 'Infirmière Anne Dubois', role: 'Infirmière', statut: 'active', specialite: 'Soins Généraux' }
  ]);

  const [journalActivites, setJournalActivites] = useState([
    { id: 1, date: '2024-03-28', activite: 'Rendez-vous confirmé', utilisateur: 'Professeur Elhadj Yaya Baldé', statut: 'completed' },
    { id: 2, date: '2024-03-28', activite: 'Nouveau patient enregistré', utilisateur: 'Réception', statut: 'completed' },
    { id: 3, date: '2024-03-28', activite: 'Dossier médical mis à jour', utilisateur: 'Docteur Mamadou Bassirou Bah', statut: 'in-progress' }
  ]);

  return (
    <Layout>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panneau d'Administration</h1>
            <p className="text-gray-600">Administrateur : {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="bg-white rounded-lg shadow mb-6 border-b border-gray-200">
        <div className="flex flex-wrap">
          {[
            { key: 'overview', label: "Vue d'ensemble" },
            { key: 'staff', label: 'Gestion du Personnel' },
            { key: 'activities', label: "Journal d'Activités" },
            { key: 'settings', label: 'Configuration' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setOngletActif(key)}
              className={`px-6 py-4 font-semibold border-b-2 transition ${
                ongletActif === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Affichage selon l'onglet actif */}
      {ongletActif === 'overview' && <VueDensemble journalActivites={journalActivites} />}
      
      {ongletActif === 'staff' && (
        <GestionPersonnel 
          membresPersonnel={membresPersonnel}
          setMembresPersonnel={setMembresPersonnel}
        />
      )}

      {ongletActif === 'activities' && <JournalActivites journalActivites={journalActivites} />}
      
      {ongletActif === 'settings' && <ConfigurationClinique />}
    </Layout>
  );
}