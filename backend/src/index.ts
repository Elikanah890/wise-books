import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { pollStalePendingOrders } from './services/payment.service';

const POLL_INTERVAL_MS = 60 * 1000;

async function bootstrap(): Promise<void> {
  const app = createApp();

  await prisma.$queryRaw`SELECT 1`;

  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT}`);
    if (!env.selcomConfigured) {
      logger.warn('Selcom integration is not configured (awaiting official API documentation)');
    }
  });

  const pollTimer = setInterval(() => {
    void pollStalePendingOrders();
  }, POLL_INTERVAL_MS);

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down');
    clearInterval(pollTimer);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
