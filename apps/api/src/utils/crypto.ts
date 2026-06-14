// apps/api/src/utils/crypto.ts
import crypto from 'crypto';

const HMAC_SECRET = process.env.API_HMAC_SECRET || 'dev_hmac_secret_change_me';
const NONCE_TTL_MS = parseInt(process.env.NONCE_TTL_MS || '300000', 10); // 5 mins default

// In-memory nonce cache (replace with Redis in multi-instance prod)
const usedNonces = new Map<string, number>();
const NONCE_CLEANUP_INTERVAL = 60_000;

// Cleanup expired nonces periodically
setInterval(() => {
  const now = Date.now();
  for (const [nonce, ts] of usedNonces.entries()) {
    if (now - ts > NONCE_TTL_MS) usedNonces.delete(nonce);
  }
}, NONCE_CLEANUP_INTERVAL);

export const cryptoUtils = {
  /**
   * Generate HMAC-SHA256 signature for payload
   */
  sign(payload: string, secret = HMAC_SECRET): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  },

  /**
   * Verify HMAC signature in constant-time
   */
  verify(payload: string, signature: string, secret = HMAC_SECRET): boolean {
    const expected = this.sign(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  },

  /**
   * Generate cryptographically secure nonce
   */
  generateNonce(): string {
    return crypto.randomBytes(16).toString('base64url');
  },

  /**
   * Validate nonce: check existence, TTL, and prevent reuse
   */
  validateNonce(nonce: string, timestamp: number): boolean {
    const now = Date.now();
    if (now - timestamp > NONCE_TTL_MS) return false; // Expired
    if (usedNonces.has(nonce)) return false; // Replay attack
    usedNonces.set(nonce, now);
    return true;
  },

  /**
   * Simple SHA-256 hash for data integrity checks
   */
  hash(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  },
};