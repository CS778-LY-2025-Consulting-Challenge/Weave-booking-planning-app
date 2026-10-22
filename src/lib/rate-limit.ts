import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Shared Rate Limiter for Weave using Upstash Redis.
 *
 * Rules:
 * - AI Chat: 5 requests per hour per signed-in user (fallback to IP for visitors).
 * - Flight Search: 30 requests per hour per visitor.
 * - AI Itinerary & Planner: 5 requests per hour per user/visitor.
 *
 * Graceful fallback: If Upstash Redis is not configured in .env.local,
 * requests are allowed through with a warning so local development is not blocked.
 */

const isConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('your_upstash')
);

export const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// AI chat: 5 requests per hour per signed-in user
export const aiChatLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:ai:chat',
    })
  : null;

// Flight search: 30 requests per hour per visitor
export const flightSearchLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 h'),
      analytics: true,
      prefix: 'ratelimit:flights',
    })
  : null;

// AI Itinerary Planner & Search: 5 requests per hour
export const aiPlannerLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:ai:planner',
    })
  : null;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp in ms
}

/**
 * Extracts client identity: signed-in user ID (preferred) or visitor IP address.
 */
export async function getClientIdentifier(request?: Request): Promise<{ identifier: string; isUser: boolean }> {
  try {
    const authData = await auth();
    if (authData?.userId) {
      return { identifier: `user:${authData.userId}`, isUser: true };
    }
  } catch (err) {
    // Auth check may fail or be absent in public endpoints, fallback to IP
  }

  let ip = '127.0.0.1';
  if (request) {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else {
      ip = request.headers.get('x-real-ip') || '127.0.0.1';
    }
  }

  return { identifier: `ip:${ip}`, isUser: false };
}

/**
 * Checks a rate limit against Upstash Redis.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    // Upstash Redis not configured, allow request through
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 3600000,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.warn('[RateLimit] Upstash call failed, allowing request as fallback:', error);
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 3600000,
    };
  }
}

/**
 * Standard 429 Too Many Requests response with standard rate limit headers.
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  message = 'Too many requests. Please try again later.'
) {
  const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));

  return NextResponse.json(
    {
      error: 'Too many requests',
      message,
      limit: result.limit,
      remaining: result.remaining,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
      },
    }
  );
}
