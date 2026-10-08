/* Seeds the demo account. Usage: MONGO_URI=... npm run seed (resets only the demo user's data). */
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config/constants.js';
import { connectDb, disconnectDb } from '../config/db.js';
import { Customer } from '../models/Customer.js';
import { Deal } from '../models/Deal.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { addDays, monthStart, todayDate } from '../utils/dates.js';
import { logger } from '../utils/logger.js';
import { CUSTOMERS, DEALS, DEMO_USER, TASKS } from './seedData.js';

const DAY_MS = 24 * 60 * 60 * 1000;

async function seed(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required');
  await connectDb(uri);

  const existing = await User.findOne({ email: DEMO_USER.email });
  if (existing) {
    await Promise.all([
      Task.deleteMany({ owner: existing._id }),
      Deal.deleteMany({ owner: existing._id }),
      Customer.deleteMany({ owner: existing._id }),
    ]);
    await existing.deleteOne();
  }

  const user = await User.create({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    passwordHash: await bcrypt.hash(DEMO_USER.password, BCRYPT_ROUNDS),
  });
  const owner = user._id;
  const now = new Date();
  const today = todayDate(now);
  const thisMonth = monthStart(now);

  const customers = await Customer.insertMany(
    CUSTOMERS.map((c) => ({
      ...c,
      owner,
      email: `${c.name.split(' ')[0].toLowerCase()}@${c.company.split(' ')[0].toLowerCase()}.example`,
      phone: `+91 98${String(Math.abs(c.name.length * 7919) % 100000000).padStart(8, '0')}`,
    })),
  );

  const deals = await Deal.insertMany(
    DEALS.map((d) => {
      // "Won this month" deals never fall before the 1st of the month, whatever day the seed runs.
      const wonAt =
        d.wonDaysAgo === undefined
          ? null
          : new Date(Math.max(now.getTime() - d.wonDaysAgo * DAY_MS, d.wonDaysAgo < 28 ? thisMonth.getTime() : 0));
      return {
        owner,
        title: d.title,
        value: d.value,
        stage: d.stage,
        customer: customers[d.customer]._id,
        expectedCloseDate: addDays(today, d.closeInDays),
        wonAt,
      };
    }),
  );

  await Task.insertMany(
    TASKS.map((t) => {
      const deal = t.deal === undefined ? undefined : deals[t.deal];
      const customer = deal ? deal.customer : t.customer === undefined ? null : customers[t.customer]._id;
      return {
        owner,
        title: t.title,
        dueDate: addDays(today, t.dueInDays),
        priority: t.priority,
        done: t.done,
        customer,
        deal: deal?._id ?? null,
      };
    }),
  );

  logger.info(`Seeded demo account: ${customers.length} customers, ${deals.length} deals, ${TASKS.length} tasks`);
}

seed()
  .then(() => disconnectDb())
  .catch(async (err: unknown) => {
    logger.error(`Seed failed: ${err instanceof Error ? err.message : String(err)}`);
    await disconnectDb();
    process.exitCode = 1;
  });
