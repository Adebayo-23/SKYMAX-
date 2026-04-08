# Password Reset Feature Documentation

## Overview

This document explains the "Forgot Password" feature implemented in the SKYMAX to-do list app. This feature allows users who have forgotten their password to securely reset it via email.

## Features

✅ **Secure Password Reset Flow**
- Users can request a password reset by entering their email
- A unique reset token is generated and sent via email
- Tokens expire after 1 hour for security
- Password reset only works with a valid, non-expired token

✅ **Email Notifications**
- Password reset link sent to user's email
- Confirmation email sent after successful password reset
- Graceful handling when email service is unavailable

✅ **Password Security**
- Passwords must be at least 8 characters long
- Must contain at least one uppercase letter
- Must contain at least one special symbol
- Tokens are cryptographically secure random values

## Installation

### 1. Install Required Dependency

The password reset feature uses Nodemailer for sending emails. Install it in your project:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the email configuration:

```bash
cp .env.example .env
```

Edit `.env` with your email service credentials:

```dotenv
# Email service provider (e.g., gmail, outlook, yahoo)
EMAIL_SERVICE=gmail

# Email address (your email or support email)
EMAIL_USER=your-email@gmail.com

# Email password or app-specific password
# For Gmail: Use an App Password (https://myaccount.google.com/apppasswords)
EMAIL_PASSWORD=your-app-password

# Application base URL (used in reset emails)
APP_URL=http://localhost:3000
```

### 3. Database Updates

The User model has been updated with two new fields:
- `resetToken`: Stores the password reset token
- `resetTokenExpiry`: Stores when the token expires

These fields are automatically managed by the password reset system.

## How to Use

### For Users

1. **Request Password Reset**
   - Go to the login page
   - Click "Forgot password?" link
   - Enter your email address
   - Click "Send Reset Link"
   - Check your email for a reset link (check spam folder if needed)

2. **Reset Password**
   - Click the link in your email
   - This takes you to the reset password page
   - Enter your new password (must meet requirements)
   - Confirm the password
   - Click "Reset Password"
   - You'll see a success message and can log in with your new password

### For Developers

#### API Endpoints

**POST `/api/forgot-password`**
- Request a password reset email
- Required: `email` form field
- Response: Success message (same whether user exists or not, for security)

```bash
curl -X POST http://localhost:3000/api/forgot-password \
  -d "email=user@example.com"
```

**POST `/api/reset-password`**
- Reset password using a valid token
- Required: `token`, `password`, `confirmPassword`
- Response: Success message or error

```bash
curl -X POST http://localhost:3000/api/reset-password \
  -d "token=xxxxx&password=NewPassword1!&confirmPassword=NewPassword1!"
```

#### Routes

- `/forgot-password` - Forgot password request page
- `/reset-password?token=xxxxx` - Password reset form page

#### Utilities

**`app/utils/email.server.ts`**
- `sendPasswordResetEmail(email, token)` - Sends password reset email
- `sendPasswordResetSuccessEmail(email)` - Sends confirmation email

**`app/utils/token.server.ts`**
- `generateResetToken()` - Generates a secure random token
- `getResetTokenExpiry()` - Returns expiry time (1 hour from now)
- `isTokenValid(expiryDate)` - Checks if token is still valid

## Email Configuration Guide

### Gmail (Recommended for Development)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password
3. In your `.env`:
   ```dotenv
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### Other Services

**Outlook**
```dotenv
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**Yahoo**
```dotenv
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

**Custom SMTP**
For other email providers, see [Nodemailer Transport Configuration](https://nodemailer.com/smtp/).

## Fallback Behavior

When email credentials are not configured:
- Development mode: The system logs a warning but allows the flow to proceed
- Production mode: Users will see an error message
- Check server logs to see reset tokens and URLs

This allows you to test the password reset flow without email configuration during development.

## Security Considerations

✅ **Implemented Security Measures**
- Reset tokens are cryptographically random (32 bytes of randomness)
- Tokens expire after 1 hour
- Tokens can only be used once (cleared after password reset)
- Expired tokens are rejected and cleared from database
- Password requirements are enforced (8+ chars, uppercase, symbol)
- User existence is not revealed (same response whether email exists or not)
- Success email sent after password change for audit trail

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**
   ```bash
   echo $EMAIL_SERVICE
   echo $EMAIL_USER
   ```

2. **Look for logs**
   - Check the server console for error messages
   - Look for warnings about email configuration

3. **Gmail Specific**
   - Make sure you're using an App Password, not your Gmail password
   - Enable "Less secure apps" if using regular password

### Token Expiration Issues

- Reset tokens expire after 1 hour
- If user clicks link after 1 hour, they'll see an "Invalid or expired" message
- They can request another reset

### Database Issues

- Ensure MongoDB is connected properly
- Check that MONGODB_URI environment variable is set
- Verify the SKYMAX database exists

## Future Enhancements

Possible improvements:
- Add rate limiting to prevent brute force attacks
- Add CAPTCHA to forgot password form
- Support for SMS-based password reset
- Password reset history/audit log
- Email templates customization
- Support for OAuth2 providers

## Testing

To test the password reset feature:

1. Make sure email credentials are configured in `.env`
2. Go to http://localhost:3000/login
3. Click "Forgot password?"
4. Enter a registered user's email
5. Check your email (including spam folder)
6. Click the reset link
7. Enter a new password and confirm
8. You should see a success message
9. Try logging in with your new password

## Support

For issues or questions about the password reset feature, check:
- Server logs for error messages
- Email configuration in `.env`
- MongoDB connection status
- Email service documentation (for service-specific issues)
