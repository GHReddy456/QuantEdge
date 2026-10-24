/**
 * QuantEdge Web Client API Utility
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `HTTP error ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Markets
  searchSymbols: (q: string) => fetchJson<any[]>(`/api/markets/search?q=${encodeURIComponent(q)}`),
  getQuote: (symbol: string, exchange?: string) =>
    fetchJson<any>(`/api/markets/quote?symbol=${encodeURIComponent(symbol)}${exchange ? `&exchange=${encodeURIComponent(exchange)}` : ''}`),
  getCandles: (symbol: string, interval: string = '1day', exchange?: string, outputsize: number = 60) =>
    fetchJson<any[]>(
      `/api/markets/candles?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${outputsize}${
        exchange ? `&exchange=${encodeURIComponent(exchange)}` : ''
      }`
    ),
  getFundamentals: (symbol: string, exchange?: string) =>
    fetchJson<any>(`/api/markets/fundamentals?symbol=${encodeURIComponent(symbol)}${exchange ? `&exchange=${encodeURIComponent(exchange)}` : ''}`),
  getFinancials: (symbol: string, exchange?: string) =>
    fetchJson<any>(`/api/markets/financials?symbol=${encodeURIComponent(symbol)}${exchange ? `&exchange=${encodeURIComponent(exchange)}` : ''}`),
  getScreener: (params: { exchange?: string; sector?: string; minPrice?: number; maxPrice?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.exchange) query.set('exchange', params.exchange);
    if (params.sector) query.set('sector', params.sector);
    if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    return fetchJson<any[]>(`/api/markets/screener?${query.toString()}`);
  },

  // Watchlists
  getWatchlists: () => fetchJson<any[]>('/api/watchlists'),
  createWatchlist: (name: string, description?: string, symbols: string[] = []) =>
    fetchJson<any>('/api/watchlists', {
      method: 'POST',
      body: JSON.stringify({ name, description, symbols })
    }),
  addInstrumentToWatchlist: (id: string, symbol: string) =>
    fetchJson<any>(`/api/watchlists/${id}/instruments`, {
      method: 'POST',
      body: JSON.stringify({ symbol })
    }),
  removeInstrumentFromWatchlist: (id: string, symbol: string) =>
    fetchJson<any>(`/api/watchlists/${id}/instruments/${symbol}`, {
      method: 'DELETE'
    }),
  deleteWatchlist: (id: string) =>
    fetchJson<any>(`/api/watchlists/${id}`, {
      method: 'DELETE'
    }),

  // Portfolio & Paper Trading
  getPortfolio: () => fetchJson<any>('/api/portfolio'),
  resetPortfolio: (startingCapital: number = 10000, currency: string = 'USD') =>
    fetchJson<any>('/api/portfolio/reset', {
      method: 'POST',
      body: JSON.stringify({ startingCapital, currency })
    }),
  getOrders: () => fetchJson<any[]>('/api/paper/orders'),
  placeOrder: (order: {
    symbol: string;
    exchange?: string;
    side: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
    idempotencyKey?: string;
  }) =>
    fetchJson<any>('/api/paper/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    }),

  // Analytics
  getPriceLeaders: (symbol: string, exchange?: string) =>
    fetchJson<any>(`/api/analytics/leaders/${symbol}${exchange ? `?exchange=${exchange}` : ''}`),
  getReturnWindow: (symbol: string, exchange?: string) =>
    fetchJson<any>(`/api/analytics/return-window/${symbol}${exchange ? `?exchange=${exchange}` : ''}`),
  getMarketBreadth: () => fetchJson<any>('/api/analytics/breadth'),
  getHeatmap: () => fetchJson<any>('/api/analytics/heatmap'),
  getIntervalGcd: (a: number, b: number) => fetchJson<any>(`/api/analytics/intervals?a=${a}&b=${b}`),
  getRollingBuffer: (symbol: string, rotation: number) =>
    fetchJson<any>(`/api/analytics/rolling-buffer/${symbol}?rotation=${rotation}`),
  getContributionBalance: () => fetchJson<any>('/api/analytics/contribution-balance'),

  // Algorithms
  getAlgorithmRegistry: () => fetchJson<any[]>('/api/algorithms/registry'),
  getAlgorithm: (idOrSlug: string) => fetchJson<any>(`/api/algorithms/${idOrSlug}`),
  runAlgorithm: (idOrSlug: string, inputPayload: any) =>
    fetchJson<any>(`/api/algorithms/${idOrSlug}/run`, {
      method: 'POST',
      body: JSON.stringify(inputPayload)
    }),
  getAlgorithmSource: (idOrSlug: string, path?: string) =>
    fetchJson<any>(`/api/algorithms/${idOrSlug}/source${path ? `?path=${encodeURIComponent(path)}` : ''}`),

  // Settings
  getSettings: () => fetchJson<any>('/api/settings')
};
