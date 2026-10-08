import type { RequestHandler } from 'express';
import { AUTH_COOKIE } from '../config/constants.js';
import { HttpError } from '../utils/httpError.js';
import { verifyToken } from '../utils/jwt.js';

/** Requires a valid JWT in the httpOnly auth cookie; sets req.user. Otherwise 401. */
export function requireAuth(jwtSecret: string): RequestHandler {
  return (req, _res, next) => {
    const token: unknown = req.cookies?.[AUTH_COOKIE];
    const id = typeof token === 'string' && token ? verifyToken(token, jwtSecret) : null;
    if (!id) return next(new HttpError(401, 'Not authenticated'));
    req.user = { id };
    next();
  };
}
