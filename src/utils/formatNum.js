/**
 * Formats a decimal number as a human-friendly fraction string.
 * e.g. 1.5 → "1½", 0.25 → "¼", 2 → "2"
 * @param {number} n
 * @returns {string}
 */
export function formatNum(n) {
  if (n <= 0) return "0";
  if (n === Math.floor(n)) return String(Math.floor(n));
  const fracs = [[0.25,"¼"],[0.33,"⅓"],[0.5,"½"],[0.67,"⅔"],[0.75,"¾"]];
  for (const [fv, sym] of fracs) {
    const whole = Math.floor(n);
    if (Math.abs(n - whole - fv) < 0.07) return whole > 0 ? `${whole}${sym}` : sym;
  }
  return parseFloat(n.toFixed(1)).toString();
}
