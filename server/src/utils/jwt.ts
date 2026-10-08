import jwt from 'jsonwebtoken';
import { TOKEN_TTL_SECONDS } from '../config/constants.js';

export function signToken(userId: string, secret: string): string {
  return jwt.sign({}, secret, { subject: userId, expiresIn: TOKEN_TTL_SECONDS, algorithm: 'HS256' });
}

/** Returns the user id, or null when the token is missing, expired or invalid. */
export function verifyToken(token: string, secret: string): string | null {
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
