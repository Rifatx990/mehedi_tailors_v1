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
    };

const pool = new Pool(poolConfig);

const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        console.error('Database Error:', err.message);
        throw err;
    }
};

const SSL_STORE_ID = process.env.SSL_STORE_ID;
const SSL_STORE_PASS = process.env.SSL_STORE_PASS;
const SSL_IS_LIVE = process.env.SSL_IS_LIVE === 'true';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5000';

const SSL_INIT_API = SSL_IS_LIVE 
  ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php" 
  : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

const SSL_VALIDATION_API = SSL_IS_LIVE
  ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
  : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

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

const validateAndUpdateOrder = async (orderId, valId) => {
    try {
        const validationURL = `${SSL_VALIDATION_API}?val_id=${valId}&store_id=${SSL_STORE_ID}&store_passwd=${SSL_STORE_PASS}&format=json`;
        const response = await fetch(validationURL);
        const v = await response.json();

        if (v.status === 'VALID' || v.status === 'VALIDATED') {
            await query(
                `UPDATE orders SET payment_status = $1, ssl_val_id = $2, ssl_payment_details = $3, status = 'In Progress' WHERE id = $4`,
                ['Fully Paid', valId, JSON.stringify(v), orderId]
            );
            return true;
        }
        return false;
    } catch (err) {
        console.error("SSL Validation Error:", err.message);
        return false;
    }
};

const apiRouter = express.Router();

apiRouter.post('/payment/init', async (req, res) => {
    try {
        const order = req.body;
        const tran_id = order.id;

        // SSLCommerz Mandatory Payload V4
        const details = {
            store_id: SSL_STORE_ID,
            store_passwd: SSL_STORE_PASS,
            total_amount: order.paidAmount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${APP_BASE_URL}/api/payment/success?id=${tran_id}`,
            fail_url: `${APP_BASE_URL}/api/payment/fail?id=${tran_id}`,
            cancel_url: `${APP_BASE_URL}/api/payment/cancel?id=${tran_id}`,
            ipn_url: `${APP_BASE_URL}/api/payment/ipn`,
            shipping_method: 'YES', // Set to YES for physical products
            num_of_item: order.items.length,
            product_name: order.items.map(i => i.name).join(', ').substring(0, 255),
            product_category: 'Apparel',
            product_profile: 'physical-goods',
            // Customer Information (Mandatory)
            cus_name: order.customerName || 'Anonymous Patron',
            cus_email: order.customerEmail || 'patron@meheditailors.com',
            cus_add1: order.address || 'Ashulia, Savar',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: order.phone || '01700000000',
            // Shipping Information (MANDATORY FIX)
            ship_name: order.customerName || 'Anonymous Patron',
            ship_add1: order.address || 'Ashulia, Savar',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: '1000',
            ship_country: 'Bangladesh'
        };

        const formBody = Object.keys(details)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
            .join('&');

        const response = await fetch(SSL_INIT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody
        });

        const data = await response.json();

        if (data.status === 'SUCCESS') {
            const body = toSnake(order);
            const keys = Object.keys(body);
            const values = Object.values(body).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            
            await query(`INSERT INTO orders (${keys.join(', ')}, ssl_tran_id) VALUES (${placeholders}, $${keys.length + 1})`, [...values, tran_id]);
            
            res.json({ url: data.GatewayPageURL });
        } else {
            console.error("SSL Error Response:", data);
            throw new Error(data.failedreason || "SSL Initialization Failed");
        }
    } catch (err) {
        console.error("Backend Payment Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/payment/success', async (req, res) => {
    const { id } = req.query;
    const { val_id } = req.body;
    const isValid = await validateAndUpdateOrder(id, val_id);
    if (isValid) {
        res.redirect(`${APP_BASE_URL}/#/order-success/${id}`);
    } else {
        res.redirect(`${APP_BASE_URL}/#/payment-fail?error=validation_failed`);
    }
});

apiRouter.post('/payment/fail', (req, res) => {
    res.redirect(`${APP_BASE_URL}/#/payment-fail`);
});

apiRouter.post('/payment/cancel', (req, res) => {
    res.redirect(`${APP_BASE_URL}/#/payment-cancel`);
});

apiRouter.post('/payment/ipn', async (req, res) => {
    const { tran_id, val_id, status } = req.body;
    if (status === 'VALID' || status === 'VALIDATED') {
        await validateAndUpdateOrder(tran_id, val_id);
    }
    res.status(200).send("IPN Processed");
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
            const values = Object.values(body).map(v => 
              (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null)
            );
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
            const values = Object.values(body).map(v => 
              (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null)
            );
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
setupCRUD('emails', 'email_logs');
setupCRUD('material-requests', 'material_requests');
setupCRUD('product-requests', 'product_requests');
setupCRUD('reviews', 'reviews');
setupCRUD('bespoke-services', 'bespoke_services');

apiRouter.patch('/orders/:id', async (req, res) => {
    try {
        const fields = toSnake(req.body);
        delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => 
          (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null)
        );
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const result = await query(`UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.get('/config', async (req, res) => {
    try {
        const result = await query('SELECT * FROM system_config WHERE id = 1');
        res.json(result.rows[0] || {});
    } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.put('/config', async (req, res) => {
    try {
        const fields = toSnake(req.body);
        delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields).map(v => 
          (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v ?? null)
        );
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const result = await query(`UPDATE system_config SET ${setClause} WHERE id = 1 RETURNING *`, values);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.post('/verify-smtp', async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: req.body.smtpHost,
            port: req.body.smtpPort,
            secure: req.body.secure ?? (req.body.smtpPort === 465),
            connectionTimeout: 30000, 
            greetingTimeout: 30000,
            auth: { user: req.body.smtpUser, pass: req.body.smtpPass }
        });
        await transporter.verify();
        res.json({ success: true, message: "Handshake Successful" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.use('/api', apiRouter);