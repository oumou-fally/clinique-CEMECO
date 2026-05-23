const pool = require('../config/db');

async function desc() {
    try {
        const [columns] = await pool.execute('DESCRIBE factures');
        console.log('Factures columns:', columns.map(c => ({ name: c.Field, type: c.Type, null: c.Null })));
    } catch (error) {
        console.error('Error describing:', error);
    } finally {
        process.exit();
    }
}

desc();
