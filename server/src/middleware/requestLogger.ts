import type { RequestHandler } from 'express';
import { logger } from '../utils/logger.js';

/** Logs method, path (no query string) and status only, never bodies, cookies or headers. */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const path = req.originalUrl.split('?')[0];
    logger.info(`${req.method} ${path} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
};
