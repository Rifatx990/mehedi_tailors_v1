import nodemailer from 'nodemailer';
import { pool } from './db.js';
import crypto from 'crypto';
import { templates } from './emailTemplates.js';
import 'dotenv/config';

/**
 * PRODUCTION-GRADE NOTIFICATION ARCHITECTURE
 * Implements the Transactional Outbox Pattern for Mehedi Atelier.
 */
class EmailService {
    constructor() {
        this.transporters = new Map();
        this.queueAdapter = null; // BullMQ or similar can be attached here
    }

    /**
     * Attach an optional background worker (e.g. BullMQ)
     */
    setQueueAdapter(adapter) {
        this.queueAdapter = adapter;
        console.log('[EmailService] Background Queue Adapter attached.');
    }

    /**
     * Generates a unique hash for SMTP configurations to manage the pool.
     */
    _getConfigHash(config) {
        return crypto.createHash('md5')
            .update(`${config.smtp_host}:${config.smtp_port}:${config.smtp_user}:${config.smtp_pass}:${config.is_enabled}`)
            .digest('hex');
    }

    /**
     * Fetches or instantiates a cached SMTP transporter.
     */
    async _getTransporter() {
        const { rows } = await pool.query('SELECT * FROM system_config WHERE id = 1');
        const config = rows[0];

        if (!config || !config.is_enabled) {
            return { transporter: null, config: null };
        }

        const hash = this._getConfigHash(config);
        if (this.transporters.has(hash)) {
            return { transporter: this.transporters.get(hash), config };
        }

        // Hot-swap/Refresh Transporter
        console.log(`[EmailService] Calibrating new SMTP pool for ${config.smtp_host}...`);
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_port === 465,
            auth: { user: config.smtp_user, pass: config.smtp_pass },
            pool: true,
            maxConnections: 10,
            rateLimit: 15
        });

        // Test handshake immediately
        try {
            await transporter.verify();
            this.transporters.clear(); // Clear old stale transporters
            this.transporters.set(hash, transporter);
            return { transporter, config };
        } catch (err) {
            console.error(`[EmailService] SMTP Handshake Failed: ${err.message}`);
            return { transporter: null, config: null };
        }
    }

    /**
     * Records a notification intent into the Ledger (Outbox).
     * This method is safe to call inside DB transactions.
     */
    async notify(event, recipient, entityId, payload, lang = 'en') {
        if (!recipient || !templates[event]) return;

        // Structured Idempotency Key
        const state = payload.step || payload.status || 'static';
        const idempotencyKey = `${entityId}:${event}:${state}`;

        try {
            const result = await pool.query(
                `INSERT INTO email_logs (idempotency_key, event_type, recipient, payload, status)
                 VALUES ($1, $2, $3, $4, 'PENDING')
                 ON CONFLICT (idempotency_key) DO NOTHING
                 RETURNING id`,
                [idempotencyKey, event, recipient, JSON.stringify(payload)]
            );

            if (result.rowCount === 0) {
                console.warn(`[EmailService] Duplicate send prevented for ${idempotencyKey}`);
                return;
            }

            const logId = result.rows[0].id;

            // Trigger dispatching
            if (this.queueAdapter) {
                await this.queueAdapter.add({ logId, event, recipient, payload, lang });
            } else {
                // Immediate async dispatch for direct systems
                setImmediate(() => this.dispatch(logId, event, recipient, payload, lang));
            }

            return logId;
        } catch (err) {
            console.error(`[EmailService] Ledger Record Failure: ${err.message}`);
        }
    }

    /**
     * Executes the actual SMTP dispatch.
     */
    async dispatch(logId, event, recipient, payload, lang, attempt = 1) {
        const { transporter, config } = await this._getTransporter();

        if (!transporter) {
            await pool.query(
                "UPDATE email_logs SET status = 'FAILED', error_reason = 'SMTP Disabled or Config Error' WHERE id = $1",
                [logId]
            );
            return;
        }

        const template = templates[event];
        const subject = template.subject[lang](payload);
        const html = template.body[lang]({
            ...payload,
            logo: config.document_logo || config.site_logo,
            siteName: config.site_name,
            invoiceUrl: `${process.env.APP_BASE_URL}/#/invoice/${payload.orderId || entityId}`,
            trackingUrl: `${process.env.APP_BASE_URL}/#/track-order?id=${payload.orderId || entityId}`
        });

        try {
            await transporter.sendMail({
                from: `"${config.site_name}" <${config.smtp_user}>`,
                to: recipient,
                subject,
                html
            });

            await pool.query(
                "UPDATE email_logs SET status = 'SENT', updated_at = NOW() WHERE id = $1",
                [logId]
            );
            console.log(`[EmailService] Dispatch Successful: ${event} -> ${recipient}`);

        } catch (err) {
            console.error(`[EmailService] SMTP Dispatch Error (Attempt ${attempt}): ${err.message}`);
            
            if (attempt < 3) {
                const backoff = attempt * 2000;
                await pool.query("UPDATE email_logs SET retry_count = retry_count + 1 WHERE id = $1", [logId]);
                setTimeout(() => this.dispatch(logId, event, recipient, payload, lang, attempt + 1), backoff);
            } else {
                await pool.query(
                    "UPDATE email_logs SET status = 'FAILED', error_reason = $1, updated_at = NOW() WHERE id = $2",
                    [err.message, logId]
                );
            }
        }
    }
}

export const emailService = new EmailService();