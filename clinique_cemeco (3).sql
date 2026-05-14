-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 14 mai 2026 à 19:03
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
  `role` enum('super_admin','admin') DEFAULT 'admin',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `administrateur`
--

INSERT INTO `administrateur` (`id`, `nom`, `prenom`, `telephone`, `email`, `mot_de_passe`, `actif`, `date_creation`, `dernier_connexion`, `role`) VALUES
(1, 'Baldé', 'Elhadj Yaya', NULL, 'elhadj.balde@clinique.com', '123456', 1, '2026-05-03 17:46:23', '2026-05-14 16:03:28', 'super_admin');

-- --------------------------------------------------------

--
-- Structure de la table `archive_medecin`
--

DROP TABLE IF EXISTS `archive_medecin`;
CREATE TABLE IF NOT EXISTS `archive_medecin` (
  `id_archive` int NOT NULL AUTO_INCREMENT,
  `id_medecin` int NOT NULL,
  `id_consultation` int DEFAULT NULL,
  `date_archive` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_archive`),
  KEY `id_medecin` (`id_medecin`),
  KEY `id_consultation` (`id_consultation`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `clinique_info`
--

DROP TABLE IF EXISTS `clinique_info`;
CREATE TABLE IF NOT EXISTS `clinique_info` (
  `id` int NOT NULL DEFAULT '1',
  `nom` varchar(200) NOT NULL,
  `adresse` text,
  `telephone` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `site_web` varchar(150) DEFAULT NULL,
  `notifications_email` tinyint(1) DEFAULT '1',
  `sauvegarde_auto` tinyint(1) DEFAULT '1',
  `retention_donnees` varchar(50) DEFAULT 'unlimited',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `clinique_info`
--

INSERT INTO `clinique_info` (`id`, `nom`, `adresse`, `telephone`, `email`, `site_web`, `notifications_email`, `sauvegarde_auto`, `retention_donnees`) VALUES
(1, 'Clinique CEMECO', 'Kipé, près de Heroes Coffee - En face de Plaza Diamond', '+224 622 00 00 00', 'contact@cemeco.gn', 'www.cemeco.gn', 1, 1, 'unlimited');

-- --------------------------------------------------------

--
-- Structure de la table `consultation`
--

DROP TABLE IF EXISTS `consultation`;
CREATE TABLE IF NOT EXISTS `consultation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_reservation` int NOT NULL,
  `id_medecin` int NOT NULL,
  `id_type_consultation` int NOT NULL,
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
  KEY `id_medecin` (`id_medecin`),
  KEY `fk_consultation_type` (`id_type_consultation`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `consultation`
--

INSERT INTO `consultation` (`id`, `id_reservation`, `id_medecin`, `id_type_consultation`, `date_consultation`, `pa`, `fc`, `fr`, `temperature`, `saturation`, `poids`, `taille`, `imc`, `biologie`, `ecg`, `rx_pulmonaire`, `ett`, `symptomes`, `diagnostic`, `traitement`, `notes`) VALUES
(1, 5, 3, 0, '2026-04-22 16:31:54', '', '', '', '', '', '', '', '', '', '', '', '', 'lskjfklsq', '', '', ''),
(2, 5, 3, 0, '2026-04-22 16:33:16', '', '', '', '', '', '', '', '', '', '', '', '', 'lskjfklsq', '', '', ''),
(3, 19, 3, 0, '2026-04-28 16:34:47', '7887', '546', '231', '6465', '00', '15.9', '44', '82.1', 'sdfghj', 'a\"\'z(er-t', '', 'fdsdghjbk', 'Chirurgie cardiaque', 'xwcvb', 'wxcvb', 'seerrty'),
(4, 20, 3, 0, '2026-04-28 17:32:09', '4525', '112', '122', '12', '12', '122', '102', '117.3', 'etrete', 'rrtytr', 'cgfdngf', 'gfd', 'Chirurgie cardiaque', 'reyrthy', 'ruèi-', 'yiuykiuliolo'),
(5, 25, 3, 0, '2026-05-08 18:21:49', 'dseyj', 'tgruy', 'tuiiu', 'freuitseru', 'kregkjregk', '12', '12', '833.3', 'EAREYRUTY', 'SRTR6U57', 'DYRUT', 'RYRUYO8I', 'Électrocardiogramme', 'YR6UTI', 'TYIYUI', 'TEYRU56'),
(6, 26, 3, 0, '2026-05-08 19:00:39', 'esrdtfgyhj', 'ZQDSF', 'ERTYGUHJK', '45E6RT7Y8U', 'ESRTYUI', '12', '345E67', '0.0', 'SZERTYU', '3ZA4E5RYU', 'EQRSTT', 'ZSERYTUIJ', 'Électrocardiogramme', 'rdtyguhjikl', 'drtfyguhjkl', 'zserdtfygu');

-- --------------------------------------------------------

--
-- Structure de la table `factures`
--

DROP TABLE IF EXISTS `factures`;
CREATE TABLE IF NOT EXISTS `factures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rendez_vous_id` int DEFAULT NULL,
  `consultation_id` int DEFAULT NULL,
  `patient_id` int NOT NULL,
  `type_consultation_id` int NOT NULL,
  `patient_nom` varchar(150) NOT NULL,
  `service` varchar(150) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `patient_type` enum('insured','non-insured') NOT NULL DEFAULT 'non-insured',
  `payment_method` enum('cash','cheque','banque','orange-money','autre') DEFAULT NULL,
  `insurance_provider` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_rib` varchar(50) DEFAULT NULL,
  `orange_number` varchar(20) DEFAULT NULL,
  `orange_name` varchar(100) DEFAULT NULL,
  `orange_transaction_id` varchar(50) DEFAULT NULL,
  `date_facture` date DEFAULT (curdate()),
  `statut` enum('en_attente','payee','annulee') DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `type_consultation_id` (`type_consultation_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `factures`
--

INSERT INTO `factures` (`id`, `rendez_vous_id`, `consultation_id`, `patient_id`, `type_consultation_id`, `patient_nom`, `service`, `montant`, `patient_type`, `payment_method`, `insurance_provider`, `bank_name`, `bank_account_number`, `bank_rib`, `orange_number`, `orange_name`, `orange_transaction_id`, `date_facture`, `statut`, `created_at`, `updated_at`) VALUES
(1, NULL, 5, 6, 0, 'oumou fally baldé', 'Consultation médicale', '0.00', 'non-insured', 'cash', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-08', 'payee', '2026-05-08 18:47:44', '2026-05-08 18:47:44'),
(2, NULL, 6, 7, 2, 'mamady sacko', 'Électrocardiogramme', '200000.00', 'non-insured', 'cash', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-08', 'payee', '2026-05-08 19:01:19', '2026-05-08 19:01:19'),
(3, NULL, 4, 1, 9, 'Aminata Diallo', 'Chirurgie cardiaque', '12300.00', 'non-insured', 'banque', NULL, 'Vista Assurance', '121335375889907', NULL, NULL, NULL, NULL, '2026-05-13', 'payee', '2026-05-13 22:06:02', '2026-05-13 22:06:02');

-- --------------------------------------------------------

--
-- Structure de la table `horaires_clinique`
--

DROP TABLE IF EXISTS `horaires_clinique`;
CREATE TABLE IF NOT EXISTS `horaires_clinique` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jour` varchar(20) NOT NULL,
  `debut` time NOT NULL,
  `fin` time NOT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `jour` (`jour`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `horaires_clinique`
--

INSERT INTO `horaires_clinique` (`id`, `jour`, `debut`, `fin`, `actif`) VALUES
(1, 'lundi', '08:00:00', '18:00:00', 1),
(2, 'mardi', '08:00:00', '18:00:00', 1),
(3, 'mercredi', '08:00:00', '18:00:00', 1),
(4, 'jeudi', '08:00:00', '18:00:00', 1),
(5, 'vendredi', '08:00:00', '18:00:00', 1),
(6, 'samedi', '09:00:00', '13:00:00', 1),
(7, 'dimanche', '00:00:00', '00:00:00', 0);

-- --------------------------------------------------------

--
-- Structure de la table `ligne_ordonnance`
--

DROP TABLE IF EXISTS `ligne_ordonnance`;
CREATE TABLE IF NOT EXISTS `ligne_ordonnance` (
  `id_ligne` int NOT NULL AUTO_INCREMENT,
  `id_ordonnance` int NOT NULL,
  `medicament` varchar(255) DEFAULT NULL,
  `dose` varchar(100) DEFAULT NULL,
  `frequence` varchar(100) DEFAULT NULL,
  `duree` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_ligne`),
  KEY `id_ordonnance` (`id_ordonnance`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `reset_otp` varchar(6) DEFAULT NULL,
  `reset_otp_expiry` datetime DEFAULT NULL,
  `reset_otp_attempts` int DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_medecin_admin` (`id_admin`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `medecin`
--

INSERT INTO `medecin` (`id`, `nom`, `prenom`, `telephone`, `email`, `mot_de_passe`, `id_admin`, `statut`, `date_creation`, `dernier_connexion`, `specialite`, `reset_otp`, `reset_otp_expiry`, `reset_otp_attempts`, `reset_token`, `reset_token_expiry`) VALUES
(1, 'iuu', 'mfkm', '7887788', 'sfjdsl@gmail.com', '$2b$10$FPfc838XvCa2xxZFs/OsS.4R26E.L9Eq2RvV2P4eVE8Pdjn8EaL6a', NULL, 'actif', '2026-04-19 16:32:54', NULL, 'Cardiologue', NULL, NULL, 0, NULL, NULL),
(3, 'Baldé', 'Elhadj Yaya', '620000001', 'elhadj.yaya@gmail.com', 'yaya123', NULL, 'actif', '2026-04-21 00:25:35', '2026-05-14 16:37:44', 'Cardiologue', NULL, NULL, 0, NULL, NULL),
(4, 'Bah', 'Mamadou Bassirou', '620000002', 'bassirou.bah@gmail.com', 'bassirou123', NULL, 'actif', '2026-04-21 00:25:35', '2026-05-14 16:24:26', 'Cardiologue', NULL, NULL, 0, NULL, NULL),
(5, 'Diallo', 'Mamadou', '620000003', 'mamadou.diallo@gmail.com', 'diallo123', NULL, 'actif', '2026-04-21 00:25:35', '2026-04-21 19:38:31', 'Cardiologue', NULL, NULL, 0, NULL, NULL),
(6, 'Baldé', 'Thierno Siradjo', '620000004', 'siradjo.balde@gmail.com', 'siradjo123', NULL, 'actif', '2026-04-21 00:25:35', '2026-04-22 15:45:59', 'Cardiologue', NULL, NULL, 0, NULL, NULL),
(7, 'Baldé', 'Thierno Boubacar', '620000005', 'boubacar.barry@gmail.com', 'barry123', NULL, 'actif', '2026-04-21 00:25:35', NULL, 'Cardiologue', NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `messagerie`
--

DROP TABLE IF EXISTS `messagerie`;
CREATE TABLE IF NOT EXISTS `messagerie` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_medecin` int NOT NULL,
  `id_patient` int NOT NULL,
  `sujet` varchar(255) DEFAULT NULL,
  `priorite` enum('low','normal','high') DEFAULT 'normal',
  `expediteur` enum('medecin','patient') NOT NULL,
  `message` text NOT NULL,
  `lu` tinyint(1) DEFAULT '0',
  `date_envoi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('text','image','vocal','file') DEFAULT 'text',
  `fichier_url` text,
  PRIMARY KEY (`id`),
  KEY `fk_message_medecin` (`id_medecin`),
  KEY `fk_message_patient` (`id_patient`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `messagerie`
--

INSERT INTO `messagerie` (`id`, `id_medecin`, `id_patient`, `sujet`, `priorite`, `expediteur`, `message`, `lu`, `date_envoi`, `type`, `fichier_url`) VALUES
(1, 3, 1, 'conseils sur hypertension', 'normal', 'patient', 'respiration mauvaise', 1, '2026-05-01 17:09:46', 'text', NULL),
(2, 3, 1, NULL, 'normal', 'medecin', 'rester allonger', 1, '2026-05-01 17:10:19', 'text', NULL),
(3, 3, 1, 'conseils sur hypertension', 'normal', 'patient', 'je suis fatiguée', 1, '2026-05-03 13:17:47', 'image', '/uploads/1777814267420-219082904.png'),
(4, 3, 1, 'conseils sur hypertension', 'normal', 'patient', 'je suis fatiguée', 1, '2026-05-03 13:19:19', 'vocal', '/uploads/1777814359603-707748423.webm'),
(5, 3, 1, NULL, 'normal', 'patient', 'monsieur sacko est trop gentil', 1, '2026-05-03 13:22:01', 'text', NULL),
(6, 3, 1, NULL, 'normal', 'medecin', '', 1, '2026-05-03 13:28:47', 'image', '/uploads/1777814927188-572431102.png'),
(7, 3, 1, NULL, 'normal', 'medecin', '', 1, '2026-05-03 13:29:59', 'vocal', '/uploads/1777814999197-213748344.webm'),
(8, 3, 6, 'conseils sur hypertension', 'normal', 'patient', 'blablaaaaaaaaaaaa', 1, '2026-05-08 00:06:39', 'text', NULL),
(9, 3, 6, NULL, 'normal', 'medecin', '', 1, '2026-05-08 00:07:22', 'vocal', '/uploads/1778198842477-179015012.webm'),
(10, 3, 6, NULL, 'normal', 'patient', '', 1, '2026-05-08 00:08:13', 'vocal', '/uploads/1778198893025-543789553.webm'),
(11, 3, 6, NULL, 'normal', 'patient', '', 0, '2026-05-14 17:56:56', 'vocal', '/uploads/1778781416416-898628335.webm');

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
) ENGINE=MyISAM AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(7, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : lundi 27 avril 2026 à 10:30 | Motif : Consultation | Tél. : 620000000', NULL, 3, 12, 1, '2026-04-26 17:56:35'),
(8, 'confirmation', '✅ Rendez-vous confirmé — Patient : Aminata Diallo | Date : lundi 27 avril 2026 à 10:30 | Motif : Consultation', NULL, 3, 12, 1, '2026-04-27 10:19:58'),
(9, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : lundi 27 avril 2026 à 10:30 | Motif : Consultation | Tél. : 620000000', NULL, 3, 12, 1, '2026-04-27 10:20:04'),
(10, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-20', NULL, 3, NULL, 1, '2026-04-28 12:02:55'),
(11, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-15', NULL, 3, NULL, 1, '2026-04-28 12:03:34'),
(12, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-02', NULL, 3, NULL, 1, '2026-04-28 12:04:36'),
(13, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-06', NULL, 3, NULL, 1, '2026-04-28 13:05:10'),
(14, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-28', NULL, 3, NULL, 1, '2026-04-28 13:05:46'),
(15, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-10', NULL, 3, NULL, 1, '2026-04-28 13:49:05'),
(16, 'planning', 'Dr. Yaya Baldé Elhadj a ajouté un planning pour le 2026-04-12', NULL, 3, NULL, 1, '2026-04-28 14:13:56'),
(17, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : mercredi 29 avril 2026 à 10:00 | Motif : Chirurgie cardiaque | Tél. : 620000000', NULL, 3, 21, 1, '2026-04-28 14:36:57'),
(18, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : mercredi 29 avril 2026 à 10:00 | Motif : Chirurgie cardiaque | Tél. : 620000000', NULL, 3, 21, 1, '2026-04-28 14:37:02'),
(19, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : jeudi 30 avril 2026 à 14:00 | Motif : Chirurgie cardiaque | Tél. : 620000000', NULL, 3, 20, 1, '2026-04-28 14:39:55'),
(20, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : jeudi 30 avril 2026 à 14:00 | Motif : Chirurgie cardiaque | Tél. : 620000000', NULL, 3, 20, 1, '2026-04-28 14:40:00'),
(21, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : jeudi 30 avril 2026 à 16:30 | Motif : Contrôle des pacemakers | Tél. : 620000000', NULL, 3, 17, 1, '2026-04-28 14:51:11'),
(22, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : mercredi 29 avril 2026 à 17:00 | Motif : Chirurgie cardiaque | Tél. : 620000000', NULL, 3, 19, 1, '2026-04-28 14:51:51'),
(23, 'confirmation', '✅ Rendez-vous confirmé — Patient : Aminata Diallo | Date : mercredi 29 avril 2026 à 17:00 | Motif : Chirurgie cardiaque', NULL, 3, 19, 1, '2026-04-28 16:03:08'),
(24, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : mercredi 29 avril 2026 à 17:00 | Motif : Chirurgie cardiaque | Tél. : 620000000', NULL, 3, 19, 1, '2026-04-28 16:03:14'),
(25, 'report', '⏳ Rendez-vous reporté — Patient : Aminata Diallo | Nouvelle date : mardi 12 mai 2026 à 10:30 | Motif du report : etyyuiuo', NULL, 3, 12, 1, '2026-05-03 17:35:18'),
(26, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : mamady sacko | Date : mardi 5 mai 2026 à 10:30 | Motif : Implantation des stimulateurs cardiaques (pacemaker) | Tél. : 612374585', NULL, 3, 22, 1, '2026-05-07 22:41:43'),
(27, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : mercredi 29 avril 2026 à 10:00 | Motif : Chirurgie cardiaque | Tél. : 620000000', NULL, 3, 21, 1, '2026-05-07 23:58:14'),
(28, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-08', NULL, 3, NULL, 1, '2026-05-08 00:00:35'),
(29, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-09', NULL, 3, NULL, 1, '2026-05-08 00:01:45'),
(30, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : oumou fally baldé | Date : samedi 9 mai 2026 à 14:30 | Motif : Consultation | Tél. : 627634812', NULL, 3, 24, 1, '2026-05-08 00:02:49'),
(31, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-10', NULL, 3, NULL, 1, '2026-05-08 11:53:24'),
(32, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-11', NULL, 3, NULL, 1, '2026-05-08 11:55:39'),
(33, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-21', NULL, 3, NULL, 1, '2026-05-08 12:07:26'),
(34, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-13', NULL, 3, NULL, 1, '2026-05-08 12:23:10'),
(35, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-18', NULL, 3, NULL, 1, '2026-05-08 12:28:51'),
(36, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-06', NULL, 3, NULL, 1, '2026-05-08 12:36:59'),
(37, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-27', NULL, 3, NULL, 1, '2026-05-08 12:40:45'),
(38, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-30', NULL, 3, NULL, 1, '2026-05-08 12:41:49'),
(39, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-25', NULL, 3, NULL, 1, '2026-05-08 13:01:00'),
(40, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-26', NULL, 3, NULL, 1, '2026-05-08 13:03:34'),
(41, 'planning', 'Dr. Elhadj Yaya Baldé a ajouté un planning pour le 2026-05-31', NULL, 3, NULL, 1, '2026-05-08 13:49:20'),
(42, 'planning_jour', '📅 Planning du jour (2026-05-08) :\n\n• 12:29 - 23:59 (disponible)\n  → temp_from_notification_35\n• 12:37 - 23:59 (disponible)\n  → temp_from_notification_36\n• 12:40 - 23:59 (disponible)\n  → temp_from_notification_37\n', NULL, 3, NULL, 1, '2026-05-08 14:14:44'),
(43, 'planning_jour', '📅 Planning du jour (2026-05-08) :\n\n• 12:29 - 23:59 (disponible)\n  → temp_from_notification_35\n• 12:37 - 23:59 (disponible)\n  → temp_from_notification_36\n• 12:40 - 23:59 (disponible)\n  → temp_from_notification_37\n', NULL, 3, NULL, 1, '2026-05-08 14:14:49'),
(44, 'planning_jour', '📅 Planning du jour (2026-05-08) :\n\n• 12:29 - 23:59 (disponible)\n  → temp_from_notification_35\n• 12:37 - 23:59 (disponible)\n  → temp_from_notification_36\n• 12:40 - 23:59 (disponible)\n  → temp_from_notification_37\n', NULL, 3, NULL, 1, '2026-05-08 14:15:10'),
(45, 'planning_jour', '📅 Planning du jour (2026-05-08) :\n\n• 12:29 - 23:59 (disponible)\n  → temp_from_notification_35\n• 12:37 - 23:59 (disponible)\n  → temp_from_notification_36\n• 12:40 - 23:59 (disponible)\n  → temp_from_notification_37\n', NULL, 3, NULL, 1, '2026-05-08 14:19:29'),
(46, 'planning_jour', '📅 Planning du jour (2026-05-08) :\n\n• 12:37 - 23:59 (disponible)\n  → temp_from_notification_36\n• 12:40 - 23:59 (disponible)\n  → temp_from_notification_37\n', NULL, 3, NULL, 1, '2026-05-08 14:20:51'),
(47, 'planning_jour', '📅 Planning du jour (2026-05-08) :\n\n• 12:37 - 23:59 (disponible)\n  → temp_from_notification_36\n• 12:40 - 23:59 (disponible)\n  → temp_from_notification_37\n', NULL, 3, NULL, 1, '2026-05-08 14:39:13'),
(48, 'planning_jour', '📅 Planning du jour (2026-05-08) :\n\n• 12:37 - 23:59 (disponible)\n  → temp_from_notification_36\n• 12:40 - 23:59 (disponible)\n  → temp_from_notification_37\n• 14:42 - 23:59 (disponible)\n  → temp_from_notification_47\n• 14:46 - 23:59 (disponible)\n  → temp_from_notification_46\n• 14:49 - 23:59 (disponible)\n  → temp_from_notification_45\n• 14:51 - 23:59 (disponible)\n  → temp_from_notification_44\n• 14:57 - 23:59 (disponible)\n  → temp_from_notification_43\n• 15:01 - 23:59 (disponible)\n  → temp_from_notification_42\n', NULL, 3, NULL, 1, '2026-05-08 15:07:58'),
(49, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : Aminata Diallo | Date : jeudi 30 avril 2026 à 14:30 | Motif : Implantation des stimulateurs cardiaques (pacemaker) | Tél. : 620000000', NULL, 3, 18, 1, '2026-05-08 15:22:20'),
(50, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : oumou fally baldé | Date : samedi 9 mai 2026 à 11:30 | Motif : Électrocardiogramme | Tél. : 627634812', NULL, 3, 25, 1, '2026-05-08 16:44:32'),
(51, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : oumou fally baldé | Date : samedi 9 mai 2026 à 11:30 | Motif : Électrocardiogramme | Tél. : 627634812', NULL, 3, 25, 1, '2026-05-08 16:44:50'),
(52, 'rendez-vous', '🩺 Nouveau rendez-vous attribué — Patient : mamady sacko | Date : dimanche 10 mai 2026 à 13:00 | Motif : Électrocardiogramme | Tél. : 612374585', NULL, 3, 26, 1, '2026-05-08 18:58:43'),
(53, 'report', '⏳ Rendez-vous reporté — Patient : mamady sacko | Nouvelle date : mardi 5 mai 2026 à 10:30 | Motif du report : Indisponibilité du médecin', NULL, 3, 22, 0, '2026-05-12 14:43:14'),
(54, 'report', '⏳ Rendez-vous reporté — Patient : Aminata Diallo | Nouvelle date : mercredi 29 avril 2026 à 10:00 | Motif du report : Indisponibilité du médecin', NULL, 3, 21, 0, '2026-05-12 14:46:41'),
(55, 'planning_jour', '📅 Planning du jour (2026-05-12) :\n\n• 08:00 - 12:00 (disponible)\n', NULL, 3, NULL, 1, '2026-05-12 15:13:58');

-- --------------------------------------------------------

--
-- Structure de la table `ordonnance`
--

DROP TABLE IF EXISTS `ordonnance`;
CREATE TABLE IF NOT EXISTS `ordonnance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_consultation` int NOT NULL,
  `date_ordination` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `medicaments` json NOT NULL,
  `dosage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_reservation` (`id_consultation`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ordonnance`
--

INSERT INTO `ordonnance` (`id`, `id_consultation`, `date_ordination`, `medicaments`, `dosage`) VALUES
(1, 5, '2026-05-14 17:16:30', '[{\"nom\": \"ezteyrtuyt\", \"dosage\": \"ttuyiuyo\"}]', NULL),
(2, 3, '2026-04-28 17:33:42', '[{\"nom\": \"doliprame\", \"dosage\": \"4 par heures\"}, {\"nom\": \"paracetamol\", \"dosage\": \"10 par heure\"}]', NULL);

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
  `date_naissance` date DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `reset_otp_attempts` int DEFAULT '0',
  `reset_otp` varchar(6) DEFAULT NULL,
  `reset_otp_expiry` datetime DEFAULT NULL,
  `groupe_sanguin` varchar(5) DEFAULT NULL,
  `allergies` text,
  `antecedent_familial` text,
  `antecedent_personnel` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `patient`
--

INSERT INTO `patient` (`id`, `nom`, `prenom`, `telephone`, `commune`, `quartier`, `email`, `sexe`, `mot_de_passe`, `dernier_connexion`, `date_naissance`, `reset_token`, `reset_token_expiry`, `reset_otp_attempts`, `reset_otp`, `reset_otp_expiry`, `groupe_sanguin`, `allergies`, `antecedent_familial`, `antecedent_personnel`) VALUES
(1, 'Diallo', 'Aminata', '620000000', 'Ratoma', 'Kaporo', 'aminata@gmail.com', 'F', '123456', '2026-05-03 17:35:51', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Test', 'Patient', '620000000', NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'baldé', 'oumou fally', '627634812', NULL, NULL, 'baldeoumoufally14@gmail.com', 'F', 'sacko@1', '2026-05-14 17:50:29', '2004-06-08', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'sacko', 'mamady', '612374585', NULL, NULL, 'sacko2120@gmail.com', 'M', 'zanka', '2026-05-08 18:57:17', '2003-02-03', NULL, NULL, 0, '523111', '2026-05-05 17:53:12', NULL, NULL, NULL, NULL);

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
  `statut` enum('disponible','indisponible','modifié','annulé','urgence') DEFAULT 'disponible',
  `commentaire` text,
  PRIMARY KEY (`id`),
  KEY `id_medecin` (`id_medecin`)
) ENGINE=MyISAM AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `planning_medecin`
--

INSERT INTO `planning_medecin` (`id`, `id_medecin`, `date_planning`, `heure_debut`, `heure_fin`, `statut`, `commentaire`) VALUES
(38, 3, '2026-05-14', '08:00:00', '12:00:00', 'disponible', ''),
(19, 3, '2026-05-21', '12:17:56', '12:17:56', 'disponible', 'temp_from_notification_33'),
(18, 3, '2026-05-21', '08:00:00', '12:00:00', 'disponible', ''),
(58, 5, '2026-05-14', '08:00:00', '12:00:00', 'urgence', ''),
(39, 3, '2026-05-22', '08:00:00', '12:00:00', 'disponible', ''),
(31, 3, '2026-05-27', '08:00:00', '12:00:00', 'disponible', ''),
(34, 3, '2026-05-30', '08:00:00', '12:00:00', 'disponible', ''),
(35, 3, '2026-05-25', '08:00:00', '12:00:00', 'disponible', ''),
(36, 3, '2026-05-26', '08:00:00', '12:00:00', 'disponible', ''),
(37, 3, '2026-05-31', '08:00:00', '12:00:00', 'disponible', ''),
(57, 4, '2026-05-14', '08:00:00', '17:04:00', 'disponible', '');

-- --------------------------------------------------------

--
-- Structure de la table `rapport_medical`
--

DROP TABLE IF EXISTS `rapport_medical`;
CREATE TABLE IF NOT EXISTS `rapport_medical` (
  `id_rapport` int NOT NULL AUTO_INCREMENT,
  `id_patient` int NOT NULL,
  `id_consultation` int DEFAULT NULL,
  `id_ordonnance` int DEFAULT NULL,
  `date_rapport` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rapport`),
  KEY `id_patient` (`id_patient`),
  KEY `id_consultation` (`id_consultation`),
  KEY `id_ordonnance` (`id_ordonnance`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
CREATE TABLE IF NOT EXISTS `reservation` (
  `id_reservation` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `id_medecin` int DEFAULT NULL,
  `id_secretaire` int DEFAULT NULL,
  `date_rendez_vous` date DEFAULT NULL,
  `heure_rendez_vous` time DEFAULT NULL,
  `statut` enum('attente','confirme','annule','termine','reporte','attribue','') DEFAULT 'attente',
  `motif` text,
  `motif_report` text,
  `notif_patient` tinyint DEFAULT '0',
  `notif_medecin` tinyint DEFAULT '0',
  `notif_secretaire` tinyint DEFAULT '0',
  PRIMARY KEY (`id_reservation`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reservation`
--

INSERT INTO `reservation` (`id_reservation`, `patient_id`, `id_medecin`, `id_secretaire`, `date_rendez_vous`, `heure_rendez_vous`, `statut`, `motif`, `motif_report`, `notif_patient`, `notif_medecin`, `notif_secretaire`) VALUES
(1, 1, 1, 1, '2026-04-30', '10:00:00', 'attente', 'Consultation générale', NULL, 0, 1, 0),
(3, 10, 1, 1, '2026-05-02', '09:30:00', 'confirme', 'Douleurs générales', NULL, 0, 0, 0),
(4, 1, NULL, 1, '2026-05-10', '09:00:00', 'attente', 'Consultation test', NULL, 0, 0, 0),
(5, 1, NULL, 1, '2026-04-26', '17:00:00', 'attente', 'Polygraphie ventilatoire', NULL, 0, 0, 0),
(6, 1, NULL, 1, '2026-04-26', '15:30:00', 'attente', 'Contrôle des pacemakers', NULL, 0, 0, 0),
(7, 1, NULL, 1, '2026-04-26', '08:00:00', 'attente', 'Chirurgie cardiaque', NULL, 0, 0, 0),
(8, 1, NULL, 1, '2026-04-26', '11:30:00', 'attente', 'Polygraphie ventilatoire', NULL, 0, 0, 0),
(9, 1, NULL, 1, '2026-04-26', '08:00:00', 'attente', 'Contrôle des pacemakers', NULL, 0, 0, 0),
(10, 1, NULL, 1, '2026-04-26', '11:30:00', 'attente', 'Consultation', NULL, 0, 0, 0),
(12, 1, 3, 1, '2026-05-12', '10:30:00', 'reporte', 'Consultation', 'etyyuiuo', 1, 1, 0),
(13, 1, NULL, 1, '2026-05-14', '13:30:00', 'reporte', 'Consultation', 'azertyui', 1, 0, 0),
(14, 1, NULL, 1, '2026-04-30', '15:00:00', 'confirme', 'Consultation', NULL, 1, 0, 0),
(15, 1, NULL, 1, '2026-04-30', '16:30:00', 'annule', 'Électrocardiogramme', NULL, 1, 0, 0),
(16, 1, NULL, 1, '2026-04-29', '09:00:00', 'annule', 'Consultation', NULL, 1, 0, 0),
(17, 1, 3, 1, '2026-04-30', '16:30:00', 'attente', 'Contrôle des pacemakers', NULL, 0, 1, 0),
(19, 1, 3, 1, '2026-04-29', '17:00:00', 'termine', 'Chirurgie cardiaque', NULL, 1, 1, 0),
(20, 1, 3, 1, '2026-04-30', '14:00:00', 'termine', 'Chirurgie cardiaque', NULL, 1, 1, 0),
(21, 1, 3, 1, '2026-04-29', '10:00:00', 'reporte', 'Chirurgie cardiaque', 'Indisponibilité du médecin', 1, 1, 0),
(22, 7, 3, 1, '2026-05-05', '10:30:00', 'reporte', 'Implantation des stimulateurs cardiaques (pacemaker)', 'Indisponibilité du médecin', 1, 1, 0),
(23, 1, NULL, 1, '2026-05-31', '16:30:00', 'reporte', 'Polygraphie ventilatoire', 'ezrtyuio', 1, 0, 0),
(24, 6, 3, 1, '2026-05-09', '14:30:00', 'attribue', 'Consultation', NULL, 1, 1, 0),
(25, 6, 3, 1, '2026-05-09', '11:30:00', 'termine', 'Électrocardiogramme', NULL, 1, 1, 0);

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
  `reset_otp` varchar(6) DEFAULT NULL,
  `reset_otp_expiry` datetime DEFAULT NULL,
  `reset_otp_attempts` int DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_secretaire_admin` (`id_admin`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `secretaire`
--

INSERT INTO `secretaire` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `telephone`, `statut`, `dernier_connexion`, `id_admin`, `created_at`, `reset_otp`, `reset_otp_expiry`, `reset_otp_attempts`, `reset_token`, `reset_token_expiry`) VALUES
(3, 'Baldé', 'Aissatou', 'baldeaissatou@gmail.com', 'd_3fW0-7oE', '627634812', 'actif', '2026-05-03 11:56:57', 1, '2026-04-24 21:18:41', NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `specialites_clinique`
--

DROP TABLE IF EXISTS `specialites_clinique`;
CREATE TABLE IF NOT EXISTS `specialites_clinique` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text,
  `icon_name` varchar(50) DEFAULT 'Heart',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `specialites_clinique`
--

INSERT INTO `specialites_clinique` (`id`, `nom`, `description`, `icon_name`) VALUES
(1, 'Cardiologie Clinique', 'Consultations et suivis cardiaques standards', 'Heart'),
(2, 'Rhythmologie', 'Troubles du rythme et pacemakers', 'Activity'),
(3, 'Chirurgie Cardiaque', 'Interventions chirurgicales lourdes', 'Stethoscope'),
(4, 'Cardiologie Vasculaire', 'Pathologies des vaisseaux et artères', 'Activity');

-- --------------------------------------------------------

--
-- Structure de la table `type_consultation`
--

DROP TABLE IF EXISTS `type_consultation`;
CREATE TABLE IF NOT EXISTS `type_consultation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `type_consultation`
--

INSERT INTO `type_consultation` (`id`, `nom`, `prix`) VALUES
(1, 'Consultation', '150000.00'),
(2, 'Électrocardiogramme', '200000.00'),
(3, 'Électrocardiographie (cardiaque et vasculaire)', '250000.00'),
(4, 'Mesure Ambulatoire de la Pression Artérielle (MAPA)', '300000.00'),
(5, 'Polygraphie ventilatoire', '350000.00'),
(6, 'Contrôle des pacemakers', '400000.00'),
(7, 'Implantation des stimulateurs cardiaques (pacemaker)', '800000.00'),
(8, 'Consultation pédiatrique (dossiers de prise en charge : mécénat France)', '180000.00'),
(9, 'Chirurgie cardiaque', '1500000.00');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
