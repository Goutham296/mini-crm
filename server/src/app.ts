import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Env } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundRoute } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiRoutes } from './routes/index.js';

export function createApp(env: Env): Express {
  const app = express();

  app.set('trust proxy', 1); // Render / Vercel sit behind one proxy; needed for secure cookies & rate limits
  app.disable('x-powered-by');

  app.use(requestLogger);
  app.use(helmet());
  app.use(corsMiddleware(env.clientUrls));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api', apiRoutes(env));

  app.use(notFoundRoute);
  app.use(errorHandler(env.isProduction));
  return app;
}
