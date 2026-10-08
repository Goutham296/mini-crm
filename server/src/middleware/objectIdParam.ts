import type { RequestParamHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { notFound } from '../utils/httpError.js';

/** router.param handler: a malformed id can never match a record, so answer 404. */
export const objectIdParam =
  (what: string): RequestParamHandler =>
  (_req, _res, next, value: string) => {
    if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value) || !isValidObjectId(value)) {
      return next(notFound(what));
    }
    next();
  };
