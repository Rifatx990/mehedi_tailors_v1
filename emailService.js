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

/**
 * PRODUCTION-GRADE NOTIFICATION ENGINE
 * Handles SMTP caching, localized templating, and transactional logging.
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.configHash = null;
    }

    /**
     * Internal: Generates a hash to detect if SMTP settings changed in DB
     */
    _generateConfigHash(config) {
        return `${config.smtp_host}:${config.smtp_port}:${config.smtp_user}:${config.is_enabled}`;
    }

    /**
     * Fetches current SMTP config and manages Transporter lifecycle
     */
    async _getTransporter() {
        const { rows } = await pool.query('SELECT * FROM system_config WHERE id = 1');
        const config = rows[0];

        if (!config || !config.is_enabled) {
            this.transporter = null;
            return null;
        }

        const newHash = this._generateConfigHash(config);

        // Reuse cached transporter if config hasn't changed
        if (this.transporter && this.configHash === newHash) {
            return { transporter: this.transporter, config };
        }

        console.log(`[EmailService] Initializing new SMTP Transporter for ${config.smtp_host}`);
        
        this.transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.secure || config.smtp_port === 465,
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass
            },
            tls: { rejectUnauthorized: false }
        });

        this.configHash = newHash;
        return { transporter: this.transporter, config };
    }

    /**
     * Main entry point for sending emails
     * @param {string} templateKey - Key from emailTemplates.js
     * @param {string} recipient - Target email
     * @param {object} data - Data to inject into template
     * @param {string} lang - 'en' or 'bn'
     */
    async send(templateKey, recipient, data, lang = 'en') {
        const template = templates[templateKey];
        if (!template) throw new Error(`Invalid Template Key: ${templateKey}`);

        const subject = template.subject[lang](data);
        const body = template.body[lang](data);
        const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        try {
            // 1. Initial log entry (Persistence first)
            await pool.query(
                `INSERT INTO email_logs (id, recipient, subject, body, status, template_id, retry_count) 
                 VALUES ($1, $2, $3, $4, $5, $6, 0)`,
                [logId, recipient, subject, body, 'queued', templateKey]
            );

            // 2. Immediate dispatch attempt
            // In a high-scale env, you'd replace this with: await queue.add({ logId, ... })
            return await this._processDispatch(logId, recipient, subject, body, data.siteName, 3);

        } catch (err) {
            console.error(`[EmailService] Critical failure for ${recipient}:`, err.message);
        }
    }

    /**
     * Recursive dispatch logic with retry circuit
     */
    async _processDispatch(logId, recipient, subject, body, siteName, retriesLeft) {
        const connection = await this._getTransporter();
        
        if (!connection) {
            await pool.query('UPDATE email_logs SET status = $1, error_log = $2 WHERE id = $3', 
                ['skipped', 'SMTP disabled in system_config', logId]);
            return;
        }

        const { transporter, config } = connection;

        try {
            await transporter.sendMail({
                from: `"${siteName || config.sender_name || 'Mehedi Tailors'}" <${config.smtp_user}>`,
                to: recipient,
                subject: subject,
                html: body
            });

            // Mark Success
            await pool.query('UPDATE email_logs SET status = $1, timestamp = NOW() WHERE id = $2', ['sent', logId]);
            console.log(`[EmailService] SUCCESS | ID: ${logId} | To: ${recipient}`);

        } catch (err) {
            const isLastAttempt = retriesLeft <= 0;
            const currentRetry = 3 - retriesLeft + 1;

            console.warn(`[EmailService] ATTEMPT ${currentRetry} FAILED | To: ${recipient} | Error: ${err.message}`);

            if (!isLastAttempt) {
                // Wait before retrying (exponential backoff simulated)
                await new Promise(res => setTimeout(res, 1000 * currentRetry));
                
                await pool.query('UPDATE email_logs SET retry_count = retry_count + 1 WHERE id = $1', [logId]);
                return this._processDispatch(logId, recipient, subject, body, siteName, retriesLeft - 1);
            }

            // Final failure log
            await pool.query(
                'UPDATE email_logs SET status = $1, error_log = $2, retry_count = 3 WHERE id = $3',
                ['failed', err.message, logId]
            );
        }
    }
}

// Singleton Export
export const emailService = new EmailService();