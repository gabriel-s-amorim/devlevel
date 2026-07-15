import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW = "15 m";

type LimitResult = { success: boolean };

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function createLimiter(max: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(max, WINDOW),
    analytics: true,
    prefix: "devlevel:ratelimit",
  });
}

const loginLimiter = createLimiter(10);
const registerLimiter = createLimiter(5);

/**
 * Serverless-friendly rate limit via Upstash Redis.
 * Graceful fallback: allows all requests when Redis is not configured (local dev).
 */
export async function checkAuthRateLimit(
  request: Request,
  path: "login" | "register"
): Promise<boolean> {
  const limiter = path === "login" ? loginLimiter : registerLimiter;
  if (!limiter) return true;

  const ip = getClientIp(request);
  const result: LimitResult = await limiter.limit(`${path}:${ip}`);
  return result.success;
}
