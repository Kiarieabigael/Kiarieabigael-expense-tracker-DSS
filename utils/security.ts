
/**
 * Simple input sanitization to prevent basic XSS
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .slice(0, 100); // Reasonable limit for descriptions
};

/**
 * Validates expense amount
 */
export const validateAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0 && amount < 1000000000;
};

/**
 * Validates date string
 */
export const validateDate = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};
