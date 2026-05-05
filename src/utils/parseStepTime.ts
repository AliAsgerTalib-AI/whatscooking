export function parseStepTime(text: string): number | null {
  const hourRangeMatch = text.match(/(\d+)\s*(?:[–—\-]|to)\s*(\d+)\s*hour/i);
  if (hourRangeMatch) return parseInt(hourRangeMatch[2], 10) * 3600;

  const hourMatch = text.match(/(\d+)\s*hour/i);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 3600;

  const rangeMatch = text.match(/(\d+)\s*(?:[–—\-]|to)\s*(\d+)\s*min/i);
  if (rangeMatch) return parseInt(rangeMatch[2], 10) * 60;

  const minMatch = text.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;

  const secMatch = text.match(/(\d+)\s*sec/i);
  if (secMatch) return parseInt(secMatch[1], 10);

  return null;
}
