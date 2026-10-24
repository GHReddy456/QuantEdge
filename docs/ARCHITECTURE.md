# QuantEdge Architecture Documentation
## Multi-Market Stock Analysis, Quantitative Research & Paper Trading Platform

---

### 1. Architectural Overview

QuantEdge is architected as an academic full-stack financial terminal designed for the **STS3007 Advanced Competitive Coding-I** course. It provides multi-market equity analysis, paper execution simulation, and an integrated algorithm research lab without cryptocurrency entanglement.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QUANTEDGE PLATFORM                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                 WEB FRONTEND (Next.js App Router)             │    │
│   │  • Dark Financial Terminal UI       • Dynamic Routing         │    │
│   │  • SVG Candlestick Charts           • Source Code Inspector   │    │
│   │  • Algorithm Execution Sandboxes    • Watchlist & Portfolio   │    │
│   └───────────────────────────────▲───────────────────────────────┘    │
│                                   │ HTTP / JSON REST API               │
│                                   ▼                                    │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                 API SERVER (Express + TypeScript)             │    │
│   │  ┌──────────────────────┐ ┌─────────────────────────────────┐ │    │
│   │  │ Market Data Service  │ │ Market Analytics Service        │ │    │
│   │  │ • Twelve Data Client │ │ • ACC-02, ACC-06, ACC-07, ACC-08│ │    │
│   │  │ • Calibrated Sim     │ │ • ACC-09, ACC-10, ACC-11, ACC-13│ │    │
│   │  │ • Rate Limit Monitor │ └─────────────────────────────────┘ │    │
│   │  └──────────────────────┘ ┌─────────────────────────────────┐ │    │
│   │  ┌──────────────────────┐ │ Algorithm Execution Service     │ │    │
│   │  │ Paper Trading Engine │ │ • File Allowlist Source Reader  │ │    │
│   │  │ • Average-Cost Basis │ │ • Dynamic Runner Dispatcher     │ │    │
│   │  │ • Decimal-Safe P&L   │ │ • Microsecond Audit Logs        │ │    │
│   │  └──────────────────────┘ └─────────────────────────────────┘ │    │
│   └───────────────────────▲───────────────────────▲───────────────┘    │
│                           │                       │                    │
│                           ▼                       ▼                    │
│   ┌───────────────────────────────┐   ┌───────────────────────────┐    │
│   │   DATABASE PERSISTENCE LAYER  │   │  @quantedge/algorithms    │    │
│   │   • MongoDB Atlas (Mongoose)  │   │  • 13 Core Implementations│    │
│   │   • Embedded In-Memory Store  │   │  • 91 Unit Tests (Vitest) │    │
│   └───────────────────────────────┘   └───────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Monorepo Organization

```
quantedge/
├── apps/
│   ├── web/                    # Next.js 14 App Router (Tailwind CSS, Lucide-react)
│   │   └── src/
│   │       ├── app/            # 11 distinct application routes
│   │       ├── components/     # CandlestickChart, SourceCodeViewer, ExecutionTrace, etc.
│   │       └── lib/            # api.ts (REST client utility)
│   └── api/                    # Node.js + Express TypeScript backend
│       └── src/
│           ├── routes/         # Markets, Watchlists, Portfolio, Paper, Analytics, Algorithms, Settings
│           ├── services/       # Market Data, Analytics, Algorithm Execution, Paper Trading
│           ├── models/         # TypeScript entities, schemas, and DataStore
│           └── db/             # Mongoose connection with embedded fallback
├── packages/
│   └── algorithms/             # 13 pure algorithmic implementations, registry, and 91 unit tests
├── docs/                       # ALGORITHM_MAPPING.md, ARCHITECTURE.md, API.md
├── .env.example                # Configuration templates
└── README.md                   # Documentation, setup, and testing commands
```

---

### 3. Market Data Architecture & Provider Abstraction

The platform implements an explicit `IMarketDataProvider` interface to normalize external equity data sources:

1. **Twelve Data Primary Provider** (`TwelveDataProvider`):
   - Configured via `TWELVE_DATA_API_KEY`.
   - Accesses `/symbol_search`, `/quote`, `/time_series`, `/profile`, `/income_statement`.
   - Normalizes exchange codes (`NSE`, `BSE`, `NASDAQ`, `NYSE`) and currencies (`INR`, `USD`).
   - Rate limit aware (monitors quota and applies exponential backoff).
2. **High-Fidelity Calibrated Fallback** (`DemoMarketDataProvider`):
   - Simulates continuous geometric Brownian motion price action, volumes, and financial fundamentals for top Indian and US equities.
   - Guaranteed deterministic availability when API keys are unconfigured or external provider limits are reached.
3. **Data Provenance System**:
   - Every returned quote and candle carries an explicit provenance status:
     - `LIVE`: Confirmed active market session from provider.
     - `DELAYED`: Exchange delayed feed or closed session.
     - `STALE`: Cached data past normal refresh window.
     - `OFFLINE`: Provider network outage.
     - `DEMO`: Explicitly simulated dataset.

---

### 4. Paper-Trading Simulation Engine

The simulated paper execution engine (`apps/api/src/services/paper-trading.service.ts`) features:

- **Initial Virtual Capital**: $10,000 USD (or 10,00,000 INR).
- **Weighted Average-Cost Accounting**:
  - When purchasing additional shares of an existing position:
    $$\text{Average Price}_{\text{new}} = \frac{(\text{Qty}_{\text{prev}} \times \text{Avg}_{\text{prev}}) + (\text{Qty}_{\text{new}} \times \text{Price}_{\text{exec}})}{\text{Qty}_{\text{prev}} + \text{Qty}_{\text{new}}}$$
  - When selling shares:
    $$\text{Realized P\&L} = (\text{Price}_{\text{exec}} - \text{Average Price}) \times \text{Qty}_{\text{sold}} - \text{Fees}$$
- **Decimal Safety**: Fixed four-decimal arithmetic prevents floating-point drift.
- **Order Types**:
  - `MARKET`: Instant simulated fill against the latest observable quote price.
  - `LIMIT`: Evaluates limit price against bid/ask; fills conditionally or remains `PENDING`.
- **Validation Rules**:
  - Rejects orders where total cost exceeds liquid virtual cash.
  - Rejects sell orders where requested quantity exceeds held shares.
  - Idempotent request keys prevent double-execution.

---

### 5. Algorithm Engine & Source Traceability

The algorithm system is designed for complete academic rigor:

- **Strict Allowlisting**: Source-code reader checks relative paths against an immutable set of permitted algorithm files (`packages/algorithms/src/*.ts`), rejecting traversal (`../`), credential files, or server secrets.
- **Direct Filesystem Inspection**: The source viewer reads real lines from disk, displaying genuine line numbers, signatures, unit test paths, and actual calling services.
- **Interactive Execution**: Every algorithm can be executed with arbitrary user input, recording execution latency in milliseconds and generating a step-by-step trace matrix.

---

### 6. Database Persistence Layer

- **MongoDB Atlas Integration**: Connects via Mongoose when `MONGODB_URI` is provided in environment variables.
- **Embedded In-Memory Fallback**: When `MONGODB_URI` is absent or network connectivity is restricted, the platform initializes an in-memory data store with identical data entities, ensuring immediate full functionality without mandatory database setup.
