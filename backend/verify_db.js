const pool = require('./config/db');

async function verify() {
    try {
        const [columns] = await pool.execute('DESCRIBE reservation');
        console.log('Reservation Status Enum:', columns.find(c => c.Field === 'statut').Type);
        
        const [tables] = await pool.execute('SHOW TABLES LIKE "consultation"');
        console.log('Consultation table exists:', tables.length > 0);
    } catch (error) {
        console.error('Error verifying:', error);
    } finally {
        process.exit();
    }
}

verify();
