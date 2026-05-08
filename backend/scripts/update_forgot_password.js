const pool = require('../config/db');

const requiredColumns = [
  { name: 'reset_otp', definition: 'VARCHAR(6) DEFAULT NULL' },
  { name: 'reset_otp_expiry', definition: 'DATETIME DEFAULT NULL' },
  { name: 'reset_otp_attempts', definition: 'INT DEFAULT 0' },
  { name: 'reset_token', definition: 'VARCHAR(255) DEFAULT NULL' },
  { name: 'reset_token_expiry', definition: 'DATETIME DEFAULT NULL' }
];

async function migrate() {
  try {
    const tables = ['patient', 'medecin', 'secretaire', 'admin'];

    for (const table of tables) {
      console.log(`Checking table: ${table}`);

      const [tableRows] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
      if (tableRows.length === 0) {
        console.log(`⚠️ Table ${table} introuvable, passage au suivant.`);
        continue;
      }

      const missingColumns = [];
      for (const column of requiredColumns) {
        const [rows] = await pool.execute(`SHOW COLUMNS FROM ${table} LIKE '${column.name}'`);
        if (rows.length === 0) {
          missingColumns.push(column);
        }
      }

      if (missingColumns.length === 0) {
        console.log(`ℹ️ Table ${table} already has all reset columns.`);
        continue;
      }

      const adds = missingColumns
        .map((column) => `ADD COLUMN ${column.name} ${column.definition}`)
        .join(',\n          ');

      console.log(`Adding missing columns to ${table}: ${missingColumns.map(c => c.name).join(', ')}`);
      await pool.execute(`ALTER TABLE ${table}\n          ${adds}`);
      console.log(`✅ Table ${table} updated.`);
    }

    console.log('🏁 Migration finished.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
