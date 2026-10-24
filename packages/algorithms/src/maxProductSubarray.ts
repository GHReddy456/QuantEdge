/**
 * Algorithm ID: ACC-07
 * Algorithm: Maximum Product Subarray
 *
 * Problem Definition:
 * Find the contiguous non-empty subarray within a one-dimensional array of numbers that has the
 * largest product. The algorithm maintains both the running maximum and minimum products ending
 * at each index to handle sign flips resulting from negative numbers.
 *
 * Exported Function:
 * maxProductSubarray(values)
 *
 * Input:
 * values: number[] (array of numbers, such as decimal return multipliers 1 + r or values)
 *
 * Output:
 * MaxProductResult {
 *   maxProduct: number,
 *   startIndex: number,
 *   endIndex: number,
 *   subarray: number[],
 *   compoundedReturnPercent: number,
 *   steps: MaxProductStep[]
 * }
 *
 * Time Complexity: O(n) linear single-pass scan
 * Auxiliary Space: O(1) auxiliary (O(n) for trace tracking)
 *
 * Business Application:
 * Stock Analytics -> Best Compounded-Return Window.
 * Identifies the historical contiguous time window that generated the maximum cumulative
 * compounded growth (where each element is a return multiplier 1 + r for period return r).
 * Note: Analyzes historical return multipliers; does not multiply raw share prices.
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/maxProductSubarray.test.ts
 */

export interface MaxProductStep {
  index: number;
  value: number;
  maxEndingHere: number;
  minEndingHere: number;
  maxSoFar: number;
  startWindow: number;
  endWindow: number;
}

export interface MaxProductResult {
  values: number[];
  maxProduct: number;
  startIndex: number;
  endIndex: number;
  subarray: number[];
  compoundedReturnPercent: number;
  steps: MaxProductStep[];
}

export function maxProductSubarray(values: number[]): MaxProductResult {
  if (!Array.isArray(values)) {
    throw new Error('Input must be an array of numbers.');
  }

  const n = values.length;
  if (n === 0) {
    return {
      values,
      maxProduct: 0,
      startIndex: -1,
      endIndex: -1,
      subarray: [],
      compoundedReturnPercent: 0,
      steps: []
    };
  }

  for (let i = 0; i < n; i++) {
    if (typeof values[i] !== 'number' || !Number.isFinite(values[i])) {
      throw new Error(`Invalid number at index ${i}: ${values[i]}`);
    }
  }

  const steps: MaxProductStep[] = [];

  let maxEndingHere = values[0];
  let minEndingHere = values[0];
  let maxSoFar = values[0];

  let currentMaxStart = 0;
  let currentMinStart = 0;
  let bestStart = 0;
  let bestEnd = 0;

  steps.push({
    index: 0,
    value: values[0],
    maxEndingHere,
    minEndingHere,
    maxSoFar,
    startWindow: bestStart,
    endWindow: bestEnd
  });

  for (let i = 1; i < n; i++) {
    const val = values[i];

    let newMaxEndingHere: number;
    let newMinEndingHere: number;
    let nextMaxStart = i;
    let nextMinStart = i;

    if (val > 0) {
      if (maxEndingHere * val > val) {
        newMaxEndingHere = maxEndingHere * val;
        nextMaxStart = currentMaxStart;
      } else {
        newMaxEndingHere = val;
        nextMaxStart = i;
      }

      if (minEndingHere * val < val) {
        newMinEndingHere = minEndingHere * val;
        nextMinStart = currentMinStart;
      } else {
        newMinEndingHere = val;
        nextMinStart = i;
      }
    } else if (val < 0) {
      if (minEndingHere * val > val) {
        newMaxEndingHere = minEndingHere * val;
        nextMaxStart = currentMinStart;
      } else {
        newMaxEndingHere = val;
        nextMaxStart = i;
      }

      if (maxEndingHere * val < val) {
        newMinEndingHere = maxEndingHere * val;
        nextMinStart = currentMaxStart;
      } else {
        newMinEndingHere = val;
        nextMinStart = i;
      }
    } else {
      // val === 0
      newMaxEndingHere = 0;
      newMinEndingHere = 0;
      nextMaxStart = i;
      nextMinStart = i;
    }

    maxEndingHere = newMaxEndingHere;
    minEndingHere = newMinEndingHere;
    currentMaxStart = nextMaxStart;
    currentMinStart = nextMinStart;

    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      bestStart = currentMaxStart;
      bestEnd = i;
    }

    steps.push({
      index: i,
      value: val,
      maxEndingHere,
      minEndingHere,
      maxSoFar,
      startWindow: bestStart,
      endWindow: bestEnd
    });
  }

  const subarray = values.slice(bestStart, bestEnd + 1);
  // If analyzing multipliers where baseline is 1.0, return percentage is (maxProduct - 1) * 100
  const compoundedReturnPercent = (maxSoFar - 1) * 100;

  return {
    values,
    maxProduct: maxSoFar,
    startIndex: bestStart,
    endIndex: bestEnd,
    subarray,
    compoundedReturnPercent,
    steps
  };
}
