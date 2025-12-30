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
        this.queueAdapter = null;
    }

    setQueueAdapter(adapter) {
        this.queueAdapter = adapter;
        console.log('[EmailService] Background Queue Adapter attached.');
    }

    _getConfigHash(config) {
        return crypto.createHash('md5')
            .update(`${config.smtp_host}:${config.smtp_port}:${config.smtp_user}:${config.smtp_pass}:${config.is_enabled}`)
            .digest('hex');
    }

    async _getTransporter() {
        const { rows } = await pool.query('SELECT * FROM system_config WHERE id = 1');
        const config = rows[0];

        if (!config) {
            console.error('[EmailService] No system_config found in ledger.');
            return { transporter: null, config: null };
        }

        if (!config.is_enabled) {
            console.warn('[EmailService] Notifications are currently DISABLED in system settings.');
            return { transporter: null, config: null };
        }

        const hash = this._getConfigHash(config);
        if (this.transporters.has(hash)) {
            return { transporter: this.transporters.get(hash), config };
        }

        console.log(`[EmailService] Calibrating new SMTP pool for ${config.smtp_host}...`);
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_port === 465,
            auth: { user: config.smtp_user, pass: config.smtp_pass },
            pool: true,
            maxConnections: 5,
            rateLimit: 10
        });

        try {
            await transporter.verify();
            this.transporters.clear();
            this.transporters.set(hash, transporter);
            return { transporter, config };
        } catch (err) {
            console.error(`[EmailService] SMTP Handshake Failed: ${err.message}`);
            return { transporter: null, config: null };
        }
    }

    async notify(event, recipient, entityId, payload, lang = 'en') {
        if (!recipient || !templates[event]) {
            console.error(`[EmailService] Invalid notify attempt: Event=${event}, Recipient=${recipient}`);
            return;
        }

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
                console.log(`[EmailService] Duplicate send prevented: ${idempotencyKey}`);
                return;
            }

            const logId = result.rows[0].id;
            console.log(`[EmailService] Logged outbox entry #${logId} for ${event}`);

            if (this.queueAdapter) {
                await this.queueAdapter.add({ logId, event, recipient, payload, lang, entityId });
            } else {
                // Async dispatch to not block main thread
                setImmediate(() => this.dispatch(logId, event, recipient, payload, lang, entityId));
            }

            return logId;
        } catch (err) {
            console.error(`[EmailService] Ledger Record Failure: ${err.message}`);
        }
    }

    async dispatch(logId, event, recipient, payload, lang, entityId, attempt = 1) {
        try {
            const { transporter, config } = await this._getTransporter();

            if (!transporter) {
                await pool.query(
                    "UPDATE email_logs SET status = 'FAILED', error_reason = 'SMTP Disabled or Config Error' WHERE id = $1",
                    [logId]
                );
                return;
            }

            const template = templates[event];
            const context = {
                ...payload,
                entityId,
                logo: config.document_logo || config.site_logo,
                siteName: config.site_name,
                invoiceUrl: `${process.env.APP_BASE_URL || ''}/#/invoice/${payload.orderId || entityId}`,
                trackingUrl: `${process.env.APP_BASE_URL || ''}/#/track-order?id=${payload.orderId || entityId}`
            };

            const subject = template.subject[lang](context);
            const html = template.body[lang](context);

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
            console.log(`[EmailService] Dispatch Successful: LogID=${logId} Event=${event} -> ${recipient}`);

        } catch (err) {
            console.error(`[EmailService] SMTP Dispatch Error (LogID=${logId}, Attempt ${attempt}): ${err.message}`);
            
            if (attempt < 3) {
                const backoff = attempt * 2000;
                await pool.query("UPDATE email_logs SET retry_count = retry_count + 1 WHERE id = $1", [logId]);
                setTimeout(() => this.dispatch(logId, event, recipient, payload, lang, entityId, attempt + 1), backoff);
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