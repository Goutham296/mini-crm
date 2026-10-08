import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

interface ErrorBody {
  message: string;
  errors?: unknown;
  stack?: string;
}

export const notFoundRoute: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'Route not found'));
};

function isDuplicateKey(err: unknown): err is { code: number; keyPattern?: Record<string, unknown> } {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;
}

function bodyParserStatus(err: unknown): number | undefined {
  const e = err as { type?: string; status?: number };
  if (e?.type === 'entity.parse.failed') return 400;
  if (e?.type === 'entity.too.large') return 413;
  return undefined;
}

function toResponse(err: unknown): { status: number; body: ErrorBody } {
  if (err instanceof HttpError) {
    return { status: err.status, body: { message: err.message, ...(err.errors ? { errors: err.errors } : {}) } };
  }
  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return { status: 400, body: { message: errors[0]?.message ?? 'Validation failed', errors } };
  }
  if (err instanceof mongoose.Error.CastError) {
    if (err.kind === 'ObjectId') return { status: 404, body: { message: 'Resource not found' } };
    return { status: 400, body: { message: `Invalid value for ${err.path}` } };
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
    return { status: 400, body: { message: 'Validation failed', errors } };
  }
  if (isDuplicateKey(err)) {
    const field = Object.keys(err.keyPattern ?? {})[0];
    const message = field === 'email' ? 'An account with this email already exists' : 'Duplicate value';
    return { status: 409, body: { message } };
  }
  const parserStatus = bodyParserStatus(err);
  if (parserStatus === 400) return { status: 400, body: { message: 'Malformed JSON body' } };
  if (parserStatus === 413) return { status: 413, body: { message: 'Request body too large' } };
  return { status: 500, body: { message: 'Internal server error' } };
}

export function errorHandler(isProduction: boolean): ErrorRequestHandler {
  return (err, req, res, _next) => {
    const { status, body } = toResponse(err);
    if (status >= 500) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error(`${req.method} ${req.originalUrl.split('?')[0]} -> ${e.name}: ${e.message}`);
      if (!isProduction && e.stack) body.stack = e.stack;
    }
    res.status(status).json(body);
  };
}
