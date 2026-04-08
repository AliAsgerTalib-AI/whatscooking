/**
 * Generates a cryptographically-random unique ID.
 * Uses `crypto.randomUUID()` (available in all modern browsers and Node ≥ 14.17).
 * Falls back to `Math.random()` in environments where the Web Crypto API is absent.
 * @returns {string}
 */
export function makeid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (e.g. very old environments / test runners without crypto)
  return Math.random().toString(36).slice(2, 10);
}
