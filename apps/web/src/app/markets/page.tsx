'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  BookmarkCheck,
  Check
} from 'lucide-react';
import { api } from '@/lib/api';
import { naturalSort } from '@quantedge/algorithms';

export default function MarketsPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortField, setSortField] = useState<'symbol' | 'price' | 'changePercent' | 'volume'>('symbol');
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const [screened, wlData] = await Promise.all([
          api.getScreener().catch(() => []),
          api.getWatchlists().catch(() => [])
        ]);

        setStocks(screened);
        setFilteredStocks(screened);
        setWatchlists(wlData);
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  useEffect(() => {
    let result = [...stocks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q) ||
          s.exchange.toLowerCase().includes(q)
      );
    }

    if (selectedExchange !== 'ALL') {
      result = result.filter((s) => s.exchange === selectedExchange);
    }

    if (selectedType !== 'ALL') {
      result = result.filter((s) => s.instrumentType === selectedType);
    }

    // Apply sorting
    if (sortField === 'symbol') {
      const sortedSymbols = naturalSort(result.map((s) => s.symbol)).sorted;
      const sortedMap = new Map(sortedSymbols.map((sym, idx) => [sym, idx]));
      result.sort((a, b) => {
        const idxA = sortedMap.get(a.symbol) ?? 0;
        const idxB = sortedMap.get(b.symbol) ?? 0;
        return sortAsc ? idxA - idxB : idxB - idxA;
      });
    } else {
      result.sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        return sortAsc ? valA - valB : valB - valA;
      });
    }

    setFilteredStocks(result);
  }, [searchQuery, selectedExchange, selectedType, sortField, sortAsc, stocks]);

  const handleToggleSort = (field: 'symbol' | 'price' | 'changePercent' | 'volume') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleAddToWatchlist = async (symbol: string) => {
    if (watchlists.length === 0) return;
    const targetWl = watchlists[0];
    try {
      await api.addInstrumentToWatchlist(targetWl.id, symbol);
      setAddedMap((prev) => ({ ...prev, [symbol]: true }));
      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [symbol]: false }));
      }, 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Market Overview & Live Equities Universe</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Indian equities (NSE/BSE), US equities (NASDAQ/NYSE), ETFs, and benchmark indices.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#0f172a] px-3 py-1.5 rounded border border-[#1e293b]">
          Total Instruments: <strong className="text-cyan-400">{filteredStocks.length}</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#1e293b] rounded text-xs text-white pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500/60 font-mono"
            />
          </div>

          {/* Exchange Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">Exchange:</span>
            {['ALL', 'NSE', 'BSE', 'NASDAQ', 'NYSE', 'INDEX'].map((ex) => (
              <button
                key={ex}
                onClick={() => setSelectedExchange(ex)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  selectedExchange === ex
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">Type:</span>
            {['ALL', 'EQUITY', 'ETF', 'INDEX'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  selectedType === t
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Table with Natural Sort Order */}
      <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#1e293b] text-slate-400 text-[11px]">
                <th
                  onClick={() => handleToggleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>SYMBOL (ACC-13 NATURAL SORT)</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th className="py-3 px-4">COMPANY NAME</th>
                <th className="py-3 px-4">EXCHANGE</th>
                <th className="py-3 px-4">SECTOR / ASSET</th>
                <th
                  onClick={() => handleToggleSort('price')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PRICE</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('changePercent')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CHANGE %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('volume')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>VOLUME</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    Loading market universe...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No matching instruments found.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const isPositive = (stock.changePercent || 0) >= 0;
                  const isAdded = addedMap[stock.symbol];

                  return (
                    <tr key={`${stock.symbol}-${stock.exchange}`} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold">
                        <Link
                          href={`/stocks/${stock.symbol}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5"
                        >
                          <span>{stock.symbol}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-normal">
                            {stock.currency}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{stock.companyName}</td>
                      <td className="py-3 px-4">
                        <span className="bg-[#111c33] text-blue-300 border border-blue-900 px-1.5 py-0.5 rounded text-[10px]">
                          {stock.exchange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-[11px] truncate max-w-xs">
                        {stock.sector || stock.instrumentType}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {stock.currency === 'INR' ? '₹' : '$'}
                        {stock.price ? stock.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {stock.changePercent !== null ? (
                          <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                            {isPositive ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {stock.volume ? stock.volume.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/stocks/${stock.symbol}`}
                            className="bg-[#1e293b] hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] transition-colors"
                          >
                            Analyze
                          </Link>
                          <button
                            onClick={() => handleAddToWatchlist(stock.symbol)}
                            title="Add to Watchlist"
                            className="p-1 rounded bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-400 hover:text-cyan-400 transition-colors"
                          >
                            {isAdded ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
