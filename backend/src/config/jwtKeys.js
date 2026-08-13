/**
 * jwtKeys.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Central key manager for ZentroPay JWT authentication.
 *
 * Strategy:
 *  • ZentroPay issues its OWN ES256 tokens (signed with zentropay_private.pem)
 *    for register / login flows.
 *  • Supabase tokens (signed with the Supabase project's EC private key) are
 *    ALSO accepted — verified against the provided Supabase public JWK.
 *  • The authenticate() middleware tries BOTH public keys so that tokens from
 *    either issuer are accepted transparently.
 *
 * Algorithm: ES256 (ECDSA with P-256 curve and SHA-256)
 */

'use strict';

const crypto = require('crypto');
const path   = require('path');
const fs     = require('fs');

const KEYS_DIR = path.join(__dirname, 'keys');

/* ── 1. ZentroPay internal ES256 keypair ─────────────────────────────────── */
const INTERNAL_PRIVATE_PEM = fs.readFileSync(
  path.join(KEYS_DIR, 'zentropay_private.pem'), 'utf8'
);
const INTERNAL_PUBLIC_PEM = fs.readFileSync(
  path.join(KEYS_DIR, 'zentropay_public.pem'), 'utf8'
);

/* ── 2. Supabase public keys (JWKS) ──────────────────────────────────────── */
const supabaseJwks = JSON.parse(
  fs.readFileSync(path.join(KEYS_DIR, 'supabase_jwks.json'), 'utf8')
);

/**
 * Pre-convert each Supabase JWK → Node.js KeyObject (PEM string) at startup
 * so verification is pure synchronous crypto — no async needed.
 */
const SUPABASE_PUBLIC_KEYS = supabaseJwks.keys.map(jwk => {
  const keyObj = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  return {
    kid: jwk.kid,
    alg: jwk.alg || 'ES256',
    pem: keyObj.export({ type: 'spki', format: 'pem' }),
  };
});

/**
 * JWT_ALGORITHM — both sides use ES256.
 */
const JWT_ALGORITHM  = 'ES256';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * All public keys accepted by the middleware (ZentroPay + Supabase).
 * Format: [{ kid, pem }, …]
 */
const ALL_PUBLIC_KEYS = [
  { kid: 'zentropay-internal', pem: INTERNAL_PUBLIC_PEM },
  ...SUPABASE_PUBLIC_KEYS,
];

module.exports = {
  /** ES256 private key PEM — used only by authService to SIGN new tokens */
  INTERNAL_PRIVATE_PEM,

  /** ZentroPay's own public key PEM */
  INTERNAL_PUBLIC_PEM,

  /** All trusted public keys (ZentroPay + Supabase) */
  ALL_PUBLIC_KEYS,

  /** Algorithm constant */
  JWT_ALGORITHM,

  /** Token expiry */
  JWT_EXPIRES_IN,
};
