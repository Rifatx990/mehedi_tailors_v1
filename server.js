import express from 'express';
import { pool } from './db.js';
import { emailService } from './emailService.js';
import 'dotenv/config';

export const router = express.Router();

/**
 * HEALTH DIAGNOSTICS
 */
router.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'Connected to Master Ledger' });
    } catch (err) {
        res.status(500).json({ status: 'Ledger Connection Refused', error: err.message });
    }
});

/**
 * DYNAMIC CRUD UTILITY
 */
const setupCRUD = (path, table) => {
    const toSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    router.get(path, async (req, res) => {
        try {
            const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post(path, async (req, res) => {
        const body = req.body;
        const columns = [];
        const values = [];
        const placeholders = [];
        
        let i = 1;
        for (const [key, val] of Object.entries(body)) {
            if (key === '_isNew') continue;
            columns.push(toSnake(key));
            values.push(typeof val === 'object' ? JSON.stringify(val) : val);
            placeholders.push(`$${i++}`);
        }

        try {
            const query = `
                INSERT INTO ${table} (${columns.join(', ')}) 
                VALUES (${placeholders.join(', ')}) 
                ON CONFLICT (id) DO UPDATE SET 
                ${columns.map((col, idx) => `${col} = EXCLUDED.${col}`).join(', ')}
                RETURNING *`;
            const { rows } = await pool.query(query, values);
            const savedItem = rows[0];

            // TRIGGER: User Account Security Notification
            if (table === 'users' && !body._isNew && savedItem.email) {
                await emailService.notify('SECURITY_ALERT', savedItem.email, savedItem.id, {
                    email: savedItem.email,
                    name: savedItem.name
                }, 'en');
            }

            res.json(savedItem);
        } catch (err) {
            console.error(`CRUD Failure [${table}]:`, err.message);
            res.status(500).json({ error: err.message });
        }
    });

    router.delete(`${path}/:id`, async (req, res) => {
        try {
            await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};

// INITIALIZE CRUD ENDPOINTS
setupCRUD('/products', 'products');
setupCRUD('/orders', 'orders');
setupCRUD('/users', 'users');
setupCRUD('/fabrics', 'fabrics');
setupCRUD('/coupons', 'coupons');
setupCRUD('/banners', 'banners');
setupCRUD('/notices', 'notices');
setupCRUD('/offers', 'offers');
setupCRUD('/bespoke-services', 'bespoke_services');
setupCRUD('/partners', 'partners');
setupCRUD('/dues', 'dues');
setupCRUD('/material-requests', 'material_requests');
setupCRUD('/product-requests', 'product_requests');
setupCRUD('/reviews', 'reviews');
setupCRUD('/upcoming', 'upcoming_products');
setupCRUD('/gift-cards', 'gift_cards');
setupCRUD('/emails', 'email_logs');

/**
 * SPECIALIZED ENDPOINTS
 */
router.get('/config', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM system_config WHERE id = 1');
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/config', async (req, res) => {
    const body = req.body;
    const updates = [];
    const values = [1];
    
    Object.entries(body).forEach(([key, val]) => {
        if (key === 'id') return;
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updates.push(`${snakeKey} = $${values.length + 1}`);
        values.push(typeof val === 'object' ? JSON.stringify(val) : val);
    });

    try {
        const query = `UPDATE system_config SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
        const { rows } = await pool.query(query, values);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/verify-smtp', async (req, res) => {
    try {
        const config = req.body;
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_port === 465,
            auth: { user: config.smtp_user, pass: config.smtp_pass }
        });
        await transporter.verify();
        res.json({ success: true, message: 'SMTP Handshake Verified' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * TRIGGER: Order Production Update (Outbox Triggered)
 */
router.patch('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { productionStep, status } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE orders SET 
                production_step = COALESCE($1, production_step), 
                status = COALESCE($2, status),
                date = NOW()
             WHERE id = $3 RETURNING *`,
            [productionStep, status, id]
        );

        const order = result.rows[0];
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // TRIGGER: Production Update Notification
        if (order.customer_email) {
            const eventType = productionStep ? 'PRODUCTION_UPDATE' : 'ORDER_STATUS_CHANGE';
            await emailService.notify(eventType, order.customer_email, order.id, {
                orderId: order.id,
                name: order.customer_name,
                step: productionStep || order.status,
                total: order.total
            }, 'en');
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export const app = router;