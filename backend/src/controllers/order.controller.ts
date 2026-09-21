import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import type { CreateOrderInput } from '../validators/order.validator';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validated?.body as CreateOrderInput;
  const result = await orderService.createOrder(body);
  return sendSuccess(res, result, 201);
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const result = await orderService.getOrderStatus(params.id);
  return sendSuccess(res, result);
});
