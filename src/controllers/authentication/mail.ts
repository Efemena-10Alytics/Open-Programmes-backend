import { Resend } from "resend";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL
import { transporter } from '../../utils/nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'programrelations@nebiant.com',
    to: email,
    subject: 'Confirm your email',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
              text-align: center;
            }
            p {
              color: #555;
              line-height: 1.6;
            }
            .token {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin-top: 20px;
              padding: 10px;
              background-color: #eee;
              border-radius: 5px;
            }
            .confirm-link {
              display: block;
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verification</h1>
            <p>Thank you for registering with our service. Please use the following token to verify your email address:</p>
            <div class="token">${token}</div>
            <p>or</p>
            <a class="confirm-link" href="${confirmLink}">Click here to confirm your email</a>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'programrelations@nebiant.com',
    to: email,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Password Reset</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
              text-align: center;
            }
            p {
              color: #555;
              line-height: 1.6;
            }
            .token {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin-top: 20px;
              padding: 10px;
              background-color: #eee;
              border-radius: 5px;
            }
            .reset-link {
              display: block;
              text-align: center;
              margin-top: 20px;
              padding: 10px 20px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Use the following token or click the button below:</p>
            <div class="token">${token}</div>
            <a href="${resetLink}" class="reset-link">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};