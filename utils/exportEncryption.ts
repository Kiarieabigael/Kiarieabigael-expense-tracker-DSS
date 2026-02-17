
/**
 * Utility for AES-GCM encryption of exported data.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // Standard for AES-GCM
const ALGO_NAME = "AES-GCM";

function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function deriveExportKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    passwordKey,
    { name: ALGO_NAME, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts data using AES-GCM and a password.
 * Format: salt(hex):iv(hex):ciphertext(hex)
 */
export async function encryptExportData(data: any, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const plainText = encoder.encode(JSON.stringify(data));
  
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const key = await deriveExportKey(password, salt);
  
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGO_NAME, iv: iv },
    key,
    plainText
  );

  return `${bufToHex(salt)}:${bufToHex(iv)}:${bufToHex(cipherBuffer)}`;
}

/**
 * Decrypts data using AES-GCM and a password.
 */
export async function decryptExportData(encryptedStr: string, password: string): Promise<any> {
  const [saltHex, ivHex, cipherHex] = encryptedStr.split(':');
  if (!saltHex || !ivHex || !cipherHex) throw new Error("Invalid encrypted format");

  const salt = hexToBuf(saltHex);
  const iv = hexToBuf(ivHex);
  const cipherBuffer = hexToBuf(cipherHex);
  
  const key = await deriveExportKey(password, salt);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGO_NAME, iv: iv },
    key,
    cipherBuffer
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decryptedBuffer));
}
