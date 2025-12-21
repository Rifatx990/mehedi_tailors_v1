
import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import 'dotenv/config';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mehedi_atelier',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function run() {
  console.log('--- ATELIER DATABASE INITIALIZATION ---');
  try {
    // Check if SQL files exist
    if (!fs.existsSync('database.sql') || !fs.existsSync('seeder.sql')) {
      throw new Error('Required SQL files (database.sql or seeder.sql) are missing from the root directory.');
    }

    const schemaSql = fs.readFileSync('database.sql', 'utf8');
    const seederSql = fs.readFileSync('seeder.sql', 'utf8');

    console.log('Applying Schema...');
    await pool.query(schemaSql);
    
    console.log('Applying Seeder Data...');
    await pool.query(seederSql);

    console.log('SUCCESS: Database is synchronized with the latest PostgreSQL schema.');
  } catch (err) {
    console.error('DATABASE INITIALIZATION FAILED:');
    console.error(err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
