/**
 * Algorithm ID: ACC-09
 * Algorithm: Maximum Equilibrium Sum
 *
 * Problem Definition:
 * Find the equilibrium position(s) in an array where the sum of elements before the position equals
 * the sum of elements after it (empty partitions evaluate to 0). If multiple equilibrium points
 * exist, return the one yielding the maximum equilibrium sum.
 *
 * Exported Function:
 * maxEquilibriumSum(values)
 *
 * Input:
 * values: number[] (array of signed numbers, e.g. signed portfolio P&L contributions)
 *
 * Output:
 * EquilibriumResult {
 *   maxEquilibriumSum: number | null,
 *   bestIndex: number | null,
 *   allEquilibriumPoints: EquilibriumPoint[],
 *   totalSum: number,
 *   steps: EquilibriumStep[]
 * }
 *
 * Time Complexity: O(n) using total sum and running prefix sum
 * Auxiliary Space: O(1) auxiliary (O(n) for trace recording)
 *
 * Business Application:
 * Portfolio Analytics -> Contribution Balance.
 * Analyzes an ordered sequence of signed asset contributions or trade P&Ls to identify points of
 * balance where accumulated prior gains/losses match subsequent contributions.
 * Note: Educational diagnostic; not a modern portfolio allocation optimizer.
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/maxEquilibriumSum.test.ts
 */

export interface EquilibriumPoint {
  index: number;
  value: number;
  leftSum: number;
  rightSum: number;
  equilibriumSum: number;
}

export interface EquilibriumStep {
  index: number;
  value: number;
  leftSum: number;
  rightSum: number;
  isEquilibrium: boolean;
}

export interface EquilibriumResult {
  values: number[];
  maxEquilibriumSum: number | null;
  bestIndex: number | null;
  allEquilibriumPoints: EquilibriumPoint[];
  totalSum: number;
  steps: EquilibriumStep[];
}

export function maxEquilibriumSum(values: number[]): EquilibriumResult {
  if (!Array.isArray(values)) {
    throw new Error('Input must be an array of numbers.');
  }

  const n = values.length;
  if (n === 0) {
    return {
      values,
      maxEquilibriumSum: null,
      bestIndex: null,
      allEquilibriumPoints: [],
      totalSum: 0,
      steps: []
    };
  }

  for (let i = 0; i < n; i++) {
    if (typeof values[i] !== 'number' || !Number.isFinite(values[i])) {
      throw new Error(`Invalid number at index ${i}: ${values[i]}`);
    }
  }

  const totalSum = values.reduce((acc, v) => acc + v, 0);
  const steps: EquilibriumStep[] = [];
  const allPoints: EquilibriumPoint[] = [];

  let runningLeftSum = 0;
  let maxEqSum: number | null = null;
  let bestIdx: number | null = null;

  for (let i = 0; i < n; i++) {
    const val = values[i];
    const rightSum = totalSum - runningLeftSum - val;

    // Check if left sum equals right sum
    // Standard floating-point tolerance check for decimal safety
    const isEquilibrium = Math.abs(runningLeftSum - rightSum) < 1e-9;

    if (isEquilibrium) {
      allPoints.push({
        index: i,
        value: val,
        leftSum: runningLeftSum,
        rightSum,
        equilibriumSum: runningLeftSum
      });

      if (maxEqSum === null || runningLeftSum > maxEqSum) {
        maxEqSum = runningLeftSum;
        bestIdx = i;
      }
    }

    steps.push({
      index: i,
      value: val,
      leftSum: runningLeftSum,
      rightSum,
      isEquilibrium
    });

    runningLeftSum += val;
  }

  return {
    values,
    maxEquilibriumSum: maxEqSum,
    bestIndex: bestIdx,
    allEquilibriumPoints: allPoints,
    totalSum,
    steps
  };
}
