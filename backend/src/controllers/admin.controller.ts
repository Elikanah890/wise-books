import type { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import * as orderService from '../services/order.service';
import * as paymentService from '../services/payment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import type { OrderListQuery, PaymentListQuery } from '../validators/order.validator';

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const result = await dashboardService.getDashboard();
  return sendSuccess(res, result);
});

export const orders = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validated?.query as OrderListQuery;
  const result = await orderService.listOrders(query);
  return sendSuccess(res, result);
});

export const payments = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validated?.query as PaymentListQuery;
  const result = await paymentService.listPayments(query);
  return sendSuccess(res, result);
});

export const revenue = asyncHandler(async (_req: Request, res: Response) => {
  const result = await dashboardService.getRevenue();
  return sendSuccess(res, result);
});
