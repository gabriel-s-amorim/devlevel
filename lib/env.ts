import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    console.error("Invalid environment variables:", details);
    throw new Error(
      `Invalid environment variables: ${Object.keys(details).join(", ")}`
    );
  }
  return parsed.data;
}

/**
 * Validated env. Throws on first access if required vars are missing.
 * Lazy so Vitest unit tests that don't import this module stay isolated.
 */
let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) cached = loadEnv();
  return cached;
}

export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
