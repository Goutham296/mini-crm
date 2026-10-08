import { beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { makeApp, signUp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = makeApp();
});

describe('customers', () => {
  it('supports create, read, update, list and delete', async () => {
    const { agent } = await signUp(app);
    const created = await agent
      .post('/api/customers')
      .send({ name: 'Ravi Kumar', company: 'Acme', email: 'ravi@acme.example', status: 'lead' });
    expect(created.status).toBe(201);
    const id = created.body.id as string;

    const got = await agent.get(`/api/customers/${id}`);
    expect(got.status).toBe(200);
    expect(got.body.customer.name).toBe('Ravi Kumar');
    expect(got.body.deals).toEqual([]);
    expect(got.body.tasks).toEqual([]);

    const updated = await agent.patch(`/api/customers/${id}`).send({ status: 'active' });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('active');

    const list = await agent.get('/api/customers');
    expect(list.body).toMatchObject({ total: 1, page: 1, pages: 1 });

    expect((await agent.delete(`/api/customers/${id}`)).status).toBe(204);
    expect((await agent.get(`/api/customers/${id}`)).status).toBe(404);
  });

  it('searches, filters by status and paginates on the server', async () => {
    const { agent } = await signUp(app);
    for (let i = 1; i <= 12; i += 1) {
      await agent
        .post('/api/customers')
        .send({ name: `Client ${i}`, company: i % 2 ? 'Odd Co' : 'Even (Ltd)', status: i <= 4 ? 'active' : 'lead' })
        .expect(201);
    }
    const page2 = await agent.get('/api/customers?page=2&limit=5');
    expect(page2.body).toMatchObject({ total: 12, page: 2, pages: 3 });
    expect(page2.body.items).toHaveLength(5);

    const active = await agent.get('/api/customers?status=active');
    expect(active.body.total).toBe(4);

    // Regex characters are escaped, so "(Ltd)" matches literally.
    const search = await agent.get('/api/customers?search=' + encodeURIComponent('(ltd)'));
    expect(search.body.total).toBe(6);
  });

  it('returns 400 for invalid body and query, 404 for a malformed id', async () => {
    const { agent } = await signUp(app);
    const bad = await agent.post('/api/customers').send({ name: '', email: 'not-an-email', status: 'vip' });
    expect(bad.status).toBe(400);
    expect(bad.body.message).toBeTruthy();
    expect(bad.body.errors.length).toBeGreaterThan(0);
    expect((await agent.get('/api/customers?status=vip')).status).toBe(400);
    expect((await agent.get('/api/customers?limit=1000')).status).toBe(400);
    expect((await agent.get('/api/customers/not-an-id')).status).toBe(404);
    expect((await agent.patch('/api/customers/123').send({ name: 'x' })).status).toBe(404);
  });

  it('requires authentication', async () => {
    const { default: request } = await import('supertest');
    expect((await request(app).get('/api/customers')).status).toBe(401);
  });

  it('includes nested deals and tasks on the detail endpoint', async () => {
    const { agent } = await signUp(app);
    const c = (await agent.post('/api/customers').send({ name: 'Nested' })).body;
    const d = (await agent.post('/api/deals').send({ title: 'Big deal', value: 1000, customer: c.id })).body;
    await agent.post('/api/tasks').send({ title: 'Call', dueDate: '2030-01-01', deal: d.id }).expect(201);
    const res = await agent.get(`/api/customers/${c.id}`);
    expect(res.body.deals).toHaveLength(1);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].customer).toBe(c.id); // task inherits the deal's customer
  });
});
