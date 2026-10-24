import { Router, Request, Response } from 'express';
import { paperTradingService } from '../services/paper-trading.service.js';

export const paperRouter = Router();

// GET /api/paper/orders
paperRouter.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await paperTradingService.getOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/paper/orders
paperRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const { symbol, exchange, side, orderType, quantity, limitPrice, idempotencyKey } = req.body;
    const order = await paperTradingService.placeOrder({
      symbol,
      exchange,
      side,
      orderType,
      quantity: Number(quantity),
      limitPrice: limitPrice ? Number(limitPrice) : undefined,
      idempotencyKey
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
