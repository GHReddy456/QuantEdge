'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Filter,
  Search,
  RotateCcw,
  BookmarkCheck,
  Check,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ScreenerPage() {
  const [exchange, setExchange] = useState('ALL');
  const [sector, setSector] = useState('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchScreenedStocks = async () => {
    setLoading(true);
    try {
      const data = await api.getScreener({
        exchange: exchange === 'ALL' ? undefined : exchange,
        sector: sector === 'ALL' ? undefined : sector,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
      });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenedStocks();
  }, [exchange, sector]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScreenedStocks();
  };

  const handleClear = () => {
    setExchange('ALL');
    setSector('ALL');
    setMinPrice('');
    setMaxPrice('');
  };

  const handleSaveWatchlist = async () => {
    if (results.length === 0) return;
    try {
      const name = `Screener (${exchange !== 'ALL' ? exchange : 'All'} - ${new Date().toLocaleTimeString()})`;
      const symbols = results.map((r) => r.symbol);
      await api.createWatchlist(name, 'Saved from Stock Screener filters', symbols);
      setSaveStatus('Saved as new Watchlist!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Failed to save watchlist.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            <span>Quantitative Stock Screener</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter multi-market equity universes by exchange, valuation, sector, and price constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveWatchlist}
            disabled={results.length === 0}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Save Results to Watchlist</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded font-mono">
          {saveStatus}
        </div>
      )}

      {/* Filter Parameters Form */}
      <form onSubmit={handleApply} className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Exchange */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Exchange</label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Exchanges</option>
              <option value="NSE">NSE (India)</option>
              <option value="BSE">BSE (India)</option>
              <option value="NASDAQ">NASDAQ (US)</option>
              <option value="NYSE">NYSE (US)</option>
              <option value="INDEX">Indices</option>
            </select>
          </div>

          {/* Sector */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="technology">Technology & IT</option>
              <option value="financial">Financial Services</option>
              <option value="consumer">Consumer Discretionary</option>
              <option value="energy">Energy & Conglomerate</option>
              <option value="broad market">Broad Market ETFs</option>
            </select>
          </div>

          {/* Min Price */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Min Price</label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Max Price</label>
            <input
              type="number"
              placeholder="e.g. 3000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
          <span className="text-[11px] text-slate-500 font-mono">
            Matched: <strong className="text-cyan-400">{results.length}</strong> instruments
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 bg-[#1e293b] hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-1.5 rounded text-xs transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </form>

      {/* Results Table */}
      <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#1e293b] text-slate-400 text-[11px]">
                <th className="py-3 px-4">TICKER</th>
                <th className="py-3 px-4">COMPANY NAME</th>
                <th className="py-3 px-4">EXCHANGE</th>
                <th className="py-3 px-4">SECTOR</th>
                <th className="py-3 px-4 text-right">LATEST PRICE</th>
                <th className="py-3 px-4 text-right">CHANGE %</th>
                <th className="py-3 px-4 text-right">VOLUME</th>
                <th className="py-3 px-4 text-center">ANALYZE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    Screening instruments...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No instruments matched the specified filter criteria.
                  </td>
                </tr>
              ) : (
                results.map((item) => {
                  const isPositive = (item.changePercent || 0) >= 0;
                  return (
                    <tr key={`${item.symbol}-${item.exchange}`} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-cyan-400">
                        <Link href={`/stocks/${item.symbol}`} className="hover:underline">
                          {item.symbol}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{item.companyName}</td>
                      <td className="py-3 px-4">
                        <span className="bg-[#111c33] text-blue-300 border border-blue-900 px-1.5 py-0.5 rounded text-[10px]">
                          {item.exchange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">{item.sector}</td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {item.currency === 'INR' ? '₹' : '$'}
                        {item.price ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {item.changePercent !== null ? (
                          <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                            {isPositive ? '+' : ''}
                            {item.changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {item.volume ? item.volume.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/stocks/${item.symbol}`}
                          className="bg-[#1e293b] hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Disclaimer Alert */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-3.5 rounded-lg flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          Academic Screener Notice: Screened metrics and historical observations are educational indicators and do not constitute investment advice or guarantee future returns.
        </span>
      </div>
    </div>
  );
}
