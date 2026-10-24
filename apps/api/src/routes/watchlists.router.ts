import { Router, Request, Response } from 'express';
import { store } from '../models/store.js';
import { marketDataService } from '../services/market-data/market-data.service.js';
import { naturalSort } from '@quantedge/algorithms';

export const watchlistsRouter = Router();

// GET /api/watchlists
watchlistsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const enriched = await Promise.all(
      store.watchlists.map(async (wl) => {
        // Naturally sort symbols using ACC-13
        const sortedSymbols = naturalSort(wl.symbols).sorted;
        const quotes = await Promise.all(
          sortedSymbols.map(async (sym: string) => {
            try {
              return await marketDataService.getQuote(sym);
            } catch {
              return null;
            }
          })
        );
        return {
          ...wl,
          symbols: sortedSymbols,
          items: quotes.filter(Boolean)
        };
      })
    );
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/watchlists
watchlistsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, description, symbols } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Watchlist name is required.' });
    }

    const newId = `wl-${Date.now()}`;
    const cleanSymbols = Array.isArray(symbols)
      ? naturalSort(symbols.map((s: string) => s.trim().toUpperCase())).sorted
      : [];

    const newWl = {
      id: newId,
      name: name.trim(),
      description: description || '',
      symbols: cleanSymbols,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.watchlists.push(newWl);
    res.status(201).json({ success: true, data: newWl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/watchlists/:id/instruments
watchlistsRouter.post('/:id/instruments', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol is required.' });
    }

    const wl = store.watchlists.find((w) => w.id === id);
    if (!wl) {
      return res.status(404).json({ success: false, error: `Watchlist "${id}" not found.` });
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    if (!wl.symbols.includes(cleanSymbol)) {
      wl.symbols.push(cleanSymbol);
      // Naturally sort
      wl.symbols = naturalSort(wl.symbols).sorted;
      wl.updatedAt = new Date().toISOString();
    }

    res.json({ success: true, data: wl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/watchlists/:id/instruments/:symbol
watchlistsRouter.delete('/:id/instruments/:symbol', (req: Request, res: Response) => {
  try {
    const { id, symbol } = req.params;
    const wl = store.watchlists.find((w) => w.id === id);
    if (!wl) {
      return res.status(404).json({ success: false, error: `Watchlist "${id}" not found.` });
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    wl.symbols = wl.symbols.filter((s) => s !== cleanSymbol);
    wl.updatedAt = new Date().toISOString();

    res.json({ success: true, data: wl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/watchlists/:id
watchlistsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = store.watchlists.length;
    store.watchlists = store.watchlists.filter((w) => w.id !== id);

    if (store.watchlists.length === initialLen) {
      return res.status(404).json({ success: false, error: `Watchlist "${id}" not found.` });
    }

    res.json({ success: true, message: `Watchlist "${id}" deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
