'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Clock,
  ShieldAlert,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { api } from '@/lib/api';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New simulated order form state
  const [symbol, setSymbol] = useState('AAPL');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState<number>(180);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [pfData, ordData] = await Promise.all([
        api.getPortfolio(),
        api.getOrders()
      ]);
      setPortfolio(pfData);
      setOrders(ordData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const ord = await api.placeOrder({
        symbol: symbol.trim().toUpperCase(),
        side,
        orderType,
        quantity: Number(quantity),
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
        idempotencyKey: `ord-client-${Date.now()}`
      });

      setFormMsg({
        type: 'success',
        text: `Simulated order ${ord.status}! ${ord.side} ${ord.quantity} ${ord.symbol} @ $${ord.executionPrice.toFixed(2)} (Fees: $${ord.fees.toFixed(2)})`
      });

      await loadData();
    } catch (err: any) {
      setFormMsg({
        type: 'error',
        text: err.message || 'Order failed.'
      });
    }
  };

  const handleResetPortfolio = async () => {
    if (!confirm('Are you sure you want to reset your virtual paper trading account to $10,000.00?')) return;
    try {
      await api.resetPortfolio(10000.0, 'USD');
      await loadData();
      setFormMsg({ type: 'success', text: 'Virtual portfolio reset to $10,000.00 starting cash.' });
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>Paper Trading & Portfolio Valuation Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate equity purchases and sales in real market conditions with weighted average-cost basis and P&L tracking.
          </p>
        </div>

        <button
          onClick={handleResetPortfolio}
          className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs font-mono transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Virtual Capital ($10,000)</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <span className="text-xs text-slate-400 font-medium">Total Net Liquidation Value</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${portfolio?.totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '10,000.00'}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Starting Capital: ${portfolio?.startingCapital?.toFixed(2) || '10,000.00'}</span>
        </div>

        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <span className="text-xs text-slate-400 font-medium">Virtual Cash Available</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            ${portfolio?.cashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '10,000.00'}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Unallocated Liquid Buying Power</span>
        </div>

        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <span className="text-xs text-slate-400 font-medium">Unrealized Profit & Loss</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              (portfolio?.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {(portfolio?.unrealizedPnL || 0) >= 0 ? '+' : ''}$
            {portfolio?.unrealizedPnL?.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Open Positions: {portfolio?.positions?.length || 0}</span>
        </div>

        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <span className="text-xs text-slate-400 font-medium">Realized Profit & Loss</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              (portfolio?.realizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {(portfolio?.realizedPnL || 0) >= 0 ? '+' : ''}$
            {portfolio?.realizedPnL?.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Net Proceeds After Fees</span>
        </div>
      </div>

      {/* Grid: Order Entry Form (Left 5 cols) | Open Holdings (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Entry Form */}
        <div className="lg:col-span-5 bg-[#0b101d] border border-[#1e293b] rounded-lg p-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1e293b] pb-3 mb-4">
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Place Simulated Paper Order</span>
          </h3>

          <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs font-mono">
            {/* Side Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#0f172a] rounded border border-[#1e293b]">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-1.5 rounded font-bold transition-colors ${
                  side === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                BUY SHARES
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-1.5 rounded font-bold transition-colors ${
                  side === 'SELL' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                SELL SHARES
              </button>
            </div>

            {/* Symbol Input */}
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Ticker Symbol</label>
              <input
                type="text"
                placeholder="e.g. AAPL, RELIANCE, TCS"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
            </div>

            {/* Order Type & Quantity */}
            <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Quantity</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Limit Price */}
            {orderType === 'LIMIT' && (
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Limit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-2.5 rounded font-bold text-white transition-colors shadow-sm ${
                side === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Submit Simulated {side} Order
            </button>

            {formMsg && (
              <div
                className={`p-3 rounded text-[11px] font-sans ${
                  formMsg.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950/80 text-red-300 border border-red-800'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <div className="text-[10px] text-slate-500 font-sans border-t border-[#1e293b] pt-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Simulation Only: No actual brokerage orders or capital transfers take place.</span>
            </div>
          </form>
        </div>

        {/* Current Holdings Table */}
        <div className="lg:col-span-7 bg-[#0b101d] border border-[#1e293b] rounded-lg p-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1e293b] pb-3 mb-4">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <span>Open Positions & Average-Cost Valuation</span>
          </h3>

          {(!portfolio?.positions || portfolio.positions.length === 0) ? (
            <div className="text-center py-12 text-xs text-slate-500 font-mono">
              No open stock positions currently held. Submit a buy order to open a simulated position.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] border-b border-[#1e293b] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">TICKER</th>
                    <th className="py-2.5 px-3 text-right">QTY</th>
                    <th className="py-2.5 px-3 text-right">AVG ENTRY</th>
                    <th className="py-2.5 px-3 text-right">CURRENT</th>
                    <th className="py-2.5 px-3 text-right">TOTAL COST</th>
                    <th className="py-2.5 px-3 text-right">MARKET VALUE</th>
                    <th className="py-2.5 px-3 text-right">UNREALIZED P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {portfolio.positions.map((pos: any) => {
                    const isPositive = pos.unrealizedPnL >= 0;
                    return (
                      <tr key={pos.symbol} className="hover:bg-slate-900/60">
                        <td className="py-2.5 px-3 font-bold text-cyan-400">
                          <Link href={`/stocks/${pos.symbol}`} className="hover:underline">
                            {pos.symbol}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-200">{pos.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">${pos.averagePrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-white font-bold">${pos.currentPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">${pos.totalCost.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-200 font-bold">${pos.currentValue.toFixed(2)}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} ({isPositive ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(1)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Complete Order History */}
      <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1e293b] pb-3 mb-4">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Paper Order History & Audit Trail</span>
        </h3>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No simulated orders recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#0f172a] border-b border-[#1e293b] text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">ORDER ID</th>
                  <th className="py-2.5 px-3">SYMBOL</th>
                  <th className="py-2.5 px-3">SIDE</th>
                  <th className="py-2.5 px-3">TYPE</th>
                  <th className="py-2.5 px-3 text-right">QUANTITY</th>
                  <th className="py-2.5 px-3 text-right">EXEC PRICE</th>
                  <th className="py-2.5 px-3 text-right">FEES</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-3 text-slate-400">{o.id}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400">{o.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        o.side === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {o.side}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{o.orderType}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{o.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-bold">${o.executionPrice?.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">${o.fees?.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        o.status === 'FILLED' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
