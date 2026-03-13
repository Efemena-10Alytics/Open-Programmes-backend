import Mailgun from 'mailgun.js';
import formData from 'form-data';
import * as dotenv from 'dotenv';

dotenv.config();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || 'your-mailgun-api-key',
});

const domain = process.env.MAILGUN_DOMAIN || 'your-mailgun-domain';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const from = process.env.MAILGUN_FROM || 'Excited User <mailgun@your-domain.com>';

    try {
        const msg = await mg.messages.create(domain, {
            from,
            to: [to],
            subject,
            html,
        });
        console.log('Mailgun message sent:', msg);
        return msg;
    } catch (error) {
        console.error('Mailgun error:', error);
        throw error;
    }
};
