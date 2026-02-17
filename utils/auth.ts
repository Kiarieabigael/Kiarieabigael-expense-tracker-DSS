
/**
 * Utility for authentication security and validation using PBKDF2 and HMAC.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
// Use 'as const' to ensure 'name' is exactly 'HMAC' and 'hash' is a valid hash identifier literal for TS.
const HMAC_ALGO = { name: "HMAC", hash: "SHA-256" } as const;

/**
 * Utility to convert ArrayBuffer to Hex String
 */
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Utility to convert Hex String to Uint8Array
 */
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Derives a key using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    passwordKey,
    256
  );

  return bufToHex(derivedBits);
}

/**
 * Hashes a password using PBKDF2 with a random salt.
 * Returns a string formatted as "salt:hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveKey(password, salt);
  return `${bufToHex(salt.buffer)}:${hash}`;
}

/**
 * Verifies credentials against local registry using stored salt and PBKDF2.
 */
export async function verifyCredentials(email: string, passwordPlain: string): Promise<any | null> {
  const users = JSON.parse(localStorage.getItem('settle_registered_users') || '[]');
  const user = users.find((u: any) => u.email === email.toLowerCase());
  
  if (!user || !user.passwordHash) return null;

  const [saltHex, storedHash] = user.passwordHash.split(':');
  if (!saltHex || !storedHash) return null;

  const salt = hexToBuf(saltHex);
  const derivedHash = await deriveKey(passwordPlain, salt);
  
  return derivedHash === storedHash ? user : null;
}

/**
 * Session Integrity Logic (HMAC)
 */

async function getSystemHmacKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem('settle_system_key');
  if (storedKey) {
    return await crypto.subtle.importKey(
      "raw",
      hexToBuf(storedKey),
      HMAC_ALGO,
      false,
      ["sign", "verify"]
    );
  } else {
    // HMAC is a symmetric algorithm, so generateKey returns a CryptoKey. 
    // We cast it to fix the TS error where it expects a CryptoKey specifically for exportKey.
    const key = (await crypto.subtle.generateKey(HMAC_ALGO, true, ["sign", "verify"])) as CryptoKey;
    const exported = await crypto.subtle.exportKey("raw", key);
    localStorage.setItem('settle_system_key', bufToHex(exported));
    return key;
  }
}

export async function signSession(userData: any): Promise<string> {
  const key = await getSystemHmacKey();
  const encoder = new TextEncoder();
  const dataStr = JSON.stringify(userData);
  const signature = await crypto.subtle.sign(HMAC_ALGO, key, encoder.encode(dataStr));
  return `${dataStr}.${bufToHex(signature)}`;
}

export async function verifySession(signedSession: string): Promise<any | null> {
  try {
    const [dataStr, signatureHex] = signedSession.split('.');
    if (!dataStr || !signatureHex) return null;

    const key = await getSystemHmacKey();
    const encoder = new TextEncoder();
    const signature = hexToBuf(signatureHex);
    
    const isValid = await crypto.subtle.verify(HMAC_ALGO, key, signature, encoder.encode(dataStr));
    return isValid ? JSON.parse(dataStr) : null;
  } catch (e) {
    console.error("Session verification failed", e);
    return null;
  }
}

/**
 * Validations and Helpers
 */

export interface PasswordStrengthResult {
  score: number;
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 12) score++;
  else errors.push("At least 12 characters");

  if (/[A-Z]/.test(password)) score++;
  else errors.push("One uppercase letter");

  if (/[a-z]/.test(password)) score++;
  else errors.push("One lowercase letter");

  if (/[0-9]/.test(password)) score++;
  else errors.push("One number");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else errors.push("One special character");

  const finalScore = Math.min(score - 1, 4);

  return {
    score: Math.max(0, finalScore),
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}

export function isEmailRegistered(email: string): boolean {
  const users = JSON.parse(localStorage.getItem('settle_registered_users') || '[]');
  return users.some((u: any) => u.email === email.toLowerCase());
}

export function isPasswordHashUnique(hash: string): boolean {
  const users = JSON.parse(localStorage.getItem('settle_registered_users') || '[]');
  return !users.some((u: any) => u.passwordHash === hash);
}

export function registerUserLocally(email: string, passwordHash: string): string {
  const users = JSON.parse(localStorage.getItem('settle_registered_users') || '[]');
  const userId = crypto.randomUUID();
  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: Date.now()
  };
  users.push(newUser);
  localStorage.setItem('settle_registered_users', JSON.stringify(users));
  return userId;
}
