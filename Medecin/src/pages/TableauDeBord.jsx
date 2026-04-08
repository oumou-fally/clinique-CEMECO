import { useState } from 'react';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  FileText,
  Stethoscope,
  Users,
  AlertCircle,
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

export default function TableauDeBord() {
  const { user } = useAuth();

  const consultationsDuJour = [
    {
      id: 1,
      patient: 'Baldé Oumou',
      heure: '14:30',
      date: '2026-04-15',
      type: 'Consultation',
      statut: 'Confirmé'
    },
    {
      id: 2,
      patient: 'Barry Yaya',
      heure: '15:30',
      date: '2026-04-15',
      type: 'Suivi',
      statut: 'Confirmé'
    },
    {
      id: 3,
      patient: 'Bah Kenda',
      heure: '16:00',
      date: '2026-04-15',
      type: 'Première visite',
      statut: 'En attente'
    }
  ];

  const rapportsRecents = [
    {
      id: 1,
      patient: 'Diakité Kadiatou',
      date: '2026-04-10',
      type: 'Rapport de consultation',
      statut: 'Complété'
    },
    {
      id: 2,
      patient: 'Barry Yaya',
      date: '2026-04-08',
      type: 'Diagnostic',
      statut: 'Complété'
    }
  ];

  const statistiques = [
    {
      label: 'Consultations Aujourd\'hui',
      valeur: '5',
      icon: Calendar,
      couleur: 'blue'
    },
    {
      label: 'Patients Actifs',
      valeur: '24',
      icon: Users,
      couleur: 'green'
    },
    {
      label: 'Rapports Complétés',
      valeur: '12',
      icon: FileText,
      couleur: 'purple'
    },
    {
      label: 'Taux de Satisfaction',
      valeur: '95%',
      icon: TrendingUp,
      couleur: 'orange'
    }
  ];

  const actionsRapides = [
    { icon: Plus, label: 'Nouvelle Consultation', couleur: 'bg-blue-600 hover:bg-blue-700' },
    { icon: FileText, label: 'Nouveau Rapport', couleur: 'bg-green-600 hover:bg-green-700' },
    { icon: Users, label: 'Ajouter Patient', couleur: 'bg-purple-600 hover:bg-purple-700' },
    { icon: Stethoscope, label: 'Mes Disponibilités', couleur: 'bg-orange-600 hover:bg-orange-700' }
  ];

  const getStatutBadge = (statut) => {
    return statut === 'Confirmé' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête de bienvenue */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Bienvenue, Dr. {user?.name?.split(' ').pop()} ! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {user?.specialty || 'Médecin'} — Tableau de bord
          </p>
        </div>

        {/* Alerte */}
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Tout est à jour</p>
            <p className="text-sm text-green-800 mt-1">
              Vous avez {rapportsRecents.length} rapports complétés cette semaine
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistiques.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br from-${stat.couleur}-50 to-${stat.couleur}-100 border border-${stat.couleur}-200 rounded-2xl p-6 hover:shadow-lg transition`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-4xl font-bold text-${stat.couleur}-700 mt-3`}>
                      {stat.valeur}
                    </p>
                  </div>
                  <div className={`p-4 bg-white rounded-2xl shadow-sm`}>
                    <Icon className={`w-8 h-8 text-${stat.couleur}-500`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actionsRapides.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`${action.couleur} text-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:scale-105 transition transform`}
              >
                <Icon className="w-7 h-7" />
                <span className="font-medium text-sm">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultations du jour */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Consultations d'aujourd'hui
                </h2>
                <span className="text-sm text-gray-500">{consultationsDuJour.length} rendez-vous</span>
              </div>

              <div className="space-y-4">
                {consultationsDuJour.map((consult) => (
                  <div
                    key={consult.id}
                    className="p-5 border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{consult.patient}</p>
                          <p className="text-sm text-gray-600">{consult.type}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-lg font-bold text-gray-900">{consult.heure}</p>
                        <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mt-2 ${getStatutBadge(consult.statut)}`}>
                          {consult.statut}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                        Commencer la consultation
                      </button>
                      <button className="flex-1 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rapports récents */}
          <div>
            <div className="bg-white rounded-2xl shadow p-6 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-600" />
                Rapports Récents
              </h2>

              <div className="space-y-4">
                {rapportsRecents.map((rapport) => (
                  <div
                    key={rapport.id}
                    className="p-5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{rapport.patient}</p>
                        <p className="text-sm text-gray-600 mt-1">{rapport.type}</p>
                        <p className="text-xs text-gray-500 mt-2">{rapport.date}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}