import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import 'dotenv/config';

export const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Database configuration with enhanced resilience
const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'mehedi_atelier',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };

const pool = new Pool(poolConfig);

// SQL Execution Wrapper
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error('PostgreSQL Connection Error:', err.message);
        throw err;
    }
};

const toSnake = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnake);
    const snake = {};
    for (let key in obj) {
        if (key.startsWith('_')) continue;
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snake[snakeKey] = toSnake(obj[key]);
    }
    return snake;
};

// --- API ROUTER ---
const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'connected', timestamp: new Date(), engine: 'MT-POSTGRES-PRO-V2' });
    } catch (err) {
        res.status(503).json({ status: 'disconnected', error: err.message });
    }
});

// --- BKASH TOKENIZED GATEWAY (AXIOS) ---
const { 
  BKASH_IS_LIVE, BKASH_SANDBOX_URL, BKASH_LIVE_URL, 
  BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD,
  APP_BASE_URL 
} = process.env;

const BKASH_BASE_URL = (BKASH_IS_LIVE === 'true') ? BKASH_LIVE_URL : BKASH_SANDBOX_URL;

async function getBkashToken() {
    try {
        const response = await axios.post(
            `${BKASH_BASE_URL}/checkout/token/grant`,
            { app_key: BKASH_APP_KEY, app_secret: BKASH_APP_SECRET },
            {
                headers: { 
                    username: BKASH_USERNAME, 
                    password: BKASH_PASSWORD 
                },
                timeout: 15000
            }
        );
        return response.data.id_token;
    } catch (err) {
        console.error("bKash Authentication Failure:", err.response?.data || err.message);
        throw new Error("bKash Handshake Denied: Verify credentials in ENV.");
    }
}

router.post('/bkash/create', async (req, res) => {
    try {
        const order = req.body;
        const token = await getBkashToken();
        const invoice = "INV_" + Date.now();
        
        const response = await axios.post(
            `${BKASH_BASE_URL}/checkout/payment/create`,
            {
                amount: Number(order.paidAmount).toFixed(2),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: order.id || invoice,
                callbackURL: `${APP_BASE_URL}/api/bkash/callback?id=${order.id}`
            },
            {
                headers: { 
                    Authorization: token, 
                    'X-APP-Key': BKASH_APP_KEY 
                },
                timeout: 15000
            }
        );

        // Record intent in DB before redirect
        const body = toSnake(order);
        const keys = Object.keys(body);
        const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await query(`INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, values);

        res.json(response.data);
    } catch (err) {
        console.error("bKash Create Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to initiate bKash payment." });
    }
});

router.get('/bkash/callback', async (req, res) => {
    const { id, paymentID, status } = req.query;
    if (status === 'success') {
        res.redirect(`${APP_BASE_URL}/#/checkout?bkash_status=execute&paymentID=${paymentID}&orderId=${id}`);
    } else {
        res.redirect(`${APP_BASE_URL}/#/payment-fail`);
    }
});

router.post('/bkash/execute', async (req, res) => {
    try {
        const { paymentID, orderId } = req.body;
        const token = await getBkashToken();

        const response = await axios.post(
            `${BKASH_BASE_URL}/checkout/payment/execute/${paymentID}`,
            {},
            {
                headers: { 
                    Authorization: token, 
                    'X-APP-Key': BKASH_APP_KEY 
                },
                timeout: 15000
            }
        );

        if (response.data.transactionStatus === "Completed") {
            await query(`UPDATE orders SET payment_status = $1, bkash_trx_id = $2, bkash_payment_details = $3, status = 'In Progress' WHERE id = $4`, 
                ['Fully Paid', response.data.trxID, JSON.stringify(response.data), orderId]
            );
            return res.json({ success: true, trxID: response.data.trxID, paymentID });
        }
        res.status(400).json({ error: "Transaction verification incomplete.", status: response.data.transactionStatus });
    } catch (err) {
        console.error("bKash Execute Error:", err.response?.data || err.message);
        res.status(500).json({ error: "bKash execution phase failed." });
    }
});

router.get('/bkash/verify/:paymentID', async (req, res) => {
    try {
        const token = await getBkashToken();
        const response = await axios.get(
            `${BKASH_BASE_URL}/checkout/payment/query/${req.params.paymentID}`,
            {
                headers: { 
                    Authorization: token, 
                    'X-APP-Key': BKASH_APP_KEY 
                },
                timeout: 15000
            }
        );
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "External verification failed." });
    }
});

// --- CORE CRUD HANDLERS ---
const setupCRUD = (route, table) => {
    router.get(`/${route}`, async (req, res) => {
        try { 
            const result = await query(`SELECT * FROM ${table} ORDER BY id DESC`);
            res.json(result.rows); 
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.post(`/${route}`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const result = await query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values);
            res.json(result.rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.put(`/${route}/:id`, async (req, res) => {
        try {
            const body = toSnake(req.body); delete body.id;
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const result = await query(`UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
            res.json(result.rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.delete(`/${route}/:id`, async (req, res) => {
        try { 
            await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]); 
            res.json({ success: true }); 
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
};

setupCRUD('users', 'users');
setupCRUD('products', 'products');
setupCRUD('orders', 'orders');
setupCRUD('fabrics', 'fabrics');
setupCRUD('coupons', 'coupons');
setupCRUD('gift-cards', 'gift_cards');
setupCRUD('dues', 'dues');
setupCRUD('bespoke-services', 'bespoke_services');
setupCRUD('banners', 'banners');
setupCRUD('notices', 'notices');
setupCRUD('offers', 'offers');
setupCRUD('partners', 'partners');
setupCRUD('upcoming', 'upcoming_products');

router.get('/config', async (req, res) => { 
    try {
        const result = await query('SELECT * FROM system_config WHERE id = 1');
        res.json(result.rows[0] || {}); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/config', async (req, res) => {
    try {
        const fields = toSnake(req.body); delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const result = await query(`UPDATE system_config SET ${setClause} WHERE id = 1 RETURNING *`, values);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Final mounting: Vite strips the /api prefix before reaching this handler.
app.use('/', router);