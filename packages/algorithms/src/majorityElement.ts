/**
 * Algorithm ID: ACC-11
 * Algorithm: Majority Element
 *
 * Problem Definition:
 * Find the majority element in an array—an element that appears strictly more than n / 2 times.
 * Implements Boyer-Moore Majority Voting Algorithm in Pass 1 to locate a candidate in O(n) time
 * and O(1) space, followed by a second verification pass in Pass 2 to confirm true majority status.
 *
 * Exported Function:
 * findMajorityElement(values)
 *
 * Input:
 * values: T[] (array of items, such as market breadth classifications 'POSITIVE' | 'NEGATIVE' | 'UNCHANGED')
 *
 * Output:
 * MajorityResult<T> {
 *   values: T[],
 *   candidate: T | null,
 *   count: number,
 *   percentage: number,
 *   hasMajority: boolean,
 *   total: number,
 *   steps: MajorityStep<T>[]
 * }
 *
 * Time Complexity: O(n) (two linear passes)
 * Auxiliary Space: O(1) auxiliary (O(n) for trace)
 *
 * Business Application:
 * Market Analytics -> Market Breadth.
 * Classifies market index components or historical daily returns into categories (Positive, Negative,
 * Unchanged) and determines whether a statistically verified directional majority dominated the session.
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/majorityElement.test.ts
 */

export interface MajorityStep<T> {
  pass: number;
  index: number;
  element: T;
  currentCandidate: T | null;
  countScore: number;
  description: string;
}

export interface MajorityResult<T> {
  values: T[];
  candidate: T | null;
  count: number;
  percentage: number;
  hasMajority: boolean;
  total: number;
  threshold: number;
  steps: MajorityStep<T>[];
}

export function findMajorityElement<T>(values: T[]): MajorityResult<T> {
  if (!Array.isArray(values)) {
    throw new Error('Input must be an array.');
  }

  const n = values.length;
  if (n === 0) {
    return {
      values,
      candidate: null,
      count: 0,
      percentage: 0,
      hasMajority: false,
      total: 0,
      threshold: 0,
      steps: []
    };
  }

  const steps: MajorityStep<T>[] = [];
  let candidate: T | null = null;
  let votes = 0;

  // Pass 1: Boyer-Moore Voting
  for (let i = 0; i < n; i++) {
    const el = values[i];
    if (votes === 0) {
      candidate = el;
      votes = 1;
      steps.push({
        pass: 1,
        index: i,
        element: el,
        currentCandidate: candidate,
        countScore: votes,
        description: `Votes dropped to zero; new candidate elected: ${String(el)}`
      });
    } else if (candidate === el) {
      votes++;
      steps.push({
        pass: 1,
        index: i,
        element: el,
        currentCandidate: candidate,
        countScore: votes,
        description: `Element matches candidate; vote score incremented to ${votes}`
      });
    } else {
      votes--;
      steps.push({
        pass: 1,
        index: i,
        element: el,
        currentCandidate: candidate,
        countScore: votes,
        description: `Element opposes candidate; vote score decremented to ${votes}`
      });
    }
  }

  // Pass 2: Strict Frequency Verification
  let actualCount = 0;
  for (let i = 0; i < n; i++) {
    if (values[i] === candidate) {
      actualCount++;
    }
  }

  const threshold = Math.floor(n / 2) + 1;
  const hasMajority = actualCount >= threshold;
  const percentage = (actualCount / n) * 100;

  steps.push({
    pass: 2,
    index: n,
    element: candidate as T,
    currentCandidate: candidate,
    countScore: actualCount,
    description: `Pass 2 Verification: count = ${actualCount}/${n} (${percentage.toFixed(1)}%). Requires strictly > ${n / 2} (${threshold} minimum). Result: ${hasMajority ? 'CONFIRMED MAJORITY' : 'NO MAJORITY'}`
  });

  return {
    values,
    candidate: hasMajority ? candidate : null,
    count: actualCount,
    percentage,
    hasMajority,
    total: n,
    threshold,
    steps
  };
}
