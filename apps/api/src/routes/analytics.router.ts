import { Router, Request, Response } from 'express';
import { marketAnalyticsService } from '../services/market-analytics.service.js';

export const analyticsRouter = Router();

// GET /api/analytics/leaders/:symbol
analyticsRouter.get('/leaders/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol;
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const data = await marketAnalyticsService.analyzePriceLeaders(symbol, exchange);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/return-window/:symbol
analyticsRouter.get('/return-window/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol;
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const data = await marketAnalyticsService.analyzeBestCompoundedReturnWindow(symbol, exchange);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/breadth
analyticsRouter.get('/breadth', async (_req: Request, res: Response) => {
  try {
    const data = await marketAnalyticsService.evaluateMarketBreadth();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/heatmap
analyticsRouter.get('/heatmap', (_req: Request, res: Response) => {
  try {
    const data = marketAnalyticsService.evaluateHeatmapHourglass();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/intervals?a=...&b=...
analyticsRouter.get('/intervals', (req: Request, res: Response) => {
  try {
    const a = req.query.a ? parseInt(String(req.query.a), 10) : 15;
    const b = req.query.b ? parseInt(String(req.query.b), 10) : 30;
    const data = marketAnalyticsService.analyzeSamplingInterval(a, b);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/rolling-buffer/:symbol?rotation=...
analyticsRouter.get('/rolling-buffer/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol;
    const rotation = req.query.rotation ? parseInt(String(req.query.rotation), 10) : 2;
    const data = await marketAnalyticsService.rotateRollingBuffer(symbol, rotation);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/contribution-balance
analyticsRouter.get('/contribution-balance', (_req: Request, res: Response) => {
  try {
    const data = marketAnalyticsService.evaluateContributionBalance();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/:symbol (comprehensive overview)
analyticsRouter.get('/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol;
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;

    const [leaders, returnWindow] = await Promise.all([
      marketAnalyticsService.analyzePriceLeaders(symbol, exchange).catch(() => null),
      marketAnalyticsService.analyzeBestCompoundedReturnWindow(symbol, exchange).catch(() => null)
    ]);

    res.json({
      success: true,
      symbol,
      data: {
        leaders,
        returnWindow
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
