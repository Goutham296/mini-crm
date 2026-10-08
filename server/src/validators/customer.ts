import { z } from 'zod';
import { CUSTOMER_STATUSES } from '../config/constants.js';
import { nonEmptyPatch, optionalQuery, paginationQuery, searchQuery } from './common.js';

const fields = {
  name: z.string().trim().min(1, 'Name is required').max(100),
  company: z.string().trim().max(100),
  email: z.union([z.literal(''), z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'))]),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s().-]*$/, 'Phone may only contain digits, spaces and + ( ) - .'),
  status: z.enum(CUSTOMER_STATUSES),
  notes: z.string().trim().max(2000),
};

export const createCustomerSchema = z.object(fields).partial().required({ name: true });
export const updateCustomerSchema = nonEmptyPatch(z.object(fields).partial());

export const listCustomersQuery = z.object({
  ...paginationQuery,
  search: searchQuery,
  status: optionalQuery(z.enum(CUSTOMER_STATUSES)),
  sort: optionalQuery(z.enum(['newest', 'oldest', 'name'])),
});
