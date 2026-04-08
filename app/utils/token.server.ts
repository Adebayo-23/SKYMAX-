import crypto from 'crypto';

/**
 * Generate a secure reset token
 * @returns {string} - A secure random token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get reset token expiry time (1 hour from now)
 * @returns {Date} - Expiry date
 */
export function getResetTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

/**
 * Check if reset token is valid (not expired)
 * @param expiryDate - Token expiry date
 * @returns {boolean} - True if token is still valid
 */
export function isTokenValid(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return false;
  return new Date() < new Date(expiryDate);
}
