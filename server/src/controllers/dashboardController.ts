import type { RequestHandler } from 'express';
import { DEAL_STAGES } from '../config/constants.js';
import { Customer } from '../models/Customer.js';
import { Deal } from '../models/Deal.js';
import { Task } from '../models/Task.js';
import { addDays, monthStart, todayDate } from '../utils/dates.js';
import { ownerObjectId } from '../utils/owner.js';
import { tzQuery } from '../validators/task.js';

interface StageRow {
  _id: string;
  value: number;
  count: number;
}
interface DealFacets {
  byStage: StageRow[];
  wonThisMonth: { count: number; value: number }[];
  open: { count: number; value: number }[];
}
interface TaskFacets {
  dueToday: { n: number }[];
  overdue: { n: number }[];
}

/** All numbers are computed with MongoDB aggregation, scoped to the logged-in user. */
export const getDashboard: RequestHandler = async (req, res) => {
  const owner = ownerObjectId(req);
  const { tzOffset } = tzQuery.parse(req.query);
  const now = new Date();
  const today = todayDate(now, tzOffset);

  const [customerAgg, dealAgg, taskAgg] = await Promise.all([
    Customer.aggregate<{ n: number }>([{ $match: { owner } }, { $count: 'n' }]),
    Deal.aggregate<DealFacets>([
      { $match: { owner } },
      {
        $facet: {
          byStage: [{ $group: { _id: '$stage', value: { $sum: '$value' }, count: { $sum: 1 } } }],
          open: [
            { $match: { stage: { $nin: ['won', 'lost'] } } },
            { $group: { _id: null, count: { $sum: 1 }, value: { $sum: '$value' } } },
          ],
          wonThisMonth: [
            { $match: { stage: 'won', wonAt: { $gte: monthStart(now, tzOffset) } } },
            { $group: { _id: null, count: { $sum: 1 }, value: { $sum: '$value' } } },
          ],
        },
      },
    ]),
    Task.aggregate<TaskFacets>([
      { $match: { owner, done: false } },
      {
        $facet: {
          dueToday: [{ $match: { dueDate: { $gte: today, $lt: addDays(today, 1) } } }, { $count: 'n' }],
          overdue: [{ $match: { dueDate: { $lt: today } } }, { $count: 'n' }],
        },
      },
    ]),
  ]);

  const deals = dealAgg[0] ?? { byStage: [], wonThisMonth: [], open: [] };
  const tasks = taskAgg[0] ?? { dueToday: [], overdue: [] };
  const pipelineByStage = DEAL_STAGES.map((stage) => {
    const row = deals.byStage.find((r) => r._id === stage);
    return { stage, value: row?.value ?? 0, count: row?.count ?? 0 };
  });

  res.json({
    totalCustomers: customerAgg[0]?.n ?? 0,
    openPipelineValue: deals.open[0]?.value ?? 0,
    openDeals: deals.open[0]?.count ?? 0,
    dealsWonThisMonth: {
      count: deals.wonThisMonth[0]?.count ?? 0,
      value: deals.wonThisMonth[0]?.value ?? 0,
    },
    tasksDueToday: tasks.dueToday[0]?.n ?? 0,
    overdueTasks: tasks.overdue[0]?.n ?? 0,
    pipelineByStage,
  });
};
