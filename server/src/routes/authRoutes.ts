import { Router } from 'express';
import type { Env } from '../config/env.js';
import { createAuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import type { createRateLimiters } from '../middleware/rateLimiters.js';

export function authRoutes(env: Env, limiters: ReturnType<typeof createRateLimiters>): Router {
  const c = createAuthController(env);
  const router = Router();
  router.post('/register', limiters.register, c.register);
  router.post('/login', limiters.login, c.login);
  router.post('/forgot-password', limiters.passwordReset, c.forgotPassword);
  router.post('/logout', c.logout);
  router.get('/me', requireAuth(env.jwtSecret), c.me);
  return router;
}
