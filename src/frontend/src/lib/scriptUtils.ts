/**
 * Formats raw user-pasted content into 4–6 reel-ready script lines.
 * Splits by newlines or sentences, cleans whitespace, keeps original meaning.
 */
export function formatToScript(content: string): string[] {
  const raw = content.trim();
  if (!raw) return [];

  // Split on newlines first, then on sentence boundaries
  let parts = raw
    .split(/\n+/)
    .flatMap((line) =>
      line.length > 120 ? line.split(/(?<=[.!?])\s+/) : [line],
    )
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.length <= 140);

  // Collapse to max 6 lines
  if (parts.length > 6) parts = parts.slice(0, 6);

  // Ensure at least one line
  if (parts.length === 0) parts = [raw.slice(0, 140)];

  return parts;
}
