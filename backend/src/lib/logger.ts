import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'JWT_SECRET',
      'SELCOM_API_SECRET',
      'SELCOM_API_KEY',
      'SELCOM_PIN',
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
