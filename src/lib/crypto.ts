import { createHash, randomBytes } from "crypto";

const SALT = process.env.PASSWORD_SALT || "xiangtai-default-salt-2024";

/**
 * Hash a password with SHA-256 + salt.
 * Format: sha256(salt + password)
 */
export function hashPassword(password: string): string {
  return createHash("sha256")
    .update(SALT + password)
    .digest("hex");
}

/**
 * Verify a password against a stored hash.
 * Supports both plain text (legacy) and hashed passwords.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  // If stored value looks like a SHA-256 hex (64 chars), compare hashed
  if (/^[a-f0-9]{64}$/i.test(storedHash)) {
    return hashPassword(password) === storedHash;
  }
  // Legacy plain text comparison
  return password === storedHash;
}

/**
 * Generate a random token for session management
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}
