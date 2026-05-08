const pool = require('../config/db');

const sql = `
TRUNCATE TABLE type_consultation;
INSERT INTO type_consultation (id, nom, prix) VALUES
(1, 'Consultation', '150000.00'),
(2, 'Électrocardiogramme', '200000.00'),
(3, 'Électrocardiographie (cardiaque et vasculaire)', '250000.00'),
(4, 'Mesure Ambulatoire de la Pression Artérielle (MAPA)', '300000.00'),
(5, 'Polygraphie ventilatoire', '350000.00'),
(6, 'Contrôle des pacemakers', '400000.00'),
(7, 'Implantation des stimulateurs cardiaques (pacemaker)', '800000.00'),
(8, 'Consultation pédiatrique (dossiers de prise en charge : mécénat France)', '180000.00'),
(9, 'Chirurgie cardiaque', '1500000.00');
`;

const run = async () => {
    try {
        const queries = sql.split(';').filter(q => q.trim());
        for (let q of queries) {
            await pool.execute(q);
        }
        console.log('✅ Tarifs Seeded successfully');
    } catch (e) {
        console.error('❌ SQL Error:', e);
    } finally {
        process.exit(0);
    }
};

run();
