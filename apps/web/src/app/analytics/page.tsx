'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Activity,
  Layers,
  Cpu,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [activeTab, setActiveTab] = useState<'breadth' | 'return-window' | 'leaders' | 'heatmap' | 'intervals' | 'rolling' | 'balance'>('breadth');

  // Analytical outputs state
  const [breadth, setBreadth] = useState<any>(null);
  const [returnWindow, setReturnWindow] = useState<any>(null);
  const [leaders, setLeaders] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [intervals, setIntervals] = useState<any>(null);
  const [rollingBuffer, setRollingBuffer] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Interval inputs
  const [intervalA, setIntervalA] = useState(15);
  const [intervalB, setIntervalB] = useState(30);

  // Buffer rotation count
  const [rotationCount, setRotationCount] = useState(2);

  const loadCurrentAnalysis = async () => {
    setLoading(true);
    try {
      if (activeTab === 'breadth') {
        const data = await api.getMarketBreadth();
        setBreadth(data);
      } else if (activeTab === 'return-window') {
        const data = await api.getReturnWindow(selectedSymbol);
        setReturnWindow(data);
      } else if (activeTab === 'leaders') {
        const data = await api.getPriceLeaders(selectedSymbol);
        setLeaders(data);
      } else if (activeTab === 'heatmap') {
        const data = await api.getHeatmap();
        setHeatmap(data);
      } else if (activeTab === 'intervals') {
        const data = await api.getIntervalGcd(intervalA, intervalB);
        setIntervals(data);
      } else if (activeTab === 'rolling') {
        const data = await api.getRollingBuffer(selectedSymbol, rotationCount);
        setRollingBuffer(data);
      } else if (activeTab === 'balance') {
        const data = await api.getContributionBalance();
        setBalance(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentAnalysis();
  }, [activeTab, selectedSymbol]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            <span>Quantitative Analytics & Algorithmic Research</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical historical price analysis, localized matrix heatmaps, Boyer-Moore breadth, and sampling divisors.
          </p>
        </div>

        {/* Symbol Selector */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Target Instrument:</span>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-[#0f172a] border border-[#1e293b] rounded px-3 py-1.5 text-cyan-400 font-bold focus:outline-none"
          >
            <option value="AAPL">AAPL (NASDAQ)</option>
            <option value="MSFT">MSFT (NASDAQ)</option>
            <option value="NVDA">NVDA (NASDAQ)</option>
            <option value="RELIANCE">RELIANCE (NSE)</option>
            <option value="TCS">TCS (NSE)</option>
            <option value="INFY">INFY (NSE)</option>
            <option value="SPY">SPY (ETF)</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs for 7 Integrated Algorithms */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1e293b] pb-2 text-xs font-mono">
        {[
          { id: 'breadth', label: 'ACC-11: Market Breadth' },
          { id: 'return-window', label: 'ACC-07: Best Return Window' },
          { id: 'leaders', label: 'ACC-10: Price Leaders' },
          { id: 'heatmap', label: 'ACC-08: Matrix Heatmap' },
          { id: 'intervals', label: 'ACC-02: Sampling Divisor' },
          { id: 'rolling', label: 'ACC-06: Rolling Window' },
          { id: 'balance', label: 'ACC-09: Contribution Balance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: ACC-11 Market Breadth */}
      {activeTab === 'breadth' && (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>ACC-11: Boyer-Moore Market Breadth Voting</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Two-Pass Verification</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Classifies multi-market daily returns into Positive, Negative, or Unchanged, and verifies whether a strict majority (&gt;50%) exists.
              </p>
            </div>
            <Link href="/algorithms/majority-element" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Algorithm &rarr;
            </Link>
          </div>

          {breadth && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                  <span className="text-slate-400 block text-[11px]">MAJORITY OUTCOME</span>
                  <span className={`text-base font-bold ${breadth.hasStrictMajority ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {breadth.hasStrictMajority ? `STRICT MAJORITY: ${breadth.candidate}` : 'NO MAJORITY DETECTED'}
                  </span>
                </div>
                <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                  <span className="text-slate-400 block text-[11px]">VOTE FREQUENCY</span>
                  <span className="text-base font-bold text-white">
                    {breadth.count} / {breadth.total} ({breadth.percentage}%)
                  </span>
                </div>
                <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                  <span className="text-slate-400 block text-[11px]">REQUIRED THRESHOLD</span>
                  <span className="text-base font-bold text-cyan-300">
                    &gt; {breadth.threshold - 1} ({breadth.threshold} min votes)
                  </span>
                </div>
              </div>

              {/* Component Classifications Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300">Market Basket Classifications:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 font-mono text-xs">
                  {breadth.symbolsEvaluated?.map((sym: string, i: number) => {
                    const c = breadth.classifications[i];
                    return (
                      <div key={sym} className="flex items-center justify-between p-2 rounded bg-[#0f172a] border border-[#1e293b]">
                        <span className="text-white font-bold">{sym}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          c === 'POSITIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          c === 'NEGATIVE' ? 'bg-red-950 text-red-400 border border-red-800' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: ACC-07 Best Return Window */}
      {activeTab === 'return-window' && (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>ACC-07: Maximum Compounded-Return Window ({selectedSymbol})</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Kadane Sign-Flip Variant</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Converts historical closing prices into daily return multipliers (1 + r) and tracks running max/min products to find optimal contiguous growth windows.
              </p>
            </div>
            <Link href="/algorithms/max-product-subarray" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Algorithm &rarr;
            </Link>
          </div>

          {returnWindow ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                  <span className="text-slate-400 block text-[11px]">MAX COMPOUNDED RETURN</span>
                  <span className="text-xl font-bold text-emerald-400">
                    +{returnWindow.compoundedReturnPercent}%
                  </span>
                </div>
                <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                  <span className="text-slate-400 block text-[11px]">MULTIPLIER PRODUCT</span>
                  <span className="text-xl font-bold text-white">
                    {returnWindow.maxCompoundedMultiplier}x
                  </span>
                </div>
                <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                  <span className="text-slate-400 block text-[11px]">WINDOW DURATION</span>
                  <span className="text-xl font-bold text-cyan-300">
                    {returnWindow.windowSize} Sessions
                  </span>
                </div>
              </div>

              <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b] text-slate-300">
                <span>Start Date: <strong>{returnWindow.periodStart?.split('T')[0]}</strong> &rarr; End Date: <strong>{returnWindow.periodEnd?.split('T')[0]}</strong></span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-8 font-mono text-xs">Calculating return window...</div>
          )}
        </div>
      )}

      {/* Tab 3: ACC-10 Price Leaders */}
      {activeTab === 'leaders' && (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>ACC-10: Historical Price Leaders Scan ({selectedSymbol})</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">O(n) Reverse Scan</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Identifies price peaks that established milestones unbroken by subsequent trading days.
              </p>
            </div>
            <Link href="/algorithms/leaders-in-array" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Algorithm &rarr;
            </Link>
          </div>

          {leaders ? (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-slate-400">Total Observations Analyzed: {leaders.totalObservations} sessions</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {leaders.leaders?.map((l: any, idx: number) => (
                  <div key={idx} className="bg-[#0f172a] p-3 rounded border border-[#1e293b] flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">{l.timestamp?.split('T')[0]}</span>
                      <span className="text-slate-500 text-[10px]">Index: {l.index}</span>
                    </div>
                    <span className="text-base font-bold text-emerald-400">${l.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-8 font-mono text-xs">Loading leaders...</div>
          )}
        </div>
      )}

      {/* Tab 4: ACC-08 Matrix Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>ACC-08: Maximum Sum of Hourglass in Matrix</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">7-Cell Cluster Scanner</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Evaluates contiguous 7-cell hourglass patterns across a sector performance matrix to identify the densest cluster of performance.
              </p>
            </div>
            <Link href="/algorithms/max-hourglass-sum" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Algorithm &rarr;
            </Link>
          </div>

          {heatmap && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b] flex items-center justify-between">
                <span>Maximum Hourglass Sum: <strong className="text-emerald-400 text-sm">{heatmap.maxSum}</strong></span>
                <span>Optimal Top-Left Anchor: <strong className="text-cyan-400">[Row {heatmap.bestRow}, Col {heatmap.bestCol}]</strong></span>
              </div>

              {/* Grid visualization */}
              <div className="overflow-x-auto">
                <table className="border-collapse mx-auto">
                  <tbody>
                    {heatmap.matrix?.map((row: number[], r: number) => (
                      <tr key={r}>
                        {row.map((val: number, c: number) => {
                          const isHourglassCell =
                            (r === heatmap.bestRow && (c >= heatmap.bestCol && c <= heatmap.bestCol + 2)) ||
                            (r === heatmap.bestRow + 1 && c === heatmap.bestCol + 1) ||
                            (r === heatmap.bestRow + 2 && (c >= heatmap.bestCol && c <= heatmap.bestCol + 2));

                          return (
                            <td
                              key={c}
                              className={`p-2.5 text-center border border-[#1e293b] transition-all ${
                                isHourglassCell
                                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500 scale-105 shadow-sm'
                                  : 'bg-[#0f172a] text-slate-400'
                              }`}
                            >
                              {val.toFixed(1)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: ACC-02 Sampling Intervals */}
      {activeTab === 'intervals' && (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>ACC-02: Euclid Sampling Interval Analysis</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Greatest Common Divisor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Computes the greatest common divisor of timeframe candle aggregations to find optimal base alignment periods.
              </p>
            </div>
            <Link href="/algorithms/euclid" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Algorithm &rarr;
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Interval A (mins):</span>
              <input
                type="number"
                min="1"
                value={intervalA}
                onChange={(e) => setIntervalA(parseInt(e.target.value || '1', 10))}
                className="w-20 bg-[#0f172a] border border-[#1e293b] rounded p-1.5 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Interval B (mins):</span>
              <input
                type="number"
                min="1"
                value={intervalB}
                onChange={(e) => setIntervalB(parseInt(e.target.value || '1', 10))}
                className="w-20 bg-[#0f172a] border border-[#1e293b] rounded p-1.5 text-white"
              />
            </div>
            <button
              onClick={loadCurrentAnalysis}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded transition-colors"
            >
              Compute GCD
            </button>
          </div>

          {intervals && (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b] flex items-center justify-between">
                <span>Greatest Common Sampling Divisor: <strong className="text-emerald-400 text-sm">{intervals.gcdMinutes} Minutes</strong></span>
                <span>Iterations: <strong className="text-slate-300">{intervals.iterations}</strong></span>
              </div>
              <p className="text-slate-300">{intervals.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: ACC-06 Rolling Sample Window */}
      {activeTab === 'rolling' && (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>ACC-06: Block Swap Rolling Sample Buffer ({selectedSymbol})</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">In-Place O(1) Space</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Demonstrates contiguous block rotation of a fixed-size historical candle sample buffer.
              </p>
            </div>
            <Link href="/algorithms/block-swap" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Algorithm &rarr;
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Positions to Rotate Left:</span>
            <input
              type="number"
              min="0"
              value={rotationCount}
              onChange={(e) => setRotationCount(parseInt(e.target.value || '0', 10))}
              className="w-20 bg-[#0f172a] border border-[#1e293b] rounded p-1.5 text-white"
            />
            <button
              onClick={loadCurrentAnalysis}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded transition-colors"
            >
              Rotate Buffer
            </button>
          </div>

          {rollingBuffer && (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b] flex items-center justify-between">
                <span>Effective Rotation: <strong className="text-cyan-400">{rollingBuffer.effectiveRotation}</strong></span>
                <span>Swaps Performed: <strong className="text-slate-300">{rollingBuffer.swapsPerformed}</strong></span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-1">ORIGINAL BUFFER:</span>
                  <div className="bg-[#0f172a] p-2 rounded max-h-40 overflow-y-auto space-y-1">
                    {rollingBuffer.original?.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span className="text-slate-500">{c.timestamp}</span>
                        <span className="text-slate-200">${c.close.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-cyan-400 block mb-1">ROTATED BUFFER:</span>
                  <div className="bg-[#0f172a] p-2 rounded max-h-40 overflow-y-auto space-y-1">
                    {rollingBuffer.rotated?.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span className="text-slate-500">{c.timestamp}</span>
                        <span className="text-emerald-400 font-bold">${c.close.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: ACC-09 Contribution Balance */}
      {activeTab === 'balance' && (
        <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>ACC-09: Portfolio Contribution Equilibrium Sum</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Prefix-Suffix Balance</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Analyzes an ordered sequence of signed portfolio contributions/trade P&Ls and identifies points where prior gains/losses match subsequent values.
              </p>
            </div>
            <Link href="/algorithms/max-equilibrium-sum" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Algorithm &rarr;
            </Link>
          </div>

          {balance && (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b] flex items-center justify-between">
                <span>Maximum Equilibrium Sum: <strong className="text-emerald-400 text-sm">{balance.maxEquilibriumSum ?? 'None'}</strong></span>
                <span>Equilibrium Position Index: <strong className="text-cyan-400">{balance.bestIndex ?? 'N/A'}</strong></span>
              </div>
              <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b]">
                <span className="text-slate-400 block text-[11px] mb-1">Signed Contributions Evaluated:</span>
                <div className="flex flex-wrap gap-1.5">
                  {balance.values?.map((v: number, idx: number) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded ${
                        idx === balance.bestIndex ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300' : 'bg-[#1e293b] text-slate-300'
                      }`}
                    >
                      {v >= 0 ? `+${v}` : v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Academic Disclaimer */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-3.5 rounded-lg flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          Quantitative Model Scope: All calculations are derived deterministically from historical observations without predictive claims of future equity performance.
        </span>
      </div>
    </div>
  );
}
