import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Trace Middleware: Monitoring handshakes for debugging 404s
app.use((req, res, next) => {
    console.log(`[ATELIER MONITOR] ${new Date().toISOString()} | ${req.method} ${req.url}`);
    next();
});

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'mehedi_atelier',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
    };

const pool = new Pool(poolConfig);

const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        console.error('Database Query Error:', err.message);
        throw err;
    }
};

const toSnake = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const snake = {};
    for (let key in obj) {
        if (key.startsWith('_')) continue;
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snake[snakeKey] = (typeof obj[key] === 'object' && obj[key] !== null) ? toSnake(obj[key]) : obj[key];
    }
    return snake;
};

const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'connected' });
    } catch (err) {
        res.status(500).json({ status: 'disconnected', error: err.message });
    }
});

const setupCRUD = (route, table) => {
    apiRouter.get(`/${route}`, async (req, res) => {
        try {
            const result = await query(`SELECT * FROM ${table} ORDER BY id ASC`);
            res.json(result.rows);
        } catch (err) { 
            console.error(`Error fetching ${route}:`, err.message);
            res.status(500).json({ error: err.message }); 
        }
    });

    apiRouter.post(`/${route}`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const result = await query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values);
            res.json(result.rows[0]);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    apiRouter.put(`/${route}/:id`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            delete body.id;
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const result = await query(`UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
            res.json(result.rows[0]);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    apiRouter.delete(`/${route}/:id`, async (req, res) => {
        try {
            await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
};

setupCRUD('users', 'users');
setupCRUD('products', 'products');
setupCRUD('upcoming', 'upcoming_products');
setupCRUD('fabrics', 'fabrics');
setupCRUD('orders', 'orders');
setupCRUD('dues', 'dues');
setupCRUD('banners', 'banners');
setupCRUD('coupons', 'coupons');
setupCRUD('gift-cards', 'gift_cards');
setupCRUD('notices', 'notices');
setupCRUD('offers', 'offers');
setupCRUD('partners', 'partners');
setupCRUD('material-requests', 'material_requests');
setupCRUD('product-requests', 'product_requests');
setupCRUD('reviews', 'reviews');
setupCRUD('emails', 'email_logs');
setupCRUD('bespoke-services', 'bespoke_services');

apiRouter.patch('/orders/:id', async (req, res) => {
    try {
        const fields = toSnake(req.body);
        delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const result = await query(`UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.get('/config', async (req, res) => {
    try {
        const result = await query('SELECT * FROM system_config WHERE id = 1');
        if (result.rowCount === 0) return res.status(404).json({ error: "Master config not seeded" });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.put('/config', async (req, res) => {
    try {
        const fields = toSnake(req.body);
        delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const result = await query(`UPDATE system_config SET ${setClause} WHERE id = 1 RETURNING *`, values);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Final explicit catch-all inside router
apiRouter.use((req, res) => {
    console.error(`[API 404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API route ${req.path} not recognized` });
});

// Primary API Mount
app.use('/api', apiRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`[MEHEDI ATELIER] Relational REST Gateway Live on port ${port}`);
});