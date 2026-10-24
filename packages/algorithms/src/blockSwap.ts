/**
 * Algorithm ID: ACC-06
 * Algorithm: Block Swap Algorithm
 *
 * Problem Definition:
 * Rotate an array of size n to the left by d positions in O(n) time and O(1) auxiliary space
 * using block swapping of disjoint subarrays without allocating a secondary buffer.
 *
 * Exported Function:
 * rotateLeftBlockSwap(array, rotationCount)
 *
 * Input:
 * array: T[] (array of items to rotate)
 * rotationCount: number (number of left positions to rotate, integer >= 0)
 *
 * Output:
 * BlockSwapResult<T> {
 *   original: T[],
 *   rotated: T[],
 *   rotationCount: number,
 *   effectiveRotation: number,
 *   swapsPerformed: number,
 *   steps: BlockSwapStep[]
 * }
 *
 * Time Complexity: O(n) total elements swapped
 * Auxiliary Space: O(1) in-place algorithm (trace records references for inspection)
 *
 * Business Application:
 * Analytics -> Rolling Sample Window.
 * Demonstrates in-place rotation of a fixed-size market observation sample buffer (e.g. rotating
 * a rolling 20-candle window for technical indicators while preserving contiguous memory layout).
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/blockSwap.test.ts
 */

export interface BlockSwapStep {
  step: number;
  operation: string;
  startIndexA: number;
  startIndexB: number;
  blockSize: number;
  description: string;
}

export interface BlockSwapResult<T> {
  original: T[];
  rotated: T[];
  rotationCount: number;
  effectiveRotation: number;
  swapsPerformed: number;
  steps: BlockSwapStep[];
}

export function rotateLeftBlockSwap<T>(array: T[], rotationCount: number): BlockSwapResult<T> {
  if (!Array.isArray(array)) {
    throw new Error('Input must be an array.');
  }
  if (!Number.isInteger(rotationCount) || rotationCount < 0) {
    throw new Error('rotationCount must be a non-negative integer.');
  }

  const originalCopy = [...array];
  const n = array.length;

  if (n <= 1 || rotationCount === 0) {
    return {
      original: originalCopy,
      rotated: [...array],
      rotationCount,
      effectiveRotation: 0,
      swapsPerformed: 0,
      steps: []
    };
  }

  const d = rotationCount % n;
  if (d === 0) {
    return {
      original: originalCopy,
      rotated: [...array],
      rotationCount,
      effectiveRotation: 0,
      swapsPerformed: 0,
      steps: []
    };
  }

  const steps: BlockSwapStep[] = [];
  let swapCount = 0;

  // Swap block arr[startA..startA + size - 1] with arr[startB..startB + size - 1]
  function swapBlocks(arr: T[], startA: number, startB: number, size: number) {
    swapCount += size;
    for (let i = 0; i < size; i++) {
      const temp = arr[startA + i];
      arr[startA + i] = arr[startB + i];
      arr[startB + i] = temp;
    }
    steps.push({
      step: steps.length + 1,
      operation: 'SWAP_BLOCKS',
      startIndexA: startA,
      startIndexB: startB,
      blockSize: size,
      description: `Swapped ${size} element(s) between indices [${startA}..${startA + size - 1}] and [${startB}..${startB + size - 1}]`
    });
  }

  // Iterative block-swap rotation
  let i = d;
  let j = n - d;
  let offset = 0;

  while (i !== j) {
    if (i < j) {
      // A is shorter than B: swap A with the last i elements of B
      swapBlocks(array, offset, offset + i + j - i, i);
      j -= i;
    } else {
      // B is shorter than A: swap B with the first j elements of A
      swapBlocks(array, offset, offset + i, j);
      offset += j;
      i -= j;
    }
  }

  // When i == j, swap the two equal blocks
  swapBlocks(array, offset, offset + i, i);

  return {
    original: originalCopy,
    rotated: array,
    rotationCount,
    effectiveRotation: d,
    swapsPerformed: swapCount,
    steps
  };
}
