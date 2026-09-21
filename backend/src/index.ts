import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { pollPendingPayments } from './services/paymentVerification.service';

const POLL_INTERVAL_MS = env.PAYME_QUERY_INTERVAL_SECONDS * 1000;

async function bootstrap(): Promise<void> {
  const app = createApp();

  await prisma.$queryRaw`SELECT 1`;

  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT}`);
    logger.info('PayMe Africa payment integration is active (live)');
  });

  logger.info(
    `Payment polling started (every ${env.PAYME_QUERY_INTERVAL_SECONDS}s, max ${env.PAYME_QUERY_MAX_ATTEMPTS} attempts)`
  );
  const pollTimer = setInterval(() => {
    void pollPendingPayments();
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
