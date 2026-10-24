/**
 * Algorithm ID: ACC-02
 * Algorithm: Euclid's Algorithm
 *
 * Problem Definition:
 * Compute the Greatest Common Divisor (GCD) of two non-negative integers using the iterative
 * Euclidean algorithm based on the principle that the GCD of two numbers also divides their remainder.
 *
 * Exported Function:
 * gcd(a, b)
 *
 * Input:
 * a: number (non-negative integer)
 * b: number (non-negative integer)
 *
 * Output:
 * EuclidResult { gcd: number, steps: EuclidStep[], iterations: number }
 *
 * Time Complexity: O(log(min(a, b)))
 * Auxiliary Space: O(log(min(a, b))) for step trace
 *
 * Business Application:
 * Analytics -> Sampling Interval Analysis.
 * Calculates common base divisor for multi-timeframe candle aggregations (e.g., finding the GCD
 * between 15-minute and 30-minute intervals = 15 minutes, or 60m and 240m = 60m).
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/euclid.test.ts
 */

export interface EuclidStep {
  step: number;
  a: number;
  b: number;
  quotient: number;
  remainder: number;
  equation: string;
}

export interface EuclidResult {
  a: number;
  b: number;
  gcd: number;
  steps: EuclidStep[];
  iterations: number;
}

export function gcd(a: number, b: number): EuclidResult {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error('Operands for Euclidean GCD must be integers.');
  }

  let x = Math.abs(a);
  let y = Math.abs(b);
  const steps: EuclidStep[] = [];
  let stepCount = 0;

  if (x === 0 && y === 0) {
    return { a, b, gcd: 0, steps: [], iterations: 0 };
  }
  if (x === 0) {
    return { a, b, gcd: y, steps: [], iterations: 0 };
  }
  if (y === 0) {
    return { a, b, gcd: x, steps: [], iterations: 0 };
  }

  while (y !== 0) {
    stepCount++;
    const quotient = Math.floor(x / y);
    const remainder = x % y;

    steps.push({
      step: stepCount,
      a: x,
      b: y,
      quotient,
      remainder,
      equation: `${x} = ${quotient} * ${y} + ${remainder}`
    });

    x = y;
    y = remainder;
  }

  return {
    a,
    b,
    gcd: x,
    steps,
    iterations: stepCount
  };
}
