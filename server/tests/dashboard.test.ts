import { beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { makeApp, signUp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = makeApp();
});

const isoDay = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

describe('dashboard', () => {
  it('returns aggregated numbers for the logged-in user only', async () => {
    const { agent } = await signUp(app);
    const other = await signUp(app);
    await other.agent.post('/api/customers').send({ name: 'Not mine' }).expect(201);

    const c1 = (await agent.post('/api/customers').send({ name: 'One' })).body;
    await agent.post('/api/customers').send({ name: 'Two' }).expect(201);

    const deal = (value: number, stage: string) =>
      agent.post('/api/deals').send({ title: `${stage} ${value}`, value, stage, customer: c1.id }).expect(201);
    await deal(100, 'lead');
    await deal(200, 'qualified');
    await deal(300, 'proposal');
    await deal(400, 'won');
    await deal(600, 'won');
    await deal(50, 'lost');

    await agent.post('/api/tasks').send({ title: 'today', dueDate: isoDay(0) }).expect(201);
    await agent.post('/api/tasks').send({ title: 'late 1', dueDate: isoDay(-1) }).expect(201);
    await agent.post('/api/tasks').send({ title: 'late 2', dueDate: isoDay(-4) }).expect(201);
    await agent.post('/api/tasks').send({ title: 'late done', dueDate: isoDay(-4), done: true }).expect(201);
    await agent.post('/api/tasks').send({ title: 'future', dueDate: isoDay(5) }).expect(201);

    const res = await agent.get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalCustomers: 2,
      openPipelineValue: 600,
      openDeals: 3,
      dealsWonThisMonth: { count: 2, value: 1000 },
      tasksDueToday: 1,
      overdueTasks: 2,
    });
    expect(res.body.pipelineByStage).toEqual([
      { stage: 'lead', value: 100, count: 1 },
      { stage: 'qualified', value: 200, count: 1 },
      { stage: 'proposal', value: 300, count: 1 },
      { stage: 'won', value: 1000, count: 2 },
      { stage: 'lost', value: 50, count: 1 },
    ]);
  });
});
