import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';

const start = async () => {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    logger.info(`TollBD API running on port ${env.PORT}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down server');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start().catch((err) => {
  logger.error('Failed to start API', { err });
  process.exit(1);
});
