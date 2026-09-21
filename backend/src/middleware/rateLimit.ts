import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const skipInTest = () => env.isTest;

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many login attempts, try again later' },
  },
});

export const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' },
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' },
  },
});

// PayMe endpoints
export const initiateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many payment attempts, try again later' },
  },
});

export const callbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many callbacks, try again later' },
  },
});

export const statusLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many status checks, try again later' },
  },
});
