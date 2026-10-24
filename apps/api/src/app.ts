import express from 'express';
import cors from 'cors';
import { marketsRouter } from './routes/markets.router.js';
import { watchlistsRouter } from './routes/watchlists.router.js';
import { portfolioRouter } from './routes/portfolio.router.js';
import { paperRouter } from './routes/paper.router.js';
import { analyticsRouter } from './routes/analytics.router.js';
import { algorithmsRouter } from './routes/algorithms.router.js';
import { settingsRouter } from './routes/settings.router.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      service: 'QuantEdge Financial Analytics & Paper Trading API',
      timestamp: new Date().toISOString()
    });
  });

  // Root & API index
  app.get(['/', '/api'], (_req, res) => {
    res.json({
      name: 'QuantEdge Financial Analytics & Paper Trading API',
      status: 'UP',
      webUrl: 'http://localhost:3000',
      message: 'QuantEdge API is running. Visit the web platform at http://localhost:3000.',
      endpoints: {
        health: '/health',
        markets: '/api/markets',
        watchlists: '/api/watchlists',
        portfolio: '/api/portfolio',
        paperTrading: '/api/paper',
        analytics: '/api/analytics',
        algorithms: '/api/algorithms/registry',
        settings: '/api/settings'
      }
    });
  });

  // API Routes
  app.use('/api/markets', marketsRouter);
  app.use('/api/watchlists', watchlistsRouter);
  app.use('/api/portfolio', portfolioRouter);
  app.use('/api/paper', paperRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/algorithms', algorithmsRouter);
  app.use('/api/settings', settingsRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found.' });
  });

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled API Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}
