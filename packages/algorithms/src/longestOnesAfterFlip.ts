/**
 * Algorithm ID: ACC-04
 * Algorithm: Longest Sequence of 1 After Flipping a Bit
 *
 * Problem Definition:
 * Given a binary array (elements 0 or 1), find the maximum length of consecutive 1s that can be
 * achieved by flipping at most one 0 to a 1.
 *
 * Exported Function:
 * longestOnesAfterFlip(bits)
 *
 * Input:
 * bits: number[] (array of 0s and 1s)
 *
 * Output:
 * LongestOnesResult {
 *   maxSequenceLength: number,
 *   bestFlipIndex: number,
 *   windowStart: number,
 *   windowEnd: number,
 *   steps: FlipStep[]
 * }
 *
 * Time Complexity: O(n) linear sliding window pass
 * Auxiliary Space: O(1) auxiliary (O(n) for trace)
 *
 * Business Application:
 * Algorithm Lab -> Binary Signal Tolerance.
 * Evaluates tolerance to temporary data gaps in binary status signals (e.g. market feed uptime or
 * packet drop indicators), determining the maximum continuous active window with single fault tolerance.
 * Note: Purely hypothetical bit-flip; does not alter underlying financial market recordings.
 *
 * Caller:
 * apps/api/src/services/algorithm-execution.service.ts
 *
 * Tests:
 * packages/algorithms/tests/longestOnesAfterFlip.test.ts
 */

export interface FlipStep {
  index: number;
  bit: number;
  windowLeft: number;
  windowRight: number;
  zerosInWindow: number;
  currentLength: number;
  bestLengthSoFar: number;
}

export interface LongestOnesResult {
  bits: number[];
  maxSequenceLength: number;
  bestFlipIndex: number;
  windowStart: number;
  windowEnd: number;
  steps: FlipStep[];
}

export function longestOnesAfterFlip(bits: number[]): LongestOnesResult {
  if (!Array.isArray(bits)) {
    throw new Error('Input must be an array of bits (0 or 1).');
  }

  for (let i = 0; i < bits.length; i++) {
    const bit = bits[i];
    if (bit !== 0 && bit !== 1) {
      throw new Error(`Invalid bit at index ${i}: expected 0 or 1, got ${bit}`);
    }
  }

  const n = bits.length;
  if (n === 0) {
    return {
      bits,
      maxSequenceLength: 0,
      bestFlipIndex: -1,
      windowStart: -1,
      windowEnd: -1,
      steps: []
    };
  }

  const steps: FlipStep[] = [];
  let left = 0;
  let zeroCount = 0;
  let lastZeroIndex = -1;
  let maxLength = 0;
  let bestFlipIndex = -1;
  let bestStart = 0;
  let bestEnd = 0;

  for (let right = 0; right < n; right++) {
    if (bits[right] === 0) {
      zeroCount++;
    }

    // Shrink window from left if more than 1 zero in current window
    while (zeroCount > 1) {
      if (bits[left] === 0) {
        zeroCount--;
      }
      left++;
    }

    const currentLen = right - left + 1;
    if (currentLen > maxLength) {
      maxLength = currentLen;
      bestStart = left;
      bestEnd = right;

      // Identify which zero in window [left, right] was hypothetically flipped
      let zeroPos = -1;
      for (let k = left; k <= right; k++) {
        if (bits[k] === 0) {
          zeroPos = k;
          break;
        }
      }
      bestFlipIndex = zeroPos;
    }

    steps.push({
      index: right,
      bit: bits[right],
      windowLeft: left,
      windowRight: right,
      zerosInWindow: zeroCount,
      currentLength: currentLen,
      bestLengthSoFar: maxLength
    });
  }

  return {
    bits,
    maxSequenceLength: maxLength,
    bestFlipIndex,
    windowStart: bestStart,
    windowEnd: bestEnd,
    steps
  };
}
