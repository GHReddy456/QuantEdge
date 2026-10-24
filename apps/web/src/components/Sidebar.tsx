'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Filter,
  BookmarkCheck,
  Briefcase,
  LineChart,
  Cpu,
  ListTree,
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Stock Screener', href: '/screener', icon: Filter },
  { name: 'Watchlists', href: '/watchlists', icon: BookmarkCheck },
  { name: 'Paper Trading', href: '/portfolio', icon: Briefcase },
  { name: 'Quant Analytics', href: '/analytics', icon: LineChart },
  { name: 'Algorithm Lab', href: '/algorithms', icon: Cpu },
  { name: 'Algorithm Registry', href: '/algorithm-registry', icon: ListTree },
  { name: 'Settings & Status', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-[#1e293b] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">QuantEdge</span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.2 rounded font-mono font-medium">v1.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">Equity Research & Algorithms</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.name === 'Algorithm Registry' && (
                  <span className="ml-auto text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">13</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-[#1e293b] bg-[#080c18]">
        <div className="bg-[#0f172a] rounded-lg p-3 border border-[#1e293b]">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 font-medium">Academic Engine</span>
            <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              STS3007
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">Traditional Markets Only</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>NSE • BSE • NASDAQ • NYSE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
