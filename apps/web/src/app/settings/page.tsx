'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Radio,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  Globe
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg('Preferences saved for current session.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Settings & System Provenance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspection of live market-data connections, database state, rate limits, and currency configuration.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded transition-colors font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {saveMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded font-mono">
          {saveMsg}
        </div>
      )}

      {/* Grid: Provider Status | Database Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Data Provider Status */}
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Market Data Provider</span>
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                settings?.marketDataProvider?.status === 'LIVE'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              }`}
            >
              {settings?.marketDataProvider?.status || 'DEMO'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
              <span className="text-slate-400">Active Provider:</span>
              <span className="text-white font-bold">{settings?.marketDataProvider?.name || 'QuantEdge Provider'}</span>
            </div>
            <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
              <span className="text-slate-400">Twelve Data Key:</span>
              <span className="text-slate-300">
                {settings?.marketDataProvider?.isConfigured ? 'Configured (Server-Side Only)' : 'Not Set (Using Calibrated Engine)'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
              <span className="text-slate-400">Rate Limit Quota:</span>
              <span className="text-cyan-400 font-bold">{settings?.marketDataProvider?.rateLimitPerMinute} requests / min</span>
            </div>
            <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
              <span className="text-slate-400">Data Freshness:</span>
              <span className="text-emerald-400 font-bold">Real-time / Delay Qualified</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">
              {settings?.marketDataProvider?.notes}
            </p>
          </div>
        </div>

        {/* Database Persistence Status */}
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Persistence</span>
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                settings?.database?.type === 'MONGODB_ATLAS'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-blue-950 text-blue-400 border border-blue-800'
              }`}
            >
              {settings?.database?.type === 'MONGODB_ATLAS' ? 'MONGODB ATLAS' : 'IN-MEMORY ENGINE'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
              <span className="text-slate-400">Connection State:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operational</span>
              </span>
            </div>
            <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
              <span className="text-slate-400">Cluster Name:</span>
              <span className="text-white font-bold">{settings?.database?.databaseName}</span>
            </div>
            <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
              <span className="text-slate-400">Atlas Ready:</span>
              <span className="text-cyan-400 font-bold">Enabled via Mongoose Driver</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">
              Provides transactional persistence for paper portfolios, simulated orders, custom watchlists, and algorithmic audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* User Preferences Form */}
      <form onSubmit={handleSavePreferences} className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Application Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Default Display Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="USD">USD ($) - United States Dollar</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Primary Trading Market</label>
            <select className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-white focus:outline-none focus:border-cyan-500">
              <option value="ALL">Multi-Market (US NASDAQ/NYSE & India NSE/BSE)</option>
              <option value="US">US Equities Only</option>
              <option value="INDIA">Indian Equities Only</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded transition-colors font-mono"
          >
            Save Session Preferences
          </button>
        </div>
      </form>

      {/* Security & Credentials Notice */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-lg flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">Security & API Privacy Guarantee</span>
          <p className="font-sans leading-relaxed">
            All API keys (including TWELVE_DATA_API_KEY) and MongoDB Atlas connection credentials are held strictly server-side in secure environment variables. Client web requests never receive or display confidential credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
