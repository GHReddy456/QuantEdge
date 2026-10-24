/**
 * Algorithm ID: ACC-13
 * Algorithm: Natural Sort Order
 *
 * Problem Definition:
 * Sort an array of strings in "natural order" where multi-digit numbers embedded within strings
 * are treated as single numerical values rather than sequences of individual ASCII characters
 * (e.g., "STOCK-2" sorts before "STOCK-10"). Implements chunking into alternating text and numeric
 * tokens with numeric comparison for digit chunks and lexicographic comparison for text chunks.
 *
 * Exported Function:
 * naturalSort(values)
 *
 * Input:
 * values: string[] (array of strings to sort)
 *
 * Output:
 * NaturalSortResult {
 *   original: string[],
 *   sorted: string[],
 *   chunksMap: Record<string, Array<string | number>>,
 *   comparisons: number
 * }
 *
 * Time Complexity: O(n log n * m) where n is array length and m is average string length
 * Auxiliary Space: O(n * m) for storing parsed token chunks
 *
 * Business Application:
 * Markets, stock search results, watchlists, order history, and Algorithm Registry.
 * Guarantees human-friendly ordering of ticker symbols, serial numbers, lot identifiers,
 * and portfolio lot tags (e.g. INF-2 before INF-10).
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/naturalSort.test.ts
 */

export interface NaturalSortResult {
  original: string[];
  sorted: string[];
  chunksMap: Record<string, Array<string | number>>;
  comparisons: number;
}

export function splitIntoChunks(str: string): Array<string | number> {
  const regex = /(\d+|\D+)/g;
  const matches = str.match(regex) || [];
  return matches.map((chunk) => {
    if (/^\d+$/.test(chunk)) {
      return Number(chunk);
    }
    return chunk.toLowerCase();
  });
}

export function compareNatural(a: string, b: string): number {
  const chunksA = splitIntoChunks(a);
  const chunksB = splitIntoChunks(b);
  const minLen = Math.min(chunksA.length, chunksB.length);

  for (let i = 0; i < minLen; i++) {
    const chunkA = chunksA[i];
    const chunkB = chunksB[i];

    if (typeof chunkA === 'number' && typeof chunkB === 'number') {
      if (chunkA !== chunkB) {
        return chunkA - chunkB;
      }
    } else {
      const strA = String(chunkA);
      const strB = String(chunkB);
      if (strA !== strB) {
        return strA.localeCompare(strB);
      }
    }
  }

  return chunksA.length - chunksB.length;
}

export function naturalSort(values: string[]): NaturalSortResult {
  if (!Array.isArray(values)) {
    throw new Error('Input must be an array of strings.');
  }

  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== 'string') {
      throw new Error(`Item at index ${i} is not a string: ${values[i]}`);
    }
  }

  const original = [...values];
  const chunksMap: Record<string, Array<string | number>> = {};
  for (const str of values) {
    if (!chunksMap[str]) {
      chunksMap[str] = splitIntoChunks(str);
    }
  }

  let comparisons = 0;

  // Use a stable sort with index fallback
  const indexed = values.map((val, idx) => ({ val, idx }));

  indexed.sort((a, b) => {
    comparisons++;
    const chunksA = chunksMap[a.val];
    const chunksB = chunksMap[b.val];
    const minLen = Math.min(chunksA.length, chunksB.length);

    for (let i = 0; i < minLen; i++) {
      const cA = chunksA[i];
      const cB = chunksB[i];

      if (typeof cA === 'number' && typeof cB === 'number') {
        if (cA !== cB) {
          return cA - cB;
        }
      } else {
        const sA = String(cA);
        const sB = String(cB);
        if (sA !== sB) {
          return sA.localeCompare(sB);
        }
      }
    }

    if (chunksA.length !== chunksB.length) {
      return chunksA.length - chunksB.length;
    }

    // Preserve original index for stability
    return a.idx - b.idx;
  });

  return {
    original,
    sorted: indexed.map((item) => item.val),
    chunksMap,
    comparisons
  };
}
