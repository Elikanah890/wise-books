import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers.x-signature',
      'req.headers.x-middleware-signature',
      'password',
      'passwordHash',
      'JWT_SECRET',
      'PAYME_SECRET',
      'PAYME_APP_ID',
      'msisdn',
      'req.body.msisdn',
      'buyerPhone',
    ],
    remove: true,
  },
  ...(env.isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }),
});
