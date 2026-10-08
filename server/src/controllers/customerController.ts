import type { RequestHandler } from 'express';
import type { SortOrder } from 'mongoose';
import { Customer } from '../models/Customer.js';
import { Deal } from '../models/Deal.js';
import { Task, serializeTask } from '../models/Task.js';
import { todayDate } from '../utils/dates.js';
import { notFound } from '../utils/httpError.js';
import { userId } from '../utils/owner.js';
import { paginate, skipFor } from '../utils/pagination.js';
import { containsRegex } from '../utils/regex.js';
import { tzQuery } from '../validators/task.js';
import { createCustomerSchema, listCustomersQuery, updateCustomerSchema } from '../validators/customer.js';

const SORTS: Record<string, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
};

const findOwned = async (id: string, owner: string) => {
  const customer = await Customer.findOne({ _id: id, owner });
  if (!customer) throw notFound('Customer');
  return customer;
};

export const listCustomers: RequestHandler = async (req, res) => {
  const q = listCustomersQuery.parse(req.query);
  const filter: Record<string, unknown> = { owner: userId(req) };
  if (q.status) filter.status = q.status;
  if (q.search) {
    const rx = containsRegex(q.search);
    filter.$or = [{ name: rx }, { company: rx }, { email: rx }];
  }
  const [items, total] = await Promise.all([
    Customer.find(filter)
      .sort({ ...SORTS[q.sort ?? 'newest'], _id: -1 })
      .skip(skipFor(q.page, q.limit))
      .limit(q.limit),
    Customer.countDocuments(filter),
  ]);
  res.json(paginate(items, total, q.page, q.limit));
};

/** Customer with its deals and tasks (nested data for the detail page). */
export const getCustomer: RequestHandler<{ id: string }> = async (req, res) => {
  const owner = userId(req);
  const { tzOffset } = tzQuery.parse(req.query);
  const customer = await findOwned(req.params.id, owner);
  const [deals, tasks] = await Promise.all([
    Deal.find({ owner, customer: customer._id }).sort({ createdAt: -1 }),
    Task.find({ owner, customer: customer._id }).populate('deal', 'title stage').sort({ done: 1, dueDate: 1 }),
  ]);
  const today = todayDate(new Date(), tzOffset);
  res.json({ customer, deals, tasks: tasks.map((t) => serializeTask(t, today)) });
};

export const createCustomer: RequestHandler = async (req, res) => {
  const data = createCustomerSchema.parse(req.body);
  const customer = await Customer.create({ ...data, owner: userId(req) });
  res.status(201).json(customer);
};

export const updateCustomer: RequestHandler<{ id: string }> = async (req, res) => {
  const data = updateCustomerSchema.parse(req.body);
  const customer = await findOwned(req.params.id, userId(req));
  customer.set(data);
  await customer.save();
  res.json(customer);
};

/** Deletes the customer and everything linked to it (its deals and tasks). */
export const deleteCustomer: RequestHandler<{ id: string }> = async (req, res) => {
  const owner = userId(req);
  const customer = await findOwned(req.params.id, owner);
  const dealIds = await Deal.find({ owner, customer: customer._id }).distinct('_id');
  await Promise.all([
    Task.deleteMany({ owner, $or: [{ customer: customer._id }, { deal: { $in: dealIds } }] }),
    Deal.deleteMany({ owner, customer: customer._id }),
  ]);
  await customer.deleteOne();
  res.status(204).end();
};
