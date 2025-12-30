import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

// Most cloud providers (Neon, Render, Supabase) require SSL. 
// We use rejectUnauthorized: false for maximum compatibility with self-signed certs common in these environments.
const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: { rejectUnauthorized: false },
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

console.log(`[Database] Initiating pool for ${poolConfig.host || 'Authenticated Gateway'}...`);

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('[Database] Idle client critical failure:', err.message);
});

export default pool;