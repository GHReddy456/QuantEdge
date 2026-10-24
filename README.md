# QuantEdge | Quantitative Intelligence for Equity Markets

> **Multi-Market Stock Analysis, Quantitative Research & Paper Trading Platform**  
> *Academic Engineering Project for STS3007 Advanced Competitive Coding-I*

QuantEdge is a professional, full-stack financial research terminal and paper-trading simulator built exclusively for traditional equity markets (Indian NSE/BSE, US NASDAQ/NYSE, ETFs, and Market Indices). It integrates 13 fundamental computer-science algorithms into real financial analytics features, complete with live execution sandboxes and verified source traceability.

---

## 1. Product Capabilities

- **Multi-Market Equity Universe**: Real-time quotes, spreads, volumes, and OHLCV historical time series for Indian equities (RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK on NSE/BSE) and US equities (AAPL, MSFT, NVDA, AMZN, GOOGL, TSLA on NASDAQ/NYSE).
- **Interactive Candlestick Terminal**: SVG-based financial charting engine with multi-timeframe intervals (`1m`, `5m`, `15m`, `1h`, `1D`, `1W`), volume bars, and responsive crosshairs.
- **Stock Screener**: Multi-factor filtering across exchanges, sectors, price bounds, and percentage returns.
- **Paper Trading Engine**: Simulated execution engine with initial virtual capital of $10,000 USD (or INR equivalent), weighted average-cost basis accounting, order fees, market and limit orders, and realized/unrealized P&L calculations.
- **13 Algorithm Academic Implementations**: Implemented from scratch in `packages/algorithms/src/` with dedicated unit tests, execution traces, time/space complexity analysis, and direct source viewer.
- **Source Traceability & Registry**: 100% verified traceability from the UI down to exact source files, exported function signatures, unit test files, and calling services.

---

## 2. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons.
- **Backend**: Node.js, Express, TypeScript, REST API with modular services (`market-data`, `market-analytics`, `algorithm-execution`, `paper-trading`).
- **Database**: MongoDB Atlas via Mongoose with embedded in-memory persistence fallback for offline or zero-config execution.
- **Testing**: Vitest test runner (102 automated tests passing: 91 algorithm unit tests + 11 API integration tests).
- **Data Provider**: Twelve Data API with provider abstraction and calibrated high-fidelity simulation adapter.

---

## 3. Algorithm-to-Feature Mapping (STS3007 ACC-I)

| Algorithm ID | Algorithm Name | Source File | Exported Function | Application Feature | Calling Module |
|---|---|---|---|---|---|
| **ACC-01** | Booth's Algorithm | `packages/algorithms/src/booth.ts` | `boothMultiply` | Algorithm Lab &rarr; Fixed-Width Signed Arithmetic | `algorithm-execution.service.ts` |
| **ACC-02** | Euclid's Algorithm | `packages/algorithms/src/euclid.ts` | `gcd` | Analytics &rarr; Sampling Interval Analysis | `market-analytics.service.ts` |
| **ACC-03** | Karatsuba Algorithm | `packages/algorithms/src/karatsuba.ts` | `karatsubaMultiply` | Algorithm Lab &rarr; Large Integer Benchmark | `algorithm-execution.service.ts` |
| **ACC-04** | Longest 1s After Bit Flip | `packages/algorithms/src/longestOnesAfterFlip.ts` | `longestOnesAfterFlip` | Algorithm Lab &rarr; Binary Signal Tolerance | `algorithm-execution.service.ts` |
| **ACC-05** | Swap Nibbles in a Byte | `packages/algorithms/src/swapNibbles.ts` | `swapNibbles` | Algorithm Lab &rarr; Binary Encoding | `algorithm-execution.service.ts` |
| **ACC-06** | Block Swap Algorithm | `packages/algorithms/src/blockSwap.ts` | `rotateLeftBlockSwap` | Analytics &rarr; Rolling Sample Window | `market-analytics.service.ts` |
| **ACC-07** | Max Product Subarray | `packages/algorithms/src/maxProductSubarray.ts` | `maxProductSubarray` | Stock Analytics &rarr; Best Compounded-Return Window | `market-analytics.service.ts` |
| **ACC-08** | Max Hourglass Sum | `packages/algorithms/src/maxHourglassSum.ts` | `maxHourglassSum` | Market Analytics &rarr; Performance Heatmap | `market-analytics.service.ts` |
| **ACC-09** | Max Equilibrium Sum | `packages/algorithms/src/maxEquilibriumSum.ts` | `maxEquilibriumSum` | Portfolio Analytics &rarr; Contribution Balance | `market-analytics.service.ts` |
| **ACC-10** | Leaders in an Array | `packages/algorithms/src/leadersInArray.ts` | `findLeaders` | Stock Detail &rarr; Historical Price Leaders | `market-analytics.service.ts` |
| **ACC-11** | Majority Element | `packages/algorithms/src/majorityElement.ts` | `findMajorityElement` | Market Analytics &rarr; Market Breadth | `market-analytics.service.ts` |
| **ACC-12** | Lexicographical Palindrome | `packages/algorithms/src/lexicographicPalindrome.ts` | `lexicographicallyFirstPalindrome` | Algorithm Lab &rarr; Symmetric Reference Generator | `algorithm-execution.service.ts` |
| **ACC-13** | Natural Sort Order | `packages/algorithms/src/naturalSort.ts` | `naturalSort` | Markets & Watchlists &rarr; Natural Identifiers Sort | `market-analytics.service.ts` |

---

## 4. Installation & Setup

### Prerequisites
- Node.js 18+ (tested on Node v24.12.0)
- npm 9+ (tested on npm 11.6.2)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/quantedge.git
cd STS_QuantEdge
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key configuration items:
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=
TWELVE_DATA_API_KEY=
MARKET_DATA_PROVIDER=twelve-data
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```
> **Note**: Both `MONGODB_URI` and `TWELVE_DATA_API_KEY` are optional. If omitted, QuantEdge automatically operates using its built-in in-memory persistent store and high-fidelity market simulation engine with explicit `DEMO` provenance.

---

## 5. Running the Application

### Start Development Server (Full-Stack Monorepo)
```bash
# Terminal 1: Start Backend API (Port 4000)
npm run dev:api

# Terminal 2: Start Frontend Web App (Port 3000)
npm run dev:web
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Production Build
```bash
npm run build
```

---

## 6. Running Automated Tests

QuantEdge includes a comprehensive test suite executed with Vitest:

```bash
# Run all 91 algorithm unit tests
npm run test:algorithms

# Run all 11 API integration tests
npm run test:api

# Run entire test suite across all packages
npm test
```

Test Summary:
- **Algorithms Unit Tests**: 14 test files, 91 tests passing (100% pass rate).
- **API Integration Tests**: 1 test file, 11 tests passing (100% pass rate).
- **Total**: 102 automated tests verified.

---

## 7. Data Provenance & Market Limitations

- **Traditional Markets Only**: QuantEdge is strictly focused on traditional equity securities (NSE, BSE, NASDAQ, NYSE, ETFs, and Indices). Cryptocurrency assets and APIs are completely excluded.
- **Provenance Transparency**: All price quotes and historical candles display an explicit provenance label:
  - `LIVE`: Live market feed from connected provider.
  - `DELAYED`: Standard delayed exchange feed (e.g. 15-minute delay).
  - `STALE`: Cached data beyond normal update threshold.
  - `OFFLINE`: Provider network unavailability.
  - `DEMO`: Simulated calibrated financial data.
- **Paper Trading Limitations**: Simulated paper orders execute using observable market quotes and simulated fill rules. A simulated fill does not guarantee that execution would have occurred on a real exchange.

---

## 8. Documentation Index

- [docs/ALGORITHM_MAPPING.md](file:///c:/Users/harig/OneDrive/Desktop/STS_QuantEdge/docs/ALGORITHM_MAPPING.md) — Comprehensive algorithm traceability matrix and theoretical complexity claims.
- [docs/ARCHITECTURE.md](file:///c:/Users/harig/OneDrive/Desktop/STS_QuantEdge/docs/ARCHITECTURE.md) — System architecture, provider adapters, paper trading engine, and database persistence.
- [docs/API.md](file:///c:/Users/harig/OneDrive/Desktop/STS_QuantEdge/docs/API.md) — Complete REST API reference, request/response schemas, and endpoints.
