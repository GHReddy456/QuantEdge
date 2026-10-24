import {
  gcd,
  rotateLeftBlockSwap,
  maxProductSubarray,
  maxHourglassSum,
  maxEquilibriumSum,
  findLeaders,
  findMajorityElement,
  naturalSort
} from '@quantedge/algorithms';
import { marketDataService } from './market-data/market-data.service.js';
import { store } from '../models/store.js';

export class MarketAnalyticsService {
  /**
   * ACC-10: Stock Detail -> Historical Price Leaders
   * Identifies chronological price milestones where closing price was never broken by later days.
   */
  public async analyzePriceLeaders(symbol: string, exchange?: string) {
    const candles = await marketDataService.getCandles(symbol, '1day', exchange, 60);
    const closePrices = candles.map((c) => c.close);
    const result = findLeaders(closePrices);

    const leadersWithTimestamps = result.leaders.map((leader) => ({
      ...leader,
      timestamp: candles[leader.index]?.timestamp || 'Unknown'
    }));

    return {
      symbol,
      exchange: exchange || 'DEFAULT',
      totalObservations: closePrices.length,
      leaders: leadersWithTimestamps,
      steps: result.steps
    };
  }

  /**
   * ACC-07: Stock Analytics -> Best Compounded-Return Window
   * Calculates daily return multipliers 1 + r and applies max product subarray to find
   * the highest yielding historical holding window.
   */
  public async analyzeBestCompoundedReturnWindow(symbol: string, exchange?: string) {
    const candles = await marketDataService.getCandles(symbol, '1day', exchange, 60);
    if (candles.length < 2) {
      throw new Error(`Insufficient historical candles for ${symbol} to compute return window.`);
    }

    const returnMultipliers: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const prev = candles[i - 1].close;
      const curr = candles[i].close;
      const r = (curr - prev) / prev;
      returnMultipliers.push(Number((1 + r).toFixed(6)));
    }

    const result = maxProductSubarray(returnMultipliers);

    const startCandle = candles[result.startIndex];
    const endCandle = candles[result.endIndex + 1] || candles[result.endIndex];

    return {
      symbol,
      periodStart: startCandle?.timestamp,
      periodEnd: endCandle?.timestamp,
      maxCompoundedMultiplier: Number(result.maxProduct.toFixed(4)),
      compoundedReturnPercent: Number(result.compoundedReturnPercent.toFixed(2)),
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      windowSize: result.subarray.length,
      steps: result.steps.slice(0, 20) // bounded trace
    };
  }

  /**
   * ACC-02: Analytics -> Sampling Interval Analysis
   * Calculates the GCD of two sampling periods (e.g. 15m and 30m).
   */
  public analyzeSamplingInterval(intervalA: number, intervalB: number) {
    const result = gcd(intervalA, intervalB);
    return {
      intervalA,
      intervalB,
      gcdMinutes: result.gcd,
      iterations: result.iterations,
      steps: result.steps,
      explanation: `The base sampling unit common to both ${intervalA}m and ${intervalB}m is ${result.gcd}m.`
    };
  }

  /**
   * ACC-06: Analytics -> Rolling Sample Window
   * In-place rotation of a fixed-size market observation sample buffer.
   */
  public async rotateRollingBuffer(symbol: string, rotationCount: number) {
    const candles = await marketDataService.getCandles(symbol, '1day', undefined, 20);
    const candleSubset = candles.map((c) => ({
      timestamp: c.timestamp.split('T')[0],
      close: c.close,
      volume: c.volume
    }));

    const result = rotateLeftBlockSwap([...candleSubset], rotationCount);
    return {
      symbol,
      rotationRequested: rotationCount,
      effectiveRotation: result.effectiveRotation,
      swapsPerformed: result.swapsPerformed,
      original: result.original,
      rotated: result.rotated,
      steps: result.steps
    };
  }

  /**
   * ACC-08: Market Analytics -> Performance Heatmap
   * Evaluates standard 7-cell hourglass localized performance clusters across sector performance matrix.
   */
  public evaluateHeatmapHourglass(customMatrix?: number[][]) {
    // Default: 6x6 matrix of sector/index relative performance metrics
    const matrix = customMatrix || [
      [1.4, 2.1, 0.8, -0.5, 1.2, 0.9],
      [-0.2, 3.5, 1.1, -1.2, 0.4, 2.0],
      [0.9, 1.8, 2.4, 0.6, -0.8, 1.5],
      [2.5, -0.4, 3.2, 4.1, 1.9, -0.1],
      [0.3, 1.2, -0.9, 2.8, 1.1, 0.7],
      [-1.1, 0.8, 2.2, 1.5, 3.0, 2.4]
    ];

    const result = maxHourglassSum(matrix);
    return {
      gridRows: result.gridRows,
      gridCols: result.gridCols,
      maxSum: Number(result.maxSum.toFixed(2)),
      bestRow: result.bestRow,
      bestCol: result.bestCol,
      hourglassCells: result.cells,
      matrix,
      steps: result.steps
    };
  }

  /**
   * ACC-09: Portfolio Analytics -> Contribution Balance
   * Analyzes signed sequence of portfolio contributions/realized P&Ls to locate points of balance.
   */
  public evaluateContributionBalance(customContributions?: number[]) {
    // Extract actual closed order P&L or positions, or fallback to sample sequence
    let values = customContributions;
    if (!values || values.length === 0) {
      if (store.orders.length > 0) {
        values = store.orders.map((o) => (o.side === 'BUY' ? -o.fees : o.totalValue - o.fees));
      } else {
        values = [-70, 15, 50, 25, -40, 30, 0];
      }
    }

    const result = maxEquilibriumSum(values);
    return {
      values,
      maxEquilibriumSum: result.maxEquilibriumSum,
      bestIndex: result.bestIndex,
      allEquilibriumPoints: result.allEquilibriumPoints,
      totalSum: result.totalSum,
      steps: result.steps
    };
  }

  /**
   * ACC-11: Market Analytics -> Market Breadth
   * Classifies price changes across market components into 'POSITIVE', 'NEGATIVE', 'UNCHANGED'
   * and runs Boyer-Moore voting + verification pass to determine strict majority.
   */
  public async evaluateMarketBreadth() {
    const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA'];
    const classifications: Array<'POSITIVE' | 'NEGATIVE' | 'UNCHANGED'> = [];

    for (const sym of symbols) {
      try {
        const q = await marketDataService.getQuote(sym);
        if (q.change > 0) classifications.push('POSITIVE');
        else if (q.change < 0) classifications.push('NEGATIVE');
        else classifications.push('UNCHANGED');
      } catch {
        classifications.push('UNCHANGED');
      }
    }

    const result = findMajorityElement(classifications);
    return {
      symbolsEvaluated: symbols,
      classifications,
      candidate: result.candidate,
      count: result.count,
      total: result.total,
      percentage: Number(result.percentage.toFixed(1)),
      hasStrictMajority: result.hasMajority,
      threshold: result.threshold,
      steps: result.steps
    };
  }

  /**
   * ACC-13: Natural Sort Order
   * Applies natural sorting to array of identifiers.
   */
  public sortIdentifiers(identifiers: string[]) {
    return naturalSort(identifiers);
  }
}

export const marketAnalyticsService = new MarketAnalyticsService();
