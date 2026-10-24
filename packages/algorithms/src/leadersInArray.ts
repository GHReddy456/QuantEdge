/**
 * Algorithm ID: ACC-10
 * Algorithm: Leaders in Array
 *
 * Problem Definition:
 * An element in an array is called a "Leader" if it is greater than or equal to all the elements
 * to its right side. The rightmost element is always a leader. The algorithm executes a right-to-left
 * linear scan maintaining the maximum value encountered so far.
 *
 * Exported Function:
 * findLeaders(values)
 *
 * Input:
 * values: number[] (array of chronological numerical observations, e.g. stock closing prices)
 *
 * Output:
 * LeadersResult {
 *   values: number[],
 *   leaders: Array<{ value: number, index: number }>,
 *   steps: LeaderStep[]
 * }
 *
 * Time Complexity: O(n) single reverse pass
 * Auxiliary Space: O(k) for k leaders found
 *
 * Business Application:
 * Stock Detail -> Historical Price Leaders.
 * Identifies historical closing price peaks that established new local highs unbroken by subsequent
 * trading days in the observed window.
 * Note: Descriptive historical milestones; does not guarantee future resistance breakouts.
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/leadersInArray.test.ts
 */

export interface LeaderItem {
  value: number;
  index: number;
}

export interface LeaderStep {
  index: number;
  value: number;
  maxToRightSoFar: number;
  isLeader: boolean;
  reason: string;
}

export interface LeadersResult {
  values: number[];
  leaders: LeaderItem[];
  steps: LeaderStep[];
}

export function findLeaders(values: number[]): LeadersResult {
  if (!Array.isArray(values)) {
    throw new Error('Input must be an array of numbers.');
  }

  const n = values.length;
  if (n === 0) {
    return {
      values,
      leaders: [],
      steps: []
    };
  }

  for (let i = 0; i < n; i++) {
    if (typeof values[i] !== 'number' || !Number.isFinite(values[i])) {
      throw new Error(`Invalid number at index ${i}: ${values[i]}`);
    }
  }

  const reversedSteps: LeaderStep[] = [];
  const reversedLeaders: LeaderItem[] = [];

  // Rightmost element is always a leader
  let maxFromRight = values[n - 1];
  reversedLeaders.push({ value: values[n - 1], index: n - 1 });
  reversedSteps.push({
    index: n - 1,
    value: values[n - 1],
    maxToRightSoFar: values[n - 1],
    isLeader: true,
    reason: 'Rightmost element is unconditionally a leader'
  });

  // Scan right to left
  for (let i = n - 2; i >= 0; i--) {
    const val = values[i];
    if (val >= maxFromRight) {
      reversedLeaders.push({ value: val, index: i });
      reversedSteps.push({
        index: i,
        value: val,
        maxToRightSoFar: maxFromRight,
        isLeader: true,
        reason: `${val} >= prior max on right (${maxFromRight})`
      });
      maxFromRight = val;
    } else {
      reversedSteps.push({
        index: i,
        value: val,
        maxToRightSoFar: maxFromRight,
        isLeader: false,
        reason: `${val} < prior max on right (${maxFromRight})`
      });
    }
  }

  // Restore chronological left-to-right order for caller convenience
  const leaders = reversedLeaders.reverse();
  const steps = reversedSteps.reverse();

  return {
    values,
    leaders,
    steps
  };
}
