import express from 'express';
import pg from 'pg';
import { emailService } from './emailService.js';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const router = express.Router();

// Helper for localized status names
const statusMapBN = {
    'Pending': 'অপেক্ষমান', 'In Progress': 'চলমান', 'Ready': 'প্রস্তুত', 
    'Shipped': 'পাঠানো হয়েছে', 'Delivered': 'পৌঁছেছে'
};

/**
 * TRIGGER: Order Production Update
 */
router.patch('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { production_step, status } = req.body;

    try {
        // Atomic Update
        const result = await pool.query(
            `UPDATE orders SET production_step = COALESCE($1, production_step), status = COALESCE($2, status) 
             WHERE id = $3 RETURNING *`,
            [production_step, status, id]
        );

        const order = result.rows[0];
        if (!order) return res.status(404).send('Order missing');

        // ASYNC NOTIFY (Triggered after success)
        if (order.customer_email) {
            const eventType = production_step ? 'PRODUCTION_UPDATE' : 'ORDER_STATUS_CHANGE';
            emailService.notify(eventType, order.customer_email, order.id, {
                orderId: order.id,
                step: production_step || order.status,
                stepBN: statusMapBN[production_step || order.status] || order.status,
                invoiceUrl: `${process.env.APP_BASE_URL}/invoice/${order.id}`,
                trackingUrl: `${process.env.APP_BASE_URL}/track-order?id=${order.id}`
            }, 'en'); // Default to EN for now
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * TRIGGER: Customer Detail Update
 */
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, address } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users SET name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING *`,
            [name, phone, address, id]
        );
        const user = result.rows[0];

        if (user && user.email) {
            emailService.notify('SECURITY_ALERT', user.email, user.id, {
                email: user.email,
                updateTime: new Date().toISOString()
            });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export const app = router;