import { IMarketDataProvider, ProviderStatus } from './provider.interface.js';
import {
  InstrumentEntity,
  QuoteEntity,
  CandleEntity,
  FundamentalsEntity,
  MarketExchange
} from '../../models/types.js';
import { INITIAL_INSTRUMENTS } from '../../models/store.js';

interface StockBaseline {
  price: number;
  currency: 'USD' | 'INR';
  exchange: MarketExchange;
  sector: string;
  industry: string;
  peRatio: number;
  eps: number;
  marketCap: number; // in millions
  revenue: number; // in millions
  netIncome: number; // in millions
  operatingMargin: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volatility: number;
}

const STOCK_BASELINES: Record<string, StockBaseline> = {
  // Indian Equities
  RELIANCE: {
    price: 2980.5,
    currency: 'INR',
    exchange: 'NSE',
    sector: 'Energy & Conglomerate',
    industry: 'Oil, Gas & Refining',
    peRatio: 28.4,
    eps: 104.9,
    marketCap: 2015000,
    revenue: 901000,
    netIncome: 71000,
    operatingMargin: 17.5,
    dividendYield: 0.35,
    fiftyTwoWeekHigh: 3217.9,
    fiftyTwoWeekLow: 2220.3,
    volatility: 0.012
  },
  TCS: {
    price: 3890.25,
    currency: 'INR',
    exchange: 'NSE',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    peRatio: 30.1,
    eps: 129.2,
    marketCap: 1405000,
    revenue: 240893,
    netIncome: 46099,
    operatingMargin: 25.2,
    dividendYield: 1.25,
    fiftyTwoWeekHigh: 4254.7,
    fiftyTwoWeekLow: 3313.0,
    volatility: 0.011
  },
  INFY: {
    price: 1545.8,
    currency: 'INR',
    exchange: 'NSE',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    peRatio: 24.8,
    eps: 62.3,
    marketCap: 642000,
    revenue: 153670,
    netIncome: 26248,
    operatingMargin: 21.0,
    dividendYield: 2.1,
    fiftyTwoWeekHigh: 1733.0,
    fiftyTwoWeekLow: 1358.35,
    volatility: 0.014
  },
  HDFCBANK: {
    price: 1530.0,
    currency: 'INR',
    exchange: 'NSE',
    sector: 'Financial Services',
    industry: 'Commercial Banking',
    peRatio: 18.2,
    eps: 84.0,
    marketCap: 1162000,
    revenue: 198000,
    netIncome: 64000,
    operatingMargin: 32.4,
    dividendYield: 1.1,
    fiftyTwoWeekHigh: 1757.8,
    fiftyTwoWeekLow: 1363.45,
    volatility: 0.013
  },
  ICICIBANK: {
    price: 1125.4,
    currency: 'INR',
    exchange: 'NSE',
    sector: 'Financial Services',
    industry: 'Commercial Banking',
    peRatio: 17.5,
    eps: 64.3,
    marketCap: 790000,
    revenue: 145000,
    netIncome: 45000,
    operatingMargin: 31.0,
    dividendYield: 0.9,
    fiftyTwoWeekHigh: 1257.8,
    fiftyTwoWeekLow: 915.0,
    volatility: 0.013
  },
  // US Equities
  AAPL: {
    price: 189.5,
    currency: 'USD',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    peRatio: 31.5,
    eps: 6.01,
    marketCap: 2910000,
    revenue: 383285,
    netIncome: 96995,
    operatingMargin: 29.8,
    dividendYield: 0.52,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    volatility: 0.015
  },
  MSFT: {
    price: 428.1,
    currency: 'USD',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Software & Cloud Infrastructure',
    peRatio: 36.2,
    eps: 11.82,
    marketCap: 3180000,
    revenue: 236584,
    netIncome: 86102,
    operatingMargin: 44.6,
    dividendYield: 0.71,
    fiftyTwoWeekHigh: 450.0,
    fiftyTwoWeekLow: 327.0,
    volatility: 0.014
  },
  NVDA: {
    price: 126.8,
    currency: 'USD',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Semiconductors',
    peRatio: 64.0,
    eps: 1.98,
    marketCap: 3120000,
    revenue: 60922,
    netIncome: 29760,
    operatingMargin: 54.1,
    dividendYield: 0.08,
    fiftyTwoWeekHigh: 140.76,
    fiftyTwoWeekLow: 39.23,
    volatility: 0.028
  },
  AMZN: {
    price: 184.2,
    currency: 'USD',
    exchange: 'NASDAQ',
    sector: 'Consumer Discretionary',
    industry: 'E-Commerce & Cloud Computing',
    peRatio: 48.6,
    eps: 3.79,
    marketCap: 1920000,
    revenue: 574785,
    netIncome: 37684,
    operatingMargin: 7.8,
    dividendYield: 0.0,
    fiftyTwoWeekHigh: 201.2,
    fiftyTwoWeekLow: 118.35,
    volatility: 0.018
  },
  GOOGL: {
    price: 178.6,
    currency: 'USD',
    exchange: 'NASDAQ',
    sector: 'Communication Services',
    industry: 'Internet Media & Search',
    peRatio: 26.4,
    eps: 6.76,
    marketCap: 2210000,
    revenue: 307394,
    netIncome: 73795,
    operatingMargin: 28.0,
    dividendYield: 0.45,
    fiftyTwoWeekHigh: 191.75,
    fiftyTwoWeekLow: 120.21,
    volatility: 0.016
  },
  TSLA: {
    price: 248.5,
    currency: 'USD',
    exchange: 'NASDAQ',
    sector: 'Consumer Discretionary',
    industry: 'Automobile & Clean Energy',
    peRatio: 68.2,
    eps: 3.64,
    marketCap: 792000,
    revenue: 96773,
    netIncome: 14997,
    operatingMargin: 9.2,
    dividendYield: 0.0,
    fiftyTwoWeekHigh: 271.0,
    fiftyTwoWeekLow: 138.8,
    volatility: 0.032
  },
  // ETFs
  SPY: {
    price: 544.2,
    currency: 'USD',
    exchange: 'NYSE',
    sector: 'Broad Market ETF',
    industry: 'S&P 500 Tracking',
    peRatio: 26.5,
    eps: 20.5,
    marketCap: 520000,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.28,
    fiftyTwoWeekHigh: 550.0,
    fiftyTwoWeekLow: 410.0,
    volatility: 0.009
  },
  QQQ: {
    price: 482.3,
    currency: 'USD',
    exchange: 'NASDAQ',
    sector: 'Tech Sector ETF',
    industry: 'NASDAQ-100 Tracking',
    peRatio: 31.0,
    eps: 15.5,
    marketCap: 260000,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 0.58,
    fiftyTwoWeekHigh: 490.0,
    fiftyTwoWeekLow: 350.0,
    volatility: 0.013
  },
  NIFTYBEES: {
    price: 268.4,
    currency: 'INR',
    exchange: 'NSE',
    sector: 'Broad Market ETF',
    industry: 'Nifty 50 Tracking',
    peRatio: 22.8,
    eps: 11.7,
    marketCap: 18000,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.15,
    fiftyTwoWeekHigh: 282.0,
    fiftyTwoWeekLow: 215.0,
    volatility: 0.009
  },
  // Indices
  NIFTY50: {
    price: 24520.0,
    currency: 'INR',
    exchange: 'INDEX',
    sector: 'Index',
    industry: 'Benchmark Index',
    peRatio: 22.4,
    eps: 1094.0,
    marketCap: 0,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.2,
    fiftyTwoWeekHigh: 25078.3,
    fiftyTwoWeekLow: 18837.85,
    volatility: 0.008
  },
  SENSEX: {
    price: 80600.0,
    currency: 'INR',
    exchange: 'INDEX',
    sector: 'Index',
    industry: 'Benchmark Index',
    peRatio: 23.8,
    eps: 3386.0,
    marketCap: 0,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.1,
    fiftyTwoWeekHigh: 82129.5,
    fiftyTwoWeekLow: 63583.0,
    volatility: 0.008
  },
  SPX: {
    price: 5460.0,
    currency: 'USD',
    exchange: 'INDEX',
    sector: 'Index',
    industry: 'Benchmark Index',
    peRatio: 25.8,
    eps: 211.0,
    marketCap: 0,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.3,
    fiftyTwoWeekHigh: 5566.0,
    fiftyTwoWeekLow: 4103.0,
    volatility: 0.008
  }
};

export class DemoMarketDataProvider implements IMarketDataProvider {
  public readonly name = 'QuantEdge Simulated Market Provider';

  public async getStatus(): Promise<ProviderStatus> {
    return {
      providerName: this.name,
      isConfigured: true,
      status: 'DEMO',
      rateLimitPerMinute: 600,
      notes: 'Operating with calibrated traditional equity simulations (NSE, BSE, NASDAQ, NYSE).'
    };
  }

  public async searchSymbols(query: string): Promise<InstrumentEntity[]> {
    const q = query.trim().toUpperCase();
    if (!q) return INITIAL_INSTRUMENTS;

    return INITIAL_INSTRUMENTS.filter(
      (inst) =>
        inst.symbol.toUpperCase().includes(q) ||
        inst.companyName.toUpperCase().includes(q) ||
        inst.exchange.toUpperCase().includes(q)
    );
  }

  public async getQuote(symbol: string, exchange?: string): Promise<QuoteEntity> {
    const sym = symbol.toUpperCase();
    const base = STOCK_BASELINES[sym];

    if (!base) {
      throw new Error(`Symbol "${symbol}" not found in traditional equity universe.`);
    }

    // Dynamic price wobble for realism
    const seed = (Date.now() / 60000) % 100;
    const wobblePercent = Math.sin(seed + sym.charCodeAt(0)) * base.volatility * 0.5;
    const currentPrice = Number((base.price * (1 + wobblePercent)).toFixed(2));
    const previousClose = Number((base.price * 0.992).toFixed(2));
    const change = Number((currentPrice - previousClose).toFixed(2));
    const changePercent = Number(((change / previousClose) * 100).toFixed(2));

    const high = Number((Math.max(currentPrice, previousClose) * 1.008).toFixed(2));
    const low = Number((Math.min(currentPrice, previousClose) * 0.992).toFixed(2));
    const volume = Math.floor(1000000 + Math.abs(Math.sin(seed)) * 5000000);

    return {
      symbol: sym,
      exchange: (exchange as MarketExchange) || base.exchange,
      price: currentPrice,
      open: previousClose,
      high,
      low,
      previousClose,
      change,
      changePercent,
      volume,
      currency: base.currency,
      timestamp: new Date().toISOString(),
      provenance: 'DEMO',
      provider: this.name
    };
  }

  public async getCandles(
    symbol: string,
    interval: string = '1day',
    exchange?: string,
    outputSize: number = 60
  ): Promise<CandleEntity[]> {
    const sym = symbol.toUpperCase();
    const base = STOCK_BASELINES[sym] || {
      price: 150.0,
      volatility: 0.015
    };

    const count = Math.min(Math.max(outputSize, 10), 300);
    const candles: CandleEntity[] = [];

    let currentClose = base.price * 0.9;
    const now = Date.now();
    const intervalMs = this.getIntervalMilliseconds(interval);

    for (let i = count - 1; i >= 0; i--) {
      const candleTime = new Date(now - i * intervalMs).toISOString();
      const drift = (Math.sin(i * 0.3 + sym.charCodeAt(0)) * 0.015) + (Math.random() - 0.48) * base.volatility;
      const open = Number(currentClose.toFixed(2));
      const close = Number((open * (1 + drift)).toFixed(2));
      const high = Number((Math.max(open, close) * (1 + Math.random() * 0.008)).toFixed(2));
      const low = Number((Math.min(open, close) * (1 - Math.random() * 0.008)).toFixed(2));
      const volume = Math.floor(500000 + Math.random() * 3000000);

      candles.push({
        timestamp: candleTime,
        open,
        high,
        low,
        close,
        volume
      });

      currentClose = close;
    }

    return candles;
  }

  public async getFundamentals(symbol: string, exchange?: string): Promise<FundamentalsEntity> {
    const sym = symbol.toUpperCase();
    const base = STOCK_BASELINES[sym];

    if (!base) {
      throw new Error(`Fundamentals unavailable for symbol "${symbol}".`);
    }

    const inst = INITIAL_INSTRUMENTS.find((i) => i.symbol === sym);

    return {
      symbol: sym,
      companyName: inst?.companyName || sym,
      sector: base.sector,
      industry: base.industry,
      marketCap: base.marketCap,
      peRatio: base.peRatio,
      eps: base.eps,
      dividendYield: base.dividendYield,
      fiftyTwoWeekHigh: base.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: base.fiftyTwoWeekLow,
      revenue: base.revenue,
      netIncome: base.netIncome,
      operatingMargin: base.operatingMargin,
      beta: 1.1,
      provenance: 'DEMO'
    };
  }

  public async getFinancials(symbol: string, exchange?: string): Promise<any> {
    const sym = symbol.toUpperCase();
    const base = STOCK_BASELINES[sym];

    return {
      symbol: sym,
      currency: base?.currency || 'USD',
      incomeStatement: [
        {
          period: 'FY 2024',
          revenue: base?.revenue ? base.revenue : 150000,
          operatingIncome: base?.revenue ? base.revenue * 0.25 : 37500,
          netIncome: base?.netIncome ? base.netIncome : 30000,
          ebitda: base?.revenue ? base.revenue * 0.32 : 48000
        },
        {
          period: 'FY 2023',
          revenue: base?.revenue ? base.revenue * 0.88 : 132000,
          operatingIncome: base?.revenue ? base.revenue * 0.22 : 29040,
          netIncome: base?.netIncome ? base.netIncome * 0.85 : 25500,
          ebitda: base?.revenue ? base.revenue * 0.29 : 38280
        }
      ],
      balanceSheet: {
        totalAssets: base?.marketCap ? base.marketCap * 0.45 : 450000,
        totalLiabilities: base?.marketCap ? base.marketCap * 0.18 : 180000,
        totalEquity: base?.marketCap ? base.marketCap * 0.27 : 270000,
        cashAndEquivalents: base?.marketCap ? base.marketCap * 0.08 : 80000
      },
      provenance: 'DEMO'
    };
  }

  private getIntervalMilliseconds(interval: string): number {
    switch (interval.toLowerCase()) {
      case '1min':
        return 60 * 1000;
      case '5min':
        return 5 * 60 * 1000;
      case '15min':
        return 15 * 60 * 1000;
      case '1h':
      case '60min':
        return 60 * 60 * 1000;
      case '1week':
        return 7 * 24 * 60 * 60 * 1000;
      case '1day':
      default:
        return 24 * 60 * 60 * 1000;
    }
  }
}
