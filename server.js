import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
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
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    };

const pool = new Pool(poolConfig);

// Diagnostic test
pool.query('SELECT 1').then(() => {
    console.log('PostgreSQL: Authority Established.');
}).catch(err => {
    console.error('PostgreSQL: Connection Lost. Detail:', err.message);
});

const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        console.error('DB Error:', err.message);
        throw err;
    }
};

const toSnake = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnake);
    const snake = {};
    for (let key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snake[snakeKey] = toSnake(obj[key]);
    }
    return snake;
};

const apiRouter = express.Router();

apiRouter.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'connected', time: new Date() });
    } catch (err) {
        res.status(503).json({ status: 'disconnected', error: err.message });
    }
});

// --- BKASH CORE ---
const { BKASH_BASE_URL, BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD, APP_BASE_URL } = process.env;

async function getBkashToken() {
  const response = await fetch(`${BKASH_BASE_URL}/checkout/token/grant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'username': BKASH_USERNAME, 'password': BKASH_PASSWORD },
    body: JSON.stringify({ app_key: BKASH_APP_KEY, app_secret: BKASH_APP_SECRET })
  });
  const data = await response.json();
  if (!data.id_token) throw new Error(data.statusMessage || "bKash Token Failed");
  return data.id_token;
}

apiRouter.post('/bkash/create', async (req, res) => {
  try {
    const order = req.body;
    const token = await getBkashToken();
    const response = await fetch(`${BKASH_BASE_URL}/checkout/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token, 'X-APP-Key': BKASH_APP_KEY },
      body: JSON.stringify({
        amount: Number(order.paidAmount).toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: order.id,
        callbackURL: `${APP_BASE_URL}/api/bkash/callback?id=${order.id}`
      })
    });
    const data = await response.json();
    
    // Preliminary save
    const body = toSnake(order);
    const keys = Object.keys(body);
    const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    await query(`INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, values);

    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.get('/bkash/callback', async (req, res) => {
    const { id, paymentID, status } = req.query;
    if (status === 'success') {
        res.redirect(`${APP_BASE_URL}/#/checkout?bkash_status=execute&paymentID=${paymentID}&orderId=${id}`);
    } else {
        res.redirect(`${APP_BASE_URL}/#/payment-fail`);
    }
});

apiRouter.post('/bkash/execute', async (req, res) => {
  try {
    const { paymentID, orderId } = req.body;
    const token = await getBkashToken();
    const response = await fetch(`${BKASH_BASE_URL}/checkout/payment/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token, 'X-APP-Key': BKASH_APP_KEY },
      body: JSON.stringify({ paymentID })
    });
    const data = await response.json();
    if (data.transactionStatus === "Completed") {
      await query(`UPDATE orders SET payment_status = $1, bkash_trx_id = $2, bkash_payment_details = $3, status = 'In Progress' WHERE id = $4`, ['Fully Paid', data.trxID, JSON.stringify(data), orderId]);
      return res.json({ success: true, trxID: data.trxID });
    }
    res.status(400).json({ error: data.statusMessage || "bKash execute failed" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SSLCOMMERZ CORE ---
const { SSL_STORE_ID, SSL_STORE_PASS, SSL_IS_LIVE } = process.env;
const SSL_INIT_API = (SSL_IS_LIVE === 'true') ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php" : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const SSL_VALIDATION_API = (SSL_IS_LIVE === 'true') ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php" : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

apiRouter.post('/payment/init', async (req, res) => {
    try {
        const order = req.body;
        const details = {
            store_id: SSL_STORE_ID, store_passwd: SSL_STORE_PASS, total_amount: order.paidAmount, currency: 'BDT', tran_id: order.id,
            success_url: `${APP_BASE_URL}/api/payment/success?id=${order.id}`,
            fail_url: `${APP_BASE_URL}/api/payment/fail?id=${order.id}`,
            cancel_url: `${APP_BASE_URL}/api/payment/cancel?id=${order.id}`,
            ipn_url: `${APP_BASE_URL}/api/payment/ipn`,
            shipping_method: 'YES', num_of_item: order.items.length, product_name: order.items.map(i => i.name).join(', ').substring(0, 255),
            product_category: 'Apparel', product_profile: 'physical-goods',
            cus_name: order.customerName || 'Patron', cus_email: order.customerEmail || 'patron@meheditailors.com', cus_add1: order.address || 'Ashulia', cus_city: 'Dhaka', cus_country: 'Bangladesh', cus_phone: order.phone || '01700000000',
            ship_name: order.customerName || 'Patron', ship_add1: order.address || 'Ashulia', ship_city: 'Dhaka', ship_country: 'Bangladesh'
        };
        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');
        const response = await fetch(SSL_INIT_API, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formBody });
        const data = await response.json();
        if (data.status === 'SUCCESS') {
            const body = toSnake(order);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            await query(`INSERT INTO orders (${keys.join(', ')}, ssl_tran_id) VALUES (${placeholders}, $${keys.length + 1}) ON CONFLICT (id) DO NOTHING`, [...values, order.id]);
            res.json({ url: data.GatewayPageURL });
        } else throw new Error(data.failedreason || "SSL Initialization Failed");
    } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.post('/payment/success', async (req, res) => {
    const { id } = req.query;
    const { val_id } = req.body;
    const vURL = `${SSL_VALIDATION_API}?val_id=${val_id}&store_id=${SSL_STORE_ID}&store_passwd=${SSL_STORE_PASS}&format=json`;
    const response = await fetch(vURL);
    const v = await response.json();
    if (v.status === 'VALID' || v.status === 'VALIDATED') {
        await query(`UPDATE orders SET payment_status = $1, ssl_val_id = $2, ssl_payment_details = $3, status = 'In Progress' WHERE id = $4`, ['Fully Paid', val_id, JSON.stringify(v), id]);
        res.redirect(`${APP_BASE_URL}/#/order-success/${id}`);
    } else res.redirect(`${APP_BASE_URL}/#/payment-fail`);
});

// CRUD Logic
const setupCRUD = (route, table) => {
    apiRouter.get(`/${route}`, async (req, res) => {
        try { res.json((await query(`SELECT * FROM ${table} ORDER BY id DESC`)).rows); } catch (e) { res.status(500).json({ error: e.message }); }
    });
    apiRouter.post(`/${route}`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            res.json((await query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values)).rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    apiRouter.put(`/${route}/:id`, async (req, res) => {
        try {
            const body = toSnake(req.body); delete body.id;
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            res.json((await query(`UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values])).rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
    apiRouter.delete(`/${route}/:id`, async (req, res) => {
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
// FIX: Added missing CRUD route for upcoming products
setupCRUD('upcoming', 'upcoming_products');

apiRouter.get('/config', async (req, res) => { res.json((await query('SELECT * FROM system_config WHERE id = 1')).rows[0] || {}); });
apiRouter.put('/config', async (req, res) => {
    try {
        const fields = toSnake(req.body); delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        res.json((await query(`UPDATE system_config SET ${setClause} WHERE id = 1 RETURNING *`, values)).rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use('/api', apiRouter);
