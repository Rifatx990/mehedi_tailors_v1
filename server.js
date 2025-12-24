import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';

export const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'mehedi_atelier',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    };

const pool = new Pool(poolConfig);

const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        console.error('SQL Ledger Error:', err.message);
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

// Route Controller (Relative to root because Vite mounts at /api)
const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'connected', timestamp: new Date() });
    } catch (err) {
        res.status(503).json({ status: 'disconnected', error: err.message });
    }
});

// --- BKASH TOKENIZED GATEWAY ---
const { 
  BKASH_IS_LIVE, BKASH_SANDBOX_URL, BKASH_LIVE_URL, 
  BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD,
  APP_BASE_URL 
} = process.env;

const BKASH_URL = (BKASH_IS_LIVE === 'true') ? BKASH_LIVE_URL : BKASH_SANDBOX_URL;

async function getBkashToken() {
    const response = await fetch(`${BKASH_URL}/checkout/token/grant`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'username': BKASH_USERNAME,
            'password': BKASH_PASSWORD
        },
        body: JSON.stringify({ app_key: BKASH_APP_KEY, app_secret: BKASH_APP_SECRET })
    });
    const data = await response.json();
    if (!data.id_token) throw new Error(data.statusMessage || "bKash Token Handshake Failed");
    return data.id_token;
}

router.post('/bkash/create', async (req, res) => {
    try {
        const order = req.body;
        const token = await getBkashToken();
        const response = await fetch(`${BKASH_URL}/checkout/payment/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token,
                'X-APP-Key': BKASH_APP_KEY
            },
            body: JSON.stringify({
                amount: Number(order.paidAmount).toFixed(2),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: order.id,
                callbackURL: `${APP_BASE_URL}/api/bkash/callback?id=${order.id}`
            })
        });
        const data = await response.json();
        
        // Log Preliminary Intent
        const body = toSnake(order);
        const keys = Object.keys(body);
        const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await query(`INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, values);

        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
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
        const response = await fetch(`${BKASH_URL}/checkout/payment/execute`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token,
                'X-APP-Key': BKASH_APP_KEY
            },
            body: JSON.stringify({ paymentID })
        });
        const data = await response.json();
        if (data.transactionStatus === "Completed") {
            await query(`UPDATE orders SET payment_status = $1, bkash_trx_id = $2, bkash_payment_details = $3, status = 'In Progress' WHERE id = $4`, ['Fully Paid', data.trxID, JSON.stringify(data), orderId]);
            return res.json({ success: true, trxID: data.trxID });
        }
        res.status(400).json({ error: data.statusMessage || "Execution Failed" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SSLCOMMERZ GATEWAY ---
const { SSL_STORE_ID, SSL_STORE_PASS, SSL_IS_LIVE } = process.env;
const SSL_INIT_API = (SSL_IS_LIVE === 'true') ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php" : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

router.post('/payment/init', async (req, res) => {
    try {
        const order = req.body;
        const details = {
            store_id: SSL_STORE_ID, store_passwd: SSL_STORE_PASS, total_amount: order.paidAmount, currency: 'BDT', tran_id: order.id,
            success_url: `${APP_BASE_URL}/api/payment/success?id=${order.id}`,
            fail_url: `${APP_BASE_URL}/api/payment/fail?id=${order.id}`,
            cancel_url: `${APP_BASE_URL}/api/payment/cancel?id=${order.id}`,
            shipping_method: 'YES', num_of_item: order.items.length, product_name: order.items.map(i => i.name).join(', '),
            product_category: 'Apparel', product_profile: 'physical-goods',
            cus_name: order.customerName, cus_email: order.customerEmail, cus_add1: order.address, cus_city: 'Dhaka', cus_country: 'Bangladesh', cus_phone: order.phone
        };
        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');
        const response = await fetch(SSL_INIT_API, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formBody });
        const data = await response.json();
        if (data.status === 'SUCCESS') res.json({ url: data.GatewayPageURL });
        else throw new Error(data.failedreason || "SSL Initialization Error");
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CRUD Logic Utility
const setupCRUD = (route, table) => {
    router.get(`/${route}`, async (req, res) => {
        try { res.json((await query(`SELECT * FROM ${table} ORDER BY id DESC`)).rows); } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.post(`/${route}`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            res.json((await query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values)).rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.put(`/${route}/:id`, async (req, res) => {
        try {
            const body = toSnake(req.body); delete body.id;
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            res.json((await query(`UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values])).rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    router.delete(`/${route}/:id`, async (req, res) => {
        try { await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
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

router.get('/config', async (req, res) => { res.json((await query('SELECT * FROM system_config WHERE id = 1')).rows[0] || {}); });
router.put('/config', async (req, res) => {
    try {
        const fields = toSnake(req.body); delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        res.json((await query(`UPDATE system_config SET ${setClause} WHERE id = 1 RETURNING *`, values)).rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Mount router at root (Vite middleware adds the /api prefix)
app.use('/', router);