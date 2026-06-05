import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Lazy-initialized — only created on first rateLimit() call, not at build time.
let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url?.startsWith('https://') && token) {
    _redis = new Redis({ url, token });
  } else {
    _redis = null;
  }
  return _redis;
}

// In-memory fallback (dev / missing env vars)
const memStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const now = Date.now();
    const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`;
    const count = await redis.incr(windowKey);
    if (count === 1) {
      await redis.pexpire(windowKey, windowMs);
    }
    return count <= maxRequests;
  }

  // In-memory fallback
  const now = Date.now();
  const record = memStore.get(key);
  if (!record || now > record.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
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
