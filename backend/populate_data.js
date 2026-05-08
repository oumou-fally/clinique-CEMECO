const pool = require('./config/db');

async function populate() {
    console.log('📦 Alimentation de la base de données avec vos données...');
    
    try {
        // Nettoyage optionnel (décommenter si vous voulez repartir de zéro)
        // await pool.execute("DELETE FROM factures;");
        // await pool.execute("DELETE FROM patient;");
        // await pool.execute("DELETE FROM type_consultation;");

        // 1. Insertion des Types de Consultation
        const typesQueries = [
            [1, 'Consultation', 150000],
            [2, 'Électrocardiogramme', 200000],
            [3, 'Électrocardiographie (cardiaque et vasculaire)', 250000],
            [4, 'Mesure Ambulatoire de la Pression Artérielle (MAPA)', 300000],
            [5, 'Polygraphie ventilatoire', 350000],
            [6, 'Contrôle des pacemakers', 400000],
            [7, 'Implantation des stimulateurs cardiaques (pacemaker)', 800000],
            [8, 'Consultation pédiatrique (dossiers de prise en charge : mécénat France)', 180000],
            [9, 'Chirurgie cardiaque', 1500000]
        ];

        for (const [id, nom, prix] of typesQueries) {
            await pool.execute("INSERT IGNORE INTO type_consultation (id, nom, prix) VALUES (?, ?, ?)", [id, nom, prix]);
        }

        // 2. Insertion des Patients
        const patientsQueries = [
            [1, 'Diallo', 'Aminata', '620000000', 'aminata@gmail.com', 'F', '123456'],
            [5, 'Test', 'Patient', '620000000', null, null, ''],
            [6, 'baldé', 'oumou fally', '627634812', 'baldeoumoufally14@gmail.com', 'F', 'sacko@1'],
            [7, 'sacko', 'mamady', '612374585', 'sacko2120@gmail.com', 'M', 'zanka']
        ];

        for (const [id, nom, prenom, tel, email, sexe, pass] of patientsQueries) {
            await pool.execute(
                "INSERT IGNORE INTO patient (id, nom, prenom, telephone, email, sexe, mot_de_passe) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, nom, prenom, tel, email, sexe, pass]
            );
        }

        console.log('✅ Données insérées avec succès !');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        process.exit(0);
    }
}

populate();
