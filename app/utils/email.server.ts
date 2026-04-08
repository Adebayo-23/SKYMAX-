// @ts-ignore - nodemailer types not available, but package is installed
import nodemailer from 'nodemailer';

// Email configuration - configure these via environment variables
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let transporter: any = null;

// Initialize email transporter
export function initializeEmailTransporter() {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('⚠️ Email credentials not configured. Password reset emails will not be sent.');
    return null;
  }

  if (transporter) return transporter;

  try {
    transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
    console.log('✅ Email transporter initialized');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error);
    return null;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const emailTransporter = initializeEmailTransporter();
    
    if (!emailTransporter) {
      console.warn(`⚠️ Email not configured. Reset link would be sent to: ${email}`);
      return true; // Fake success for development
    }

    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your SKYMAX account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #9335FF; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetLink}</p>
        <p><strong>This link expires in 1 hour.</strong></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr />
        <p>SKYMAX Team</p>
      `,
      text: `
        Password Reset Request
        
        You requested a password reset for your SKYMAX account.
        
        Click the link below to reset your password:
        ${resetLink}
        
        This link expires in 1 hour.
        
        If you did not request a password reset, please ignore this email.
        
        SKYMAX Team
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendPasswordResetSuccessEmail(email: string) {
  try {
    const emailTransporter = initializeEmailTransporter();
    
    if (!emailTransporter) {
      console.warn(`⚠️ Email not configured. Success notification would be sent to: ${email}`);
      return true;
    }

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Your Password Has Been Changed',
      html: `
        <h2>Password Changed Successfully</h2>
        <p>Your SKYMAX account password has been successfully changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        <hr />
        <p>SKYMAX Team</p>
      `,
      text: `
        Password Changed Successfully
        
        Your SKYMAX account password has been successfully changed.
        
        If you did not make this change, please contact support immediately.
        
        SKYMAX Team
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Password reset success email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset success email:', error);
    return false;
  }
}
