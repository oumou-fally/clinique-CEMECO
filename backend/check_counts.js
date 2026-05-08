const pool = require('./config/db');

async function checkData() {
    try {
        const [patients] = await pool.execute('SELECT COUNT(*) as count FROM patient');
        const [types] = await pool.execute('SELECT COUNT(*) as count FROM type_consultation');
        console.log(`Patients: ${patients[0].count}`);
        console.log(`Services: ${types[0].count}`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkData();
