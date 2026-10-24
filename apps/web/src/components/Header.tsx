'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, DollarSign, Radio } from 'lucide-react';
import { api } from '@/lib/api';

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [cashBalance, setCashBalance] = useState<number>(10000);
  const [providerStatus, setProviderStatus] = useState<string>('DEMO');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // Fetch initial portfolio & settings status
    api.getPortfolio()
      .then((p) => {
        if (p?.cashBalance !== undefined) setCashBalance(p.cashBalance);
      })
      .catch(() => {});

    api.getSettings()
      .then((s) => {
        if (s?.marketDataProvider?.status) setProviderStatus(s.marketDataProvider.status);
      })
      .catch(() => {});

    return () => clearInterval(clockInterval);
  }, []);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.searchSymbols(val);
      setSearchResults(res.slice(0, 5));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSymbol = (sym: string) => {
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/stocks/${sym}`);
  };

  return (
    <header className="h-14 bg-[#0a0f1d] border-b border-[#1e293b] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input & Dropdown */}
      <div className="relative w-72">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] rounded-md px-3 py-1.5 focus-within:border-cyan-500/60 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock ticker (e.g. AAPL, RELIANCE)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono uppercase"
          />
        </div>

        {/* Live Search Results Popup */}
        {searchResults.length > 0 && (
          <div className="absolute top-11 left-0 right-0 bg-[#0f172a] border border-[#1e293b] rounded-md shadow-xl py-1 z-50">
            {searchResults.map((item) => (
              <button
                key={`${item.symbol}-${item.exchange}`}
                onClick={() => handleSelectSymbol(item.symbol)}
                className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-cyan-400 font-mono mr-2">{item.symbol}</span>
                  <span className="text-slate-300 truncate">{item.companyName}</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  {item.exchange}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Indices Bar */}
      <div className="hidden lg:flex items-center gap-5 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans font-medium">NIFTY 50:</span>
          <span className="text-slate-200">24,520.00</span>
          <span className="text-emerald-400 text-[11px]">+0.48%</span>
        </div>
        <div className="h-3.5 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans font-medium">SENSEX:</span>
          <span className="text-slate-200">80,600.00</span>
          <span className="text-emerald-400 text-[11px]">+0.39%</span>
        </div>
        <div className="h-3.5 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-sans font-medium">S&P 500:</span>
          <span className="text-slate-200">5,460.00</span>
          <span className="text-emerald-400 text-[11px]">+0.62%</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 text-xs font-mono">
        {/* Virtual Cash Pill */}
        <div className="flex items-center gap-1.5 bg-[#0f172a] px-3 py-1 rounded border border-[#1e293b]">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">Virtual Funds:</span>
          <span className="text-emerald-400 font-bold">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        {/* Provenance Status Badge */}
        <div className="flex items-center gap-1.5 bg-[#0f172a] px-2.5 py-1 rounded border border-[#1e293b]">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-300 font-semibold uppercase">{providerStatus}</span>
        </div>

        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px]">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{currentTime || '00:00:00 UTC'}</span>
        </div>
      </div>
    </header>
  );
}
