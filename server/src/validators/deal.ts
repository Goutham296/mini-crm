import { z } from 'zod';
import { DEAL_STAGES } from '../config/constants.js';
import { nonEmptyPatch, nullableDate, objectId, optionalQuery, paginationQuery, searchQuery } from './common.js';

const fields = {
  title: z.string().trim().min(1, 'Title is required').max(150),
  value: z.coerce.number('Value must be a number').min(0, 'Value cannot be negative').max(1e12),
  stage: z.enum(DEAL_STAGES),
  expectedCloseDate: nullableDate,
  customer: objectId,
};

export const createDealSchema = z.object(fields).partial().required({ title: true, value: true, customer: true });
export const updateDealSchema = nonEmptyPatch(z.object(fields).partial());
export const updateStageSchema = z.object({ stage: z.enum(DEAL_STAGES) });

export const listDealsQuery = z.object({
  ...paginationQuery,
  search: searchQuery,
  stage: optionalQuery(z.enum(DEAL_STAGES)),
  customer: optionalQuery(objectId),
});
