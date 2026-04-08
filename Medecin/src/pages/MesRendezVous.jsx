import { useState } from 'react';
import Layout from '../layouts/Layout';
import { 
  Calendar, Clock, MapPin, User, Plus, ChevronLeft, 
  ChevronRight, AlertCircle, Eye 
} from 'lucide-react';

export default function MesRendezVous() {
  const [ongletActif, setOngletActif] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'

  const rendezVousAVenir = [
    {
      id: 1,
      medecin: 'Prof. Elhadj Yaya Baldé',
      specialite: 'Médecin Généraliste',
      date: '2026-04-15',
      heure: '14:30',
      lieu: 'Clinique Santé Plus - Bureau 301',
      type: 'Consultation Générale',
      statut: 'Confirmé'
    },
    {
      id: 2,
      medecin: 'Dr. Mamadou Diallo',
      specialite: 'Cardiologue',
      date: '2026-04-22',
      heure: '10:00',
      lieu: 'Clinique Santé Plus - Bureau 105',
      type: 'Suivi Cardiaque',
      statut: 'Confirmé'
    },
    {
      id: 3,
      medecin: 'Dr. Thierno Siradjo Baldé',
      specialite: 'Dermatologue',
      date: '2026-05-03',
      heure: '15:45',
      lieu: 'Clinique Santé Plus - Bureau 202',
      type: 'Consultation Dermatologie',
      statut: 'En attente'
    }
  ];

  const rendezVousPasses = [
    {
      id: 1,
      medecin: 'Prof. Elhadj Yaya Baldé',
      specialite: 'Cardiologue',
      date: '2026-03-15',
      heure: '14:30',
      lieu: 'Clinique Santé Plus - Bureau 301',
      type: 'Consultation Générale',
      statut: 'Complété'
    },
    {
      id: 2,
      medecin: 'Dr. Mamadou Diallo',
      specialite: 'Cardiologue',
      date: '2026-03-01',
      heure: '10:00',
      lieu: 'Clinique Santé Plus - Bureau 105',
      type: 'Suivi Cardiaque',
      statut: 'Complété'
    }
  ];

  const rendezVousAnnules = [
    {
      id: 1,
      medecin: 'Dr. Thierno Boubacar Barry',
      specialite: 'Cardiologue',
      date: '2026-02-20',
      heure: '09:00',
      lieu: 'Clinique Santé Plus - Bureau 103',
      type: 'Consultation Cardiaque',
      statut: 'Annulé',
      raison: 'Annulé par le patient'
    }
  ];

  const getStatutBadge = (statut) => {
    const styles = {
      'Confirmé': 'bg-green-100 text-green-800',
      'En attente': 'bg-yellow-100 text-yellow-800',
      'Complété': 'bg-blue-100 text-blue-800',
      'Annulé': 'bg-red-100 text-red-800'
    };
    return styles[statut] || 'bg-gray-100 text-gray-800';
  };

  const AppointmentCard = ({ rendezVous, estPasse = false }) => (
    <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all p-6 border-l-4 border-teal-500">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-100 rounded-xl">
            <User className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{rendezVous.medecin}</h3>
            <p className="text-sm text-gray-600">{rendezVous.specialite}</p>
            <p className="text-teal-600 font-medium text-sm mt-1">{rendezVous.type}</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getStatutBadge(rendezVous.statut)}`}>
          {rendezVous.statut}
        </span>
      </div>

      <div className="space-y-3 mb-6 pb-6 border-b">
        <div className="flex items-center gap-3 text-gray-600">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span>{rendezVous.date}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="w-5 h-5 text-teal-600" />
          <span>{rendezVous.heure}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5 text-teal-600" />
          <span>{rendezVous.lieu}</span>
        </div>
      </div>

      {rendezVous.raison && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800"><strong>Raison :</strong> {rendezVous.raison}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!estPasse && rendezVous.statut !== 'Annulé' && (
          <>
            <button className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition">
              Reprogrammer
            </button>
            <button className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition">
              Annuler
            </button>
          </>
        )}
        {estPasse && rendezVous.statut === 'Complété' && (
          <>
            <button className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition">
              Voir le dossier médical
            </button>
            <button className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition">
              Donner mon avis
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
            <p className="text-gray-600 mt-1">Gestion et suivi de vos consultations</p>
          </div>
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-medium transition">
            <Plus className="w-5 h-5" />
            Prendre un nouveau RDV
          </button>
        </div>

        {/* Alerte du prochain RDV */}
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Vous avez un rendez-vous demain</p>
            <p className="text-sm text-green-800 mt-1">
              Prof. Elhadj Yaya Baldé — 14:30 • Confirmé
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'upcoming', label: 'À venir', count: rendezVousAVenir.length },
            { key: 'past', label: 'Passés', count: rendezVousPasses.length },
            { key: 'cancelled', label: 'Annulés', count: rendezVousAnnules.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setOngletActif(tab.key)}
              className={`pb-4 px-8 font-semibold transition border-b-2 ${
                ongletActif === tab.key 
                  ? 'border-teal-600 text-teal-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Liste des rendez-vous */}
        <div className="space-y-5">
          {ongletActif === 'upcoming' && rendezVousAVenir.map(rdv => (
            <AppointmentCard key={rdv.id} rendezVous={rdv} />
          ))}
          {ongletActif === 'past' && rendezVousPasses.map(rdv => (
            <AppointmentCard key={rdv.id} rendezVous={rdv} estPasse={true} />
          ))}
          {ongletActif === 'cancelled' && rendezVousAnnules.map(rdv => (
            <AppointmentCard key={rdv.id} rendezVous={rdv} />
          ))}

          {((ongletActif === 'upcoming' && rendezVousAVenir.length === 0) ||
            (ongletActif === 'past' && rendezVousPasses.length === 0) ||
            (ongletActif === 'cancelled' && rendezVousAnnules.length === 0)) && (
            <div className="text-center py-16 bg-white rounded-2xl shadow">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Aucun rendez-vous dans cette catégorie</p>
            </div>
          )}
        </div>

        {/* Mini Calendrier */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendrier</h2>
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold">Avril 2026</h3>
              <div className="flex gap-2">
                <button className="p-3 hover:bg-gray-100 rounded-xl transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-xl transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grille du calendrier simplifiée */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(jour => (
                <div key={jour} className="font-semibold text-gray-500 py-2">
                  {jour}
                </div>
              ))}
              {[...Array(30)].map((_, i) => {
                const jour = i + 1;
                const hasRDV = [15, 22].includes(jour);
                return (
                  <div
                    key={jour}
                    className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-medium transition cursor-pointer ${
                      hasRDV 
                        ? 'bg-teal-600 text-white hover:bg-teal-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {jour}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}