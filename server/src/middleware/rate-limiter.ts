import { Request, Response, NextFunction } from "express";
import { ApiException } from "../utils/api-response";

// ── In-Memory Token Bucket Store ────────────────────────────────────────
interface BucketEntry {
  count: number;
  /** Timestamp (ms) when this window started */
  windowStart: number;
}

const buckets = new Map<string, BucketEntry>();

// ── Periodic cleanup to prevent unbounded memory growth ─────────────────
const CLEANUP_INTERVAL_MS = 60_000; // every 60 s
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupRunning(windowMs: number): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      if (now - entry.windowStart > windowMs * 2) {
        buckets.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node process to exit even if the timer is still running
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Express middleware builder for rate limiting.
 * Uses a token-bucket algorithm per IP.
 */
export function rateLimiter(maxRequests = 60, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    ensureCleanupRunning(windowMs);

    // Extract identifier (IP address)
    const identifier = req.ip || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    const entry = buckets.get(identifier);

    // First request or window has expired → reset
    if (!entry || now - entry.windowStart >= windowMs) {
      buckets.set(identifier, { count: 1, windowStart: now });
      return next();
    }

    // Within current window – increment
    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.setHeader("Retry-After", retryAfterSec);
      return next(
        new ApiException(
          `Rate limit exceeded. Please try again in ${retryAfterSec} seconds.`,
          429
        )
      );
    }

    next();
  };
}
