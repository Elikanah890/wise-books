import fs from 'node:fs';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

export function createApp(): express.Express {
  const app = express();

  fs.mkdirSync(env.coversDir, { recursive: true });

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(corsOptions));
  app.use(
    express.json({
      limit: '1mb',
      verify(req, _res, buffer) {
        // Express types the parser callback as IncomingMessage; the runtime object is a Request.
        (req as express.Request).rawBody = Buffer.from(buffer);
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(env.uploadRoot, { fallthrough: true }));
  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
