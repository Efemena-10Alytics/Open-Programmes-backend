import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { transporter } from '../../utils/nodemailer';

// Load environment variables
dotenv.config();

interface AccountDeletionParams {
  email: string;
  name: string;
}

export const sendAccountDeletionEmail = async ({ email, name }: AccountDeletionParams) => {
  try {
    const deletionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'programrelations@nebiant.com',
      to: email,
      subject: 'Notice Regarding Your Account Deletion',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Account Deletion Notice</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #333333;
                text-align: center;
                margin-bottom: 20px;
              }
              p {
                color: #555555;
                line-height: 1.6;
                margin-bottom: 15px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                color: #999999;
                font-size: 12px;
              }
              .date-notice {
                font-style: italic;
                color: #666;
                text-align: center;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Account Deletion Notice</h1>
              
              <p>Dear ${name},</p>
              
              <p>We wanted to inform you that your account has been deleted from our system as of <span class="date-notice">${deletionDate}</span>.</p>
              
              <p>If you believe this was done in error or if you have any concerns, please do not hesitate to contact your class coordinator for further assistance.</p>
              
              <p>We apologize for any inconvenience this may have caused.</p>
              
              <p>Best regards,<br>Nebiant Analytics Team</p>

              <div class="footer">
                <p>© ${new Date().getFullYear()} Nebiant Analytics. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending account deletion email:", error);
    throw error;
  }
};