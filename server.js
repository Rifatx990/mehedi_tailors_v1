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

// Trace Middleware
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        console.log(`[GATEWAY] ${new Date().toLocaleTimeString()} | ${req.method} ${req.url}`);
    }
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
        console.error('Database Error:', err.message);
        throw err;
    }
};

// --- SSLCOMMERZ CONFIG ---
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

// --- RECURSIVE TRANSFORMERS ---
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

// --- ROBUST SMTP SYSTEM ---
const sendMail = async ({ to, subject, html }) => {
  try {
    const configRes = await query('SELECT * FROM system_config WHERE id = 1');
    const config = configRes.rows[0] || {};

    const transporter = nodemailer.createTransport({
      host: config.smtp_host || process.env.SMTP_HOST || "smtp.gmail.com",
      port: config.smtp_port || process.env.SMTP_PORT || 587,
      secure: config.secure ?? (config.smtp_port === 465), 
      connectionTimeout: 30000, 
      greetingTimeout: 30000,
      socketTimeout: 35000,
      auth: {
        user: config.smtp_user || process.env.SMTP_USER,
        pass: config.smtp_pass || process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"${config.site_name || 'Mehedi Tailors & Fabrics'}" <${config.smtp_user || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });

    console.log("✅ Email Sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Email Failed:", err.message);
    return false;
  }
};

const apiRouter = express.Router();

// --- SSLCOMMERZ CORE SECURED LOGIC (Using Native Fetch) ---

const verifyAndFinalizePayment = async (orderId, valId) => {
    try {
        const validationURL = `${SSL_VALIDATION_API}?val_id=${valId}&store_id=${SSL_STORE_ID}&store_passwd=${SSL_STORE_PASS}&format=json`;
        const response = await fetch(validationURL);
        const v = await response.json();

        if (v.status === 'VALID' || v.status === 'VALIDATED') {
            const orderRes = await query('SELECT total, paid_amount FROM orders WHERE id = $1', [orderId]);
            if (orderRes.rowCount === 0) throw new Error("Order lost in archive.");
            
            const order = orderRes.rows[0];
            const isFullPayment = Number(v.amount) >= Number(order.total);
            const newPaymentStatus = isFullPayment ? 'Fully Paid' : 'Partially Paid';

            await query(
                `UPDATE orders SET payment_status = $1, ssl_val_id = $2, ssl_payment_details = $3, status = 'In Progress' WHERE id = $4`,
                [newPaymentStatus, valId, JSON.stringify(v), orderId]
            );

            await sendMail({
                to: v.cus_email,
                subject: `Handshake Confirmed: Order #${orderId}`,
                html: `<h2>Sartorial Confirmation</h2><p>Your payment of BDT ${v.amount} for Order #${orderId} has been verified.</p><p>Artisans have been notified to begin production.</p>`
            });

            return { success: true, orderId };
        }
        return { success: false, reason: v.status };
    } catch (err) {
        console.error("Finalization Error:", err.message);
        return { success: false, error: err.message };
    }
};

apiRouter.post('/payment/init', async (req, res) => {
    try {
        const order = req.body;
        const tran_id = order.id;

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
            shipping_method: 'Courier',
            product_name: order.items.map(i => i.name).join(', '),
            product_category: 'Apparel',
            product_profile: 'general',
            cus_name: order.customerName,
            cus_email: order.customerEmail,
            cus_add1: order.address,
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: order.phone || '01700000000',
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
            throw new Error(data.failedreason || "SSL Initialization Failed");
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/payment/success', async (req, res) => {
    const { id } = req.query;
    const { val_id } = req.body;
    const result = await verifyAndFinalizePayment(id, val_id);
    
    if (result.success) {
        res.redirect(`${APP_BASE_URL}/#/order-success/${id}`);
    } else {
        res.redirect(`${APP_BASE_URL}/#/checkout?error=validation_failed`);
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
        console.log(`[IPN] Validating background transaction for ${tran_id}`);
        await verifyAndFinalizePayment(tran_id, val_id);
    }
    res.status(200).send("IPN Processed");
});

// --- RESTFUL ENDPOINTS ---

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
        
        if (req.body.status) {
            await sendMail({
                to: result.rows[0].customer_email,
                subject: `Order Status Updated: #${req.params.id}`,
                html: `<h2>Order Update</h2><p>Your artisan commission #${req.params.id} status is now: <strong>${req.body.status}</strong></p><p>View your dashboard for details.</p>`
            });
        }
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