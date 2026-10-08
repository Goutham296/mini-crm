import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid id');

/** Treats empty query-string values (e.g. `?status=`) as "not provided". */
export const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);
export const optionalQuery = <T extends z.ZodType>(schema: T) => z.preprocess(emptyToUndefined, schema.optional());

export const paginationQuery = {
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(10_000).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(10)),
};

export const searchQuery = optionalQuery(z.string().trim().max(100));

/** Client timezone offset in minutes, as returned by Date#getTimezoneOffset(). */
export const tzOffsetQuery = z.preprocess(emptyToUndefined, z.coerce.number().int().min(-840).max(840).default(0));

/** Optional date in a body: accepts ISO strings, `null` or `""` (clears the value). */
export const nullableDate = z.preprocess((v) => (v === '' ? null : v), z.coerce.date().nullable());

export const nonEmptyPatch = <T extends z.ZodObject>(schema: T) =>
  schema.refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' });
