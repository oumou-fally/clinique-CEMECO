-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 26 avr. 2026 à 18:05
-- Version du serveur : 8.0.31
-- Version de PHP : 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `clinique_cemeco`
--

-- --------------------------------------------------------

--
-- Structure de la table `absence_medecin`
--

DROP TABLE IF EXISTS `absence_medecin`;
CREATE TABLE IF NOT EXISTS `absence_medecin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medecin_id` int NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `type` enum('congé','voyage','urgence') NOT NULL,
  `commentaire` text,
  PRIMARY KEY (`id`),
  KEY `medecin_id` (`medecin_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `administrateur`
--

DROP TABLE IF EXISTS `administrateur`;
CREATE TABLE IF NOT EXISTS `administrateur` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dernier_connexion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `administrateur`
--

INSERT INTO `administrateur` (`id`, `nom`, `prenom`, `telephone`, `email`, `mot_de_passe`, `actif`, `date_creation`, `dernier_connexion`) VALUES
(1, 'Diallo', 'Mamadou', '621000111', 'mamadou.diallo@gmail.com', '123', 1, '2026-04-19 14:54:49', '2026-04-22 13:37:47'),
(2, 'Camara', 'Aminata', '622000222', 'aminata.camara@gmail.com', '123', 1, '2026-04-19 14:54:49', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `consultation`
--

DROP TABLE IF EXISTS `consultation`;
CREATE TABLE IF NOT EXISTS `consultation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_reservation` int NOT NULL,
  `id_medecin` int NOT NULL,
  `date_consultation` datetime DEFAULT CURRENT_TIMESTAMP,
  `pa` varchar(20) DEFAULT NULL,
  `fc` varchar(10) DEFAULT NULL,
  `fr` varchar(10) DEFAULT NULL,
  `temperature` varchar(10) DEFAULT NULL,
  `saturation` varchar(10) DEFAULT NULL,
  `poids` varchar(10) DEFAULT NULL,
  `taille` varchar(10) DEFAULT NULL,
  `imc` varchar(10) DEFAULT NULL,
  `biologie` text,
  `ecg` text,
  `rx_pulmonaire` text,
  `ett` text,
  `symptomes` text,
  `diagnostic` text,
  `traitement` text,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `id_reservation` (`id_reservation`),
  KEY `id_medecin` (`id_medecin`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `consultation`
--

INSERT INTO `consultation` (`id`, `id_reservation`, `id_medecin`, `date_consultation`, `pa`, `fc`, `fr`, `temperature`, `saturation`, `poids`, `taille`, `imc`, `biologie`, `ecg`, `rx_pulmonaire`, `ett`, `symptomes`, `diagnostic`, `traitement`, `notes`) VALUES
(1, 5, 3, '2026-04-22 16:31:54', '', '', '', '', '', '', '', '', '', '', '', '', 'lskjfklsq', '', '', ''),
(2, 5, 3, '2026-04-22 16:33:16', '', '', '', '', '', '', '', '', '', '', '', '', 'lskjfklsq', '', '', '');

-- --------------------------------------------------------

--
-- Structure de la table `medecin`
--

DROP TABLE IF EXISTS `medecin`;
CREATE TABLE IF NOT EXISTS `medecin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `id_admin` int DEFAULT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `dernier_connexion` datetime DEFAULT NULL,
  `specialite` varchar(100) DEFAULT 'Généraliste',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_medecin_admin` (`id_admin`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `medecin`
--

INSERT INTO `medecin` (`id`, `nom`, `prenom`, `telephone`, `email`, `mot_de_passe`, `id_admin`, `statut`, `date_creation`, `dernier_connexion`, `specialite`) VALUES
(1, 'iuu', 'mfkm', '7887788', 'sfjdsl@gmail.com', '$2b$10$FPfc838XvCa2xxZFs/OsS.4R26E.L9Eq2RvV2P4eVE8Pdjn8EaL6a', NULL, 'actif', '2026-04-19 16:32:54', NULL, 'Généraliste'),
(3, 'Elhadj', 'Yaya Baldé', '620000001', 'elhadj.yaya@gmail.com', 'yaya123', NULL, 'actif', '2026-04-21 00:25:35', '2026-04-22 16:26:34', 'Généraliste'),
(4, 'Mamadou', 'Bassirou Bah', '620000002', 'bassirou.bah@gmail.com', 'bassirou123', NULL, 'actif', '2026-04-21 00:25:35', '2026-04-25 12:59:13', 'Généraliste'),
(5, 'Mamadou', 'Diallo', '620000003', 'mamadou.diallo@gmail.com', 'diallo123', NULL, 'actif', '2026-04-21 00:25:35', '2026-04-21 19:38:31', 'Généraliste'),
(6, 'Thierno Siradjo', 'Baldé', '620000004', 'siradjo.balde@gmail.com', 'siradjo123', NULL, 'actif', '2026-04-21 00:25:35', '2026-04-22 15:45:59', 'Généraliste'),
(7, 'Thierno Boubacar', 'Barry', '620000005', 'boubacar.barry@gmail.com', 'barry123', NULL, 'actif', '2026-04-21 00:25:35', NULL, 'Généraliste');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT NULL,
  `message` text,
  `id_secretaire` int DEFAULT NULL,
  `id_medecin` int DEFAULT NULL,
  `id_reservation` int DEFAULT NULL,
  `lu` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `message`, `id_secretaire`, `id_medecin`, `id_reservation`, `lu`, `created_at`) VALUES
(1, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-27', NULL, 3, NULL, 1, '2026-04-26 16:52:34'),
(2, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-29', NULL, 3, NULL, 1, '2026-04-26 16:59:47'),
(3, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-30', NULL, 3, NULL, 1, '2026-04-26 17:05:01'),
(4, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : lundi 27 avril 2026 à 10:30 | Motif : Consultation | Tél. : 620000000', NULL, 3, 12, 1, '2026-04-26 17:23:22'),
(5, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : lundi 27 avril 2026 à 10:30 | Motif : Consultation | Tél. : 620000000', NULL, 3, 12, 1, '2026-04-26 17:28:27'),
(6, 'confirmation', '✅ Rendez-vous confirmé — Patient : Aminata Diallo | Date : lundi 27 avril 2026 à 10:30 | Motif : Consultation', NULL, 3, 12, 1, '2026-04-26 17:56:29'),
(7, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : lundi 27 avril 2026 à 10:30 | Motif : Consultation | Tél. : 620000000', NULL, 3, 12, 1, '2026-04-26 17:56:35');

-- --------------------------------------------------------

--
-- Structure de la table `ordonnance`
--

DROP TABLE IF EXISTS `ordonnance`;
CREATE TABLE IF NOT EXISTS `ordonnance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_medecin` int NOT NULL,
  `id_reservation` int NOT NULL,
  `nom_medicament` varchar(150) NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `date_ordination` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_medecin` (`id_medecin`),
  KEY `id_reservation` (`id_reservation`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ordonnance`
--

INSERT INTO `ordonnance` (`id`, `id_medecin`, `id_reservation`, `nom_medicament`, `dosage`, `date_ordination`) VALUES
(1, 3, 5, 'bbcetamol', '2 fois jour', '2026-04-22 17:34:48');

-- --------------------------------------------------------

--
-- Structure de la table `patient`
--

DROP TABLE IF EXISTS `patient`;
CREATE TABLE IF NOT EXISTS `patient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `commune` varchar(100) DEFAULT NULL,
  `quartier` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `sexe` enum('M','F') DEFAULT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `dernier_connexion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `patient`
--

INSERT INTO `patient` (`id`, `nom`, `prenom`, `telephone`, `commune`, `quartier`, `email`, `sexe`, `mot_de_passe`, `dernier_connexion`) VALUES
(1, 'Diallo', 'Aminata', '620000000', 'Ratoma', 'Kaporo', 'aminata@gmail.com', 'F', '123456', '2026-04-25 12:58:06'),
(5, 'Test', 'Patient', '620000000', NULL, NULL, NULL, NULL, '', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `planning_medecin`
--

DROP TABLE IF EXISTS `planning_medecin`;
CREATE TABLE IF NOT EXISTS `planning_medecin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_medecin` int NOT NULL,
  `date_planning` date NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `statut` enum('disponible','indisponible','urgence') DEFAULT 'disponible',
  `commentaire` text,
  PRIMARY KEY (`id`),
  KEY `id_medecin` (`id_medecin`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `planning_medecin`
--

INSERT INTO `planning_medecin` (`id`, `id_medecin`, `date_planning`, `heure_debut`, `heure_fin`, `statut`, `commentaire`) VALUES
(1, 3, '2026-04-22', '08:00:00', '12:00:00', 'disponible', ''),
(2, 3, '2026-04-18', '08:00:00', '12:00:00', 'disponible', ''),
(3, 3, '2026-04-26', '08:00:00', '12:00:00', 'disponible', 'libre'),
(4, 3, '2026-04-27', '09:00:00', '13:00:00', 'disponible', ''),
(5, 3, '2026-04-29', '08:00:00', '12:00:00', 'disponible', 'formation'),
(6, 3, '2026-04-30', '10:00:00', '14:00:00', 'disponible', '');

-- --------------------------------------------------------

--
-- Structure de la table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
CREATE TABLE IF NOT EXISTS `reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `id_medecin` int DEFAULT NULL,
  `id_secretaire` int DEFAULT NULL,
  `date_rendez_vous` date DEFAULT NULL,
  `heure_rendez_vous` time DEFAULT NULL,
  `statut` enum('en_attente','confirme','annule','termine') DEFAULT 'en_attente',
  `motif` text,
  `notif_patient` tinyint DEFAULT '0',
  `notif_medecin` tinyint DEFAULT '0',
  `notif_secretaire` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_patient` (`patient_id`),
  KEY `fk_medecin` (`id_medecin`),
  KEY `fk_secretaire` (`id_secretaire`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reservation`
--

INSERT INTO `reservation` (`id`, `patient_id`, `id_medecin`, `id_secretaire`, `date_rendez_vous`, `heure_rendez_vous`, `statut`, `motif`, `notif_patient`, `notif_medecin`, `notif_secretaire`) VALUES
(1, 1, 1, 1, '2026-04-30', '10:00:00', '', 'Consultation générale', 0, 1, 0),
(2, 5, 1, 2, '2026-04-30', '10:00:00', 'en_attente', 'Consultation générale', 0, 0, 0),
(3, 10, 1, 1, '2026-05-02', '09:30:00', 'confirme', 'Douleurs générales', 0, 0, 0),
(4, 1, NULL, 1, '2026-05-10', '09:00:00', 'en_attente', 'Consultation test', 0, 0, 0),
(5, 1, NULL, 1, '2026-04-26', '17:00:00', 'en_attente', 'Polygraphie ventilatoire', 0, 0, 0),
(6, 1, NULL, 1, '2026-04-26', '15:30:00', 'en_attente', 'Contrôle des pacemakers', 0, 0, 0),
(7, 1, NULL, 1, '2026-04-26', '08:00:00', 'en_attente', 'Chirurgie cardiaque', 0, 0, 0),
(8, 1, NULL, 1, '2026-04-26', '11:30:00', '', 'Polygraphie ventilatoire', 0, 0, 0),
(9, 1, NULL, 1, '2026-04-26', '08:00:00', '', 'Contrôle des pacemakers', 0, 0, 0),
(10, 1, NULL, 1, '2026-04-26', '11:30:00', '', 'Consultation', 0, 0, 0),
(11, 1, NULL, 1, '2026-04-27', '15:00:00', '', 'Chirurgie cardiaque', 0, 0, 0),
(12, 1, 3, 1, '2026-04-27', '10:30:00', '', 'Consultation', 1, 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `secretaire`
--

DROP TABLE IF EXISTS `secretaire`;
CREATE TABLE IF NOT EXISTS `secretaire` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `dernier_connexion` datetime DEFAULT NULL,
  `id_admin` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_secretaire_admin` (`id_admin`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `secretaire`
--

INSERT INTO `secretaire` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `telephone`, `statut`, `dernier_connexion`, `id_admin`, `created_at`) VALUES
(3, 'Baldé', 'Aissatou', 'baldeaissatou@gmail.com', 'd_3fW0-7oE', '627634812', 'actif', NULL, 1, '2026-04-24 21:18:41');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
