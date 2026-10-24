'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  DollarSign,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { CandlestickChart } from '@/components/CandlestickChart';

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();
  const [quote, setQuote] = useState<any>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [fundamentals, setFundamentals] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [leaders, setLeaders] = useState<any>(null);
  const [returnWindow, setReturnWindow] = useState<any>(null);
  const [interval, setInterval] = useState('1day');
  const [loading, setLoading] = useState(true);

  // Paper order form state
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState<number | undefined>(undefined);
  const [orderStatusMsg, setOrderStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadStockDetails() {
      setLoading(true);
      try {
        const [qData, cData, fData, finData, leadData, retData] = await Promise.all([
          api.getQuote(symbol).catch(() => null),
          api.getCandles(symbol, interval).catch(() => []),
          api.getFundamentals(symbol).catch(() => null),
          api.getFinancials(symbol).catch(() => null),
          api.getPriceLeaders(symbol).catch(() => null),
          api.getReturnWindow(symbol).catch(() => null)
        ]);

        setQuote(qData);
        setCandles(cData);
        setFundamentals(fData);
        setFinancials(finData);
        setLeaders(leadData);
        setReturnWindow(retData);
        if (qData?.price && !limitPrice) {
          setLimitPrice(qData.price);
        }
      } finally {
        setLoading(false);
      }
    }

    loadStockDetails();
  }, [symbol, interval]);

  const handleIntervalChange = async (newInterval: string) => {
    setInterval(newInterval);
    try {
      const cData = await api.getCandles(symbol, newInterval);
      setCandles(cData);
    } catch {
      // ignore
    }
  };

  const handleExecutePaperOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatusMsg(null);
    try {
      const order = await api.placeOrder({
        symbol,
        exchange: quote?.exchange,
        side: orderSide,
        orderType,
        quantity: Number(quantity),
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined
      });

      setOrderStatusMsg({
        type: 'success',
        text: `Order executed! ${order.side} ${order.quantity} ${order.symbol} @ $${order.executionPrice.toFixed(2)} (Fees: $${order.fees.toFixed(2)})`
      });
    } catch (err: any) {
      setOrderStatusMsg({
        type: 'error',
        text: err.message || 'Order failed.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-500 font-mono text-xs">
        Loading real-time financial market analytics for {symbol}...
      </div>
    );
  }

  const isPositive = (quote?.change || 0) >= 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stock Header Banner */}
      <div className="bg-[#0b101d] border border-[#1e293b] p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">{symbol}</h1>
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
              {quote?.exchange || 'EQUITY'}
            </span>
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {quote?.currency || 'USD'}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Provider: {quote?.provider || 'QuantEdge Engine'} ({quote?.provenance || 'DEMO'})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">{fundamentals?.companyName || symbol}</p>
        </div>

        {/* Big Live Price */}
        <div className="text-right font-mono">
          <div className="text-3xl font-extrabold text-white">
            {quote?.currency === 'INR' ? '₹' : '$'}
            {quote?.price ? quote.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
          </div>
          <div className={`text-xs font-bold flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isPositive ? '+' : ''}
              {quote?.change ? quote.change.toFixed(2) : '0.00'} ({isPositive ? '+' : ''}
              {quote?.changePercent ? quote.changePercent.toFixed(2) : '0.00'}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Candlestick Chart (Left 8 cols) | Paper Trading Box (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Candlestick Chart */}
          <CandlestickChart
            candles={candles}
            symbol={symbol}
            currency={quote?.currency || 'USD'}
            activeInterval={interval}
            onIntervalChange={handleIntervalChange}
            height={380}
          />

          {/* Algorithm-Driven Historical Analytics */}
          <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Algorithm-Driven Quantitative Analysis</span>
              </h3>
              <Link href="/analytics" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono">
                <span>Full Analytics Studio</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* ACC-10: Historical Price Leaders */}
              <div className="bg-[#0f172a] p-3.5 rounded border border-[#1e293b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-cyan-400">ACC-10: Price Leaders</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {leaders?.leaders?.length || 0} Milestones
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mb-3">
                  Historical closing highs unbroken by subsequent sessions in the observation window.
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {leaders?.leaders?.map((l: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-[#11192d] px-2 py-1 rounded text-[11px]">
                      <span className="text-slate-400">{l.timestamp?.split('T')[0] || `Index ${l.index}`}</span>
                      <span className="text-emerald-400 font-bold">${l.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACC-07: Best Compounded-Return Window */}
              <div className="bg-[#0f172a] p-3.5 rounded border border-[#1e293b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-cyan-400">ACC-07: Return Window</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    Max Product Subarray
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mb-3">
                  Contiguous historical window yielding maximum cumulative compounded growth.
                </p>
                {returnWindow ? (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-[#1e293b] pb-1">
                      <span className="text-slate-400">Compounded Return:</span>
                      <span className="text-emerald-400 font-bold">+{returnWindow.compoundedReturnPercent}%</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1e293b] pb-1">
                      <span className="text-slate-400">Multiplier Product:</span>
                      <span className="text-slate-200">{returnWindow.maxCompoundedMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Holding Days:</span>
                      <span className="text-slate-200">{returnWindow.windowSize} Sessions</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 py-4 text-center">Calculating return window...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Trading Form & Fundamentals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Paper Trading Execution Box */}
          <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1e293b] pb-3 mb-4">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Simulated Paper Order</span>
            </h3>

            <form onSubmit={handleExecutePaperOrder} className="space-y-4 text-xs font-mono">
              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0f172a] rounded border border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-1.5 rounded font-bold transition-colors ${
                    orderSide === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-1.5 rounded font-bold transition-colors ${
                    orderSide === 'SELL'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Order Type */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="MARKET">Market Order</option>
                  <option value="LIMIT">Limit Order</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Quantity (Shares)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Limit Price (if limit order) */}
              {orderType === 'LIMIT' && (
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Limit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={limitPrice ?? ''}
                    onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                    className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Order Estimate */}
              <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Total:</span>
                  <span className="text-white font-bold">
                    ${((quote?.price || 0) * quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Simulated Fee (0.1%):</span>
                  <span className="text-slate-300">
                    ${Math.max((quote?.price || 0) * quantity * 0.001, 1.0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 rounded font-bold text-white transition-colors shadow-sm ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                Submit Simulated {orderSide} Order
              </button>

              {/* Status Message */}
              {orderStatusMsg && (
                <div
                  className={`p-2.5 rounded text-[11px] font-sans ${
                    orderStatusMsg.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950/80 text-red-300 border border-red-800'
                  }`}
                >
                  {orderStatusMsg.text}
                </div>
              )}
            </form>
          </div>

          {/* Company Fundamentals Card */}
          <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Company Fundamentals</span>
            </h3>

            {fundamentals ? (
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-[#1e293b] pb-1">
                  <span className="text-slate-400">Sector:</span>
                  <span className="text-slate-200">{fundamentals.sector}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-1">
                  <span className="text-slate-400">Industry:</span>
                  <span className="text-slate-200">{fundamentals.industry}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-1">
                  <span className="text-slate-400">Market Cap:</span>
                  <span className="text-slate-200">${(fundamentals.marketCap / 1000).toFixed(1)}B</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-1">
                  <span className="text-slate-400">P/E Ratio:</span>
                  <span className="text-slate-200">{fundamentals.peRatio?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-1">
                  <span className="text-slate-400">EPS:</span>
                  <span className="text-slate-200">${fundamentals.eps?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-1">
                  <span className="text-slate-400">Dividend Yield:</span>
                  <span className="text-slate-200">{fundamentals.dividendYield ? `${fundamentals.dividendYield}%` : '0%'}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-1">
                  <span className="text-slate-400">52W Range:</span>
                  <span className="text-slate-200">
                    ${fundamentals.fiftyTwoWeekLow?.toFixed(2)} - ${fundamentals.fiftyTwoWeekHigh?.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-4">No fundamentals available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
