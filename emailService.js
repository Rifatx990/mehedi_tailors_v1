import nodemailer from 'nodemailer';
import pg from 'pg';
const { Pool } = pg;
import { templates } from './emailTemplates.js';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;
const pool = new Pool(process.env.DATABASE_URL ? { 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
} : {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'mehedi_atelier',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

class EmailService {
    async getTransporter() {
        const client = await pool.connect();
        try {
            const configRes = await client.query('SELECT * FROM system_config WHERE id = 1');
            const config = configRes.rows[0];

            if (!config || !config.is_enabled) return null;

            return nodemailer.createTransport({
                host: config.smtp_host,
                port: config.smtp_port,
                secure: config.secure || config.smtp_port === 465,
                auth: {
                    user: config.smtp_user,
                    pass: config.smtp_pass
                },
                tls: { rejectUnauthorized: false }
            });
        } finally {
            client.release();
        }
    }

    async send(templateKey, recipient, data, lang = 'en', retries = 3) {
        const template = templates[templateKey];
        if (!template) throw new Error(`Template ${templateKey} not found.`);

        const subject = template.subject[lang](data);
        const body = template.body[lang](data);

        // Preliminary log entry
        const logId = `LOG-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        await pool.query(
            'INSERT INTO email_logs (id, recipient, subject, body, status, template_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [logId, recipient, subject, body, 'queued', templateKey]
        );

        const transporter = await this.getTransporter();
        if (!transporter) {
            console.warn(`[Notification-Skipped] SMTP disabled for ${recipient}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: `"${data.siteName || 'Mehedi Tailors'}" <${transporter.options.auth.user}>`,
                to: recipient,
                subject: subject,
                html: body
            });

            await pool.query('UPDATE email_logs SET status = $1 WHERE id = $2', ['sent', logId]);
            console.log(`[Notification-Success] Dispatched ${templateKey} to ${recipient}`);
        } catch (err) {
            console.error(`[Notification-Error] Dispatch failed: ${err.message}`);
            
            if (retries > 0) {
                console.log(`[Notification-Retry] Attempting again... (${retries} left)`);
                return this.send(templateKey, recipient, data, lang, retries - 1);
            }

            await pool.query(
                'UPDATE email_logs SET status = $1, error_log = $2 WHERE id = $3',
                ['failed', err.message, logId]
            );
        }
    }
}

export const emailService = new EmailService();