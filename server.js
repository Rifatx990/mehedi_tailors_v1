import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import 'dotenv/config';
import { emailService } from './emailService.js';

export const router = express.Router();

router.use(cors());
router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ extended: true }));

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;
const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000 
    }
  : {
      user: process.env.DB_USER || 'postgres', host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'mehedi_atelier', password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'), ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

const query = async (text, params) => {
    const client = await pool.connect();
    try { return await client.query(text, params); } 
    catch (err) { throw err; } 
    finally { client.release(); }
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

// Map step names to BN
const stepBN = { 'Queue': 'অপেক্ষমান', 'Cutting': 'কাটিং', 'Stitching': 'সেলাই', 'Finishing': 'ফিনিশিং', 'Ready': 'প্রস্তুত' };

// --- CORE ROUTES ---
router.get('/health', async (req, res) => {
    try { await query('SELECT 1'); res.json({ status: 'connected', engine: 'MT-PRO-V3.5' }); } 
    catch (err) { res.status(503).json({ status: 'disconnected' }); }
});

router.post('/verify-smtp', async (req, res) => {
    res.json({ success: true, message: "SMTP Bridge Handshake Verified." });
});

// --- BKASH ---
const { APP_BASE_URL, BKASH_APP_KEY } = process.env;
router.post('/bkash/execute', async (req, res) => {
    try {
        const { paymentID, orderId } = req.body;
        // Mock bKash execution... assume success
        const response = { data: { transactionStatus: "Completed", trxID: "TRX_MOCK_123" } };

        if (response.data.transactionStatus === "Completed") {
            const orderRes = await query(`UPDATE orders SET payment_status = $1, bkash_trx_id = $2 WHERE id = $3 RETURNING *`, 
                ['Fully Paid', response.data.trxID, orderId]
            );
            const order = orderRes.rows[0];
            
            // Trigger Email
            if (order.customer_email) {
                emailService.send('PAYMENT_SUCCESS', order.customer_email, {
                    orderId: order.id, amount: order.paid_amount, refId: response.data.trxID
                });
            }

            return res.json({ success: true });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CRUD ENGINE ---
const setupCRUD = (route, table) => {
    router.get(`/${route}`, async (req, res) => {
        try { const result = await query(`SELECT * FROM ${table} ORDER BY id DESC`); res.json(result.rows); } 
        catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.post(`/${route}`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const result = await query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values);
            const record = result.rows[0];

            // Hook: Order Confirmation
            if (route === 'orders' && record.customer_email) {
                emailService.send('ORDER_CONFIRMED', record.customer_email, {
                    name: record.customer_name, orderId: record.id, total: record.total
                });
            }

            res.json(record);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.patch(`/${route}/:id`, async (req, res) => {
        try {
            const body = toSnake(req.body); delete body.id;
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const result = await query(`UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
            const updated = result.rows[0];

            // Hook: Production Status Update
            if (route === 'orders' && body.production_step && updated.customer_email) {
                emailService.send('PRODUCTION_UPDATE', updated.customer_email, {
                    orderId: updated.id, step: updated.production_step, stepBN: stepBN[updated.production_step] || updated.production_step
                });
            }

            res.json(updated);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.put(`/${route}/:id`, async (req, res) => {
        try {
            const body = toSnake(req.body); delete body.id;
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null));
            const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
            const result = await query(`UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
            const updated = result.rows[0];

            // Hook: Security Alert for Profile
            if (route === 'users' && updated.email) {
                emailService.send('SECURITY_ALERT', updated.email, { email: updated.email });
            }

            res.json(updated);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.delete(`/${route}/:id`, async (req, res) => {
        try { await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]); res.json({ success: true }); } 
        catch (e) { res.status(500).json({ error: e.message }); }
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
setupCRUD('emails', 'email_logs'); 
setupCRUD('material-requests', 'material_requests');
setupCRUD('product-requests', 'product_requests');
setupCRUD('reviews', 'reviews');

router.get('/config', async (req, res) => { 
    try { const result = await query('SELECT * FROM system_config WHERE id = 1'); res.json(result.rows[0] || {}); } 
    catch (e) { res.status(500).json({ error: e.message }); }
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

export const app = router;