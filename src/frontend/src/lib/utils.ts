import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats raw user content into 4-6 reel-ready lines.
 * Does NOT call AI — preserves user's original meaning.
 */
export function formatToScript(content: string): string[] {
  // Split by newlines first, then by sentence-ending punctuation
  const raw = content
    .split(/\n/)
    .flatMap((line) =>
      line
        .split(/(?<=[.!?…])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2),
    )
    .filter((s) => s.length > 0);

  if (raw.length === 0) return [content.trim()];

  // Keep 4-6 lines, preferring shorter ones
  if (raw.length <= 6) return raw;

  // If too many lines, pick evenly spaced ones
  const step = raw.length / 5;
  const picked: string[] = [];
  for (let i = 0; i < 5; i++) {
    picked.push(raw[Math.round(i * step)] || raw[i]);
  }
  return picked;
}
