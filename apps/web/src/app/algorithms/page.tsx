'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Search,
  Code2,
  Play,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AlgorithmLabPage() {
  const [algorithms, setAlgorithms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegistry() {
      try {
        const list = await api.getAlgorithmRegistry();
        setAlgorithms(list);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchRegistry();
  }, []);

  const filteredAlgos = algorithms.filter((algo) => {
    const matchesSearch =
      algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.exportedFunction.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || algo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'Arithmetic', 'Array Processing', 'Dynamic Programming', 'Bit Manipulation', 'String Processing'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Algorithm Lab & Execution Sandbox</span>
            </h1>
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono px-2 py-0.5 rounded">
              13 Core Algorithms
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            STS3007 Advanced Competitive Coding-I reference implementations with interactive execution sandboxes and verified source traceability.
          </p>
        </div>

        <Link
          href="/algorithm-registry"
          className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded transition-colors border border-slate-700"
        >
          <span>View Matrix Registry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#0b101d] border border-[#1e293b] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search algorithms by name, ID, function..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded text-xs text-white pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500/60 font-mono"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Algorithms Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 font-mono">
          Loading algorithm directory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlgos.map((algo) => (
            <div
              key={algo.id}
              className="bg-[#0b101d] border border-[#1e293b] hover:border-slate-700 rounded-lg p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-cyan-500/5 group"
            >
              <div className="space-y-3">
                {/* Card Top: ID & Category */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    {algo.id}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded">
                    {algo.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {algo.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {algo.description}
                  </p>
                </div>

                {/* Real Application Use Case */}
                <div className="bg-[#0f172a] p-2.5 rounded border border-[#1e293b] text-xs">
                  <span className="text-[10px] text-slate-500 font-mono block">APPLICATION USE CASE:</span>
                  <span className="text-slate-200 font-medium text-[11px] block mt-0.5">
                    {algo.applicationUseCase}
                  </span>
                </div>

                {/* Metadata List */}
                <div className="text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Function:</span>
                    <code className="text-emerald-400 font-bold">{algo.exportedFunction}()</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Complexity:</span>
                    <span className="text-amber-300">{algo.timeComplexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source:</span>
                    <span className="text-slate-400 truncate max-w-[160px]">{algo.sourceFile}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#1e293b] mt-4">
                <Link
                  href={`/algorithms/${algo.slug}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 rounded transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Sandbox</span>
                </Link>
                <Link
                  href={`/algorithms/${algo.slug}#source`}
                  className="flex items-center justify-center gap-1 bg-[#1e293b] hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded transition-colors border border-slate-700"
                  title="View Verified Source Code"
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Source</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
