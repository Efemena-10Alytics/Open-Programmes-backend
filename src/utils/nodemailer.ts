import * as nodemailer from 'nodemailer';
import { sendEmail as sendMailgunEmail } from './mailgun';
import * as dotenv from 'dotenv';

dotenv.config();

// Creating a transporter object using SMTP transport
export const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Unified sendMail function that prefers Mailgun API if configured,
 * otherwise falls back to nodemailer SMTP.
 * Use this function instead of transporter.sendMail directly.
 */
export const sendMail = async (options: {
  from?: string;
  to: string;
  subject: string;
  html: string;
}) => {
  // Use Mailgun if API key and domain are provided
  if (process.env.MAILGUN_API_KEY &&
    process.env.MAILGUN_DOMAIN &&
    process.env.MAILGUN_API_KEY !== 'your_mailgun_api_key' &&
    process.env.MAILGUN_API_KEY !== '') {
    try {
      return await sendMailgunEmail(options.to, options.subject, options.html);
    } catch (error) {
      console.error('Mailgun API failed, falling back to SMTP...', error);
      // Fallback to SMTP below
    }
  }

  // Fallback to SMTP
  const mailOptions = {
    from: options.from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  return await transporter.sendMail(mailOptions);
};