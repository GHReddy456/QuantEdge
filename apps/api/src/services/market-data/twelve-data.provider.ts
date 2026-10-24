import { IMarketDataProvider, ProviderStatus } from './provider.interface.js';
import {
  InstrumentEntity,
  QuoteEntity,
  CandleEntity,
  FundamentalsEntity,
  MarketExchange,
  ProvenanceStatus
} from '../../models/types.js';

export class TwelveDataProvider implements IMarketDataProvider {
  public readonly name = 'Twelve Data Global Markets';
  private readonly baseUrl = 'https://api.twelvedata.com';
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TWELVE_DATA_API_KEY;
  }

  public async getStatus(): Promise<ProviderStatus> {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim() !== '');
    return {
      providerName: this.name,
      isConfigured,
      status: isConfigured ? 'LIVE' : 'OFFLINE',
      rateLimitPerMinute: 8,
      notes: isConfigured
        ? 'Twelve Data API key configured with rate-limit monitoring.'
        : 'Twelve Data API key not configured. Server runs in DEMO fallback mode.'
    };
  }

  public async searchSymbols(query: string): Promise<InstrumentEntity[]> {
    if (!this.apiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured on the server.');
    }

    const url = `${this.baseUrl}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${this.apiKey}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'QuantEdge-Terminal/1.0' } });
    if (!resp.ok) {
      throw new Error(`Twelve Data symbol search failed with status ${resp.status}`);
    }

    const data = await resp.json();
    if (data.status === 'error') {
      throw new Error(`Twelve Data error: ${data.message}`);
    }

    const results: any[] = data.data || [];
    return results
      .filter((item: any) => {
        // Exclude cryptocurrencies! Traditional markets only (Common Stock, ETF, Index)
        const type = (item.instrument_type || '').toLowerCase();
        return !type.includes('crypto') && !type.includes('digital');
      })
      .map((item: any) => ({
        symbol: item.symbol,
        companyName: item.instrument_name || item.symbol,
        exchange: this.normalizeExchange(item.exchange),
        instrumentType: this.normalizeType(item.instrument_type),
        currency: item.currency === 'INR' ? 'INR' : 'USD',
        providerIdentifier: `${item.symbol}:${item.exchange}`
      }));
  }

  public async getQuote(symbol: string, exchange?: string): Promise<QuoteEntity> {
    if (!this.apiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured on the server.');
    }

    let url = `${this.baseUrl}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    if (exchange) {
      url += `&exchange=${encodeURIComponent(exchange)}`;
    }

    const resp = await fetch(url, { headers: { 'User-Agent': 'QuantEdge-Terminal/1.0' } });
    const data = await resp.json();

    if (data.status === 'error' || data.code >= 400) {
      throw new Error(`Twelve Data quote error for ${symbol}: ${data.message || 'Unknown error'}`);
    }

    const price = parseFloat(data.close || data.price || '0');
    const open = parseFloat(data.open || '0');
    const high = parseFloat(data.high || '0');
    const low = parseFloat(data.low || '0');
    const prevClose = parseFloat(data.previous_close || String(price));
    const change = parseFloat(data.change || '0');
    const changePercent = parseFloat(data.percent_change || '0');
    const volume = parseInt(data.volume || '0', 10);

    const provenance: ProvenanceStatus = data.is_market_open ? 'LIVE' : 'DELAYED';

    return {
      symbol: data.symbol || symbol,
      exchange: this.normalizeExchange(data.exchange || exchange || 'NASDAQ'),
      price,
      open,
      high,
      low,
      previousClose: prevClose,
      change,
      changePercent,
      volume,
      currency: data.currency || (exchange === 'NSE' || exchange === 'BSE' ? 'INR' : 'USD'),
      timestamp: data.datetime ? new Date(data.datetime).toISOString() : new Date().toISOString(),
      provenance,
      provider: this.name
    };
  }

  public async getCandles(
    symbol: string,
    interval: string = '1day',
    exchange?: string,
    outputSize: number = 60
  ): Promise<CandleEntity[]> {
    if (!this.apiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured on the server.');
    }

    let url = `${this.baseUrl}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${outputSize}&apikey=${this.apiKey}`;
    if (exchange) {
      url += `&exchange=${encodeURIComponent(exchange)}`;
    }

    const resp = await fetch(url, { headers: { 'User-Agent': 'QuantEdge-Terminal/1.0' } });
    const data = await resp.json();

    if (data.status === 'error' || !data.values) {
      throw new Error(`Twelve Data candles error: ${data.message || 'No values returned'}`);
    }

    const candles: CandleEntity[] = data.values.map((v: any) => ({
      timestamp: new Date(v.datetime).toISOString(),
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseInt(v.volume || '0', 10)
    }));

    // Twelve data returns time series in descending order (latest first). Reverse to ascending.
    return candles.reverse();
  }

  public async getFundamentals(symbol: string, exchange?: string): Promise<FundamentalsEntity> {
    if (!this.apiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured.');
    }

    const url = `${this.baseUrl}/profile?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'QuantEdge-Terminal/1.0' } });
    const data = await resp.json();

    if (data.status === 'error') {
      throw new Error(`Twelve Data profile error: ${data.message}`);
    }

    return {
      symbol: data.symbol || symbol,
      companyName: data.name || symbol,
      sector: data.sector || 'General',
      industry: data.industry || 'Equities',
      marketCap: 0,
      peRatio: null,
      eps: null,
      dividendYield: null,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      revenue: null,
      netIncome: null,
      operatingMargin: null,
      beta: parseFloat(data.beta) || null,
      provenance: 'LIVE'
    };
  }

  public async getFinancials(symbol: string, exchange?: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured.');
    }

    const url = `${this.baseUrl}/income_statement?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'QuantEdge-Terminal/1.0' } });
    const data = await resp.json();

    return {
      symbol,
      incomeStatement: data.income_statement || [],
      provenance: 'LIVE'
    };
  }

  private normalizeExchange(ex: string = ''): MarketExchange {
    const upper = ex.toUpperCase();
    if (upper.includes('NSE') || upper.includes('NATIONAL STOCK EXCHANGE')) return 'NSE';
    if (upper.includes('BSE') || upper.includes('BOMBAY')) return 'BSE';
    if (upper.includes('NASDAQ')) return 'NASDAQ';
    if (upper.includes('NYSE')) return 'NYSE';
    return 'NASDAQ';
  }

  private normalizeType(type: string = ''): 'EQUITY' | 'ETF' | 'INDEX' {
    const upper = type.toUpperCase();
    if (upper.includes('ETF')) return 'ETF';
    if (upper.includes('INDEX')) return 'INDEX';
    return 'EQUITY';
  }
}
