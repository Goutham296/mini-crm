import { loadEnv } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  const env = loadEnv(); // fails fast if MONGO_URI / JWT_SECRET / CLIENT_URL are missing
  await connectDb(env.mongoUri);
  logger.info('Connected to MongoDB');

  const server = createApp(env).listen(env.port, () => {
    logger.info(`API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
      void disconnectDb().finally(() => process.exit(0));
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  logger.error(`Startup failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
