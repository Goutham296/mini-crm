import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { loadEnv } from '../src/config/env.js';
import { ORIGIN, makeApp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = makeApp();
});

describe('security & errors', () => {
  it('allows the configured origin with credentials', async () => {
    const res = await request(app).get('/api/health').set('Origin', ORIGIN);
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('answers a blocked origin with 403 JSON, not 500', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/CORS/);
    const preflight = await request(app).options('/api/customers').set('Origin', 'https://evil.example.com');
    expect(preflight.status).toBe(403);
  });

  it('sets helmet headers and returns JSON 404 / 400 errors', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    const bad = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(bad.status).toBe(400);
    expect(bad.body.stack).toBeUndefined();
  });

  it('fails fast when required env vars are missing', () => {
    expect(() => loadEnv({ NODE_ENV: 'production' })).toThrow(/MONGO_URI/);
  });
});
