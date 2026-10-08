import type { RequestHandler } from 'express';
import { Customer } from '../models/Customer.js';
import { Deal } from '../models/Deal.js';
import { Task, serializeTask } from '../models/Task.js';
import { addDays, todayDate } from '../utils/dates.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { userId } from '../utils/owner.js';
import { paginate, skipFor } from '../utils/pagination.js';
import { containsRegex } from '../utils/regex.js';
import { createTaskSchema, listTasksQuery, tzQuery, updateTaskSchema } from '../validators/task.js';

type Link = string | null | undefined;

const findOwned = async (id: string, owner: string) => {
  const task = await Task.findOne({ _id: id, owner });
  if (!task) throw notFound('Task');
  return task;
};

const LINKS = [
  { path: 'customer', select: 'name company' },
  { path: 'deal', select: 'title stage' },
];

const populateLinks = (task: InstanceType<typeof Task>) => task.populate(LINKS);

/**
 * Checks that linked records belong to the user. A task linked to a deal is
 * attached to that deal's customer; a conflicting customer is rejected.
 */
async function resolveLinks(owner: string, customer: Link, deal: Link) {
  let resolvedCustomer: Link = customer;
  if (deal) {
    const d = await Deal.findOne({ _id: deal, owner }).select('customer');
    if (!d) throw badRequest('Linked deal not found');
    const dealCustomer = d.customer.toString();
    if (customer && customer !== dealCustomer) throw badRequest('Deal does not belong to the selected customer');
    resolvedCustomer = dealCustomer;
  }
  if (resolvedCustomer && !(await Customer.exists({ _id: resolvedCustomer, owner }))) {
    throw badRequest('Linked customer not found');
  }
  return { customer: resolvedCustomer ?? null, deal: deal ?? null };
}

export const listTasks: RequestHandler = async (req, res) => {
  const q = listTasksQuery.parse(req.query);
  const today = todayDate(new Date(), q.tzOffset);
  const filter: Record<string, unknown> = { owner: userId(req) };
  if (q.status === 'open') filter.done = false;
  if (q.status === 'done') filter.done = true;
  if (q.status === 'overdue') Object.assign(filter, { done: false, dueDate: { $lt: today } });
  if (q.status === 'today') Object.assign(filter, { done: false, dueDate: { $gte: today, $lt: addDays(today, 1) } });
  if (q.priority) filter.priority = q.priority;
  if (q.customer) filter.customer = q.customer;
  if (q.deal) filter.deal = q.deal;
  if (q.search) filter.title = containsRegex(q.search);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate(LINKS)
      .sort({ done: 1, dueDate: 1, _id: 1 })
      .skip(skipFor(q.page, q.limit))
      .limit(q.limit),
    Task.countDocuments(filter),
  ]);
  res.json(paginate(tasks.map((t) => serializeTask(t, today)), total, q.page, q.limit));
};

export const getTask: RequestHandler<{ id: string }> = async (req, res) => {
  const { tzOffset } = tzQuery.parse(req.query);
  const task = await findOwned(req.params.id, userId(req));
  await populateLinks(task);
  res.json(serializeTask(task, todayDate(new Date(), tzOffset)));
};

export const createTask: RequestHandler = async (req, res) => {
  const owner = userId(req);
  const { tzOffset } = tzQuery.parse(req.query);
  const data = createTaskSchema.parse(req.body);
  const links = await resolveLinks(owner, data.customer, data.deal);
  const task = await Task.create({ ...data, ...links, owner });
  await populateLinks(task);
  res.status(201).json(serializeTask(task, todayDate(new Date(), tzOffset)));
};

export const updateTask: RequestHandler<{ id: string }> = async (req, res) => {
  const owner = userId(req);
  const { tzOffset } = tzQuery.parse(req.query);
  const data = updateTaskSchema.parse(req.body);
  const task = await findOwned(req.params.id, owner);
  if (data.customer !== undefined || data.deal !== undefined) {
    const customer = data.customer !== undefined ? data.customer : task.customer?.toString();
    // Changing the customer without naming a deal drops a deal that belongs to the old customer.
    const deal = data.deal !== undefined ? data.deal : data.customer !== undefined ? null : task.deal?.toString();
    Object.assign(data, await resolveLinks(owner, customer, deal));
  }
  task.set(data);
  await task.save();
  await populateLinks(task);
  res.json(serializeTask(task, todayDate(new Date(), tzOffset)));
};

export const deleteTask: RequestHandler<{ id: string }> = async (req, res) => {
  const task = await findOwned(req.params.id, userId(req));
  await task.deleteOne();
  res.status(204).end();
};
