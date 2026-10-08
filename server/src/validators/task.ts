import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUS_FILTERS } from '../config/constants.js';
import { nonEmptyPatch, objectId, optionalQuery, paginationQuery, searchQuery, tzOffsetQuery } from './common.js';

const fields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  dueDate: z.preprocess((v) => (v === null || v === '' ? undefined : v), z.coerce.date('Enter a valid due date')),
  priority: z.enum(TASK_PRIORITIES),
  done: z.boolean(),
  customer: objectId.nullable(),
  deal: objectId.nullable(),
};

export const createTaskSchema = z.object(fields).partial().required({ title: true, dueDate: true });
export const updateTaskSchema = nonEmptyPatch(z.object(fields).partial());

export const listTasksQuery = z.object({
  ...paginationQuery,
  search: searchQuery,
  status: optionalQuery(z.enum(TASK_STATUS_FILTERS)),
  priority: optionalQuery(z.enum(TASK_PRIORITIES)),
  customer: optionalQuery(objectId),
  deal: optionalQuery(objectId),
  tzOffset: tzOffsetQuery,
});

export const tzQuery = z.object({ tzOffset: tzOffsetQuery });
