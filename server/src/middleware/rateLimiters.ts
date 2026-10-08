import { rateLimit, type Options } from 'express-rate-limit';

const base: Partial<Options> = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({ message: 'Too many attempts. Please try again later.' });
  },
};

/** Created per app instance so each app (and each test) has its own counters. */
export function createRateLimiters() {
  return {
    login: rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 10 }),
    register: rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 10 }),
    passwordReset: rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 5 }),
  };
}
