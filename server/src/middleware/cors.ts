import cors from 'cors';
import { HttpError } from '../utils/httpError.js';

/** CORS allowlist with credentials. Disallowed origins get a 403 via the error handler. */
export function corsMiddleware(allowedOrigins: string[]) {
  const allowed = new Set(allowedOrigins);
  return cors({
    credentials: true,
    origin(origin, callback) {
      // Requests without an Origin header (curl, health checks, same-origin) are not CORS requests.
      if (!origin || allowed.has(origin.replace(/\/+$/, ''))) return callback(null, true);
      callback(new HttpError(403, 'Origin not allowed by CORS'));
    },
  });
}
