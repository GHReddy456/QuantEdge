import {
  InstrumentEntity,
  QuoteEntity,
  CandleEntity,
  FundamentalsEntity,
  ProvenanceStatus
} from '../../models/types.js';

export interface ProviderStatus {
  providerName: string;
  isConfigured: boolean;
  status: ProvenanceStatus;
  rateLimitPerMinute: number;
  creditsRemaining?: number;
  notes: string;
}

export interface IMarketDataProvider {
  readonly name: string;
  getStatus(): Promise<ProviderStatus>;
  searchSymbols(query: string): Promise<InstrumentEntity[]>;
  getQuote(symbol: string, exchange?: string): Promise<QuoteEntity>;
  getCandles(
    symbol: string,
    interval: string,
    exchange?: string,
    outputSize?: number
  ): Promise<CandleEntity[]>;
  getFundamentals(symbol: string, exchange?: string): Promise<FundamentalsEntity>;
  getFinancials(symbol: string, exchange?: string): Promise<any>;
}
