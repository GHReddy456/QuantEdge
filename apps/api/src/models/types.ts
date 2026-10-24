export type MarketExchange = 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'INDEX';
export type InstrumentType = 'EQUITY' | 'ETF' | 'INDEX';
export type ProvenanceStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'OFFLINE' | 'DEMO';

export interface InstrumentEntity {
  symbol: string;
  companyName: string;
  exchange: MarketExchange;
  instrumentType: InstrumentType;
  currency: 'USD' | 'INR';
  sector?: string;
  industry?: string;
  providerIdentifier?: string;
}

export interface QuoteEntity {
  symbol: string;
  exchange: MarketExchange;
  price: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  currency: string;
  timestamp: string;
  provenance: ProvenanceStatus;
  provider: string;
}

export interface CandleEntity {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundamentalsEntity {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  revenue: number | null;
  netIncome: number | null;
  operatingMargin: number | null;
  beta: number | null;
  provenance: ProvenanceStatus;
}

export interface WatchlistEntity {
  id: string;
  name: string;
  description?: string;
  symbols: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PositionEntity {
  symbol: string;
  exchange: MarketExchange;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PortfolioEntity {
  id: string;
  userId: string;
  baseCurrency: 'USD' | 'INR';
  startingCapital: number;
  cashBalance: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPortfolioValue: number;
  positions: PositionEntity[];
  lastUpdated: string;
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'FILLED' | 'PENDING' | 'REJECTED' | 'CANCELLED';

export interface PaperOrderEntity {
  id: string;
  symbol: string;
  exchange: MarketExchange;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  limitPrice?: number;
  executionPrice: number;
  totalValue: number;
  fees: number;
  status: OrderStatus;
  quoteTimestampUsed: string;
  rejectionReason?: string;
  createdAt: string;
  executedAt?: string;
}

export interface AnalysisRunEntity {
  id: string;
  symbol: string;
  algorithmId: string;
  algorithmName: string;
  timestamp: string;
  inputSnapshot: any;
  outputSnapshot: any;
  executionTimeMs: number;
}
