/**
 * Algorithm ID: ACC-03
 * Algorithm: Karatsuba Algorithm
 *
 * Problem Definition:
 * Fast divide-and-conquer multiplication of two large integers by splitting operands into high
 * and low halves and computing only 3 recursive multiplications instead of 4:
 * z2 = high1 * high2, z0 = low1 * low2, z1 = (high1 + low1) * (high2 + low2) - z2 - z0.
 *
 * Exported Function:
 * karatsubaMultiply(a, b)
 *
 * Input:
 * a: bigint | string | number
 * b: bigint | string | number
 *
 * Output:
 * KaratsubaResult { product: string, steps: KaratsubaStep[], comparisons: number }
 *
 * Time Complexity: O(n^1.585) (i.e. O(n^(log2(3))))
 * Auxiliary Space: O(n) call stack and intermediate bigints
 *
 * Business Application:
 * Algorithm Lab -> Large Integer Benchmark.
 * Demonstrates high-precision integer arithmetic for cryptographic or ultra-precise
 * non-floating-point financial computations with documented asymptotic efficiency.
 *
 * Caller:
 * apps/api/src/services/algorithm-execution.service.ts
 *
 * Tests:
 * packages/algorithms/tests/karatsuba.test.ts
 */

export interface KaratsubaStep {
  depth: number;
  a: string;
  b: string;
  operation: string;
  detail: string;
}

export interface KaratsubaResult {
  a: string;
  b: string;
  product: string;
  steps: KaratsubaStep[];
  comparisons: number;
  asymptoticComplexity: string;
}

export function karatsubaMultiply(
  inputA: bigint | string | number,
  inputB: bigint | string | number
): KaratsubaResult {
  const parseBigInt = (val: bigint | string | number): bigint => {
    if (typeof val === 'bigint') return val;
    if (typeof val === 'number') {
      if (!Number.isSafeInteger(val)) {
        throw new Error('Number exceeds safe integer limits; pass as bigint or string.');
      }
      return BigInt(val);
    }
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!/^-?\d+$/.test(trimmed)) {
        throw new Error(`Invalid integer string format: "${val}"`);
      }
      return BigInt(trimmed);
    }
    throw new Error('Unsupported input type for Karatsuba multiplication.');
  };

  const a = parseBigInt(inputA);
  const b = parseBigInt(inputB);

  // Handle signs
  const isNegative = (a < 0n && b > 0n) || (a > 0n && b < 0n);
  const absA = a < 0n ? -a : a;
  const absB = b < 0n ? -b : b;

  const steps: KaratsubaStep[] = [];
  let comparisonCount = 0;

  function recursiveMultiply(x: bigint, y: bigint, depth: number): bigint {
    comparisonCount++;
    // Base case: small integers (e.g. less than 100)
    if (x < 100n || y < 100n) {
      const prod = x * y;
      if (depth <= 4) {
        steps.push({
          depth,
          a: x.toString(),
          b: y.toString(),
          operation: 'BASE_CASE',
          detail: `${x} * ${y} = ${prod}`
        });
      }
      return prod;
    }

    const strX = x.toString();
    const strY = y.toString();
    const n = Math.max(strX.length, strY.length);
    const m = Math.floor(n / 2);
    const base = 10n ** BigInt(m);

    const high1 = x / base;
    const low1 = x % base;
    const high2 = y / base;
    const low2 = y % base;

    if (depth <= 3) {
      steps.push({
        depth,
        a: x.toString(),
        b: y.toString(),
        operation: 'SPLIT',
        detail: `Split at m=${m}: high1=${high1}, low1=${low1}, high2=${high2}, low2=${low2}`
      });
    }

    // 3 Karatsuba recursive multiplications
    const z0 = recursiveMultiply(low1, low2, depth + 1);
    const z2 = recursiveMultiply(high1, high2, depth + 1);
    const z1 = recursiveMultiply(high1 + low1, high2 + low2, depth + 1) - z2 - z0;

    const result = z2 * (10n ** BigInt(2 * m)) + z1 * base + z0;

    if (depth <= 3) {
      steps.push({
        depth,
        a: x.toString(),
        b: y.toString(),
        operation: 'COMBINE',
        detail: `z2=${z2}, z1=${z1}, z0=${z0} => product=${result}`
      });
    }

    return result;
  }

  const rawProduct = recursiveMultiply(absA, absB, 0);
  const finalProduct = isNegative ? -rawProduct : rawProduct;

  return {
    a: a.toString(),
    b: b.toString(),
    product: finalProduct.toString(),
    steps,
    comparisons: comparisonCount,
    asymptoticComplexity: 'O(n^1.585)'
  };
}
