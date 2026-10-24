'use client';

import React, { useState, useMemo } from 'react';

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  candles: Candle[];
  symbol: string;
  currency?: string;
  activeInterval?: string;
  onIntervalChange?: (interval: string) => void;
  height?: number;
}

const INTERVALS = [
  { label: '1m', value: '1min' },
  { label: '5m', value: '5min' },
  { label: '15m', value: '15min' },
  { label: '1h', value: '1h' },
  { label: '1D', value: '1day' },
  { label: '1W', value: '1week' },
];

export function CandlestickChart({
  candles,
  symbol,
  currency = 'USD',
  activeInterval = '1day',
  onIntervalChange,
  height = 360
}: CandlestickChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { minPrice, maxPrice, maxVolume, priceRange } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVolume: 1000, priceRange: 100 };
    }
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    for (const c of candles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    }

    const padding = (max - min) * 0.08 || 1;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: maxVol || 1000,
      priceRange: (max + padding) - (min - padding)
    };
  }, [candles]);

  const chartWidth = 800;
  const paddingRight = 65; // Price scale
  const paddingBottom = 30; // Date scale
  const paddingTop = 20;
  const plotWidth = chartWidth - paddingRight;
  const plotHeight = height - paddingBottom - paddingTop;
  const candleAreaHeight = plotHeight * 0.75;
  const volumeAreaHeight = plotHeight * 0.22;

  const count = candles?.length || 0;
  const candleWidth = count > 0 ? Math.max((plotWidth / count) * 0.7, 3) : 6;

  const getY = (price: number) => {
    return paddingTop + candleAreaHeight - ((price - minPrice) / priceRange) * candleAreaHeight;
  };

  const getVolY = (vol: number) => {
    const volRatio = Math.min(vol / maxVolume, 1);
    return height - paddingBottom - volRatio * volumeAreaHeight;
  };

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  return (
    <div className="bg-[#0b101d] border border-[#1e293b] rounded-lg p-4 font-sans select-none">
      {/* Chart Top Bar: Symbol, Live Price, Interval Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-white font-mono">{symbol}</span>
          {activeCandle && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">O: <strong className="text-slate-200">{activeCandle.open.toFixed(2)}</strong></span>
              <span className="text-slate-400">H: <strong className="text-slate-200">{activeCandle.high.toFixed(2)}</strong></span>
              <span className="text-slate-400">L: <strong className="text-slate-200">{activeCandle.low.toFixed(2)}</strong></span>
              <span className="text-slate-400">C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-red-400'}>{activeCandle.close.toFixed(2)}</strong></span>
              <span className="text-slate-500">Vol: {activeCandle.volume.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Timeframe Intervals */}
        <div className="flex items-center gap-1 bg-[#0f172a] p-1 rounded border border-[#1e293b]">
          {INTERVALS.map((item) => (
            <button
              key={item.value}
              onClick={() => onIntervalChange?.(item.value)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                activeInterval === item.value
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Candlestick Viewport */}
      <div className="relative w-full overflow-hidden mt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
            if (mouseX < plotWidth && count > 0) {
              const idx = Math.min(Math.max(Math.floor((mouseX / plotWidth) * count), 0), count - 1);
              setHoverIndex(idx);
            }
          }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const priceVal = minPrice + priceRange * (1 - pct);
            const y = paddingTop + candleAreaHeight * pct;
            return (
              <g key={idx}>
                <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth={1} />
                <text x={plotWidth + 6} y={y + 4} fill="#64748b" fontSize={10} fontFamily="monospace">
                  {priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volume separator line */}
          <line
            x1={0}
            y1={height - paddingBottom - volumeAreaHeight - 4}
            x2={plotWidth}
            y2={height - paddingBottom - volumeAreaHeight - 4}
            stroke="#1e293b"
            strokeWidth={1}
          />
          <text x={4} y={height - paddingBottom - volumeAreaHeight} fill="#475569" fontSize={9} fontFamily="monospace">
            VOL
          </text>

          {/* Render Candles & Volume Bars */}
          {candles.map((c, i) => {
            const x = (i + 0.5) * (plotWidth / count);
            const isBull = c.close >= c.open;
            const candleColor = isBull ? '#10b981' : '#ef4444';
            const volumeColor = isBull ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)';

            const highY = getY(c.high);
            const lowY = getY(c.low);
            const openY = getY(c.open);
            const closeY = getY(c.close);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);

            // Volume bar
            const volY = getVolY(c.volume);
            const volBarHeight = height - paddingBottom - volY;

            return (
              <g key={i}>
                {/* Volume bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={volBarHeight}
                  fill={volumeColor}
                />

                {/* Wick */}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={candleColor} strokeWidth={1.2} />

                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={candleColor}
                  rx={0.5}
                />
              </g>
            );
          })}

          {/* Crosshair when hovering */}
          {hoverIndex !== null && candles[hoverIndex] && (
            <g>
              {/* Vertical line */}
              <line
                x1={(hoverIndex + 0.5) * (plotWidth / count)}
                y1={paddingTop}
                x2={(hoverIndex + 0.5) * (plotWidth / count)}
                y2={height - paddingBottom}
                stroke="#38bdf8"
                strokeDasharray="2 2"
                strokeWidth={1}
              />
              {/* Horizontal line */}
              <line
                x1={0}
                y1={getY(candles[hoverIndex].close)}
                x2={plotWidth}
                y2={getY(candles[hoverIndex].close)}
                stroke="#38bdf8"
                strokeDasharray="2 2"
                strokeWidth={1}
              />
              {/* Price badge on axis */}
              <rect
                x={plotWidth + 2}
                y={getY(candles[hoverIndex].close) - 9}
                width={58}
                height={18}
                fill="#0284c7"
                rx={2}
              />
              <text
                x={plotWidth + 6}
                y={getY(candles[hoverIndex].close) + 3}
                fill="#ffffff"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {candles[hoverIndex].close.toFixed(2)}
              </text>
            </g>
          )}

          {/* Time axis labels */}
          {candles
            .filter((_, idx) => idx % Math.ceil(count / 6) === 0)
            .map((c, idx) => {
              const origIdx = candles.indexOf(c);
              const x = (origIdx + 0.5) * (plotWidth / count);
              const dateStr = c.timestamp.split('T')[0] || c.timestamp;
              return (
                <text
                  key={idx}
                  x={x}
                  y={height - 8}
                  fill="#64748b"
                  fontSize={10}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {dateStr.slice(5)}
                </text>
              );
            })}
        </svg>
      </div>
    </div>
  );
}
