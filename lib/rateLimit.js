/**
 * In-memory sliding-window rate limiter.
 * Works per Vercel instance — good enough to stop bots on any given cold start.
 * For multi-instance protection, swap the store for Upstash Redis.
 *
 * Usage:
 *   const limiter = rateLimit({ windowMs: 60_000, max: 5 });
 *   const result  = limiter.check(ip);
 *   if (!result.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

export function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  // Each limiter gets its own store — prevents cross-limiter count interference
  // when the same key (e.g. an IP) is checked by different limiters.
  const store = new Map(); // key → { count, resetAt }

  if (typeof setInterval !== "undefined") {
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of store) {
        if (val.resetAt <= now) store.delete(key);
      }
    }, windowMs).unref?.();
  }

  return {
    check(key) {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, remaining: max - 1 };
      }

      if (entry.count >= max) {
        return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
      }

      entry.count++;
      return { ok: true, remaining: max - entry.count };
    },
  };
}

/** Extract the real IP from a Next.js Request object. */
export function getIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ── Pre-configured limiters for common use-cases ──────────────────────────────

/** 5 requests per minute — for form submissions (subscribe, contact, leads) */
export const formLimiter = rateLimit({ windowMs: 60_000, max: 5 });

/** 30 requests per minute — for read APIs (articles, vehicles) */
export const readLimiter = rateLimit({ windowMs: 60_000, max: 30 });

/** 10 requests per minute — for comment posting */
export const commentLimiter = rateLimit({ windowMs: 60_000, max: 10 });

/** 3 requests per minute — for auth (login) */
export const authLimiter = rateLimit({ windowMs: 60_000, max: 3 });
