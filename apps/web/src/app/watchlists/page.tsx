'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookmarkCheck,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ExternalLink,
  Search
} from 'lucide-react';
import { api } from '@/lib/api';
import { naturalSort } from '@quantedge/algorithms';

export default function WatchlistsPage() {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
  const [newWlName, setNewWlName] = useState('');
  const [addSymbolInput, setAddSymbolInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadWatchlists = async () => {
    try {
      const data = await api.getWatchlists();
      setWatchlists(data);
      if (data.length > 0 && !activeWatchlistId) {
        setActiveWatchlistId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlists();
  }, []);

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlName.trim()) return;
    try {
      const created = await api.createWatchlist(newWlName.trim());
      setNewWlName('');
      await loadWatchlists();
      setActiveWatchlistId(created.id);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    try {
      await api.deleteWatchlist(id);
      await loadWatchlists();
      setActiveWatchlistId(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWatchlistId || !addSymbolInput.trim()) return;
    try {
      await api.addInstrumentToWatchlist(activeWatchlistId, addSymbolInput.trim().toUpperCase());
      setAddSymbolInput('');
      await loadWatchlists();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    if (!activeWatchlistId) return;
    try {
      await api.removeInstrumentFromWatchlist(activeWatchlistId, symbol);
      await loadWatchlists();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const activeWl = watchlists.find((w) => w.id === activeWatchlistId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-cyan-400" />
            <span>Custom Watchlists & Multi-Asset Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize, monitor, and naturally sort your customized baskets of Indian and US equities.
          </p>
        </div>

        {/* Create Watchlist Form */}
        <form onSubmit={handleCreateWatchlist} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New watchlist name..."
            value={newWlName}
            onChange={(e) => setNewWlName(e.target.value)}
            className="bg-[#0f172a] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create List</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded font-mono">
          {errorMsg}
        </div>
      )}

      {/* Watchlist Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1e293b] pb-2">
        {watchlists.map((wl) => (
          <div key={wl.id} className="flex items-center">
            <button
              onClick={() => setActiveWatchlistId(wl.id)}
              className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors border-t border-x ${
                activeWatchlistId === wl.id
                  ? 'bg-[#0b101d] border-[#1e293b] text-cyan-400 font-bold border-b-2 border-b-cyan-500'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {wl.name} ({wl.symbols?.length || 0})
            </button>
          </div>
        ))}
      </div>

      {/* Active Watchlist Content */}
      {activeWl ? (
        <div className="space-y-4">
          {/* Watchlist Bar: Add Symbol & Delete List */}
          <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={handleAddSymbol} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add ticker (e.g. NVDA, TCS)..."
                value={addSymbolInput}
                onChange={(e) => setAddSymbolInput(e.target.value)}
                className="bg-[#0f172a] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="bg-[#1e293b] hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-mono transition-colors"
              >
                + Add Symbol
              </button>
            </form>

            <button
              onClick={() => handleDeleteWatchlist(activeWl.id)}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete This Watchlist</span>
            </button>
          </div>

          {/* Table of Items */}
          <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#0f172a] border-b border-[#1e293b] text-slate-400 text-[11px]">
                  <th className="py-3 px-4">TICKER (ACC-13 SORTED)</th>
                  <th className="py-3 px-4">EXCHANGE</th>
                  <th className="py-3 px-4 text-right">PRICE</th>
                  <th className="py-3 px-4 text-right">CHANGE</th>
                  <th className="py-3 px-4 text-right">CHANGE %</th>
                  <th className="py-3 px-4 text-right">VOLUME</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {(!activeWl.items || activeWl.items.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                      This watchlist is currently empty. Add ticker symbols using the form above.
                    </td>
                  </tr>
                ) : (
                  activeWl.items.map((item: any) => {
                    const isPositive = (item.change || 0) >= 0;
                    return (
                      <tr key={item.symbol} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-cyan-400">
                          <Link href={`/stocks/${item.symbol}`} className="hover:underline flex items-center gap-1">
                            <span>{item.symbol}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-[#111c33] text-blue-300 border border-blue-900 px-1.5 py-0.5 rounded text-[10px]">
                            {item.exchange}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          {item.currency === 'INR' ? '₹' : '$'}
                          {item.price?.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}
                          {item.change?.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}
                          {item.changePercent?.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400">
                          {item.volume?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleRemoveSymbol(item.symbol)}
                            className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-12 text-center text-slate-500 font-mono text-xs">
          No watchlists found. Create one above to get started.
        </div>
      )}
    </div>
  );
}
