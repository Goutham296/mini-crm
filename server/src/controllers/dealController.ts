import type { RequestHandler } from 'express';
import { Customer } from '../models/Customer.js';
import { Deal, applyStage } from '../models/Deal.js';
import { Task } from '../models/Task.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { userId } from '../utils/owner.js';
import { paginate, skipFor } from '../utils/pagination.js';
import { containsRegex } from '../utils/regex.js';
import { createDealSchema, listDealsQuery, updateDealSchema, updateStageSchema } from '../validators/deal.js';

const CUSTOMER_FIELDS = 'name company status';

const findOwned = async (id: string, owner: string) => {
  const deal = await Deal.findOne({ _id: id, owner });
  if (!deal) throw notFound('Deal');
  return deal;
};

const assertCustomerOwned = async (customerId: string, owner: string) => {
  if (!(await Customer.exists({ _id: customerId, owner }))) throw badRequest('Linked customer not found');
};

export const listDeals: RequestHandler = async (req, res) => {
  const q = listDealsQuery.parse(req.query);
  const filter: Record<string, unknown> = { owner: userId(req) };
  if (q.stage) filter.stage = q.stage;
  if (q.customer) filter.customer = q.customer;
  if (q.search) filter.title = containsRegex(q.search);
  const [items, total] = await Promise.all([
    Deal.find(filter)
      .populate('customer', CUSTOMER_FIELDS)
      .sort({ updatedAt: -1, _id: -1 })
      .skip(skipFor(q.page, q.limit))
      .limit(q.limit),
    Deal.countDocuments(filter),
  ]);
  res.json(paginate(items, total, q.page, q.limit));
};

export const getDeal: RequestHandler<{ id: string }> = async (req, res) => {
  const deal = await findOwned(req.params.id, userId(req));
  await deal.populate('customer', CUSTOMER_FIELDS);
  res.json(deal);
};

export const createDeal: RequestHandler = async (req, res) => {
  const owner = userId(req);
  const { stage = 'lead', ...data } = createDealSchema.parse(req.body);
  await assertCustomerOwned(data.customer, owner);
  const deal = new Deal({ ...data, owner });
  applyStage(deal, stage);
  await deal.save();
  await deal.populate('customer', CUSTOMER_FIELDS);
  res.status(201).json(deal);
};

export const updateDeal: RequestHandler<{ id: string }> = async (req, res) => {
  const owner = userId(req);
  const { stage, ...data } = updateDealSchema.parse(req.body);
  const deal = await findOwned(req.params.id, owner);
  const customerChanged = data.customer !== undefined && data.customer !== deal.customer.toString();
  if (customerChanged) await assertCustomerOwned(data.customer!, owner);
  deal.set(data);
  if (stage) applyStage(deal, stage);
  await deal.save();
  // Keep tasks attached to this deal pointing at the deal's customer.
  if (customerChanged) await Task.updateMany({ owner, deal: deal._id }, { customer: deal.customer });
  await deal.populate('customer', CUSTOMER_FIELDS);
  res.json(deal);
};

/** Pipeline board drag & drop. */
export const updateDealStage: RequestHandler<{ id: string }> = async (req, res) => {
  const { stage } = updateStageSchema.parse(req.body);
  const deal = await findOwned(req.params.id, userId(req));
  applyStage(deal, stage);
  await deal.save();
  await deal.populate('customer', CUSTOMER_FIELDS);
  res.json(deal);
};

/** Deletes the deal; its tasks are kept but unlinked from it. */
export const deleteDeal: RequestHandler<{ id: string }> = async (req, res) => {
  const owner = userId(req);
  const deal = await findOwned(req.params.id, owner);
  await Task.updateMany({ owner, deal: deal._id }, { deal: null });
  await deal.deleteOne();
  res.status(204).end();
};
