import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';

export const ORIGIN = 'https://app.example.com';

export function makeApp(): Express {
  return createApp(loadEnv());
}

let counter = 0;

/** Registers a fresh user and returns an agent that carries its auth cookie. */
export async function signUp(app: Express, name = 'User') {
  counter += 1;
  const email = `user${counter}-${Date.now()}@example.com`;
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/register').send({ name, email, password: 'Passw0rd!' });
  if (res.status !== 201) throw new Error(`register failed: ${res.status}`);
  return { agent, email, user: res.body.user as { id: string } };
}

export function cookieHeader(res: request.Response): string {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  return (raw ?? []).find((c) => c.startsWith('token=')) ?? '';
}
