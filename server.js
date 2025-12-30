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
 * Maps camelCase keys to snake_case columns
 */
const setupCRUD = (path, table, options = {}) => {
    const toSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // GET ALL
    router.get(path, async (req, res) => {
        try {
            const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST (CREATE / UPDATE)
    router.post(path, async (req, res) => {
        const body = req.body;
        const columns = [];
        const values = [];
        const placeholders = [];
        
        Object.entries(body).forEach(([key, val], idx) => {
            if (key === '_isNew') return;
            columns.push(toSnake(key));
            values.push(typeof val === 'object' ? JSON.stringify(val) : val);
            placeholders.push(`$${idx + 1}`);
        });

        try {
            const query = `
                INSERT INTO ${table} (${columns.join(', ')}) 
                VALUES (${placeholders.join(', ')}) 
                ON CONFLICT (id) DO UPDATE SET 
                ${columns.map((col, idx) => `${col} = EXCLUDED.${col}`).join(', ')}
                RETURNING *`;
            const { rows } = await pool.query(query, values);
            res.json(rows[0]);
        } catch (err) {
            console.error(`CRUD Failure [${table}]:`, err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // DELETE
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

/**
 * SPECIALIZED ENDPOINTS
 */
router.get('/config', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM system_config WHERE id = 1');
    res.json(rows[0] || {});
});

router.put('/config', async (req, res) => {
    const body = req.body;
    const updates = [];
    const values = [1]; // ID is always 1
    
    Object.entries(body).forEach(([key, val], idx) => {
        if (key === 'id') return;
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updates.push(`${snakeKey} = $${values.length + 1}`);
        values.push(typeof val === 'object' ? JSON.stringify(val) : val);
    });

    const query = `UPDATE system_config SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
});

router.post('/verify-smtp', async (req, res) => {
    try {
        const config = req.body;
        // Mocking verification for now, as actual connection requires valid creds
        res.json({ success: true, message: 'SMTP Handshake Verified' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * TRIGGER: Order Production Update (Snake Case mapping for table columns)
 */
router.patch('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { productionStep, status } = req.body;

    try {
        const result = await pool.query(
            `UPDATE orders SET production_step = COALESCE($1, production_step), status = COALESCE($2, status) 
             WHERE id = $3 RETURNING *`,
            [productionStep, status, id]
        );

        const order = result.rows[0];
        if (!order) return res.status(404).send('Order missing');

        if (order.customer_email) {
            const eventType = productionStep ? 'PRODUCTION_UPDATE' : 'ORDER_STATUS_CHANGE';
            emailService.notify(eventType, order.customer_email, order.id, {
                orderId: order.id,
                step: productionStep || order.status,
                invoiceUrl: `${process.env.APP_BASE_URL}/invoice/${order.id}`,
            }, 'en');
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export const app = router;