import { Router } from 'express';
import type { Env } from '../config/env.js';
import { getDashboard } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { createRateLimiters } from '../middleware/rateLimiters.js';
import { authRoutes } from './authRoutes.js';
import { customerRoutes } from './customerRoutes.js';
import { dealRoutes } from './dealRoutes.js';
import { taskRoutes } from './taskRoutes.js';

export function apiRoutes(env: Env): Router {
  const router = Router();
  const auth = requireAuth(env.jwtSecret);

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  router.use('/auth', authRoutes(env, createRateLimiters()));
  router.use('/customers', auth, customerRoutes);
  router.use('/deals', auth, dealRoutes);
  router.use('/tasks', auth, taskRoutes);
  router.get('/dashboard', auth, getDashboard);
  return router;
}
