import { IMarketDataProvider, ProviderStatus } from './provider.interface.js';
import { DemoMarketDataProvider } from './demo-market.provider.js';
import { TwelveDataProvider } from './twelve-data.provider.js';
import {
  InstrumentEntity,
  QuoteEntity,
  CandleEntity,
  FundamentalsEntity
} from '../../models/types.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MarketDataService {
  private primaryProvider: IMarketDataProvider;
  private demoProvider: DemoMarketDataProvider;
  private quoteCache: Map<string, CacheEntry<QuoteEntity>> = new Map();
  private candleCache: Map<string, CacheEntry<CandleEntity[]>> = new Map();
  private readonly QUOTE_TTL_MS = 10000; // 10 seconds cache to preserve API quota
  private readonly CANDLE_TTL_MS = 60000; // 60 seconds cache for historical candles

  constructor() {
    this.demoProvider = new DemoMarketDataProvider();

    const selected = (process.env.MARKET_DATA_PROVIDER || 'twelve-data').toLowerCase();
    const hasTwelveDataKey = Boolean(process.env.TWELVE_DATA_API_KEY && process.env.TWELVE_DATA_API_KEY.trim() !== '');

    if (selected === 'twelve-data' && hasTwelveDataKey) {
      console.log('MarketDataService: Using Twelve Data as primary live provider.');
      this.primaryProvider = new TwelveDataProvider();
    } else {
      console.log('MarketDataService: Using high-fidelity Demo Market Data Provider (Traditional Equities).');
      this.primaryProvider = this.demoProvider;
    }
  }

  public async getProviderStatus(): Promise<ProviderStatus> {
    return this.primaryProvider.getStatus();
  }

  public async searchSymbols(query: string): Promise<InstrumentEntity[]> {
    try {
      return await this.primaryProvider.searchSymbols(query);
    } catch (err: any) {
      console.warn(`Primary provider search failed (${err.message}). Using fallback universe.`);
      return this.demoProvider.searchSymbols(query);
    }
  }

  public async getQuote(symbol: string, exchange?: string): Promise<QuoteEntity> {
    const key = `${symbol.toUpperCase()}:${exchange || 'DEF'}`;
    const cached = this.quoteCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.QUOTE_TTL_MS) {
      return cached.data;
    }

    try {
      const quote = await this.primaryProvider.getQuote(symbol, exchange);
      this.quoteCache.set(key, { data: quote, timestamp: Date.now() });
      return quote;
    } catch (err: any) {
      console.warn(`Primary quote failed for ${symbol} (${err.message}). Using calibrated fallback quote.`);
      const demoQuote = await this.demoProvider.getQuote(symbol, exchange);
      this.quoteCache.set(key, { data: demoQuote, timestamp: Date.now() });
      return demoQuote;
    }
  }

  public async getCandles(
    symbol: string,
    interval: string = '1day',
    exchange?: string,
    outputSize: number = 60
  ): Promise<CandleEntity[]> {
    const key = `${symbol.toUpperCase()}:${interval}:${outputSize}:${exchange || 'DEF'}`;
    const cached = this.candleCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CANDLE_TTL_MS) {
      return cached.data;
    }

    try {
      const candles = await this.primaryProvider.getCandles(symbol, interval, exchange, outputSize);
      this.candleCache.set(key, { data: candles, timestamp: Date.now() });
      return candles;
    } catch (err: any) {
      console.warn(`Primary candles failed for ${symbol} (${err.message}). Generating calibrated candles.`);
      const demoCandles = await this.demoProvider.getCandles(symbol, interval, exchange, outputSize);
      this.candleCache.set(key, { data: demoCandles, timestamp: Date.now() });
      return demoCandles;
    }
  }

  public async getFundamentals(symbol: string, exchange?: string): Promise<FundamentalsEntity> {
    try {
      return await this.primaryProvider.getFundamentals(symbol, exchange);
    } catch (err: any) {
      return this.demoProvider.getFundamentals(symbol, exchange);
    }
  }

  public async getFinancials(symbol: string, exchange?: string): Promise<any> {
    try {
      return await this.primaryProvider.getFinancials(symbol, exchange);
    } catch (err: any) {
      return this.demoProvider.getFinancials(symbol, exchange);
    }
  }
}

export const marketDataService = new MarketDataService();
