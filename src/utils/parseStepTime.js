/**
 * Extracts a duration in seconds from natural-language step text.
 * Returns null if no time hint is found.
 * Priority: hours > minutes range > minutes > seconds.
 */
export function parseStepTime(text) {
  // 1 hour / 2 hours
  const hourMatch = text.match(/(\d+)\s*hour/i);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 3600;

  // Range: "3–4 min", "3-4 minutes", "3 to 4 minutes" — take upper bound
  const rangeMatch = text.match(/(\d+)\s*(?:[–\-]|to)\s*(\d+)\s*min/i);
  if (rangeMatch) return parseInt(rangeMatch[2], 10) * 60;

  // Single minutes: "10 minutes", "about 5 min"
  const minMatch = text.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;

  // Seconds only
  const secMatch = text.match(/(\d+)\s*sec/i);
  if (secMatch) return parseInt(secMatch[1], 10);

  return null;
}
