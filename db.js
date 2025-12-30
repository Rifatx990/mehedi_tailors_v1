import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'mehedi_atelier',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    };

console.log(`[Database] Initializing connection pool for ${poolConfig.host || 'Remote Gateway'}...`);

export const pool = new Pool(poolConfig);

// Diagnostic Heartbeat
pool.on('error', (err) => {
    console.error('[Database] Unexpected error on idle client:', err.message);
});

export default pool;