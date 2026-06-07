# Documentation des fonctionnalités de l'application Clinique CEMECO

## 1. Présentation générale

Ce projet est une solution de gestion médicale multi-roles composée de 4 applications front-end React/Vite :
- `Admin`
- `backend`
- `Medecin`
- `Patient`
- `Secretaire`

Chaque dossier représente une interface métier dédiée à un rôle.

Le backend Express sert d'API centralisée avec des routes organisées par rôle :
- `/api/admin`
- `/api/patient`
- `/api/medecin`
- `/api/secretaire`
- `/api/reservations`
- `/api/notifications`
- `/api/stats/rendezvous`


## 2. Rôles et périmètres fonctionnels

### 2.1 Patient

dossier : `Patient`

Fonctionnalités principales :
- Authentification patient (connexion / mot de passe oublié)
- Tableau de bord patient
  - Résumé des rendez-vous
  - Statistiques de suivi (nombre de rendez-vous, médecins consultés, dossiers médicaux)
  - Affichage du prochain rendez-vous
  - Bouton de prise de rendez-vous
- Prise et gestion de rendez-vous
  - Page `/dashboard/appointments`
  - Visualisation des rendez-vous à venir, passés et annulés
  - Formulaire de demande de rendez-vous
- Dossier médical
  - Page `/dashboard/medical-record`
  - Consultation des données médicales du patient
- Liste des médecins
  - Page `/dashboard/doctors`
  - Consultation des médecins disponibles et de leurs profils
- Chat / consultations
  - Page `/dashboard/consultations`
  - Envoi de messages au médecin et suivi des échanges
- Notifications
  - Page `/dashboard/notifications`
  - Suivi des alertes et changements de statut
- Paramètres du compte / profil
  - Page `/dashboard/settings`
  - Page `/dashboard/profile`
  - Gestion du profil et des informations personnelles

Routes front-end :
- `/login`
- `/forgot-password`
- `/dashboard`
- `/dashboard/appointments`
- `/dashboard/medical-record`
- `/dashboard/doctors`
- `/dashboard/consultations`
- `/dashboard/consultations/:medecinId`
- `/dashboard/notifications`
- `/dashboard/settings`
- `/dashboard/profile`

API patient identifiée :
- `GET /api/patient/:patientId/dashboard`
- `POST /api/patient/login`
- `POST /api/patient/register`
- `POST /api/patient/forgot-password`
- `POST /api/patient/reset-password`
- `POST /api/patient/verify-otp`
- `GET /api/patient/profil/:id`
- `GET /api/patient/:patientId/mes-medecins`
- `GET /api/patient/dossier/:patientId`
- `GET /api/messagerie/info/medecin/:id`
- `GET /api/messagerie/info/patient/:id`
- `POST /api/messagerie/envoyer`
- `GET /api/messagerie/conversation/:patientId/:medecinId`
- `GET /api/messagerie/medecin/:medecinId/stats`
- `GET /api/messagerie/patient/:patientId/discussions`
- `GET /api/messagerie/medecin/:medecinId/discussions`
- `GET /api/patient/types-consultation`
- `GET /api/patient/notifications/patient/:patientId`


### 2.2 Médecin

dossier : `Medecin`

Fonctionnalités principales :
- Authentification médecin
- Tableau de bord médecin
  - Vue globale des rendez-vous
  - Accès rapide aux patients, consultations et plannings
- Gestion des patients
  - Page `/dashboard/patients`
  - Liste des patients suivis
- Consultation médicale
  - Page `/dashboard/consultations`
  - Détails des consultations
  - Historique
- Rapports médicaux
  - Page `/dashboard/medical-reports`
  - Consultation des comptes-rendus médicaux
- Ordonnances / prescriptions
  - Page `/dashboard/prescriptions`
  - Création / consultation d’ordonnances
- Gestion des conseils médicaux
  - Page `/dashboard/advice`
  - Publication de conseils ou notes médicales
- Planning
  - Page `/dashboard/planning`
  - Calendrier des disponibilités et rendez-vous
- Notifications
  - Page `/dashboard/notifications`
- Paramètres personnels
  - Page `/dashboard/settings`

Routes front-end :
- `/login`
- `/dashboard`
- `/dashboard/patients`
- `/dashboard/consultations`
- `/dashboard/medical-reports`
- `/dashboard/prescriptions`
- `/dashboard/advice`
- `/dashboard/notifications`
- `/dashboard/settings`
- `/dashboard/planning`

API médecin identifiée :
- `POST /api/medecin/login`
- `GET /api/medecin/profil/:id`
- `GET /api/medecin/disponibilites`
- `POST /api/medecin/disponibilites`
- `GET /api/consultations/reservations/:medecinId`
- `POST /api/consultations`
- `GET /api/consultations/historique/:medecinId`
- `GET /api/consultations/detail/:reservationId`
- `POST /api/consultations/ordonnance`
- `GET /api/consultations/ordonnance/:id`
- `GET /api/consultations/ordonnances/all`
- `GET /api/consultations/ordonnances/medecin/:medecinId`
- `GET /api/consultations/patients/:medecinId`
- `GET /api/medecin/planning/medecin/:medecinId`
- `GET /api/medecin/planning/all/global`
- `GET /api/medecin/planning/:id/impacts`
- `POST /api/medecin/planning`
- `POST /api/medecin/planning/cleanup`
- `POST /api/medecin/planning/envoyer-jour`


### 2.3 Secrétaire

dossier : `Secretaire`

Fonctionnalités principales :
- Authentification secrétaire
- Tableau de bord secrétaire
  - Statistiques clés : rendez-vous du jour, médecins disponibles, factures en attente, alertes
- Gestion des rendez-vous
  - Page `/dashboard/rendez-vous`
  - Liste des rendez-vous
  - Filtre par statut
  - Recherche par patient, date ou médecin
  - Confirmation, annulation, report
- Emploi du temps des médecins
  - Page `/dashboard/emploi-du-temps`
  - Consultations des horaires par médecin
  - Gestion des disponibilités et des congés
- Facturation
  - Page `/dashboard/facturation`
  - Création de factures à partir de consultations
  - Gestion des patients assurés ou non-assurés
  - Validation administrative pour factures assurance
  - Reçu patient et reçu assurance
  - Export / impression de factures
- Gestion des médecins / patients
  - Page `/dashboard/doctors`
  - Consultation des profils des médecins
- Disponibilités médecins
  - Page `/dashboard/disponibilites`
- Attribution médecin
  - Page `/dashboard/attribution`
  - Attribution automatique ou manuelle des médecins aux rendez-vous
- Notifications
  - Page `/dashboard/notifications`
- Paramètres
  - Page `/dashboard/settings`

Routes front-end :
- `/login`
- `/dashboard`
- `/dashboard/rendez-vous`
- `/dashboard/emploi-du-temps`
- `/dashboard/facturation`
- `/dashboard/doctors`
- `/dashboard/notifications`
- `/dashboard/settings`
- `/dashboard/disponibilites`
- `/dashboard/attribution`

API secrétaire identifiée :
- `POST /api/secretaire/login-secretaire`
- `GET /api/secretaire/verify-secretaire`
- `GET /api/secretaire/notifications/count/:id`
- `GET /api/secretaire/profil/:id`
- `GET /api/secretaire/factures`
- `GET /api/secretaire/factures/assurance/payees`
- `GET /api/secretaire/factures/assurance/validation-requests`
- `GET /api/secretaire/factures/patients`
- `GET /api/secretaire/factures/consultations`
- `GET /api/secretaire/factures/consultations/patient/:id`
- `GET /api/secretaire/factures/consultations/patient/:id/grouped`
- `GET /api/secretaire/factures/types-consultation`
- `GET /api/secretaire/factures/:id`
- `POST /api/secretaire/factures`
- `POST /api/secretaire/factures/:id/admin-validate`
- `GET /api/secretaire/factures/:id/history`
- `GET /api/secretaire/medecins`
- `GET /api/secretaire/medecins` *(via backend medecin route)*
- `GET /api/reservations/patient/:patientId`
- `GET /api/reservations`
- `POST /api/reservations`
- `GET /api/reservations/notifications/patient/:patientId`
- `GET /api/reservations/notifications/secretaire`
- `GET /api/reservations/stats/dashboard`


### 2.4 Admin

dossier : `Admin`

Fonctionnalités principales :
- Authentification admin
- Tableau de bord global
  - KPI patients, médecins, rendez-vous, finances
  - Analyse des performances médicales
  - Distribution patients assurés / non-assurés
- Supervision
  - Page `/dashboard/supervision`
  - Tableau de rendez-vous
  - Dossiers patients
  - Détails des rendez-vous et patients
- Gestion des utilisateurs
  - Page `/dashboard/users`
  - Création, modification, suppression de médecins et secrétaires
- Gestion système
  - Page `/dashboard/system`
  - Paramètres de la clinique
  - Horaires, spécialités, informations cliniques
- Gestion financière
  - Page `/dashboard/finance`
  - Statistiques financières approfondies
- Gestion des tarifs
  - Page `/dashboard/tarifs`
  - Liste des tarifs de consultation
  - Création / modification / suppression de tarifs

Routes front-end :
- `/login`
- `/dashboard`
- `/dashboard/users`
- `/dashboard/system`
- `/dashboard/supervision`
- `/dashboard/finance`
- `/dashboard/tarifs`

API admin identifiée :
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/profile/:id`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/stats`
- `GET /api/admin/finances`
- `GET /api/admin/finances/assurances/payees`
- `GET /api/admin/finances/assurances/validation-requests`
- `POST /api/personnel`
- `GET /api/personnel`
- `DELETE /api/personnel/:id`
- `PUT /api/personnel/:id`
- `GET /api/admin/parametres/info`
- `POST /api/admin/parametres/info`
- `GET /api/admin/parametres/types-consultation`
- `GET /api/admin/parametres/horaires`
- `POST /api/admin/parametres/horaires`
- `GET /api/admin/parametres/specialites`
- `GET /api/admin/tarifs`
- `POST /api/admin/tarifs`
- `PUT /api/admin/tarifs/:id`
- `DELETE /api/admin/tarifs/:id`


## 3. Architecture technique

- Chaque interface est une application React/Vite indépendante
- Chacune utilise un contexte d'authentification (`AuthContext.jsx`)
- Les pages protégées sont sécurisées par un composant `ProtectedRoute` ou `RouteProtegee`
- Le backend est un serveur Node/Express avec modules routeurs séparés
- Les routes API sont organisées par rôle et par domaine métier
- Les données patient, médecin, secrétaire, rendez-vous, factures et notifications transitent via JSON


## 4. Cas d’usage métier

### 4.1 Patient
- Se connecter et retrouver son profil
- Voir le prochain rendez-vous et ses dossiers
- Prendre un nouveau rendez-vous
- Consulter la liste des médecins
- Dialoguer avec le médecin via messagerie
- Consulter ses notifications
- Accéder à ses dossiers médicaux

### 4.2 Médecin
- Se connecter et consulter son planning
- Voir la liste des patients
- Suivre les consultations planifiées
- Gérer les ordonnances
- Publier des conseils médicaux
- Recevoir des notifications

### 4.3 Secrétaire
- Gérer les rendez-vous et attribuer des médecins
- Organiser le planning des médecins
- Établir des factures et gérer les paiements
- Gérer les disponibilités et congés
- Suivre les validations d’assurance
- Superviser les patients et les médecins

### 4.4 Admin
- Superviser l’activité globale de la clinique
- Gérer les comptes du personnel
- Ajuster les tarifs et paramètres système
- Analyser les statistiques et finances
- Surveiller les rendez-vous et dossiers patients


## 5. Recommandations pour le diagramme

Pour ton diagramme, tu peux représenter :
- 4 acteurs principaux : Patient, Médecin, Secrétaire, Admin
- 4 applications front-end séparées
- Backend commun avec routes API
- Flux principaux : Authentification → Tableau de bord → Gestion des rendez-vous / factures / consultations / dossiers
- Liens entre les acteurs :
  - Patient ↔ Secrétaire : réservation + facturation
  - Patient ↔ Médecin : consultation + messagerie
  - Secrétaire ↔ Médecin : planning / attribution / disponibilité
  - Secrétaire ↔ Admin : validation administrative / tarification
  - Admin ↔ Backend : supervision et configuration globale


## 6. Notes spécifiques

- Le dossier `Secretaire` contient un fichier d’implémentation détaillé `IMPLEMENTATION_SECRETAIRE.md`
- Le backend expose aussi une route de santé `GET /api/health` et de test DB `GET /api/test-db`
- Les interfaces utilisent des routes React standard et sont construites autour de composants `Layout`, `Sidebar` et `ProtectedRoute`


---

*Document créé pour aider à la construction du diagramme de l’application Clinique CEMECO.*
