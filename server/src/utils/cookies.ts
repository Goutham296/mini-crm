import type { CookieOptions } from 'express';
import type { Env } from '../config/env.js';
import { TOKEN_TTL_SECONDS } from '../config/constants.js';

export function authCookieOptions(env: Env): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS * 1000,
  };
}

export function clearCookieOptions(env: Env): CookieOptions {
  const { maxAge: _maxAge, ...rest } = authCookieOptions(env);
  return rest;
}
