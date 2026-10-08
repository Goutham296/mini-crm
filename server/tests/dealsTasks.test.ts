import { beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { makeApp, signUp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = makeApp();
});

const isoDay = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

describe('deals', () => {
  it('saves stage changes and keeps wonAt in sync', async () => {
    const { agent } = await signUp(app);
    const c = (await agent.post('/api/customers').send({ name: 'Stage Co' })).body;
    const d = (await agent.post('/api/deals').send({ title: 'Deal', value: 100, customer: c.id })).body;
    expect(d.stage).toBe('lead');

    const won = await agent.patch(`/api/deals/${d.id}/stage`).send({ stage: 'won' });
    expect(won.status).toBe(200);
    expect(won.body.wonAt).toBeTruthy();

    const back = await agent.patch(`/api/deals/${d.id}/stage`).send({ stage: 'proposal' });
    expect(back.body.wonAt).toBeNull();
    expect((await agent.patch(`/api/deals/${d.id}/stage`).send({ stage: 'closed' })).status).toBe(400);

    const filtered = await agent.get('/api/deals?stage=proposal');
    expect(filtered.body.total).toBe(1);
    expect(filtered.body.items[0].customer.name).toBe('Stage Co');
  });
});

describe('tasks', () => {
  it('calculates overdue from the due date and filters on it', async () => {
    const { agent } = await signUp(app);
    const late = await agent.post('/api/tasks').send({ title: 'Late', dueDate: isoDay(-2) });
    expect(late.body.overdue).toBe(true);
    const doneLate = await agent.post('/api/tasks').send({ title: 'Done late', dueDate: isoDay(-2), done: true });
    expect(doneLate.body.overdue).toBe(false);
    await agent.post('/api/tasks').send({ title: 'Future', dueDate: isoDay(3), priority: 'high' }).expect(201);

    const overdue = await agent.get('/api/tasks?status=overdue');
    expect(overdue.body.items.map((t: { title: string }) => t.title)).toEqual(['Late']);
    expect((await agent.get('/api/tasks?status=done')).body.total).toBe(1);
    expect((await agent.get('/api/tasks?priority=high')).body.total).toBe(1);

    // Marking it done clears overdue; "overdue" can't be set by hand.
    const fixed = await agent.patch(`/api/tasks/${late.body.id}`).send({ done: true, overdue: false });
    expect(fixed.body.overdue).toBe(false);
  });
});
