/**
 * auth.js — JWT Authentication Middleware
 * ──────────────────────────────────────────────────────────────────────────────
 * Accepts ES256 tokens from TWO trusted issuers:
 *   1. ZentroPay internal  — signed with zentropay_private.pem (our own login/register)
 *   2. Supabase            — signed with the Supabase project's EC private key
 *
 * Verification strategy:
 *   a) Parse the JWT header to extract kid (Key ID).
 *   b) If kid matches a known Supabase key → verify with that Supabase public key.
 *   c) Otherwise → try ZentroPay internal public key.
 *   d) If ALL keys fail → 403 Invalid or expired token.
 *
 * Supabase JWT claims mapping:
 *   sub  → userId  (Supabase user UUID)
 *   email → email
 *   role  → from app_metadata.role or user_metadata.role (fallback: 'user')
 *
 * ZentroPay JWT claims (unchanged):
 *   userId, email, role
 */

'use strict';

const jwt     = require('jsonwebtoken');
const { ALL_PUBLIC_KEYS, JWT_ALGORITHM } = require('../config/jwtKeys');

/**
 * Safely decode the JWT header without verifying the signature.
 * Returns null on any parse error.
 */
function decodeHeader(token) {
  try {
    const headerB64 = token.split('.')[0];
    const headerJson = Buffer.from(headerB64, 'base64url').toString('utf8');
    return JSON.parse(headerJson);
  } catch {
    return null;
  }
}

/**
 * Normalise the decoded payload into a consistent req.user shape,
 * regardless of whether the token came from ZentroPay or Supabase.
 *
 * ZentroPay payload:   { userId, email, role, iat, exp }
 * Supabase payload:    { sub, email, role, app_metadata, user_metadata, iat, exp, … }
 */
function normalisePayload(payload) {
  // ZentroPay token already has userId
  if (payload.userId) return payload;

  // Supabase token uses `sub` as the user UUID
  const role =
    payload.role ||
    payload.app_metadata?.role ||
    payload.user_metadata?.role ||
    'user';

  return {
    userId:   payload.sub,
    email:    payload.email || null,
    role,
    // Preserve original Supabase fields in case downstream needs them
    _supabase: true,
    _raw:      payload,
  };
}

/**
 * authenticate — Express middleware
 *
 * Reads the Bearer token from Authorization header, verifies it against
 * all trusted ES256 public keys, normalises the payload, attaches to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  // Decode header to find preferred key by kid
  const header = decodeHeader(token);
  const tokenKid = header?.kid || null;
  const tokenAlg = header?.alg || JWT_ALGORITHM;

  // Only accept ES256
  if (tokenAlg !== 'ES256') {
    return res.status(403).json({
      success: false,
      message: `Unsupported JWT algorithm: ${tokenAlg}. Expected ES256.`,
    });
  }

  // Build ordered list — preferred key (by kid) first, then the rest
  let keysToTry = ALL_PUBLIC_KEYS;
  if (tokenKid) {
    const matched  = ALL_PUBLIC_KEYS.filter(k => k.kid === tokenKid);
    const unmatched = ALL_PUBLIC_KEYS.filter(k => k.kid !== tokenKid);
    keysToTry = [...matched, ...unmatched];
  }

  // Try each key in order
  for (const keyEntry of keysToTry) {
    try {
      const decoded = jwt.verify(token, keyEntry.pem, {
        algorithms: ['ES256'],
      });
      req.user = normalisePayload(decoded);
      return next();
    } catch {
      // Try next key
    }
  }

  // All keys failed
  return res.status(403).json({
    success: false,
    message: 'Invalid or expired token',
  });
};

/**
 * authorizeAdmin — must be used AFTER authenticate.
 * Checks req.user.role === 'admin'.
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Admin access required',
  });
};

module.exports = { authenticate, authorizeAdmin };
