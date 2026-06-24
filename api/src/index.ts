// env must be imported first — validates all required vars before anything else runs
import { env } from './config/env';
import { logger } from './config/logger';
import { app } from './app';
import { prisma } from './config/database';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { err });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

const start = async () => {
  await prisma.$connect();
  logger.info(`Connected to database (${env.NODE_ENV})`);

  const server = app.listen(env.PORT, () => {
    logger.info(`TollBD API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.error('Failed to start API', { err });
  process.exit(1);
});
