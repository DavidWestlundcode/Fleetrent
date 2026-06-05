import type { NextRequest } from 'next/server';

// In-memory store — protects within a single serverless instance.
// For multi-instance production hardening, replace with Upstash Redis.
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;

  record.count++;
  return true;
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

// Pre-built limiters for common patterns
export const LIMITS = {
  // Expensive AI calls — 10 per minute per user
  ai: (userId: string) => rateLimit(`ai:${userId}`, 10, 60_000),
  // Lead/contact form — 5 per 10 min per IP
  lead: (ip: string) => rateLimit(`lead:${ip}`, 5, 600_000),
  // Fortnox/Zigned integration actions — 20 per minute per user
  integration: (userId: string) => rateLimit(`integration:${userId}`, 20, 60_000),
  // PDF generation — 5 per minute per user (CPU intensive)
  pdf: (userId: string) => rateLimit(`pdf:${userId}`, 5, 60_000),
  // User admin actions (create/invite user) — 10 per minute per user
  userAdmin: (userId: string) => rateLimit(`userAdmin:${userId}`, 10, 60_000),
  // Sync operations — 5 per 5 minutes per user
  sync: (userId: string) => rateLimit(`sync:${userId}`, 5, 300_000),
  // Generic authenticated mutation — 60 per minute per user
  mutation: (userId: string) => rateLimit(`mutation:${userId}`, 60, 60_000),
  // Webhook endpoints — 100 per minute per IP
  webhook: (ip: string) => rateLimit(`webhook:${ip}`, 100, 60_000),
};
