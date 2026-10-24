// src/serverless.ts
import dotenv from "dotenv";

// src/app.ts
import express from "express";
import cors from "cors";

// src/routes/markets.router.ts
import { Router } from "express";

// src/models/store.ts
var INITIAL_INSTRUMENTS = [
  // Indian Equities (NSE / BSE)
  {
    symbol: "RELIANCE",
    companyName: "Reliance Industries Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    currency: "INR",
    sector: "Energy & Conglomerate",
    industry: "Oil, Gas & Consumable Fuels",
    providerIdentifier: "RELIANCE:NSE"
  },
  {
    symbol: "TCS",
    companyName: "Tata Consultancy Services Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    currency: "INR",
    sector: "Technology",
    industry: "IT Services & Consulting",
    providerIdentifier: "TCS:NSE"
  },
  {
    symbol: "INFY",
    companyName: "Infosys Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    currency: "INR",
    sector: "Technology",
    industry: "IT Services & Consulting",
    providerIdentifier: "INFY:NSE"
  },
  {
    symbol: "HDFCBANK",
    companyName: "HDFC Bank Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    currency: "INR",
    sector: "Financial Services",
    industry: "Private Commercial Banking",
    providerIdentifier: "HDFCBANK:NSE"
  },
  {
    symbol: "ICICIBANK",
    companyName: "ICICI Bank Limited",
    exchange: "NSE",
    instrumentType: "EQUITY",
    currency: "INR",
    sector: "Financial Services",
    industry: "Private Commercial Banking",
    providerIdentifier: "ICICIBANK:NSE"
  },
  // US Equities (NASDAQ / NYSE)
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    exchange: "NASDAQ",
    instrumentType: "EQUITY",
    currency: "USD",
    sector: "Technology",
    industry: "Consumer Electronics",
    providerIdentifier: "AAPL:NASDAQ"
  },
  {
    symbol: "MSFT",
    companyName: "Microsoft Corporation",
    exchange: "NASDAQ",
    instrumentType: "EQUITY",
    currency: "USD",
    sector: "Technology",
    industry: "Software & Cloud Infrastructure",
    providerIdentifier: "MSFT:NASDAQ"
  },
  {
    symbol: "NVDA",
    companyName: "NVIDIA Corporation",
    exchange: "NASDAQ",
    instrumentType: "EQUITY",
    currency: "USD",
    sector: "Technology",
    industry: "Semiconductors",
    providerIdentifier: "NVDA:NASDAQ"
  },
  {
    symbol: "AMZN",
    companyName: "Amazon.com Inc.",
    exchange: "NASDAQ",
    instrumentType: "EQUITY",
    currency: "USD",
    sector: "Consumer Discretionary",
    industry: "E-Commerce & Cloud Computing",
    providerIdentifier: "AMZN:NASDAQ"
  },
  {
    symbol: "GOOGL",
    companyName: "Alphabet Inc.",
    exchange: "NASDAQ",
    instrumentType: "EQUITY",
    currency: "USD",
    sector: "Communication Services",
    industry: "Internet Media & Search",
    providerIdentifier: "GOOGL:NASDAQ"
  },
  {
    symbol: "TSLA",
    companyName: "Tesla Inc.",
    exchange: "NASDAQ",
    instrumentType: "EQUITY",
    currency: "USD",
    sector: "Consumer Discretionary",
    industry: "Automobile & Clean Energy",
    providerIdentifier: "TSLA:NASDAQ"
  },
  // ETFs
  {
    symbol: "SPY",
    companyName: "SPDR S&P 500 ETF Trust",
    exchange: "NYSE",
    instrumentType: "ETF",
    currency: "USD",
    sector: "Broad Market ETF",
    industry: "Equities Index Tracking",
    providerIdentifier: "SPY:NYSE"
  },
  {
    symbol: "QQQ",
    companyName: "Invesco QQQ Trust (NASDAQ-100 Index)",
    exchange: "NASDAQ",
    instrumentType: "ETF",
    currency: "USD",
    sector: "Tech Sector ETF",
    industry: "Equities Index Tracking",
    providerIdentifier: "QQQ:NASDAQ"
  },
  {
    symbol: "NIFTYBEES",
    companyName: "Nippon India ETF Nifty 50 BeES",
    exchange: "NSE",
    instrumentType: "ETF",
    currency: "INR",
    sector: "Broad Market ETF",
    industry: "Equities Index Tracking",
    providerIdentifier: "NIFTYBEES:NSE"
  },
  // Indices
  {
    symbol: "NIFTY50",
    companyName: "Nifty 50 Index",
    exchange: "INDEX",
    instrumentType: "INDEX",
    currency: "INR",
    sector: "Index",
    industry: "Benchmark Index",
    providerIdentifier: "NIFTY50:INDEX"
  },
  {
    symbol: "SENSEX",
    companyName: "BSE SENSEX Index",
    exchange: "INDEX",
    instrumentType: "INDEX",
    currency: "INR",
    sector: "Index",
    industry: "Benchmark Index",
    providerIdentifier: "SENSEX:INDEX"
  },
  {
    symbol: "SPX",
    companyName: "S&P 500 Index",
    exchange: "INDEX",
    instrumentType: "INDEX",
    currency: "USD",
    sector: "Index",
    industry: "Benchmark Index",
    providerIdentifier: "SPX:INDEX"
  }
];
var DataStore = class {
  instruments = [...INITIAL_INSTRUMENTS];
  watchlists = [
    {
      id: "wl-default-tech",
      name: "Global MegaCap Tech",
      description: "Leading US & Indian technology firms",
      symbols: ["AAPL", "MSFT", "NVDA", "TCS", "INFY"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "wl-default-india",
      name: "India Blue Chips (NSE)",
      description: "Top Indian market bellwethers",
      symbols: ["RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "NIFTYBEES"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  portfolio = {
    id: "portfolio-default",
    userId: "user-demo",
    baseCurrency: "USD",
    startingCapital: 1e4,
    cashBalance: 1e4,
    realizedPnL: 0,
    unrealizedPnL: 0,
    totalPortfolioValue: 1e4,
    positions: [],
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  orders = [];
  analysisRuns = [];
  resetPortfolio(startingCash = 1e4, currency = "USD") {
    this.portfolio = {
      id: "portfolio-default",
      userId: "user-demo",
      baseCurrency: currency,
      startingCapital: startingCash,
      cashBalance: startingCash,
      realizedPnL: 0,
      unrealizedPnL: 0,
      totalPortfolioValue: startingCash,
      positions: [],
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.orders = [];
  }
};
var store = new DataStore();

// src/services/market-data/demo-market.provider.ts
var STOCK_BASELINES = {
  // Indian Equities
  RELIANCE: {
    price: 2980.5,
    currency: "INR",
    exchange: "NSE",
    sector: "Energy & Conglomerate",
    industry: "Oil, Gas & Refining",
    peRatio: 28.4,
    eps: 104.9,
    marketCap: 2015e3,
    revenue: 901e3,
    netIncome: 71e3,
    operatingMargin: 17.5,
    dividendYield: 0.35,
    fiftyTwoWeekHigh: 3217.9,
    fiftyTwoWeekLow: 2220.3,
    volatility: 0.012
  },
  TCS: {
    price: 3890.25,
    currency: "INR",
    exchange: "NSE",
    sector: "Technology",
    industry: "IT Services & Consulting",
    peRatio: 30.1,
    eps: 129.2,
    marketCap: 1405e3,
    revenue: 240893,
    netIncome: 46099,
    operatingMargin: 25.2,
    dividendYield: 1.25,
    fiftyTwoWeekHigh: 4254.7,
    fiftyTwoWeekLow: 3313,
    volatility: 0.011
  },
  INFY: {
    price: 1545.8,
    currency: "INR",
    exchange: "NSE",
    sector: "Technology",
    industry: "IT Services & Consulting",
    peRatio: 24.8,
    eps: 62.3,
    marketCap: 642e3,
    revenue: 153670,
    netIncome: 26248,
    operatingMargin: 21,
    dividendYield: 2.1,
    fiftyTwoWeekHigh: 1733,
    fiftyTwoWeekLow: 1358.35,
    volatility: 0.014
  },
  HDFCBANK: {
    price: 1530,
    currency: "INR",
    exchange: "NSE",
    sector: "Financial Services",
    industry: "Commercial Banking",
    peRatio: 18.2,
    eps: 84,
    marketCap: 1162e3,
    revenue: 198e3,
    netIncome: 64e3,
    operatingMargin: 32.4,
    dividendYield: 1.1,
    fiftyTwoWeekHigh: 1757.8,
    fiftyTwoWeekLow: 1363.45,
    volatility: 0.013
  },
  ICICIBANK: {
    price: 1125.4,
    currency: "INR",
    exchange: "NSE",
    sector: "Financial Services",
    industry: "Commercial Banking",
    peRatio: 17.5,
    eps: 64.3,
    marketCap: 79e4,
    revenue: 145e3,
    netIncome: 45e3,
    operatingMargin: 31,
    dividendYield: 0.9,
    fiftyTwoWeekHigh: 1257.8,
    fiftyTwoWeekLow: 915,
    volatility: 0.013
  },
  // US Equities
  AAPL: {
    price: 189.5,
    currency: "USD",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Consumer Electronics",
    peRatio: 31.5,
    eps: 6.01,
    marketCap: 291e4,
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
    currency: "USD",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software & Cloud Infrastructure",
    peRatio: 36.2,
    eps: 11.82,
    marketCap: 318e4,
    revenue: 236584,
    netIncome: 86102,
    operatingMargin: 44.6,
    dividendYield: 0.71,
    fiftyTwoWeekHigh: 450,
    fiftyTwoWeekLow: 327,
    volatility: 0.014
  },
  NVDA: {
    price: 126.8,
    currency: "USD",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    peRatio: 64,
    eps: 1.98,
    marketCap: 312e4,
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
    currency: "USD",
    exchange: "NASDAQ",
    sector: "Consumer Discretionary",
    industry: "E-Commerce & Cloud Computing",
    peRatio: 48.6,
    eps: 3.79,
    marketCap: 192e4,
    revenue: 574785,
    netIncome: 37684,
    operatingMargin: 7.8,
    dividendYield: 0,
    fiftyTwoWeekHigh: 201.2,
    fiftyTwoWeekLow: 118.35,
    volatility: 0.018
  },
  GOOGL: {
    price: 178.6,
    currency: "USD",
    exchange: "NASDAQ",
    sector: "Communication Services",
    industry: "Internet Media & Search",
    peRatio: 26.4,
    eps: 6.76,
    marketCap: 221e4,
    revenue: 307394,
    netIncome: 73795,
    operatingMargin: 28,
    dividendYield: 0.45,
    fiftyTwoWeekHigh: 191.75,
    fiftyTwoWeekLow: 120.21,
    volatility: 0.016
  },
  TSLA: {
    price: 248.5,
    currency: "USD",
    exchange: "NASDAQ",
    sector: "Consumer Discretionary",
    industry: "Automobile & Clean Energy",
    peRatio: 68.2,
    eps: 3.64,
    marketCap: 792e3,
    revenue: 96773,
    netIncome: 14997,
    operatingMargin: 9.2,
    dividendYield: 0,
    fiftyTwoWeekHigh: 271,
    fiftyTwoWeekLow: 138.8,
    volatility: 0.032
  },
  // ETFs
  SPY: {
    price: 544.2,
    currency: "USD",
    exchange: "NYSE",
    sector: "Broad Market ETF",
    industry: "S&P 500 Tracking",
    peRatio: 26.5,
    eps: 20.5,
    marketCap: 52e4,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.28,
    fiftyTwoWeekHigh: 550,
    fiftyTwoWeekLow: 410,
    volatility: 9e-3
  },
  QQQ: {
    price: 482.3,
    currency: "USD",
    exchange: "NASDAQ",
    sector: "Tech Sector ETF",
    industry: "NASDAQ-100 Tracking",
    peRatio: 31,
    eps: 15.5,
    marketCap: 26e4,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 0.58,
    fiftyTwoWeekHigh: 490,
    fiftyTwoWeekLow: 350,
    volatility: 0.013
  },
  NIFTYBEES: {
    price: 268.4,
    currency: "INR",
    exchange: "NSE",
    sector: "Broad Market ETF",
    industry: "Nifty 50 Tracking",
    peRatio: 22.8,
    eps: 11.7,
    marketCap: 18e3,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.15,
    fiftyTwoWeekHigh: 282,
    fiftyTwoWeekLow: 215,
    volatility: 9e-3
  },
  // Indices
  NIFTY50: {
    price: 24520,
    currency: "INR",
    exchange: "INDEX",
    sector: "Index",
    industry: "Benchmark Index",
    peRatio: 22.4,
    eps: 1094,
    marketCap: 0,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.2,
    fiftyTwoWeekHigh: 25078.3,
    fiftyTwoWeekLow: 18837.85,
    volatility: 8e-3
  },
  SENSEX: {
    price: 80600,
    currency: "INR",
    exchange: "INDEX",
    sector: "Index",
    industry: "Benchmark Index",
    peRatio: 23.8,
    eps: 3386,
    marketCap: 0,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.1,
    fiftyTwoWeekHigh: 82129.5,
    fiftyTwoWeekLow: 63583,
    volatility: 8e-3
  },
  SPX: {
    price: 5460,
    currency: "USD",
    exchange: "INDEX",
    sector: "Index",
    industry: "Benchmark Index",
    peRatio: 25.8,
    eps: 211,
    marketCap: 0,
    revenue: 0,
    netIncome: 0,
    operatingMargin: 0,
    dividendYield: 1.3,
    fiftyTwoWeekHigh: 5566,
    fiftyTwoWeekLow: 4103,
    volatility: 8e-3
  }
};
var DemoMarketDataProvider = class {
  name = "QuantEdge Simulated Market Provider";
  async getStatus() {
    return {
      providerName: this.name,
      isConfigured: true,
      status: "DEMO",
      rateLimitPerMinute: 600,
      notes: "Operating with calibrated traditional equity simulations (NSE, BSE, NASDAQ, NYSE)."
    };
  }
  async searchSymbols(query) {
    const q = query.trim().toUpperCase();
    if (!q) return INITIAL_INSTRUMENTS;
    return INITIAL_INSTRUMENTS.filter(
      (inst) => inst.symbol.toUpperCase().includes(q) || inst.companyName.toUpperCase().includes(q) || inst.exchange.toUpperCase().includes(q)
    );
  }
  async getQuote(symbol, exchange) {
    const sym = symbol.toUpperCase();
    const base = STOCK_BASELINES[sym];
    if (!base) {
      throw new Error(`Symbol "${symbol}" not found in traditional equity universe.`);
    }
    const seed = Date.now() / 6e4 % 100;
    const wobblePercent = Math.sin(seed + sym.charCodeAt(0)) * base.volatility * 0.5;
    const currentPrice = Number((base.price * (1 + wobblePercent)).toFixed(2));
    const previousClose = Number((base.price * 0.992).toFixed(2));
    const change = Number((currentPrice - previousClose).toFixed(2));
    const changePercent = Number((change / previousClose * 100).toFixed(2));
    const high = Number((Math.max(currentPrice, previousClose) * 1.008).toFixed(2));
    const low = Number((Math.min(currentPrice, previousClose) * 0.992).toFixed(2));
    const volume = Math.floor(1e6 + Math.abs(Math.sin(seed)) * 5e6);
    return {
      symbol: sym,
      exchange: exchange || base.exchange,
      price: currentPrice,
      open: previousClose,
      high,
      low,
      previousClose,
      change,
      changePercent,
      volume,
      currency: base.currency,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      provenance: "DEMO",
      provider: this.name
    };
  }
  async getCandles(symbol, interval = "1day", exchange, outputSize = 60) {
    const sym = symbol.toUpperCase();
    const base = STOCK_BASELINES[sym] || {
      price: 150,
      volatility: 0.015
    };
    const count = Math.min(Math.max(outputSize, 10), 300);
    const candles = [];
    let currentClose = base.price * 0.9;
    const now = Date.now();
    const intervalMs = this.getIntervalMilliseconds(interval);
    for (let i = count - 1; i >= 0; i--) {
      const candleTime = new Date(now - i * intervalMs).toISOString();
      const drift = Math.sin(i * 0.3 + sym.charCodeAt(0)) * 0.015 + (Math.random() - 0.48) * base.volatility;
      const open = Number(currentClose.toFixed(2));
      const close = Number((open * (1 + drift)).toFixed(2));
      const high = Number((Math.max(open, close) * (1 + Math.random() * 8e-3)).toFixed(2));
      const low = Number((Math.min(open, close) * (1 - Math.random() * 8e-3)).toFixed(2));
      const volume = Math.floor(5e5 + Math.random() * 3e6);
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
  async getFundamentals(symbol, exchange) {
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
      provenance: "DEMO"
    };
  }
  async getFinancials(symbol, exchange) {
    const sym = symbol.toUpperCase();
    const base = STOCK_BASELINES[sym];
    return {
      symbol: sym,
      currency: base?.currency || "USD",
      incomeStatement: [
        {
          period: "FY 2024",
          revenue: base?.revenue ? base.revenue : 15e4,
          operatingIncome: base?.revenue ? base.revenue * 0.25 : 37500,
          netIncome: base?.netIncome ? base.netIncome : 3e4,
          ebitda: base?.revenue ? base.revenue * 0.32 : 48e3
        },
        {
          period: "FY 2023",
          revenue: base?.revenue ? base.revenue * 0.88 : 132e3,
          operatingIncome: base?.revenue ? base.revenue * 0.22 : 29040,
          netIncome: base?.netIncome ? base.netIncome * 0.85 : 25500,
          ebitda: base?.revenue ? base.revenue * 0.29 : 38280
        }
      ],
      balanceSheet: {
        totalAssets: base?.marketCap ? base.marketCap * 0.45 : 45e4,
        totalLiabilities: base?.marketCap ? base.marketCap * 0.18 : 18e4,
        totalEquity: base?.marketCap ? base.marketCap * 0.27 : 27e4,
        cashAndEquivalents: base?.marketCap ? base.marketCap * 0.08 : 8e4
      },
      provenance: "DEMO"
    };
  }
  getIntervalMilliseconds(interval) {
    switch (interval.toLowerCase()) {
      case "1min":
        return 60 * 1e3;
      case "5min":
        return 5 * 60 * 1e3;
      case "15min":
        return 15 * 60 * 1e3;
      case "1h":
      case "60min":
        return 60 * 60 * 1e3;
      case "1week":
        return 7 * 24 * 60 * 60 * 1e3;
      case "1day":
      default:
        return 24 * 60 * 60 * 1e3;
    }
  }
};

// src/services/market-data/twelve-data.provider.ts
var TwelveDataProvider = class {
  name = "Twelve Data Global Markets";
  baseUrl = "https://api.twelvedata.com";
  apiKey;
  constructor() {
    this.apiKey = process.env.TWELVE_DATA_API_KEY;
  }
  async getStatus() {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim() !== "");
    return {
      providerName: this.name,
      isConfigured,
      status: isConfigured ? "LIVE" : "OFFLINE",
      rateLimitPerMinute: 8,
      notes: isConfigured ? "Twelve Data API key configured with rate-limit monitoring." : "Twelve Data API key not configured. Server runs in DEMO fallback mode."
    };
  }
  async searchSymbols(query) {
    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY is not configured on the server.");
    }
    const url = `${this.baseUrl}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${this.apiKey}`;
    const resp = await fetch(url, { headers: { "User-Agent": "QuantEdge-Terminal/1.0" } });
    if (!resp.ok) {
      throw new Error(`Twelve Data symbol search failed with status ${resp.status}`);
    }
    const data = await resp.json();
    if (data.status === "error") {
      throw new Error(`Twelve Data error: ${data.message}`);
    }
    const results = data.data || [];
    return results.filter((item) => {
      const type = (item.instrument_type || "").toLowerCase();
      return !type.includes("crypto") && !type.includes("digital");
    }).map((item) => ({
      symbol: item.symbol,
      companyName: item.instrument_name || item.symbol,
      exchange: this.normalizeExchange(item.exchange),
      instrumentType: this.normalizeType(item.instrument_type),
      currency: item.currency === "INR" ? "INR" : "USD",
      providerIdentifier: `${item.symbol}:${item.exchange}`
    }));
  }
  async getQuote(symbol, exchange) {
    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY is not configured on the server.");
    }
    let url = `${this.baseUrl}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    if (exchange) {
      url += `&exchange=${encodeURIComponent(exchange)}`;
    }
    const resp = await fetch(url, { headers: { "User-Agent": "QuantEdge-Terminal/1.0" } });
    const data = await resp.json();
    if (data.status === "error" || data.code >= 400) {
      throw new Error(`Twelve Data quote error for ${symbol}: ${data.message || "Unknown error"}`);
    }
    const price = parseFloat(data.close || data.price || "0");
    const open = parseFloat(data.open || "0");
    const high = parseFloat(data.high || "0");
    const low = parseFloat(data.low || "0");
    const prevClose = parseFloat(data.previous_close || String(price));
    const change = parseFloat(data.change || "0");
    const changePercent = parseFloat(data.percent_change || "0");
    const volume = parseInt(data.volume || "0", 10);
    const provenance = data.is_market_open ? "LIVE" : "DELAYED";
    return {
      symbol: data.symbol || symbol,
      exchange: this.normalizeExchange(data.exchange || exchange || "NASDAQ"),
      price,
      open,
      high,
      low,
      previousClose: prevClose,
      change,
      changePercent,
      volume,
      currency: data.currency || (exchange === "NSE" || exchange === "BSE" ? "INR" : "USD"),
      timestamp: data.datetime ? new Date(data.datetime).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      provenance,
      provider: this.name
    };
  }
  async getCandles(symbol, interval = "1day", exchange, outputSize = 60) {
    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY is not configured on the server.");
    }
    let url = `${this.baseUrl}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${outputSize}&apikey=${this.apiKey}`;
    if (exchange) {
      url += `&exchange=${encodeURIComponent(exchange)}`;
    }
    const resp = await fetch(url, { headers: { "User-Agent": "QuantEdge-Terminal/1.0" } });
    const data = await resp.json();
    if (data.status === "error" || !data.values) {
      throw new Error(`Twelve Data candles error: ${data.message || "No values returned"}`);
    }
    const candles = data.values.map((v) => ({
      timestamp: new Date(v.datetime).toISOString(),
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseInt(v.volume || "0", 10)
    }));
    return candles.reverse();
  }
  async getFundamentals(symbol, exchange) {
    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY is not configured.");
    }
    const url = `${this.baseUrl}/profile?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    const resp = await fetch(url, { headers: { "User-Agent": "QuantEdge-Terminal/1.0" } });
    const data = await resp.json();
    if (data.status === "error") {
      throw new Error(`Twelve Data profile error: ${data.message}`);
    }
    return {
      symbol: data.symbol || symbol,
      companyName: data.name || symbol,
      sector: data.sector || "General",
      industry: data.industry || "Equities",
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
      provenance: "LIVE"
    };
  }
  async getFinancials(symbol, exchange) {
    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY is not configured.");
    }
    const url = `${this.baseUrl}/income_statement?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    const resp = await fetch(url, { headers: { "User-Agent": "QuantEdge-Terminal/1.0" } });
    const data = await resp.json();
    return {
      symbol,
      incomeStatement: data.income_statement || [],
      provenance: "LIVE"
    };
  }
  normalizeExchange(ex = "") {
    const upper = ex.toUpperCase();
    if (upper.includes("NSE") || upper.includes("NATIONAL STOCK EXCHANGE")) return "NSE";
    if (upper.includes("BSE") || upper.includes("BOMBAY")) return "BSE";
    if (upper.includes("NASDAQ")) return "NASDAQ";
    if (upper.includes("NYSE")) return "NYSE";
    return "NASDAQ";
  }
  normalizeType(type = "") {
    const upper = type.toUpperCase();
    if (upper.includes("ETF")) return "ETF";
    if (upper.includes("INDEX")) return "INDEX";
    return "EQUITY";
  }
};

// src/services/market-data/market-data.service.ts
var MarketDataService = class {
  primaryProvider;
  demoProvider;
  quoteCache = /* @__PURE__ */ new Map();
  candleCache = /* @__PURE__ */ new Map();
  QUOTE_TTL_MS = 1e4;
  // 10 seconds cache to preserve API quota
  CANDLE_TTL_MS = 6e4;
  // 60 seconds cache for historical candles
  constructor() {
    this.demoProvider = new DemoMarketDataProvider();
    const selected = (process.env.MARKET_DATA_PROVIDER || "twelve-data").toLowerCase();
    const hasTwelveDataKey = Boolean(process.env.TWELVE_DATA_API_KEY && process.env.TWELVE_DATA_API_KEY.trim() !== "");
    if (selected === "twelve-data" && hasTwelveDataKey) {
      console.log("MarketDataService: Using Twelve Data as primary live provider.");
      this.primaryProvider = new TwelveDataProvider();
    } else {
      console.log("MarketDataService: Using high-fidelity Demo Market Data Provider (Traditional Equities).");
      this.primaryProvider = this.demoProvider;
    }
  }
  async getProviderStatus() {
    return this.primaryProvider.getStatus();
  }
  async searchSymbols(query) {
    try {
      return await this.primaryProvider.searchSymbols(query);
    } catch (err) {
      console.warn(`Primary provider search failed (${err.message}). Using fallback universe.`);
      return this.demoProvider.searchSymbols(query);
    }
  }
  async getQuote(symbol, exchange) {
    const key = `${symbol.toUpperCase()}:${exchange || "DEF"}`;
    const cached = this.quoteCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.QUOTE_TTL_MS) {
      return cached.data;
    }
    try {
      const quote = await this.primaryProvider.getQuote(symbol, exchange);
      this.quoteCache.set(key, { data: quote, timestamp: Date.now() });
      return quote;
    } catch (err) {
      console.warn(`Primary quote failed for ${symbol} (${err.message}). Using calibrated fallback quote.`);
      const demoQuote = await this.demoProvider.getQuote(symbol, exchange);
      this.quoteCache.set(key, { data: demoQuote, timestamp: Date.now() });
      return demoQuote;
    }
  }
  async getCandles(symbol, interval = "1day", exchange, outputSize = 60) {
    const key = `${symbol.toUpperCase()}:${interval}:${outputSize}:${exchange || "DEF"}`;
    const cached = this.candleCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CANDLE_TTL_MS) {
      return cached.data;
    }
    try {
      const candles = await this.primaryProvider.getCandles(symbol, interval, exchange, outputSize);
      this.candleCache.set(key, { data: candles, timestamp: Date.now() });
      return candles;
    } catch (err) {
      console.warn(`Primary candles failed for ${symbol} (${err.message}). Generating calibrated candles.`);
      const demoCandles = await this.demoProvider.getCandles(symbol, interval, exchange, outputSize);
      this.candleCache.set(key, { data: demoCandles, timestamp: Date.now() });
      return demoCandles;
    }
  }
  async getFundamentals(symbol, exchange) {
    try {
      return await this.primaryProvider.getFundamentals(symbol, exchange);
    } catch (err) {
      return this.demoProvider.getFundamentals(symbol, exchange);
    }
  }
  async getFinancials(symbol, exchange) {
    try {
      return await this.primaryProvider.getFinancials(symbol, exchange);
    } catch (err) {
      return this.demoProvider.getFinancials(symbol, exchange);
    }
  }
};
var marketDataService = new MarketDataService();

// src/routes/markets.router.ts
var marketsRouter = Router();
marketsRouter.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "");
    const results = await marketDataService.searchSymbols(q);
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
marketsRouter.get("/quote", async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "AAPL");
    const exchange = req.query.exchange ? String(req.query.exchange) : void 0;
    const quote = await marketDataService.getQuote(symbol, exchange);
    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});
marketsRouter.get("/candles", async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "AAPL");
    const exchange = req.query.exchange ? String(req.query.exchange) : void 0;
    const interval = String(req.query.interval || "1day");
    const outputsize = req.query.outputsize ? parseInt(String(req.query.outputsize), 10) : 60;
    const candles = await marketDataService.getCandles(symbol, interval, exchange, outputsize);
    res.json({ success: true, count: candles.length, interval, data: candles });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});
marketsRouter.get("/fundamentals", async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "AAPL");
    const exchange = req.query.exchange ? String(req.query.exchange) : void 0;
    const fundamentals = await marketDataService.getFundamentals(symbol, exchange);
    res.json({ success: true, data: fundamentals });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});
marketsRouter.get("/financials", async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "AAPL");
    const exchange = req.query.exchange ? String(req.query.exchange) : void 0;
    const financials = await marketDataService.getFinancials(symbol, exchange);
    res.json({ success: true, data: financials });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});
marketsRouter.get("/screener", async (req, res) => {
  try {
    const exchange = req.query.exchange ? String(req.query.exchange).toUpperCase() : void 0;
    const sector = req.query.sector ? String(req.query.sector).toLowerCase() : void 0;
    const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : void 0;
    const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : void 0;
    let screened = [...INITIAL_INSTRUMENTS];
    if (exchange) {
      screened = screened.filter((s) => s.exchange.toUpperCase() === exchange);
    }
    if (sector) {
      screened = screened.filter((s) => (s.sector || "").toLowerCase().includes(sector));
    }
    const enriched = await Promise.all(
      screened.map(async (inst) => {
        try {
          const q = await marketDataService.getQuote(inst.symbol, inst.exchange);
          return {
            ...inst,
            price: q.price,
            changePercent: q.changePercent,
            volume: q.volume,
            provenance: q.provenance
          };
        } catch {
          return {
            ...inst,
            price: null,
            changePercent: null,
            volume: null,
            provenance: "OFFLINE"
          };
        }
      })
    );
    let filtered = enriched;
    if (minPrice !== void 0) {
      filtered = filtered.filter((item) => item.price !== null && item.price >= minPrice);
    }
    if (maxPrice !== void 0) {
      filtered = filtered.filter((item) => item.price !== null && item.price <= maxPrice);
    }
    res.json({ success: true, total: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// src/routes/watchlists.router.ts
import { Router as Router2 } from "express";
import { naturalSort } from "@quantedge/algorithms";
var watchlistsRouter = Router2();
watchlistsRouter.get("/", async (_req, res) => {
  try {
    const enriched = await Promise.all(
      store.watchlists.map(async (wl) => {
        const sortedSymbols = naturalSort(wl.symbols).sorted;
        const quotes = await Promise.all(
          sortedSymbols.map(async (sym) => {
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
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
watchlistsRouter.post("/", (req, res) => {
  try {
    const { name, description, symbols } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, error: "Watchlist name is required." });
    }
    const newId = `wl-${Date.now()}`;
    const cleanSymbols = Array.isArray(symbols) ? naturalSort(symbols.map((s) => s.trim().toUpperCase())).sorted : [];
    const newWl = {
      id: newId,
      name: name.trim(),
      description: description || "",
      symbols: cleanSymbols,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.watchlists.push(newWl);
    res.status(201).json({ success: true, data: newWl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
watchlistsRouter.post("/:id/instruments", (req, res) => {
  try {
    const { id } = req.params;
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ success: false, error: "Symbol is required." });
    }
    const wl = store.watchlists.find((w) => w.id === id);
    if (!wl) {
      return res.status(404).json({ success: false, error: `Watchlist "${id}" not found.` });
    }
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!wl.symbols.includes(cleanSymbol)) {
      wl.symbols.push(cleanSymbol);
      wl.symbols = naturalSort(wl.symbols).sorted;
      wl.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    res.json({ success: true, data: wl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
watchlistsRouter.delete("/:id/instruments/:symbol", (req, res) => {
  try {
    const { id, symbol } = req.params;
    const wl = store.watchlists.find((w) => w.id === id);
    if (!wl) {
      return res.status(404).json({ success: false, error: `Watchlist "${id}" not found.` });
    }
    const cleanSymbol = symbol.trim().toUpperCase();
    wl.symbols = wl.symbols.filter((s) => s !== cleanSymbol);
    wl.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    res.json({ success: true, data: wl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
watchlistsRouter.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = store.watchlists.length;
    store.watchlists = store.watchlists.filter((w) => w.id !== id);
    if (store.watchlists.length === initialLen) {
      return res.status(404).json({ success: false, error: `Watchlist "${id}" not found.` });
    }
    res.json({ success: true, message: `Watchlist "${id}" deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// src/routes/portfolio.router.ts
import { Router as Router3 } from "express";

// src/services/paper-trading.service.ts
var PaperTradingService = class {
  FEE_RATE = 1e-3;
  // 0.1% transaction fee
  MIN_FEE = 1;
  // $1.00 minimum transaction fee
  processedKeys = /* @__PURE__ */ new Set();
  async getPortfolio() {
    await this.updatePositionsValuation();
    return store.portfolio;
  }
  async getOrders() {
    return [...store.orders].reverse();
  }
  async resetAccount(startingCapital = 1e4, currency = "USD") {
    store.resetPortfolio(startingCapital, currency);
    this.processedKeys.clear();
    return store.portfolio;
  }
  async placeOrder(req) {
    const symbol = req.symbol.trim().toUpperCase();
    const quantity = Math.floor(req.quantity);
    if (!symbol) {
      throw new Error("Stock symbol is required.");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive whole integer.");
    }
    if (req.side !== "BUY" && req.side !== "SELL") {
      throw new Error(`Invalid order side: ${req.side}`);
    }
    if (req.orderType !== "MARKET" && req.orderType !== "LIMIT") {
      throw new Error(`Invalid order type: ${req.orderType}`);
    }
    if (req.orderType === "LIMIT" && (!req.limitPrice || req.limitPrice <= 0)) {
      throw new Error("Limit price must be greater than zero for LIMIT orders.");
    }
    if (req.idempotencyKey) {
      if (this.processedKeys.has(req.idempotencyKey)) {
        throw new Error("Duplicate order submission detected (idempotency key matched).");
      }
      this.processedKeys.add(req.idempotencyKey);
    }
    const quote = await marketDataService.getQuote(symbol, req.exchange);
    const observablePrice = quote.price;
    let executionPrice = observablePrice;
    let isFilled = false;
    let statusReason = "";
    if (req.orderType === "MARKET") {
      isFilled = true;
      executionPrice = observablePrice;
    } else if (req.orderType === "LIMIT") {
      const limit = req.limitPrice;
      if (req.side === "BUY") {
        if (observablePrice <= limit) {
          isFilled = true;
          executionPrice = Math.min(observablePrice, limit);
        } else {
          isFilled = false;
          statusReason = `Limit price $${limit} is below current market ask $${observablePrice}`;
        }
      } else {
        if (observablePrice >= limit) {
          isFilled = true;
          executionPrice = Math.max(observablePrice, limit);
        } else {
          isFilled = false;
          statusReason = `Limit price $${limit} is above current market bid $${observablePrice}`;
        }
      }
    }
    const grossValue = Number((executionPrice * quantity).toFixed(2));
    const fee = Number(Math.max(grossValue * this.FEE_RATE, this.MIN_FEE).toFixed(2));
    const totalOrderCost = Number((grossValue + fee).toFixed(2));
    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    if (req.side === "BUY") {
      if (store.portfolio.cashBalance < totalOrderCost) {
        const rejectedOrder = {
          id: orderId,
          symbol,
          exchange: quote.exchange,
          side: "BUY",
          orderType: req.orderType,
          quantity,
          limitPrice: req.limitPrice,
          executionPrice,
          totalValue: grossValue,
          fees: fee,
          status: "REJECTED",
          quoteTimestampUsed: quote.timestamp,
          rejectionReason: `Insufficient virtual cash balance. Required: $${totalOrderCost}, Available: $${store.portfolio.cashBalance.toFixed(2)}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        store.orders.push(rejectedOrder);
        throw new Error(rejectedOrder.rejectionReason);
      }
      if (isFilled) {
        store.portfolio.cashBalance = Number((store.portfolio.cashBalance - totalOrderCost).toFixed(2));
        const existingPos = store.portfolio.positions.find((p) => p.symbol === symbol);
        if (existingPos) {
          const totalExistingCost = existingPos.quantity * existingPos.averagePrice;
          const totalNewCost = quantity * executionPrice;
          const combinedQty = existingPos.quantity + quantity;
          const newAvgPrice = Number(((totalExistingCost + totalNewCost) / combinedQty).toFixed(4));
          existingPos.quantity = combinedQty;
          existingPos.averagePrice = newAvgPrice;
          existingPos.currentPrice = executionPrice;
          existingPos.totalCost = Number((newAvgPrice * combinedQty).toFixed(2));
          existingPos.currentValue = Number((executionPrice * combinedQty).toFixed(2));
          existingPos.unrealizedPnL = Number((existingPos.currentValue - existingPos.totalCost).toFixed(2));
          existingPos.unrealizedPnLPercent = Number((existingPos.unrealizedPnL / existingPos.totalCost * 100).toFixed(2));
        } else {
          const newPos = {
            symbol,
            exchange: quote.exchange,
            quantity,
            averagePrice: executionPrice,
            currentPrice: executionPrice,
            totalCost: grossValue,
            currentValue: grossValue,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0
          };
          store.portfolio.positions.push(newPos);
        }
      }
    } else {
      const existingPos = store.portfolio.positions.find((p) => p.symbol === symbol);
      const heldQty = existingPos?.quantity || 0;
      if (!existingPos || heldQty < quantity) {
        const rejectedOrder = {
          id: orderId,
          symbol,
          exchange: quote.exchange,
          side: "SELL",
          orderType: req.orderType,
          quantity,
          limitPrice: req.limitPrice,
          executionPrice,
          totalValue: grossValue,
          fees: fee,
          status: "REJECTED",
          quoteTimestampUsed: quote.timestamp,
          rejectionReason: `Cannot sell ${quantity} shares of ${symbol}. Currently holding ${heldQty} shares.`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        store.orders.push(rejectedOrder);
        throw new Error(rejectedOrder.rejectionReason);
      }
      if (isFilled) {
        const proceeds = Number((grossValue - fee).toFixed(2));
        store.portfolio.cashBalance = Number((store.portfolio.cashBalance + proceeds).toFixed(2));
        const realizedOnLot = Number(((executionPrice - existingPos.averagePrice) * quantity - fee).toFixed(2));
        store.portfolio.realizedPnL = Number((store.portfolio.realizedPnL + realizedOnLot).toFixed(2));
        existingPos.quantity -= quantity;
        if (existingPos.quantity === 0) {
          store.portfolio.positions = store.portfolio.positions.filter((p) => p.symbol !== symbol);
        } else {
          existingPos.totalCost = Number((existingPos.quantity * existingPos.averagePrice).toFixed(2));
          existingPos.currentValue = Number((existingPos.quantity * executionPrice).toFixed(2));
          existingPos.unrealizedPnL = Number((existingPos.currentValue - existingPos.totalCost).toFixed(2));
          existingPos.unrealizedPnLPercent = Number((existingPos.unrealizedPnL / existingPos.totalCost * 100).toFixed(2));
        }
      }
    }
    const order = {
      id: orderId,
      symbol,
      exchange: quote.exchange,
      side: req.side,
      orderType: req.orderType,
      quantity,
      limitPrice: req.limitPrice,
      executionPrice: isFilled ? executionPrice : 0,
      totalValue: grossValue,
      fees: isFilled ? fee : 0,
      status: isFilled ? "FILLED" : "PENDING",
      quoteTimestampUsed: quote.timestamp,
      rejectionReason: isFilled ? void 0 : statusReason,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      executedAt: isFilled ? (/* @__PURE__ */ new Date()).toISOString() : void 0
    };
    store.orders.push(order);
    await this.updatePositionsValuation();
    return order;
  }
  async updatePositionsValuation() {
    let totalPositionsValue = 0;
    let totalUnrealizedPnL = 0;
    for (const pos of store.portfolio.positions) {
      try {
        const quote = await marketDataService.getQuote(pos.symbol, pos.exchange);
        pos.currentPrice = quote.price;
        pos.currentValue = Number((pos.quantity * quote.price).toFixed(2));
        pos.unrealizedPnL = Number((pos.currentValue - pos.totalCost).toFixed(2));
        pos.unrealizedPnLPercent = pos.totalCost > 0 ? Number((pos.unrealizedPnL / pos.totalCost * 100).toFixed(2)) : 0;
      } catch {
      }
      totalPositionsValue += pos.currentValue;
      totalUnrealizedPnL += pos.unrealizedPnL;
    }
    store.portfolio.unrealizedPnL = Number(totalUnrealizedPnL.toFixed(2));
    store.portfolio.totalPortfolioValue = Number((store.portfolio.cashBalance + totalPositionsValue).toFixed(2));
    store.portfolio.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  }
};
var paperTradingService = new PaperTradingService();

// src/routes/portfolio.router.ts
var portfolioRouter = Router3();
portfolioRouter.get("/", async (_req, res) => {
  try {
    const portfolio = await paperTradingService.getPortfolio();
    res.json({ success: true, data: portfolio });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
portfolioRouter.post("/reset", async (req, res) => {
  try {
    const startingCapital = req.body.startingCapital ? Number(req.body.startingCapital) : 1e4;
    const currency = req.body.currency === "INR" ? "INR" : "USD";
    const portfolio = await paperTradingService.resetAccount(startingCapital, currency);
    res.json({ success: true, message: "Portfolio reset successfully.", data: portfolio });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// src/routes/paper.router.ts
import { Router as Router4 } from "express";
var paperRouter = Router4();
paperRouter.get("/orders", async (_req, res) => {
  try {
    const orders = await paperTradingService.getOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
paperRouter.post("/orders", async (req, res) => {
  try {
    const { symbol, exchange, side, orderType, quantity, limitPrice, idempotencyKey } = req.body;
    const order = await paperTradingService.placeOrder({
      symbol,
      exchange,
      side,
      orderType,
      quantity: Number(quantity),
      limitPrice: limitPrice ? Number(limitPrice) : void 0,
      idempotencyKey
    });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// src/routes/analytics.router.ts
import { Router as Router5 } from "express";

// src/services/market-analytics.service.ts
import {
  gcd,
  rotateLeftBlockSwap,
  maxProductSubarray,
  maxHourglassSum,
  maxEquilibriumSum,
  findLeaders,
  findMajorityElement,
  naturalSort as naturalSort2
} from "@quantedge/algorithms";
var MarketAnalyticsService = class {
  /**
   * ACC-10: Stock Detail -> Historical Price Leaders
   * Identifies chronological price milestones where closing price was never broken by later days.
   */
  async analyzePriceLeaders(symbol, exchange) {
    const candles = await marketDataService.getCandles(symbol, "1day", exchange, 60);
    const closePrices = candles.map((c) => c.close);
    const result = findLeaders(closePrices);
    const leadersWithTimestamps = result.leaders.map((leader) => ({
      ...leader,
      timestamp: candles[leader.index]?.timestamp || "Unknown"
    }));
    return {
      symbol,
      exchange: exchange || "DEFAULT",
      totalObservations: closePrices.length,
      leaders: leadersWithTimestamps,
      steps: result.steps
    };
  }
  /**
   * ACC-07: Stock Analytics -> Best Compounded-Return Window
   * Calculates daily return multipliers 1 + r and applies max product subarray to find
   * the highest yielding historical holding window.
   */
  async analyzeBestCompoundedReturnWindow(symbol, exchange) {
    const candles = await marketDataService.getCandles(symbol, "1day", exchange, 60);
    if (candles.length < 2) {
      throw new Error(`Insufficient historical candles for ${symbol} to compute return window.`);
    }
    const returnMultipliers = [];
    for (let i = 1; i < candles.length; i++) {
      const prev = candles[i - 1].close;
      const curr = candles[i].close;
      const r = (curr - prev) / prev;
      returnMultipliers.push(Number((1 + r).toFixed(6)));
    }
    const result = maxProductSubarray(returnMultipliers);
    const startCandle = candles[result.startIndex];
    const endCandle = candles[result.endIndex + 1] || candles[result.endIndex];
    return {
      symbol,
      periodStart: startCandle?.timestamp,
      periodEnd: endCandle?.timestamp,
      maxCompoundedMultiplier: Number(result.maxProduct.toFixed(4)),
      compoundedReturnPercent: Number(result.compoundedReturnPercent.toFixed(2)),
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      windowSize: result.subarray.length,
      steps: result.steps.slice(0, 20)
      // bounded trace
    };
  }
  /**
   * ACC-02: Analytics -> Sampling Interval Analysis
   * Calculates the GCD of two sampling periods (e.g. 15m and 30m).
   */
  analyzeSamplingInterval(intervalA, intervalB) {
    const result = gcd(intervalA, intervalB);
    return {
      intervalA,
      intervalB,
      gcdMinutes: result.gcd,
      iterations: result.iterations,
      steps: result.steps,
      explanation: `The base sampling unit common to both ${intervalA}m and ${intervalB}m is ${result.gcd}m.`
    };
  }
  /**
   * ACC-06: Analytics -> Rolling Sample Window
   * In-place rotation of a fixed-size market observation sample buffer.
   */
  async rotateRollingBuffer(symbol, rotationCount) {
    const candles = await marketDataService.getCandles(symbol, "1day", void 0, 20);
    const candleSubset = candles.map((c) => ({
      timestamp: c.timestamp.split("T")[0],
      close: c.close,
      volume: c.volume
    }));
    const result = rotateLeftBlockSwap([...candleSubset], rotationCount);
    return {
      symbol,
      rotationRequested: rotationCount,
      effectiveRotation: result.effectiveRotation,
      swapsPerformed: result.swapsPerformed,
      original: result.original,
      rotated: result.rotated,
      steps: result.steps
    };
  }
  /**
   * ACC-08: Market Analytics -> Performance Heatmap
   * Evaluates standard 7-cell hourglass localized performance clusters across sector performance matrix.
   */
  evaluateHeatmapHourglass(customMatrix) {
    const matrix = customMatrix || [
      [1.4, 2.1, 0.8, -0.5, 1.2, 0.9],
      [-0.2, 3.5, 1.1, -1.2, 0.4, 2],
      [0.9, 1.8, 2.4, 0.6, -0.8, 1.5],
      [2.5, -0.4, 3.2, 4.1, 1.9, -0.1],
      [0.3, 1.2, -0.9, 2.8, 1.1, 0.7],
      [-1.1, 0.8, 2.2, 1.5, 3, 2.4]
    ];
    const result = maxHourglassSum(matrix);
    return {
      gridRows: result.gridRows,
      gridCols: result.gridCols,
      maxSum: Number(result.maxSum.toFixed(2)),
      bestRow: result.bestRow,
      bestCol: result.bestCol,
      hourglassCells: result.cells,
      matrix,
      steps: result.steps
    };
  }
  /**
   * ACC-09: Portfolio Analytics -> Contribution Balance
   * Analyzes signed sequence of portfolio contributions/realized P&Ls to locate points of balance.
   */
  evaluateContributionBalance(customContributions) {
    let values = customContributions;
    if (!values || values.length === 0) {
      if (store.orders.length > 0) {
        values = store.orders.map((o) => o.side === "BUY" ? -o.fees : o.totalValue - o.fees);
      } else {
        values = [-70, 15, 50, 25, -40, 30, 0];
      }
    }
    const result = maxEquilibriumSum(values);
    return {
      values,
      maxEquilibriumSum: result.maxEquilibriumSum,
      bestIndex: result.bestIndex,
      allEquilibriumPoints: result.allEquilibriumPoints,
      totalSum: result.totalSum,
      steps: result.steps
    };
  }
  /**
   * ACC-11: Market Analytics -> Market Breadth
   * Classifies price changes across market components into 'POSITIVE', 'NEGATIVE', 'UNCHANGED'
   * and runs Boyer-Moore voting + verification pass to determine strict majority.
   */
  async evaluateMarketBreadth() {
    const symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "TSLA"];
    const classifications = [];
    for (const sym of symbols) {
      try {
        const q = await marketDataService.getQuote(sym);
        if (q.change > 0) classifications.push("POSITIVE");
        else if (q.change < 0) classifications.push("NEGATIVE");
        else classifications.push("UNCHANGED");
      } catch {
        classifications.push("UNCHANGED");
      }
    }
    const result = findMajorityElement(classifications);
    return {
      symbolsEvaluated: symbols,
      classifications,
      candidate: result.candidate,
      count: result.count,
      total: result.total,
      percentage: Number(result.percentage.toFixed(1)),
      hasStrictMajority: result.hasMajority,
      threshold: result.threshold,
      steps: result.steps
    };
  }
  /**
   * ACC-13: Natural Sort Order
   * Applies natural sorting to array of identifiers.
   */
  sortIdentifiers(identifiers) {
    return naturalSort2(identifiers);
  }
};
var marketAnalyticsService = new MarketAnalyticsService();

// src/routes/analytics.router.ts
var analyticsRouter = Router5();
analyticsRouter.get("/leaders/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const exchange = req.query.exchange ? String(req.query.exchange) : void 0;
    const data = await marketAnalyticsService.analyzePriceLeaders(symbol, exchange);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
analyticsRouter.get("/return-window/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const exchange = req.query.exchange ? String(req.query.exchange) : void 0;
    const data = await marketAnalyticsService.analyzeBestCompoundedReturnWindow(symbol, exchange);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
analyticsRouter.get("/breadth", async (_req, res) => {
  try {
    const data = await marketAnalyticsService.evaluateMarketBreadth();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
analyticsRouter.get("/heatmap", (_req, res) => {
  try {
    const data = marketAnalyticsService.evaluateHeatmapHourglass();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
analyticsRouter.get("/intervals", (req, res) => {
  try {
    const a = req.query.a ? parseInt(String(req.query.a), 10) : 15;
    const b = req.query.b ? parseInt(String(req.query.b), 10) : 30;
    const data = marketAnalyticsService.analyzeSamplingInterval(a, b);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
analyticsRouter.get("/rolling-buffer/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const rotation = req.query.rotation ? parseInt(String(req.query.rotation), 10) : 2;
    const data = await marketAnalyticsService.rotateRollingBuffer(symbol, rotation);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
analyticsRouter.get("/contribution-balance", (_req, res) => {
  try {
    const data = marketAnalyticsService.evaluateContributionBalance();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
analyticsRouter.get("/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const exchange = req.query.exchange ? String(req.query.exchange) : void 0;
    const [leaders, returnWindow] = await Promise.all([
      marketAnalyticsService.analyzePriceLeaders(symbol, exchange).catch(() => null),
      marketAnalyticsService.analyzeBestCompoundedReturnWindow(symbol, exchange).catch(() => null)
    ]);
    res.json({
      success: true,
      symbol,
      data: {
        leaders,
        returnWindow
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// src/routes/algorithms.router.ts
import { Router as Router6 } from "express";

// src/services/algorithm-execution.service.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALGORITHM_REGISTRY,
  getAlgorithmById,
  getAlgorithmBySlug
} from "@quantedge/algorithms";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var projectRoot = path.resolve(__dirname, "../../../../");
var ALLOWLISTED_FILES = /* @__PURE__ */ new Set([
  "packages/algorithms/src/booth.ts",
  "packages/algorithms/src/euclid.ts",
  "packages/algorithms/src/karatsuba.ts",
  "packages/algorithms/src/longestOnesAfterFlip.ts",
  "packages/algorithms/src/swapNibbles.ts",
  "packages/algorithms/src/blockSwap.ts",
  "packages/algorithms/src/maxProductSubarray.ts",
  "packages/algorithms/src/maxHourglassSum.ts",
  "packages/algorithms/src/maxEquilibriumSum.ts",
  "packages/algorithms/src/leadersInArray.ts",
  "packages/algorithms/src/majorityElement.ts",
  "packages/algorithms/src/lexicographicPalindrome.ts",
  "packages/algorithms/src/naturalSort.ts",
  "packages/algorithms/src/registry.ts",
  "packages/algorithms/src/index.ts",
  "packages/algorithms/tests/booth.test.ts",
  "packages/algorithms/tests/euclid.test.ts",
  "packages/algorithms/tests/karatsuba.test.ts",
  "packages/algorithms/tests/longestOnesAfterFlip.test.ts",
  "packages/algorithms/tests/swapNibbles.test.ts",
  "packages/algorithms/tests/blockSwap.test.ts",
  "packages/algorithms/tests/maxProductSubarray.test.ts",
  "packages/algorithms/tests/maxHourglassSum.test.ts",
  "packages/algorithms/tests/maxEquilibriumSum.test.ts",
  "packages/algorithms/tests/leadersInArray.test.ts",
  "packages/algorithms/tests/majorityElement.test.ts",
  "packages/algorithms/tests/lexicographicPalindrome.test.ts",
  "packages/algorithms/tests/naturalSort.test.ts",
  "packages/algorithms/tests/registry.test.ts"
]);
var AlgorithmExecutionService = class {
  getAllRegistry() {
    return ALGORITHM_REGISTRY;
  }
  getAlgorithm(identifier) {
    return getAlgorithmById(identifier) || getAlgorithmBySlug(identifier);
  }
  executeAlgorithm(identifier, inputPayload) {
    const algo = this.getAlgorithm(identifier);
    if (!algo) {
      throw new Error(`Algorithm "${identifier}" is not registered.`);
    }
    const startTime = performance.now();
    try {
      const output = algo.execute(inputPayload);
      const executionTimeMs = Number((performance.now() - startTime).toFixed(3));
      store.analysisRuns.push({
        id: `run-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
        symbol: inputPayload.symbol || "N/A",
        algorithmId: algo.id,
        algorithmName: algo.name,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        inputSnapshot: inputPayload,
        outputSnapshot: output,
        executionTimeMs
      });
      return {
        algorithmId: algo.id,
        algorithmName: algo.name,
        slug: algo.slug,
        executionTimeMs,
        input: inputPayload,
        output
      };
    } catch (err) {
      throw new Error(`Execution error in ${algo.name}: ${err.message}`);
    }
  }
  getAlgorithmSource(identifier, requestedPath) {
    const algo = this.getAlgorithm(identifier);
    if (!algo) {
      throw new Error(`Algorithm "${identifier}" not found in registry.`);
    }
    const relativePath = (requestedPath || algo.sourceFile).replace(/\\/g, "/");
    if (!ALLOWLISTED_FILES.has(relativePath)) {
      throw new Error(`Access denied: File "${relativePath}" is not in the permitted algorithm allowlist.`);
    }
    const absolutePath = path.resolve(projectRoot, relativePath);
    if (!absolutePath.startsWith(projectRoot)) {
      throw new Error("Access denied: Path traversal detected.");
    }
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Source file "${relativePath}" does not exist on disk.`);
    }
    const code = fs.readFileSync(absolutePath, "utf8");
    const lines = code.split("\n");
    return {
      algorithmId: algo.id,
      algorithmName: algo.name,
      filePath: relativePath,
      exportedFunction: algo.exportedFunction,
      testFile: algo.testFile,
      actualCaller: algo.actualCaller,
      timeComplexity: algo.timeComplexity,
      spaceComplexity: algo.spaceComplexity,
      lineCount: lines.length,
      sourceCode: code,
      lines
    };
  }
};
var algorithmExecutionService = new AlgorithmExecutionService();

// src/routes/algorithms.router.ts
var algorithmsRouter = Router6();
algorithmsRouter.get("/registry", (_req, res) => {
  try {
    const list = algorithmExecutionService.getAllRegistry().map((algo) => ({
      id: algo.id,
      slug: algo.slug,
      name: algo.name,
      category: algo.category,
      description: algo.description,
      sourceFile: algo.sourceFile,
      exportedFunction: algo.exportedFunction,
      testFile: algo.testFile,
      applicationUseCase: algo.applicationUseCase,
      actualCaller: algo.actualCaller,
      route: algo.route,
      timeComplexity: algo.timeComplexity,
      spaceComplexity: algo.spaceComplexity
    }));
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
algorithmsRouter.get("/:identifier", (req, res) => {
  try {
    const { identifier } = req.params;
    const algo = algorithmExecutionService.getAlgorithm(identifier);
    if (!algo) {
      return res.status(404).json({ success: false, error: `Algorithm "${identifier}" not found.` });
    }
    res.json({
      success: true,
      data: {
        id: algo.id,
        slug: algo.slug,
        name: algo.name,
        category: algo.category,
        description: algo.description,
        problemStatement: algo.problemStatement,
        sourceFile: algo.sourceFile,
        exportedFunction: algo.exportedFunction,
        testFile: algo.testFile,
        applicationUseCase: algo.applicationUseCase,
        actualCaller: algo.actualCaller,
        route: algo.route,
        timeComplexity: algo.timeComplexity,
        spaceComplexity: algo.spaceComplexity,
        inputSchema: algo.inputSchema,
        outputSchema: algo.outputSchema
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
algorithmsRouter.post("/:identifier/run", (req, res) => {
  try {
    const { identifier } = req.params;
    const payload = req.body;
    const result = algorithmExecutionService.executeAlgorithm(identifier, payload);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
algorithmsRouter.get("/:identifier/source", (req, res) => {
  try {
    const { identifier } = req.params;
    const requestedPath = req.query.path ? String(req.query.path) : void 0;
    const sourceData = algorithmExecutionService.getAlgorithmSource(identifier, requestedPath);
    res.json({ success: true, data: sourceData });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// src/routes/settings.router.ts
import { Router as Router7 } from "express";

// src/db/connection.ts
import mongoose from "mongoose";
var dbState = {
  isConnected: false,
  type: "IN_MEMORY_PERSISTENCE"
};
async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim() !== "") {
    try {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2e3,
        connectTimeoutMS: 2e3
      });
      dbState = {
        isConnected: true,
        type: "MONGODB_ATLAS",
        uri: uri.replace(/:([^@]+)@/, ":****@"),
        // Mask password in state
        databaseName: mongoose.connection.name
      };
      console.log(`Connected to MongoDB Atlas: database "${mongoose.connection.name}"`);
      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB Atlas disconnected. Falling back to memory store.");
        dbState.isConnected = false;
      });
      return dbState;
    } catch (err) {
      console.warn(`MongoDB Atlas connection failed: ${err.message}. Initializing embedded persistence store.`);
      dbState = {
        isConnected: false,
        type: "IN_MEMORY_PERSISTENCE",
        error: err.message
      };
    }
  } else {
    console.log("MONGODB_URI not provided. Initializing embedded in-memory persistence engine (Atlas ready).");
    dbState = {
      isConnected: false,
      type: "IN_MEMORY_PERSISTENCE"
    };
  }
  return dbState;
}
function getDatabaseState() {
  return { ...dbState };
}

// src/routes/settings.router.ts
var settingsRouter = Router7();
settingsRouter.get("/", async (_req, res) => {
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
          databaseName: dbStatus.databaseName || "in-memory-quantedge",
          error: dbStatus.error
        },
        preferences: {
          defaultDisplayCurrency: "USD",
          portfolioBaseCurrency: "USD",
          supportedExchanges: ["NSE", "BSE", "NASDAQ", "NYSE", "INDEX"]
        },
        securityNotice: "Server-side API keys and credentials are never exposed through client endpoints."
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// src/app.ts
function createApp() {
  const app2 = express();
  app2.use(cors());
  app2.use(express.json());
  app2.get(["/health", "/api/health"], (_req, res) => {
    res.json({
      status: "UP",
      service: "QuantEdge Financial Analytics & Paper Trading API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get(["/", "/api", "/api/index", "/api/index.js"], (_req, res) => {
    res.json({
      name: "QuantEdge Financial Analytics & Paper Trading API",
      status: "UP",
      webUrl: "http://localhost:3000",
      message: "QuantEdge API is running. Visit the web platform at http://localhost:3000.",
      endpoints: {
        health: "/health",
        markets: "/api/markets",
        watchlists: "/api/watchlists",
        portfolio: "/api/portfolio",
        paperTrading: "/api/paper",
        analytics: "/api/analytics",
        algorithms: "/api/algorithms/registry",
        settings: "/api/settings"
      }
    });
  });
  app2.use("/api/markets", marketsRouter);
  app2.use("/api/watchlists", watchlistsRouter);
  app2.use("/api/portfolio", portfolioRouter);
  app2.use("/api/paper", paperRouter);
  app2.use("/api/analytics", analyticsRouter);
  app2.use("/api/algorithms", algorithmsRouter);
  app2.use("/api/settings", settingsRouter);
  app2.use((_req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found." });
  });
  app2.use((err, _req, res, _next) => {
    console.error("Unhandled API Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error"
    });
  });
  return app2;
}

// src/serverless.ts
dotenv.config();
connectDatabase().catch((err) => console.warn("Async DB connection:", err));
var app = createApp();
app.use((req, _res, next) => {
  const originalPath = req.headers["x-forwarded-uri"] || req.headers["x-matched-path"];
  if (originalPath && typeof originalPath === "string") {
    req.url = originalPath;
  }
  next();
});
var serverless_default = app;
export {
  app,
  serverless_default as default
};
