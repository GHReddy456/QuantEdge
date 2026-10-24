'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  FileCode,
  ShieldCheck,
  ArrowLeft,
  Activity,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { SourceCodeViewer } from '@/components/SourceCodeViewer';
import { ExecutionTrace } from '@/components/ExecutionTrace';

export default function AlgorithmInspectorPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [algo, setAlgo] = useState<any>(null);
  const [sourceData, setSourceData] = useState<any>(null);
  const [inputState, setInputState] = useState<any>({});
  const [outputState, setOutputState] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [executing, setExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlgorithm() {
      setLoading(true);
      try {
        const [algoData, srcData] = await Promise.all([
          api.getAlgorithm(slug),
          api.getAlgorithmSource(slug)
        ]);

        setAlgo(algoData);
        setSourceData(srcData);

        // Populate initial input from example payload
        if (algoData?.inputSchema?.examplePayload) {
          setInputState(algoData.inputSchema.examplePayload);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load algorithm inspector.');
      } finally {
        setLoading(false);
      }
    }

    loadAlgorithm();
  }, [slug]);

  const handleInputChange = (field: string, value: any, type: string) => {
    let parsedVal = value;
    if (type === 'number') {
      parsedVal = value === '' ? '' : Number(value);
    } else if (type === 'array') {
      try {
        parsedVal = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        parsedVal = value;
      }
    } else if (type === 'matrix') {
      try {
        parsedVal = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        parsedVal = value;
      }
    }

    setInputState((prev: any) => ({ ...prev, [field]: parsedVal }));
  };

  const handleRunExecution = async () => {
    setExecuting(true);
    setErrorMsg(null);
    try {
      const res = await api.runAlgorithm(slug, inputState);
      setOutputState(res.output);
      setExecutionTime(res.executionTimeMs);
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
      setOutputState(null);
    } finally {
      setExecuting(false);
    }
  };

  const handleResetInputs = () => {
    if (algo?.inputSchema?.examplePayload) {
      setInputState(algo.inputSchema.examplePayload);
      setOutputState(null);
      setErrorMsg(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-xs text-slate-500 font-mono">
        Loading algorithm specification & verified source...
      </div>
    );
  }

  if (!algo) {
    return (
      <div className="p-8 text-center text-xs font-mono text-red-400">
        Algorithm "{slug}" not found in QuantEdge registry.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back link & Top Bar */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
        <Link
          href="/algorithms"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to Algorithm Lab Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            {algo.id}
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {algo.category}
          </span>
        </div>
      </div>

      {/* Main Algorithm Banner */}
      <div className="bg-[#0b101d] border border-[#1e293b] p-6 rounded-lg space-y-3">
        <h1 className="text-2xl font-bold font-mono text-white tracking-tight">{algo.name}</h1>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{algo.problemStatement}</p>
        <div className="bg-[#0f172a] p-3 rounded border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">APPLICATION USE CASE</span>
            <span className="text-cyan-300 font-medium">{algo.applicationUseCase}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">TIME COMPLEXITY</span>
            <span className="text-amber-300 font-bold">{algo.timeComplexity}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">SPACE COMPLEXITY</span>
            <span className="text-purple-300 font-bold">{algo.spaceComplexity}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">CALLING MODULE</span>
            <span className="text-slate-300">{algo.actualCaller}</span>
          </div>
        </div>
      </div>

      {/* Execution Sandbox (Left: Inputs | Right: Outputs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input Form */}
        <div className="lg:col-span-5 bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Input Contract Editor</span>
            </h3>
            <button
              onClick={handleResetInputs}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 font-sans">{algo.inputSchema.description}</p>

          <div className="space-y-3 font-mono text-xs">
            {algo.inputSchema.fields.map((field: any) => {
              const currentVal = inputState[field.name];
              const isComplex = field.type === 'array' || field.type === 'matrix';

              return (
                <div key={field.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold">{field.name}</label>
                    <span className="text-[10px] text-slate-500">type: {field.type}</span>
                  </div>
                  {isComplex ? (
                    <textarea
                      rows={field.type === 'matrix' ? 5 : 3}
                      value={typeof currentVal === 'object' ? JSON.stringify(currentVal, null, 2) : currentVal}
                      onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={currentVal ?? ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded p-2 text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                    />
                  )}
                  <span className="text-[10px] text-slate-500 block">{field.description}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRunExecution}
            disabled={executing}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded transition-all shadow-md flex items-center justify-center gap-2 font-mono disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{executing ? 'Executing Implementation...' : 'Run Real Implementation'}</span>
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded font-mono">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right: Output Panel */}
        <div className="lg:col-span-7 bg-[#0b101d] border border-[#1e293b] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Execution Output & Diagnostics</span>
            </h3>
            {executionTime !== null && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Execution Time: {executionTime}ms
              </span>
            )}
          </div>

          {outputState ? (
            <div className="space-y-4">
              {/* Highlight summary fields */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                {Object.entries(outputState)
                  .filter(([k]) => k !== 'steps' && k !== 'values' && k !== 'matrix')
                  .slice(0, 4)
                  .map(([key, value]: any) => (
                    <div key={key} className="bg-[#0f172a] p-2.5 rounded border border-[#1e293b]">
                      <span className="text-[10px] text-slate-500 uppercase block">{key}</span>
                      <span className="text-white font-bold text-sm block mt-0.5 truncate">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* JSON Payload Display */}
              <div className="bg-[#060a12] p-4 rounded border border-[#1e293b] max-h-60 overflow-y-auto text-xs font-mono text-emerald-300">
                <pre>{JSON.stringify(outputState, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-slate-500 font-mono">
              Press "Run Real Implementation" to execute this algorithm with the configured inputs.
            </div>
          )}
        </div>
      </div>

      {/* Execution Trace Table */}
      {outputState?.steps && outputState.steps.length > 0 && (
        <ExecutionTrace steps={outputState.steps} />
      )}

      {/* Source Code Viewer Section */}
      <div id="source" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Verified Source Code: {algo.sourceFile}</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Read directly from filesystem</span>
        </div>

        {sourceData && (
          <SourceCodeViewer
            algorithmId={sourceData.algorithmId}
            algorithmName={sourceData.algorithmName}
            filePath={sourceData.filePath}
            exportedFunction={sourceData.exportedFunction}
            testFile={sourceData.testFile}
            actualCaller={sourceData.actualCaller}
            timeComplexity={sourceData.timeComplexity}
            spaceComplexity={sourceData.spaceComplexity}
            sourceCode={sourceData.sourceCode}
            lines={sourceData.lines}
          />
        )}
      </div>
    </div>
  );
}
