import nodemailer from 'nodemailer';
import { pool } from './db.js';
import crypto from 'crypto';
import { templates } from './emailTemplates.js';
import 'dotenv/config';

/**
 * PRODUCTION NOTIFICATION ENGINE
 * Implements Outbox Pattern & Connection Pooling
 */
class EmailService {
    constructor() {
        this.transporters = new Map(); // Cache transporters by config hash
        this.queueAdapter = null;      // Pluggable (e.g. BullMQ)
    }

    setQueueAdapter(adapter) {
        this.queueAdapter = adapter;
    }

    _getHash(config) {
        return crypto.createHash('sha256')
            .update(`${config.smtp_host}:${config.smtp_port}:${config.smtp_user}:${config.is_enabled}`)
            .digest('hex');
    }

    async _getTransporter() {
        const { rows } = await pool.query('SELECT * FROM system_config WHERE id = 1');
        const config = rows[0];

        if (!config || !config.is_enabled) return null;

        const hash = this._getHash(config);
        if (this.transporters.has(hash)) {
            return { transporter: this.transporters.get(hash), config };
        }

        console.log(`[EmailService] Instantiating new pool for ${config.smtp_host}`);
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_secure,
            auth: { user: config.smtp_user, pass: config.smtp_pass },
            pool: true,
            maxConnections: 5,
            rateLimit: 10
        });

        this.transporters.set(hash, transporter);
        return { transporter, config };
    }

    async notify(event, recipient, entityId, payload, lang = 'en') {
        const template = templates[event];
        if (!template) throw new Error(`Event ${event} not mapped in templates.`);

        const state = payload.step || payload.status || 'default';
        const idempotencyKey = `${entityId}:${event}:${state}`;

        try {
            const logResult = await pool.query(
                `INSERT INTO email_logs (idempotency_key, event_type, recipient, payload, status)
                 VALUES ($1, $2, $3, $4, 'PENDING')
                 ON CONFLICT (idempotency_key) DO NOTHING
                 RETURNING id`,
                [idempotencyKey, event, recipient, JSON.stringify(payload)]
            );

            if (logResult.rowCount === 0) {
                console.warn(`[EmailService] Duplicate ignored: ${idempotencyKey}`);
                return;
            }

            const logId = logResult.rows[0].id;

            if (this.queueAdapter) {
                return await this.queueAdapter.add({ logId, event, recipient, payload, lang });
            }

            return await this._executeSend(logId, event, recipient, payload, lang);

        } catch (err) {
            console.error(`[EmailService] Critical Failure: ${err.message}`);
        }
    }

    async _executeSend(logId, event, recipient, payload, lang, retries = 3) {
        const conn = await this._getTransporter();
        if (!conn) {
            await pool.query("UPDATE email_logs SET status = 'SKIPPED', error_reason = 'SMTP Disabled' WHERE id = $1", [logId]);
            return;
        }

        const { transporter, config } = conn;
        const template = templates[event];
        const subject = template.subject[lang](payload);
        const html = template.body[lang]({ ...payload, logo: config.site_logo });

        try {
            await transporter.sendMail({
                from: `"${config.site_name}" <${config.smtp_user}>`,
                to: recipient,
                subject,
                html
            });

            await pool.query("UPDATE email_logs SET status = 'SENT', updated_at = NOW() WHERE id = $1", [logId]);
            console.log(`[EmailService] Dispatched ${event} to ${recipient}`);

        } catch (err) {
            if (retries > 0) {
                await pool.query("UPDATE email_logs SET retry_count = retry_count + 1 WHERE id = $1", [logId]);
                const delay = (4 - retries) * 2000;
                await new Promise(r => setTimeout(r, delay));
                return this._executeSend(logId, event, recipient, payload, lang, retries - 1);
            }

            await pool.query(
                "UPDATE email_logs SET status = 'FAILED', error_reason = $1, updated_at = NOW() WHERE id = $2",
                [err.message, logId]
            );
        }
    }
}

export const emailService = new EmailService();