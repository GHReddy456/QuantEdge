import { Router, Request, Response } from 'express';
import { paperTradingService } from '../services/paper-trading.service.js';

export const portfolioRouter = Router();

// GET /api/portfolio
portfolioRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const portfolio = await paperTradingService.getPortfolio();
    res.json({ success: true, data: portfolio });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/portfolio/reset
portfolioRouter.post('/reset', async (req: Request, res: Response) => {
  try {
    const startingCapital = req.body.startingCapital ? Number(req.body.startingCapital) : 10000.0;
    const currency = req.body.currency === 'INR' ? 'INR' : 'USD';
    const portfolio = await paperTradingService.resetAccount(startingCapital, currency);
    res.json({ success: true, message: 'Portfolio reset successfully.', data: portfolio });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
