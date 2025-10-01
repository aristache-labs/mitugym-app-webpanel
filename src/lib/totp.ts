/**
 * TOTP (Time-based One-Time Password) utilities
 * Industry-standard implementation using otpauth library
 * 
 * Security features:
 * - 30-second time step (standard)
 * - 6-digit codes
 * - 160-bit secret entropy
 * - ±1 time step tolerance (60-second validation window)
 */

import { TOTP, Secret } from "otpauth";

// TOTP Configuration
const TOTP_CONFIG = {
  period: 30, // 30-second refresh
  digits: 6, // 6-digit code
  algorithm: "SHA1" as const, // Standard for TOTP
  window: 1, // Accept ±1 time step (current + previous = 60s window)
};

/**
 * Generate a new TOTP secret for a member
 * @returns Base32-encoded secret string
 */
export function generateTOTPSecret(): string {
  const secret = new Secret({ size: 20 }); // 160 bits
  return secret.base32;
}

/**
 * Create a TOTP instance for a member
 * @param memberId - Member's unique ID
 * @param secret - Member's TOTP secret (base32)
 */
function createTOTP(memberId: string, secret: string): TOTP {
  return new TOTP({
    issuer: "MituGym",
    label: memberId,
    algorithm: TOTP_CONFIG.algorithm,
    digits: TOTP_CONFIG.digits,
    period: TOTP_CONFIG.period,
    secret: Secret.fromBase32(secret),
  });
}

/**
 * Generate current TOTP code for a member
 * Used for testing and mobile app implementation reference
 * 
 * @param secret - Member's TOTP secret (base32)
 * @param memberId - Member's unique ID
 * @returns 6-digit TOTP code as string
 */
export function generateTOTPCode(secret: string, memberId: string = "member"): string {
  const totp = createTOTP(memberId, secret);
  return totp.generate();
}

/**
 * Validate a TOTP code for a member
 * Accepts codes from current time step and previous time step (60-second window)
 * 
 * @param code - 6-digit TOTP code to validate
 * @param secret - Member's TOTP secret (base32)
 * @param memberId - Member's unique ID
 * @returns true if code is valid within the time window
 */
export function validateTOTPCode(
  code: string,
  secret: string,
  memberId: string = "member"
): boolean {
  if (!code || !secret) {
    return false;
  }

  // Ensure code is 6 digits
  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  const totp = createTOTP(memberId, secret);
  
  // Validate with ±1 time step window (60 seconds total)
  // Returns delta: 0 for current, -1 for previous step, null for invalid
  const delta = totp.validate({
    token: code,
    window: TOTP_CONFIG.window,
  });

  // Accept if delta is 0 (current) or -1 (previous step)
  return delta !== null && delta >= -TOTP_CONFIG.window;
}

/**
 * Parse QR code content into member ID and TOTP code
 * Format: member_id:totp_code
 * 
 * @param qrCode - QR code content
 * @returns {memberId, totpCode} or null if invalid format
 */
export function parseQRCode(qrCode: string): { memberId: string; totpCode: string } | null {
  if (!qrCode || typeof qrCode !== 'string') {
    return null;
  }

  // Check if it contains the separator
  const parts = qrCode.split(':');
  
  if (parts.length !== 2) {
    // Legacy format: just member ID (backward compatibility)
    return null;
  }

  const [memberId, totpCode] = parts;

  // Validate format
  if (!memberId || !totpCode || !/^\d{6}$/.test(totpCode)) {
    return null;
  }

  return { memberId, totpCode };
}

/**
 * Check if QR code uses new TOTP format
 * @param qrCode - QR code content
 * @returns true if TOTP format (contains ':'), false if legacy format
 */
export function isTOTPFormat(qrCode: string): boolean {
  return qrCode?.includes(':') ?? false;
}

/**
 * Get TOTP URI for mobile app setup (for QR code generation in setup flow)
 * This is NOT the gym check-in QR - this is for initial TOTP configuration
 * 
 * @param memberId - Member's unique ID
 * @param secret - Member's TOTP secret (base32)
 * @returns otpauth:// URI for QR code generation
 */
export function getTOTPSetupURI(
  memberId: string,
  secret: string
): string {
  const totp = createTOTP(memberId, secret);
  return totp.toString();
}

/**
 * Calculate time remaining until next TOTP code refresh
 * @returns seconds until next code (0-30)
 */
export function getTimeUntilNextCode(): number {
  const now = Math.floor(Date.now() / 1000);
  const timeStep = TOTP_CONFIG.period;
  return timeStep - (now % timeStep);
}

/**
 * Get current time step for debugging/logging
 * @returns current Unix time step
 */
export function getCurrentTimeStep(): number {
  return Math.floor(Date.now() / 1000 / TOTP_CONFIG.period);
}

