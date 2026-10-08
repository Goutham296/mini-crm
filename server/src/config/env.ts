import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string({ error: 'is required' }).min(1, 'is required'),
  JWT_SECRET: z.string({ error: 'is required' }).min(16, 'must be at least 16 characters'),
  CLIENT_URL: z.string({ error: 'is required' }).min(1, 'is required'),
});

export interface Env {
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  clientUrls: string[];
}

/** Reads and validates process.env. Throws (fail fast) when required values are missing. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration -> ${details}`);
  }
  const e = parsed.data;
  const clientUrls = e.CLIENT_URL.split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  if (clientUrls.length === 0) throw new Error('Invalid environment configuration -> CLIENT_URL is empty');

  return {
    nodeEnv: e.NODE_ENV,
    isProduction: e.NODE_ENV === 'production',
    port: e.PORT,
    mongoUri: e.MONGO_URI,
    jwtSecret: e.JWT_SECRET,
    clientUrls,
  };
}
