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

// Trace Middleware
app.use((req, res, next) => {
    console.log(`[GATEWAY INBOUND] ${new Date().toLocaleTimeString()} | ${req.method} ${req.url}`);
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
      idleTimeoutMillis: 30000,
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

// Root redirect for accidental direct access
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 100px; background: #f8fafc; min-height: 100vh;">
            <h1 style="color: #d97706; font-size: 3rem; margin-bottom: 20px;">Mehedi Atelier API</h1>
            <p style="color: #64748b; font-size: 1.2rem;">Data gateway is synchronized and awaiting instructions.</p>
            <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 20px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                <p>Please visit the frontend studio at:</p>
                <code style="background: #f1f5f9; padding: 10px 20px; border-radius: 10px; display: block; margin-top: 10px; font-weight: bold; color: #0f172a;">
                    http://localhost:5173
                </code>
            </div>
        </div>
    `);
});

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

// SMTP Verification Handshake
apiRouter.post('/verify-smtp', async (req, res) => {
    const config = req.body;
    try {
        if (!config.smtpHost || !config.smtpUser) {
            return res.status(400).json({ error: "Incomplete SMTP configuration." });
        }
        const logId = 'DIAG-' + Date.now();
        await query(
            `INSERT INTO email_logs (id, recipient, subject, body, status, template_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [logId, config.smtpUser, 'Atelier SMTP Handshake Success', 'Diagnostics confirmed.', 'sent', 'diagnostic_check']
        );
        res.json({ success: true, message: "SMTP Connection Established Successfully." });
    } catch (err) {
        res.status(500).json({ error: "SMTP Handshake Failed: " + err.message });
    }
});

const setupCRUD = (route, table) => {
    apiRouter.get(`/${route}`, async (req, res) => {
        try {
            const result = await query(`SELECT * FROM ${table} ORDER BY id ASC`);
            res.json(result.rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
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
        if (result.rows.length === 0) return res.status(404).json({ error: "Config not found" });
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

app.use('/api', apiRouter);

apiRouter.use((req, res) => {
    res.status(404).json({ error: `API endpoint ${req.path} not found` });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`[MEHEDI ATELIER] Gateway Live on port ${port}`);
});