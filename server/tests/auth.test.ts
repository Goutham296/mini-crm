import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { cookieHeader, makeApp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = makeApp();
});

const creds = { name: 'Asha', email: 'asha@example.com', password: 'Passw0rd!' };

describe('auth', () => {
  it('registers a user, hashes the password and sets an httpOnly cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(creds);
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Asha', email: 'asha@example.com' });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(cookieHeader(res)).toMatch(/HttpOnly/i);
  });

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...creds, email: 'ASHA@example.com' });
    expect(res.status).toBe(409);
  });

  it('returns 400 with a clear message for invalid register input', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: '', email: 'nope', password: 'short' });
    expect(res.status).toBe(400);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.errors.map((e: { path: string }) => e.path)).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
  });

  it('logs in and sets an httpOnly, SameSite cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: creds.email, password: creds.password });
    expect(res.status).toBe(200);
    const cookie = cookieHeader(res);
    expect(cookie).toMatch(/^token=[^;]+/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: creds.email, password: 'Wrong1234' });
    expect(res.status).toBe(401);
  });

  it('GET /me returns 401 without a cookie or with a bad token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Cookie', 'token=not-a-jwt')).status).toBe(401);
  });

  it('GET /me restores the session and logout ends it', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: creds.email, password: creds.password }).expect(200);
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(creds.email);
    await agent.post('/api/auth/logout').expect(200);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('rate-limits the password reset route', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      statuses.push((await request(app).post('/api/auth/forgot-password').send({ email: creds.email })).status);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });
});
