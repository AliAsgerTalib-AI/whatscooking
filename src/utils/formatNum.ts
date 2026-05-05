export function formatNum(n: number): string {
  if (n <= 0) return "0";
  if (n === Math.floor(n)) return String(Math.floor(n));
  const fracs: [number, string][] = [[0.25,"¼"],[0.33,"⅓"],[0.5,"½"],[0.67,"⅔"],[0.75,"¾"]];
  for (const [fv, sym] of fracs) {
    const whole = Math.floor(n);
    if (Math.abs(n - whole - fv) < 0.07) return whole > 0 ? `${whole}${sym}` : sym;
  }
  return parseFloat(n.toFixed(1)).toString();
}
