import {
  InstrumentEntity,
  WatchlistEntity,
  PortfolioEntity,
  PaperOrderEntity,
  AnalysisRunEntity
} from './types.js';

// Pre-seeded Instruments Universe (Traditional Equities Only: Indian NSE/BSE, US NASDAQ/NYSE, ETFs, Indices)
export const INITIAL_INSTRUMENTS: InstrumentEntity[] = [
  // Indian Equities (NSE / BSE)
  {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    exchange: 'NSE',
    instrumentType: 'EQUITY',
    currency: 'INR',
    sector: 'Energy & Conglomerate',
    industry: 'Oil, Gas & Consumable Fuels',
    providerIdentifier: 'RELIANCE:NSE'
  },
  {
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services Limited',
    exchange: 'NSE',
    instrumentType: 'EQUITY',
    currency: 'INR',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    providerIdentifier: 'TCS:NSE'
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    exchange: 'NSE',
    instrumentType: 'EQUITY',
    currency: 'INR',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    providerIdentifier: 'INFY:NSE'
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    exchange: 'NSE',
    instrumentType: 'EQUITY',
    currency: 'INR',
    sector: 'Financial Services',
    industry: 'Private Commercial Banking',
    providerIdentifier: 'HDFCBANK:NSE'
  },
  {
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Limited',
    exchange: 'NSE',
    instrumentType: 'EQUITY',
    currency: 'INR',
    sector: 'Financial Services',
    industry: 'Private Commercial Banking',
    providerIdentifier: 'ICICIBANK:NSE'
  },
  // US Equities (NASDAQ / NYSE)
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    exchange: 'NASDAQ',
    instrumentType: 'EQUITY',
    currency: 'USD',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    providerIdentifier: 'AAPL:NASDAQ'
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    instrumentType: 'EQUITY',
    currency: 'USD',
    sector: 'Technology',
    industry: 'Software & Cloud Infrastructure',
    providerIdentifier: 'MSFT:NASDAQ'
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    instrumentType: 'EQUITY',
    currency: 'USD',
    sector: 'Technology',
    industry: 'Semiconductors',
    providerIdentifier: 'NVDA:NASDAQ'
  },
  {
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    exchange: 'NASDAQ',
    instrumentType: 'EQUITY',
    currency: 'USD',
    sector: 'Consumer Discretionary',
    industry: 'E-Commerce & Cloud Computing',
    providerIdentifier: 'AMZN:NASDAQ'
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    instrumentType: 'EQUITY',
    currency: 'USD',
    sector: 'Communication Services',
    industry: 'Internet Media & Search',
    providerIdentifier: 'GOOGL:NASDAQ'
  },
  {
    symbol: 'TSLA',
    companyName: 'Tesla Inc.',
    exchange: 'NASDAQ',
    instrumentType: 'EQUITY',
    currency: 'USD',
    sector: 'Consumer Discretionary',
    industry: 'Automobile & Clean Energy',
    providerIdentifier: 'TSLA:NASDAQ'
  },
  // ETFs
  {
    symbol: 'SPY',
    companyName: 'SPDR S&P 500 ETF Trust',
    exchange: 'NYSE',
    instrumentType: 'ETF',
    currency: 'USD',
    sector: 'Broad Market ETF',
    industry: 'Equities Index Tracking',
    providerIdentifier: 'SPY:NYSE'
  },
  {
    symbol: 'QQQ',
    companyName: 'Invesco QQQ Trust (NASDAQ-100 Index)',
    exchange: 'NASDAQ',
    instrumentType: 'ETF',
    currency: 'USD',
    sector: 'Tech Sector ETF',
    industry: 'Equities Index Tracking',
    providerIdentifier: 'QQQ:NASDAQ'
  },
  {
    symbol: 'NIFTYBEES',
    companyName: 'Nippon India ETF Nifty 50 BeES',
    exchange: 'NSE',
    instrumentType: 'ETF',
    currency: 'INR',
    sector: 'Broad Market ETF',
    industry: 'Equities Index Tracking',
    providerIdentifier: 'NIFTYBEES:NSE'
  },
  // Indices
  {
    symbol: 'NIFTY50',
    companyName: 'Nifty 50 Index',
    exchange: 'INDEX',
    instrumentType: 'INDEX',
    currency: 'INR',
    sector: 'Index',
    industry: 'Benchmark Index',
    providerIdentifier: 'NIFTY50:INDEX'
  },
  {
    symbol: 'SENSEX',
    companyName: 'BSE SENSEX Index',
    exchange: 'INDEX',
    instrumentType: 'INDEX',
    currency: 'INR',
    sector: 'Index',
    industry: 'Benchmark Index',
    providerIdentifier: 'SENSEX:INDEX'
  },
  {
    symbol: 'SPX',
    companyName: 'S&P 500 Index',
    exchange: 'INDEX',
    instrumentType: 'INDEX',
    currency: 'USD',
    sector: 'Index',
    industry: 'Benchmark Index',
    providerIdentifier: 'SPX:INDEX'
  }
];

class DataStore {
  public instruments: InstrumentEntity[] = [...INITIAL_INSTRUMENTS];
  public watchlists: WatchlistEntity[] = [
    {
      id: 'wl-default-tech',
      name: 'Global MegaCap Tech',
      description: 'Leading US & Indian technology firms',
      symbols: ['AAPL', 'MSFT', 'NVDA', 'TCS', 'INFY'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wl-default-india',
      name: 'India Blue Chips (NSE)',
      description: 'Top Indian market bellwethers',
      symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'NIFTYBEES'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  public portfolio: PortfolioEntity = {
    id: 'portfolio-default',
    userId: 'user-demo',
    baseCurrency: 'USD',
    startingCapital: 10000.0,
    cashBalance: 10000.0,
    realizedPnL: 0.0,
    unrealizedPnL: 0.0,
    totalPortfolioValue: 10000.0,
    positions: [],
    lastUpdated: new Date().toISOString()
  };
  public orders: PaperOrderEntity[] = [];
  public analysisRuns: AnalysisRunEntity[] = [];

  public resetPortfolio(startingCash: number = 10000.0, currency: 'USD' | 'INR' = 'USD') {
    this.portfolio = {
      id: 'portfolio-default',
      userId: 'user-demo',
      baseCurrency: currency,
      startingCapital: startingCash,
      cashBalance: startingCash,
      realizedPnL: 0.0,
      unrealizedPnL: 0.0,
      totalPortfolioValue: startingCash,
      positions: [],
      lastUpdated: new Date().toISOString()
    };
    this.orders = [];
  }
}

export const store = new DataStore();
