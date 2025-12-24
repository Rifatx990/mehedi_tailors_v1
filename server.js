import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import 'dotenv/config';

export const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Database configuration
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

// --- CORE SYSTEM ROUTES ---
app.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'connected', timestamp: new Date() });
    } catch (err) {
        res.status(503).json({ status: 'disconnected', error: err.message });
    }
});

// --- BKASH TOKENIZED GATEWAY (AXIOS IMPLEMENTATION) ---
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
                headers: { username: BKASH_USERNAME, password: BKASH_PASSWORD },
                timeout: 15000
            }
        );
        return response.data.id_token;
    } catch (err) {
        console.error("bKash Token Error:", err.response?.data || err.message);
        throw new Error("bKash Token Handshake Failed");
    }
}

app.post('/bkash/create', async (req, res) => {
    try {
        const order = req.body;
        const token = await getBkashToken();
        
        const response = await axios.post(
            `${BKASH_BASE_URL}/checkout/payment/create`,
            {
                amount: Number(order.paidAmount).toFixed(2),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: order.id,
                callbackURL: `${APP_BASE_URL}/api/bkash/callback?id=${order.id}`
            },
            {
                headers: { Authorization: token, 'X-APP-Key': BKASH_APP_KEY },
                timeout: 15000
            }
        );

        // Persistent Intent Logging
        const body = toSnake(order);
        const keys = Object.keys(body);
        const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await query(`INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, values);

        res.json(response.data);
    } catch (err) {
        console.error("bKash Create Error:", err.response?.data || err.message);
        res.status(500).json({ error: "bKash payment create failed" });
    }
});

app.get('/bkash/callback', async (req, res) => {
    const { id, paymentID, status } = req.query;
    if (status === 'success') {
        res.redirect(`${APP_BASE_URL}/#/checkout?bkash_status=execute&paymentID=${paymentID}&orderId=${id}`);
    } else {
        res.redirect(`${APP_BASE_URL}/#/payment-fail`);
    }
});

app.post('/bkash/execute', async (req, res) => {
    try {
        const { paymentID, orderId } = req.body;
        const token = await getBkashToken();

        const response = await axios.post(
            `${BKASH_BASE_URL}/checkout/payment/execute/${paymentID}`,
            {},
            {
                headers: { Authorization: token, 'X-APP-Key': BKASH_APP_KEY },
                timeout: 15000
            }
        );

        if (response.data.transactionStatus === "Completed") {
            await query(`UPDATE orders SET payment_status = $1, bkash_trx_id = $2, bkash_payment_details = $3, status = 'In Progress' WHERE id = $4`, 
                ['Fully Paid', response.data.trxID, JSON.stringify(response.data), orderId]
            );
            return res.json({ success: true, trxID: response.data.trxID, paymentID });
        }
        
        res.status(400).json({ error: "Payment not completed", status: response.data.transactionStatus });
    } catch (err) {
        console.error("bKash Execute Error:", err.response?.data || err.message);
        res.status(500).json({ error: "bKash execute failed" });
    }
});

app.get('/bkash/verify/:paymentID', async (req, res) => {
    try {
        const token = await getBkashToken();
        const response = await axios.get(
            `${BKASH_BASE_URL}/checkout/payment/query/${req.params.paymentID}`,
            {
                headers: { Authorization: token, 'X-APP-Key': BKASH_APP_KEY },
                timeout: 15000
            }
        );
        res.json(response.data);
    } catch (err) {
        console.error("bKash Verify Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Verification failed" });
    }
});

// --- SSLCOMMERZ GATEWAY ---
const { SSL_STORE_ID, SSL_STORE_PASS, SSL_IS_LIVE } = process.env;
const SSL_INIT_API = (SSL_IS_LIVE === 'true') ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php" : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

app.post('/payment/init', async (req, res) => {
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
        const response = await axios.post(SSL_INIT_API, formBody, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        if (response.data.status === 'SUCCESS') res.json({ url: response.data.GatewayPageURL });
        else throw new Error(response.data.failedreason || "SSL Initialization Error");
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CRUD GENERATORS ---
const setupCRUD = (route, table) => {
    app.get(`/${route}`, async (req, res) => {
        try { res.json((await query(`SELECT * FROM ${table} ORDER BY id DESC`)).rows); } catch (e) { res.status(500).json({ error: e.message }); }
    });
    app.post(`/${route}`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            res.json((await query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values)).rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    app.put(`/${route}/:id`, async (req, res) => {
        try {
            const body = toSnake(req.body); delete body.id;
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            res.json((await query(`UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values])).rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    app.delete(`/${route}/:id`, async (req, res) => {
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

app.get('/config', async (req, res) => { res.json((await query('SELECT * FROM system_config WHERE id = 1')).rows[0] || {}); });
app.put('/config', async (req, res) => {
    try {
        const fields = toSnake(req.body); delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        res.json((await query(`UPDATE system_config SET ${setClause} WHERE id = 1 RETURNING *`, values)).rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});