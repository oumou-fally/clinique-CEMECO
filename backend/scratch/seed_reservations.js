const pool = require('../config/db');

const sql = `
DROP TABLE IF EXISTS reservation;
CREATE TABLE IF NOT EXISTS reservation (
  id_reservation int NOT NULL AUTO_INCREMENT,
  patient_id int DEFAULT NULL,
  id_medecin int DEFAULT NULL,
  id_secretaire int DEFAULT NULL,
  date_rendez_vous date DEFAULT NULL,
  heure_rendez_vous time DEFAULT NULL,
  statut enum('attente','confirme','annule','termine','reporte','attribue','') DEFAULT 'attente',
  motif text,
  motif_report text,
  notif_patient tinyint DEFAULT '0',
  notif_medecin tinyint DEFAULT '0',
  notif_secretaire tinyint DEFAULT '0',
  PRIMARY KEY (id_reservation)
);

INSERT INTO reservation (id_reservation, patient_id, id_medecin, id_secretaire, date_rendez_vous, heure_rendez_vous, statut, motif, motif_report, notif_patient, notif_medecin, notif_secretaire) VALUES
(1, 1, 1, 1, '2026-04-30', '10:00:00', 'attente', 'Consultation générale', NULL, 0, 1, 0),
(2, 5, 1, 2, '2026-04-30', '10:00:00', 'attente', 'Consultation générale', NULL, 0, 0, 0),
(3, 10, 1, 1, '2026-05-02', '09:30:00', 'confirme', 'Douleurs générales', NULL, 0, 0, 0),
(4, 1, NULL, 1, '2026-05-10', '09:00:00', 'attente', 'Consultation test', NULL, 0, 0, 0),
(5, 1, NULL, 1, '2026-04-26', '17:00:00', 'attente', 'Polygraphie ventilatoire', NULL, 0, 0, 0),
(6, 1, NULL, 1, '2026-04-26', '15:30:00', 'attente', 'Contrôle des pacemakers', NULL, 0, 0, 0),
(7, 1, NULL, 1, '2026-04-26', '08:00:00', 'attente', 'Chirurgie cardiaque', NULL, 0, 0, 0),
(8, 1, NULL, 1, '2026-04-26', '11:30:00', 'attente', 'Polygraphie ventilatoire', NULL, 0, 0, 0),
(9, 1, NULL, 1, '2026-04-26', '08:00:00', 'attente', 'Contrôle des pacemakers', NULL, 0, 0, 0),
(10, 1, NULL, 1, '2026-04-26', '11:30:00', 'attente', 'Consultation', NULL, 0, 0, 0),
(11, 1, NULL, 1, '2026-04-27', '15:00:00', 'attente', 'Chirurgie cardiaque', NULL, 0, 0, 0),
(12, 1, 3, 1, '2026-05-12', '10:30:00', 'reporte', 'Consultation', 'etyyuiuo', 1, 1, 0),
(13, 1, NULL, 1, '2026-05-14', '13:30:00', 'reporte', 'Consultation', 'azertyui', 1, 0, 0),
(14, 1, NULL, 1, '2026-04-30', '15:00:00', 'confirme', 'Consultation', NULL, 1, 0, 0),
(15, 1, NULL, 1, '2026-04-30', '16:30:00', 'annule', 'Électrocardiogramme', NULL, 1, 0, 0),
(16, 1, NULL, 1, '2026-04-29', '09:00:00', 'annule', 'Consultation', NULL, 1, 0, 0),
(17, 1, 3, 1, '2026-04-30', '16:30:00', 'attente', 'Contrôle des pacemakers', NULL, 0, 1, 0),
(18, 1, NULL, 1, '2026-04-30', '14:30:00', 'confirme', 'Implantation des stimulateurs cardiaques (pacemaker)', NULL, 0, 0, 0),
(19, 1, 3, 1, '2026-04-29', '17:00:00', 'termine', 'Chirurgie cardiaque', NULL, 1, 1, 0),
(20, 1, 3, 1, '2026-04-30', '14:00:00', 'termine', 'Chirurgie cardiaque', NULL, 1, 1, 0),
(21, 1, 3, 1, '2026-04-29', '10:00:00', 'attente', 'Chirurgie cardiaque', NULL, 0, 1, 0),
(22, 7, NULL, 1, '2026-05-05', '10:30:00', 'confirme', 'Implantation des stimulateurs cardiaques (pacemaker)', NULL, 1, 0, 0),
(23, 1, NULL, 1, '2026-05-31', '16:30:00', 'reporte', 'Polygraphie ventilatoire', 'ezrtyuio', 1, 0, 0);
`;

const run = async () => {
    try {
        const queries = sql.split(';').filter(q => q.trim());
        for (let q of queries) {
            await pool.execute(q);
        }
        console.log('✅ SQL Executed successfully');
    } catch (e) {
        console.error('❌ SQL Error:', e);
    } finally {
        process.exit(0);
    }
};

run();
