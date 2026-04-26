-- Création de la table administrateur
CREATE TABLE IF NOT EXISTS administrateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dernier_connexion TIMESTAMP NULL,
    actif BOOLEAN DEFAULT TRUE
);

-- Insertion d'un administrateur par défaut
INSERT INTO administrateur (nom, prenom, telephone, email, mot_de_passe) VALUES
('Baldé', 'Elhadj Yaya', '+221 77 123 45 67', 'elhadj.balde@clinic.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- mot de passe: Admin@123