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

// Trace Middleware for Handshake Debugging
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

// --- ARTISAN MAILING SYSTEM ---
const getTransporter = async () => {
    const configRes = await query('SELECT * FROM system_config WHERE id = 1');
    const config = configRes.rows[0] || {};
    
    return nodemailer.createTransport({
        host: config.smtp_host || process.env.SMTP_HOST || "smtp.gmail.com",
        port: config.smtp_port || process.env.SMTP_PORT || 587,
        secure: config.secure || false,
        auth: {
            user: config.smtp_user || process.env.SMTP_USER,
            pass: config.smtp_pass || process.env.SMTP_PASS
        }
    });
};

const sendArtisanEmail = async ({ to, subject, html }) => {
    try {
        const transporter = await getTransporter();
        const configRes = await query('SELECT site_name, sender_email FROM system_config WHERE id = 1');
        const config = configRes.rows[0] || {};
        
        const info = await transporter.sendMail({
            from: `"${config.site_name || 'Mehedi Tailors'}" <${config.sender_email || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log("✅ Email Dispatched:", info.messageId);
        return true;
    } catch (err) {
        console.error("❌ Mailing Failed:", err.message);
        return false;
    }
};

// --- UTILITIES ---
const toSnake = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const snake = {};
    for (let key in obj) {
        if (key.startsWith('_')) continue;
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const val = obj[key];
        // Ensure complex arrays/objects are stored as JSON strings for PG JSONB
        snake[snakeKey] = (val !== null && typeof val === 'object') ? JSON.stringify(val) : val;
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
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    apiRouter.post(`/${route}`, async (req, res) => {
        try {
            const body = toSnake(req.body);
            const keys = Object.keys(body);
            const values = Object.values(body);
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
            const values = Object.values(body);
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

// Specialized Handlers
apiRouter.patch('/orders/:id', async (req, res) => {
    try {
        const fields = toSnake(req.body);
        delete fields.id;
        const keys = Object.keys(fields);
        const values = Object.values(fields);
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const result = await query(`UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
        
        // Automated Email on Status Change
        if (req.body.status) {
            await sendArtisanEmail({
                to: result.rows[0].customer_email,
                subject: `Order Update: #${req.params.id}`,
                html: `<h3>Status: ${req.body.status}</h3><p>Your artisan commission is being handled with precision. Tracking: <a href="https://meheditailors.com/#/track-order?id=${req.params.id}">View Pipeline</a></p>`
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
        const values = Object.values(fields);
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
            secure: req.body.secure,
            auth: { user: req.body.smtpUser, pass: req.body.smtpPass }
        });
        await transporter.verify();
        res.json({ success: true, message: "SMTP Handshake Successful" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.use('/api', apiRouter);