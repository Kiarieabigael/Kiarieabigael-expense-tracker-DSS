
/**
 * Utility for authentication security and validation.
 */

/**
 * Simulates a secure hash using SHA-256 via Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

/**
 * Validates password strength according to strict rules.
 */
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

  // Adjust score to be max 4 for the UI meter
  const finalScore = Math.min(score - 1, 4);

  return {
    score: Math.max(0, finalScore),
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}

/**
 * Checks if email is already in the local registry.
 */
export function isEmailRegistered(email: string): boolean {
  const users = JSON.parse(localStorage.getItem('settle_registered_users') || '[]');
  return users.some((u: any) => u.email === email.toLowerCase());
}

/**
 * Checks if a password hash is already used by another user.
 */
export function isPasswordHashUnique(hash: string): boolean {
  const users = JSON.parse(localStorage.getItem('settle_registered_users') || '[]');
  return !users.some((u: any) => u.passwordHash === hash);
}

/**
 * Registers a new user locally.
 */
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

/**
 * Verifies credentials against local registry.
 */
export function verifyCredentials(email: string, passwordHash: string): any | null {
  const users = JSON.parse(localStorage.getItem('settle_registered_users') || '[]');
  const user = users.find((u: any) => u.email === email.toLowerCase() && u.passwordHash === passwordHash);
  return user || null;
}
