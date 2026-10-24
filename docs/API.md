# QuantEdge REST API Specification

All QuantEdge endpoints return standardized JSON responses formatted as:
```json
{
  "success": true,
  "data": { ... }
}
```
Or upon error:
```json
{
  "success": false,
  "error": "Error description message"
}
```

---

### 1. Market Data Endpoints

#### `GET /api/markets/search`
Search for traditional equity symbols across Indian and US exchanges.
- **Query Parameters**:
  - `q` (string, required): Ticker prefix, symbol, or company name.
- **Example Response**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "symbol": "AAPL",
      "companyName": "Apple Inc.",
      "exchange": "NASDAQ",
      "instrumentType": "EQUITY",
      "currency": "USD",
      "providerIdentifier": "AAPL:NASDAQ"
    }
  ]
}
```

#### `GET /api/markets/quote`
Retrieve observable pricing, spread, volume, and data provenance.
- **Query Parameters**:
  - `symbol` (string, required): Stock ticker symbol.
  - `exchange` (string, optional): Specific exchange (`NSE`, `BSE`, `NASDAQ`, `NYSE`).
- **Example Response**:
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "exchange": "NASDAQ",
    "price": 189.5,
    "open": 187.98,
    "high": 191.02,
    "low": 187.98,
    "previousClose": 187.98,
    "change": 1.52,
    "changePercent": 0.81,
    "volume": 4512300,
    "currency": "USD",
    "timestamp": "2026-10-23T20:00:00.000Z",
    "provenance": "LIVE",
    "provider": "Twelve Data Global Markets"
  }
}
```

#### `GET /api/markets/candles`
Fetch historical OHLCV candlestick time series.
- **Query Parameters**:
  - `symbol` (string, required): Ticker.
  - `interval` (string, optional): `1min`, `5min`, `15min`, `1h`, `1day`, `1week` (default: `1day`).
  - `outputsize` (number, optional): Number of candles (default: `60`).
  - `exchange` (string, optional): Market exchange.

#### `GET /api/markets/fundamentals`
Fetch valuation ratios, market capitalization, 52-week ranges, and profitability metrics.

#### `GET /api/markets/screener`
Filter stocks by exchange, sector, min/max price constraints.
- **Query Parameters**:
  - `exchange`: `NSE`, `BSE`, `NASDAQ`, `NYSE`, `INDEX`
  - `sector`: Sector substring (e.g. `technology`, `financial`)
  - `minPrice`: Minimum numerical price
  - `maxPrice`: Maximum numerical price

---

### 2. Paper Trading & Portfolio Endpoints

#### `GET /api/portfolio`
Retrieve portfolio net liquidation valuation, cash balance, positions, and unrealized/realized P&L.
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "portfolio-default",
    "baseCurrency": "USD",
    "startingCapital": 10000.0,
    "cashBalance": 9052.5,
    "realizedPnL": 0.0,
    "unrealizedPnL": 15.0,
    "totalPortfolioValue": 10015.0,
    "positions": [
      {
        "symbol": "AAPL",
        "exchange": "NASDAQ",
        "quantity": 5,
        "averagePrice": 189.5,
        "currentPrice": 192.5,
        "totalCost": 947.5,
        "currentValue": 962.5,
        "unrealizedPnL": 15.0,
        "unrealizedPnLPercent": 1.58
      }
    ]
  }
}
```

#### `POST /api/paper/orders`
Place a simulated market or limit order with fee deductions and average-cost basis updates.
- **Request Body**:
```json
{
  "symbol": "AAPL",
  "exchange": "NASDAQ",
  "side": "BUY",
  "orderType": "MARKET",
  "quantity": 10,
  "idempotencyKey": "req-unique-token-123"
}
```

#### `GET /api/paper/orders`
Retrieve simulated order book and execution audit trail.

#### `POST /api/portfolio/reset`
Reset virtual funds to initial starting capital ($10,000 USD).

---

### 3. Quantitative Analytics Endpoints

#### `GET /api/analytics/leaders/:symbol`
Applies **ACC-10: Leaders in an Array** to historical closing prices.

#### `GET /api/analytics/return-window/:symbol`
Applies **ACC-07: Maximum Product Subarray** over daily return multipliers $(1 + r)$.

#### `GET /api/analytics/breadth`
Applies **ACC-11: Boyer-Moore Majority Element** to market component session directions.

#### `GET /api/analytics/heatmap`
Applies **ACC-08: Maximum Sum of Hourglass in Matrix** across a sector performance grid.

#### `GET /api/analytics/intervals?a=15&b=30`
Applies **ACC-02: Euclid's GCD** to compute the base sampling unit between two intervals.

#### `GET /api/analytics/rolling-buffer/:symbol?rotation=2`
Applies **ACC-06: Block Swap Algorithm** to rotate a rolling historical observation buffer in-place.

#### `GET /api/analytics/contribution-balance`
Applies **ACC-09: Maximum Equilibrium Sum** to analyze portfolio contribution points.

---

### 4. Algorithm Lab & Registry Endpoints

#### `GET /api/algorithms/registry`
Returns metadata, complexity claims, and function pointers for all 13 required algorithms.

#### `GET /api/algorithms/:identifier`
Retrieve single algorithm metadata and input/output contracts by ID (e.g. `ACC-01`) or slug (e.g. `booth`).

#### `POST /api/algorithms/:identifier/run`
Execute the real algorithm implementation with user-supplied arguments.
- **Request Body**:
```json
{
  "a": 7,
  "b": -3,
  "bitWidth": 8
}
```

#### `GET /api/algorithms/:identifier/source`
Opens the verified source file directly from the filesystem under strict security allowlisting.
- **Query Parameters**:
  - `path` (string, optional): Specific allowlisted source or test file.
- **Returns**: Code lines, line numbers, exported function signature, callers, and test file links.

---

### 5. Settings Endpoint

#### `GET /api/settings`
Returns provider health, database persistence mode, rate limit quotas, and default currency settings without leaking API keys.
