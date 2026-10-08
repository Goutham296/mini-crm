import { Types } from 'mongoose';
import type { Request } from 'express';
import { HttpError } from './httpError.js';

/** Id of the authenticated user. Only call behind the requireAuth middleware. */
export function userId(req: Request): string {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  return req.user.id;
}

export function ownerObjectId(req: Request): Types.ObjectId {
  return new Types.ObjectId(userId(req));
}
