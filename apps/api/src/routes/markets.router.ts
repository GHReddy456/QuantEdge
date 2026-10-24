import { Router, Request, Response } from 'express';
import { marketDataService } from '../services/market-data/market-data.service.js';
import { INITIAL_INSTRUMENTS } from '../models/store.js';

export const marketsRouter = Router();

// GET /api/markets/search?q=...
marketsRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '');
    const results = await marketDataService.searchSymbols(q);
    res.json({ success: true, count: results.length, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/markets/quote?symbol=...&exchange=...
marketsRouter.get('/quote', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.query.symbol || 'AAPL');
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const quote = await marketDataService.getQuote(symbol, exchange);
    res.json({ success: true, data: quote });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// GET /api/markets/candles?symbol=...&exchange=...&interval=...&outputsize=...
marketsRouter.get('/candles', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.query.symbol || 'AAPL');
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const interval = String(req.query.interval || '1day');
    const outputsize = req.query.outputsize ? parseInt(String(req.query.outputsize), 10) : 60;

    const candles = await marketDataService.getCandles(symbol, interval, exchange, outputsize);
    res.json({ success: true, count: candles.length, interval, data: candles });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// GET /api/markets/fundamentals?symbol=...&exchange=...
marketsRouter.get('/fundamentals', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.query.symbol || 'AAPL');
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const fundamentals = await marketDataService.getFundamentals(symbol, exchange);
    res.json({ success: true, data: fundamentals });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// GET /api/markets/financials?symbol=...&exchange=...
marketsRouter.get('/financials', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.query.symbol || 'AAPL');
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const financials = await marketDataService.getFinancials(symbol, exchange);
    res.json({ success: true, data: financials });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// GET /api/markets/screener (filter stocks by exchange, sector, price range, volume, etc.)
marketsRouter.get('/screener', async (req: Request, res: Response) => {
  try {
    const exchange = req.query.exchange ? String(req.query.exchange).toUpperCase() : undefined;
    const sector = req.query.sector ? String(req.query.sector).toLowerCase() : undefined;
    const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined;

    let screened = [...INITIAL_INSTRUMENTS];

    if (exchange) {
      screened = screened.filter((s) => s.exchange.toUpperCase() === exchange);
    }
    if (sector) {
      screened = screened.filter((s) => (s.sector || '').toLowerCase().includes(sector));
    }

    // Attach latest quote data
    const enriched = await Promise.all(
      screened.map(async (inst) => {
        try {
          const q = await marketDataService.getQuote(inst.symbol, inst.exchange);
          return {
            ...inst,
            price: q.price,
            changePercent: q.changePercent,
            volume: q.volume,
            provenance: q.provenance
          };
        } catch {
          return {
            ...inst,
            price: null,
            changePercent: null,
            volume: null,
            provenance: 'OFFLINE'
          };
        }
      })
    );

    let filtered = enriched;
    if (minPrice !== undefined) {
      filtered = filtered.filter((item) => item.price !== null && item.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((item) => item.price !== null && item.price <= maxPrice);
    }

    res.json({ success: true, total: filtered.length, data: filtered });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
