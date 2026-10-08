import { beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { makeApp, signUp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = makeApp();
});

describe('data isolation between users', () => {
  it("returns 404 when user B touches user A's records", async () => {
    const a = await signUp(app, 'Alice');
    const b = await signUp(app, 'Bob');

    const customer = (await a.agent.post('/api/customers').send({ name: 'Alice Client' })).body;
    const deal = (await a.agent.post('/api/deals').send({ title: 'A deal', value: 500, customer: customer.id })).body;
    const task = (await a.agent.post('/api/tasks').send({ title: 'A task', dueDate: '2030-01-01' })).body;

    expect((await b.agent.get(`/api/customers/${customer.id}`)).status).toBe(404);
    expect((await b.agent.patch(`/api/customers/${customer.id}`).send({ name: 'Hacked' })).status).toBe(404);
    expect((await b.agent.delete(`/api/customers/${customer.id}`)).status).toBe(404);
    expect((await b.agent.get(`/api/deals/${deal.id}`)).status).toBe(404);
    expect((await b.agent.patch(`/api/deals/${deal.id}/stage`).send({ stage: 'won' })).status).toBe(404);
    expect((await b.agent.patch(`/api/tasks/${task.id}`).send({ done: true })).status).toBe(404);

    // B can't attach records to A's customer either.
    const link = await b.agent.post('/api/deals').send({ title: 'Sneaky', value: 1, customer: customer.id });
    expect(link.status).toBe(400);

    // Lists and dashboard only show B's own data.
    expect((await b.agent.get('/api/customers')).body.total).toBe(0);
    expect((await b.agent.get('/api/deals')).body.total).toBe(0);
    expect((await b.agent.get('/api/dashboard')).body.totalCustomers).toBe(0);

    // A's record is untouched.
    const still = await a.agent.get(`/api/customers/${customer.id}`);
    expect(still.status).toBe(200);
    expect(still.body.customer.name).toBe('Alice Client');
  });
});
