import { Router, Request, Response } from 'express';
import { marketDataService } from '../services/market-data/market-data.service.js';
import { getDatabaseState } from '../db/connection.js';

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const providerStatus = await marketDataService.getProviderStatus();
    const dbStatus = getDatabaseState();

    res.json({
      success: true,
      data: {
        marketDataProvider: {
          name: providerStatus.providerName,
          status: providerStatus.status,
          isConfigured: providerStatus.isConfigured,
          rateLimitPerMinute: providerStatus.rateLimitPerMinute,
          notes: providerStatus.notes
        },
        database: {
          type: dbStatus.type,
          isConnected: dbStatus.isConnected,
          databaseName: dbStatus.databaseName || 'in-memory-quantedge',
          error: dbStatus.error
        },
        preferences: {
          defaultDisplayCurrency: 'USD',
          portfolioBaseCurrency: 'USD',
          supportedExchanges: ['NSE', 'BSE', 'NASDAQ', 'NYSE', 'INDEX']
        },
        securityNotice: 'Server-side API keys and credentials are never exposed through client endpoints.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
