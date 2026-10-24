'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  DollarSign,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  BookmarkCheck,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [gainers, setGainers] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const [providerStatus, setProviderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [pfData, ordData, wlData, screenerData, statusData] = await Promise.all([
          api.getPortfolio().catch(() => null),
          api.getOrders().catch(() => []),
          api.getWatchlists().catch(() => []),
          api.getScreener().catch(() => []),
          api.getSettings().catch(() => null)
        ]);

        setPortfolio(pfData);
        setOrders(ordData.slice(0, 5));
        setWatchlists(wlData.slice(0, 2));
        setProviderStatus(statusData?.marketDataProvider);

        // Sort gainers & losers
        if (screenerData && screenerData.length > 0) {
          const validQuotes = screenerData.filter((s: any) => s.changePercent !== null);
          const sortedGainers = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);
          const sortedLosers = [...validQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4);
          setGainers(sortedGainers);
          setLosers(sortedLosers);
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Headline */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0d1627] to-[#0a1020] border border-[#1e293b] p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Market Intelligence Terminal</h1>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 font-mono px-2 py-0.5 rounded border border-cyan-800">
              {providerStatus?.status || 'DEMO'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time traditional equity research, quantitative algorithmic models, and paper execution engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portfolio"
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Simulate Order</span>
          </Link>
          <Link
            href="/algorithms"
            className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded transition-colors border border-slate-700"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Algorithm Lab</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row: Portfolio Capital, Cash, Realized PnL, Unrealized PnL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Portfolio Net Liquidation</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            ${portfolio?.totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '10,000.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
            <span>Base Currency: {portfolio?.baseCurrency || 'USD'}</span>
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Virtual Cash Balance</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            ${portfolio?.cashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '10,000.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Available for simulated purchase</div>
        </div>

        {/* Unrealized PnL */}
        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Unrealized P&L</span>
            {(portfolio?.unrealizedPnL || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              (portfolio?.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {(portfolio?.unrealizedPnL || 0) >= 0 ? '+' : ''}$
            {Math.abs(portfolio?.unrealizedPnL || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Open Positions: {portfolio?.positions?.length || 0}
          </div>
        </div>

        {/* Realized PnL */}
        <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Realized P&L</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              (portfolio?.realizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {(portfolio?.realizedPnL || 0) >= 0 ? '+' : ''}$
            {Math.abs(portfolio?.realizedPnL || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Closed trades net profit/loss</div>
        </div>
      </div>

      {/* Grid: Gainers & Losers | Watchlist Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Market Gainers & Losers */}
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Market Movers (Gainers & Losers)</span>
            </h3>
            <Link href="/markets" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gainers */}
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono block mb-2">TOP GAINERS</span>
              <div className="space-y-2">
                {gainers.map((stock) => (
                  <Link
                    key={stock.symbol}
                    href={`/stocks/${stock.symbol}`}
                    className="flex items-center justify-between p-2 rounded bg-[#0f172a] hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                  >
                    <div>
                      <span className="font-bold text-xs text-white font-mono block">{stock.symbol}</span>
                      <span className="text-[10px] text-slate-400">{stock.exchange}</span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-200 block">${stock.price?.toFixed(2)}</span>
                      <span className="text-emerald-400 text-[11px]">+{stock.changePercent?.toFixed(2)}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div>
              <span className="text-[11px] font-semibold text-red-400 font-mono block mb-2">TOP DECLINERS</span>
              <div className="space-y-2">
                {losers.map((stock) => (
                  <Link
                    key={stock.symbol}
                    href={`/stocks/${stock.symbol}`}
                    className="flex items-center justify-between p-2 rounded bg-[#0f172a] hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                  >
                    <div>
                      <span className="font-bold text-xs text-white font-mono block">{stock.symbol}</span>
                      <span className="text-[10px] text-slate-400">{stock.exchange}</span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-200 block">${stock.price?.toFixed(2)}</span>
                      <span className="text-red-400 text-[11px]">{stock.changePercent?.toFixed(2)}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist Summary */}
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-blue-400" />
              <span>Watchlist Highlights</span>
            </h3>
            <Link href="/watchlists" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>Manage Lists</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {watchlists.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-mono">No watchlists created yet.</div>
          ) : (
            <div className="space-y-4">
              {watchlists.map((wl) => (
                <div key={wl.id} className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white">{wl.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{wl.symbols.length} Symbols</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {wl.symbols.map((sym: string) => (
                      <Link
                        key={sym}
                        href={`/stocks/${sym}`}
                        className="text-xs font-mono bg-[#1e293b] hover:bg-cyan-950 hover:text-cyan-400 text-slate-300 px-2.5 py-1 rounded transition-colors"
                      >
                        {sym}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Activity Table */}
      <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Simulated Paper Orders</span>
          </h3>
          <Link href="/portfolio" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            <span>Order History</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No simulated orders executed yet. Visit the Paper Trading terminal to place orders.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-[#1e293b] text-[11px]">
                  <th className="pb-2">ORDER ID</th>
                  <th className="pb-2">SYMBOL</th>
                  <th className="pb-2">SIDE</th>
                  <th className="pb-2">TYPE</th>
                  <th className="pb-2">QUANTITY</th>
                  <th className="pb-2">EXEC PRICE</th>
                  <th className="pb-2">STATUS</th>
                  <th className="pb-2">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/50">
                    <td className="py-2.5 text-slate-400">{o.id}</td>
                    <td className="py-2.5 font-bold text-cyan-400">{o.symbol}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        o.side === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {o.side}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">{o.orderType}</td>
                    <td className="py-2.5 text-slate-200">{o.quantity}</td>
                    <td className="py-2.5 text-slate-200">${o.executionPrice?.toFixed(2)}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">{new Date(o.createdAt).toLocaleTimeString()}</td>
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
