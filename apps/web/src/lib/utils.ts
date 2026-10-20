import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Extracts {{variable}} tokens from prompt strings
 */
export function extractVariables(promptText: string): string[] {
  const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(promptText)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
}

/**
 * Replaces {{variable}} tokens with supplied dictionary values
 */
export function interpolatePrompt(promptText: string, values: Record<string, string>): string {
  return promptText.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (_, key) => {
    return values[key] !== undefined && values[key] !== '' ? values[key] : `{{${key}}}`;
  });
}
