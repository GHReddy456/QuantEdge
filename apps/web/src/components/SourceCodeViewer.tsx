'use client';

import React, { useState } from 'react';
import { FileCode, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

interface SourceCodeViewerProps {
  algorithmId: string;
  algorithmName: string;
  filePath: string;
  exportedFunction: string;
  testFile: string;
  actualCaller: string;
  timeComplexity: string;
  spaceComplexity: string;
  sourceCode: string;
  lines: string[];
}

export function SourceCodeViewer({
  algorithmId,
  algorithmName,
  filePath,
  exportedFunction,
  testFile,
  actualCaller,
  timeComplexity,
  spaceComplexity,
  sourceCode,
  lines
}: SourceCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg overflow-hidden font-sans">
      {/* Viewer Header */}
      <div className="bg-[#0f172a] p-4 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center">
            <FileCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                {algorithmId}
              </span>
              <span className="text-sm font-bold text-white font-mono">{filePath}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified Implementation: <code className="text-emerald-400 font-mono font-semibold">{exportedFunction}()</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Source'}</span>
          </button>
        </div>
      </div>

      {/* Traceability Metadata Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#080d1a] p-3 text-xs border-b border-[#1e293b] font-mono">
        <div>
          <span className="text-slate-500 block text-[10px]">EXPORTED FUNCTION</span>
          <span className="text-cyan-300 font-bold">{exportedFunction}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">TIME / SPACE</span>
          <span className="text-amber-300">{timeComplexity}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">CALLING MODULE</span>
          <span className="text-slate-300 truncate block" title={actualCaller}>{actualCaller.split('/').pop()}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">UNIT TEST</span>
          <span className="text-emerald-400 truncate block" title={testFile}>{testFile.split('/').pop()}</span>
        </div>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="max-h-[500px] overflow-y-auto bg-[#060a12] p-4 text-xs font-mono">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isFunctionLine = line.includes(`export function ${exportedFunction}`) || line.includes(`function ${exportedFunction}`);
              return (
                <tr
                  key={lineNum}
                  className={isFunctionLine ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/50'}
                >
                  <td className="w-10 pr-4 text-right text-slate-600 select-none align-top font-mono text-[11px]">
                    {lineNum}
                  </td>
                  <td className="text-slate-300 whitespace-pre font-mono leading-relaxed">
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Provenance */}
      <div className="bg-[#0a0f1c] px-4 py-2 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real Local Filesystem Source • Verified Allowlist</span>
        </div>
        <span>Total Lines: {lines.length}</span>
      </div>
    </div>
  );
}
