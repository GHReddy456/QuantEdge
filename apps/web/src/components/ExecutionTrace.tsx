'use client';

import React from 'react';
import { Activity } from 'lucide-react';

interface ExecutionTraceProps {
  steps: any[];
  title?: string;
}

export function ExecutionTrace({ steps, title = 'Execution Trace & State Register Transitions' }: ExecutionTraceProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-6 text-center text-xs text-slate-500 font-mono">
        No execution trace recorded.
      </div>
    );
  }

  // Detect keys present in steps to render tabular columns
  const firstStep = steps[0];
  const keys = Object.keys(firstStep).filter((k) => k !== 'description' && k !== 'detail');

  return (
    <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg overflow-hidden font-sans">
      <div className="bg-[#0f172a] px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{title}</h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          {steps.length} Steps Recorded
        </span>
      </div>

      <div className="max-h-[360px] overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-[#080d1a] border-b border-[#1e293b] text-slate-400 text-[11px]">
              <th className="py-2.5 px-3">#</th>
              {keys.map((k) => (
                <th key={k} className="py-2.5 px-3 uppercase tracking-wider">
                  {k}
                </th>
              ))}
              {(firstStep.description || firstStep.detail) && (
                <th className="py-2.5 px-3 uppercase tracking-wider">Operation Description</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {steps.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                {keys.map((k) => {
                  const val = s[k];
                  const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
                  return (
                    <td key={k} className="py-2 px-3 text-cyan-300">
                      {display}
                    </td>
                  );
                })}
                {(s.description || s.detail) && (
                  <td className="py-2 px-3 text-slate-300">
                    {s.description || s.detail}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
