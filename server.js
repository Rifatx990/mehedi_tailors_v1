
import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mehedi_atelier',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const query = (text, params) => pool.query(text, params);

const toSnake = (obj) => {
    const snake = {};
    for (let key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snake[snakeKey] = obj[key];
    }
    return snake;
};

const setupCRUD = (route, table) => {
    app.get(`/api/${route}`, async (req, res) => {
        try {
            const result = await query(`SELECT * FROM ${table} ORDER BY id ASC`);
            res.json(result.rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post(`/api/${route}`, async (req, res) => {
        const body = toSnake(req.body);
        const keys = Object.keys(body);
        const values = Object.values(body).map(v => typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        try {
            const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
            const result = await query(sql, values);
            res.json(result.rows[0]);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.put(`/api/${route}/:id`, async (req, res) => {
        const body = toSnake(req.body);
        delete body.id;
        const keys = Object.keys(body);
        const values = Object.values(body).map(v => typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        try {
            const sql = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
            const result = await query(sql, [req.params.id, ...values]);
            res.json(result.rows[0]);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.delete(`/api/${route}/:id`, async (req, res) => {
        try {
            await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
};

setupCRUD('users', 'users');
setupCRUD('products', 'products');
setupCRUD('fabrics', 'fabrics');
setupCRUD('bespoke-services', 'bespoke_services');
setupCRUD('orders', 'orders');
setupCRUD('dues', 'dues');
setupCRUD('banners', 'banners');
setupCRUD('coupons', 'coupons');
setupCRUD('gift-cards', 'gift_cards');
setupCRUD('notices', 'notices');
setupCRUD('offers', 'offers');
setupCRUD('partners', 'partners');
setupCRUD('material-requests', 'material_requests');
setupCRUD('product-requests', 'product_requests');
setupCRUD('reviews', 'reviews');

app.patch('/api/orders/:id', async (req, res) => {
    const fields = toSnake(req.body);
    const keys = Object.keys(fields);
    const values = Object.values(fields).map(v => typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    try {
        const result = await query(`UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`, [req.params.id, ...values]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/config', async (req, res) => {
    try {
        const result = await query('SELECT * FROM system_config WHERE id = 1');
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/config', async (req, res) => {
    const fields = toSnake(req.body);
    delete fields.id;
    const keys = Object.keys(fields);
    const values = Object.values(fields).map(v => typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    try {
        const result = await query(`UPDATE system_config SET ${setClause} WHERE id = 1 RETURNING *`, values);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
  console.log(`[MEHEDI ATELIER BACKEND] Authorized on http://localhost:${port}`);
});
