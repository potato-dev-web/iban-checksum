/**
 * Strips whitespace and hyphens and uppercases.
 * Throws TypeError if the input is not a string.
 */
export function normalizeIban(input: string): string;

/**
 * Normalizes, then prints in groups of four characters separated by a space.
 * Does not check validity. Throws TypeError if the input is not a string.
 */
export function formatIban(input: string): string;

/**
 * True when the input has the general IBAN shape (2 letters, 2 digits, then
 * 1-30 letters or digits) and its mod-97 checksum is 1.
 * Never throws: anything that is not a string returns false.
 */
export function isValidIbanChecksum(input: unknown): boolean;
