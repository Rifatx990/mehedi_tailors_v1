import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import 'dotenv/config';

// Robust connection logic: Prioritize connection strings for cloud environments
const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'mehedi_atelier',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

async function run() {
  console.log('--- MEHEDI ATELIER: POSTGRESQL INITIALIZATION ---');
  console.log(`Connecting as: ${poolConfig.user || 'Connection String User'}`);
  
  try {
    // 1. Verify existence of SQL artifacts
    if (!fs.existsSync('database.sql') || !fs.existsSync('seeder.sql')) {
      throw new Error('Crucial SQL artifacts (database.sql / seeder.sql) are missing from root.');
    }

    // 2. Read and sanitize (strip UTF-8 BOM if present)
    const schemaSql = fs.readFileSync('database.sql', 'utf8').replace(/^\uFEFF/, '');
    const seederSql = fs.readFileSync('seeder.sql', 'utf8').replace(/^\uFEFF/, '');

    console.log('Executing Relational Schema Definition...');
    await pool.query(schemaSql);
    
    console.log('Injecting Artisan Seeder Data...');
    await pool.query(seederSql);

    console.log('SUCCESS: Global Ledger Synchronized and Secure.');
  } catch (err) {
    console.error('CRITICAL DATABASE FAILURE:');
    console.error(err.message);
    
    if (err.message.includes('role "postgres" does not exist')) {
        console.error('\n--- CONFIGURATION ERROR ---');
        console.error('The default user "postgres" is rejected by your environment.');
        console.error('Please configure DB_USER in your .env or environment variables.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();