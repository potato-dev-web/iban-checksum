// Format + mod-97 checksum only. No per-country lengths, no suggestions, no bank data.

/**
 * Strips whitespace and hyphens and uppercases.
 * Throws TypeError if the input is not a string.
 * @param {string} input
 * @returns {string}
 */
export function normalizeIban(input) {
  if (typeof input !== "string") {
    throw new TypeError("normalizeIban expects a string");
  }
  return input.replace(/[\s-]+/g, "").toUpperCase();
}

/**
 * Normalizes, then prints in groups of four characters separated by a space.
 * Does not check validity. Throws TypeError if the input is not a string.
 * @param {string} input
 * @returns {string}
 */
export function formatIban(input) {
  const iban = normalizeIban(input);
  const groups = [];
  for (let i = 0; i < iban.length; i += 4) groups.push(iban.slice(i, i + 4));
  return groups.join(" ");
}

// 2 letters, 2 digits, then 1-30 letters or digits (at most 34 characters in total).
const SHAPE = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

/**
 * True when the input has the general IBAN shape and its mod-97 checksum is 1.
 * Never throws: anything that is not a string returns false.
 * @param {unknown} input
 * @returns {boolean}
 */
export function isValidIbanChecksum(input) {
  if (typeof input !== "string") return false;
  const iban = normalizeIban(input);
  if (!SHAPE.test(iban)) return false;

  // Move the first four characters to the end, then read letters as A=10 ... Z=35.
  // The remainder is carried one character at a time, so no big numbers are needed.
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    remainder =
      code >= 65
        ? (remainder * 100 + (code - 55)) % 97 // letter: two digits
        : (remainder * 10 + (code - 48)) % 97; // digit: one digit
  }
  return remainder === 1;
}
