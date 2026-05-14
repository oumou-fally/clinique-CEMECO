const pool = require('../config/db');

async function updateConsultationTypes() {
    try {
        console.log('🚀 Mise à jour des types de consultation...');

        // Vider la table existante pour éviter les doublons ou conflits d'ID
        await pool.query('TRUNCATE TABLE type_consultation');

        // Insérer les nouvelles données
        await pool.query(`
            INSERT INTO \`type_consultation\` (\`id\`, \`nom\`, \`prix\`) VALUES
            (1, 'Consultation', '150000.00'),
            (2, 'Électrocardiogramme', '200000.00'),
            (3, 'Électrocardiographie (cardiaque et vasculaire)', '250000.00'),
            (4, 'Mesure Ambulatoire de la Pression Artérielle (MAPA)', '300000.00'),
            (5, 'Polygraphie ventilatoire', '350000.00'),
            (6, 'Contrôle des pacemakers', '400000.00'),
            (7, 'Implantation des stimulateurs cardiaques (pacemaker)', '800000.00'),
            (8, 'Consultation pédiatrique (dossiers de prise en charge : mécénat France)', '180000.00'),
            (9, 'Chirurgie cardiaque', '1500000.00');
        `);

        console.log('✅ Types de consultation mis à jour avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        process.exit(1);
    }
}

updateConsultationTypes();
