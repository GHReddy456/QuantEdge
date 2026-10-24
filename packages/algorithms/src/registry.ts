/**
 * QuantEdge Algorithm Registry
 * Defines full metadata and typed runner dispatchers for all 13 core algorithms.
 */

import { boothMultiply } from './booth.js';
import { gcd } from './euclid.js';
import { karatsubaMultiply } from './karatsuba.js';
import { longestOnesAfterFlip } from './longestOnesAfterFlip.js';
import { swapNibbles } from './swapNibbles.js';
import { rotateLeftBlockSwap } from './blockSwap.js';
import { maxProductSubarray } from './maxProductSubarray.js';
import { maxHourglassSum } from './maxHourglassSum.js';
import { maxEquilibriumSum } from './maxEquilibriumSum.js';
import { findLeaders } from './leadersInArray.js';
import { findMajorityElement } from './majorityElement.js';
import { lexicographicallyFirstPalindrome } from './lexicographicPalindrome.js';
import { naturalSort } from './naturalSort.js';

export interface AlgorithmMetadata {
  id: string;
  slug: string;
  name: string;
  category: 'Arithmetic' | 'Array Processing' | 'Dynamic Programming' | 'Bit Manipulation' | 'String Processing';
  description: string;
  problemStatement: string;
  sourceFile: string;
  exportedFunction: string;
  testFile: string;
  applicationUseCase: string;
  actualCaller: string;
  route: string;
  timeComplexity: string;
  spaceComplexity: string;
  inputSchema: {
    description: string;
    fields: Array<{
      name: string;
      type: string;
      defaultValue: any;
      description: string;
    }>;
    examplePayload: any;
  };
  outputSchema: {
    description: string;
    fields: string[];
  };
  execute: (input: any) => any;
}

export const ALGORITHM_REGISTRY: AlgorithmMetadata[] = [
  {
    id: 'ACC-01',
    slug: 'booth',
    name: "Booth's Multiplication Algorithm",
    category: 'Arithmetic',
    description: "Signed two's-complement multiplication with explicit register tracking and arithmetic shifts.",
    problemStatement: "Multiplies two signed integers using Booth's encoding, reducing addition steps for consecutive ones.",
    sourceFile: 'packages/algorithms/src/booth.ts',
    exportedFunction: 'boothMultiply',
    testFile: 'packages/algorithms/tests/booth.test.ts',
    applicationUseCase: 'Algorithm Lab -> Fixed-Width Signed Arithmetic',
    actualCaller: 'apps/api/src/services/algorithm-execution.service.ts',
    route: '/algorithms/booth',
    timeComplexity: 'O(n) where n is bit width',
    spaceComplexity: 'O(n) for trace recording',
    inputSchema: {
      description: 'Signed multiplicand, multiplier, and bit width (4-16)',
      fields: [
        { name: 'a', type: 'number', defaultValue: 7, description: 'Multiplicand (signed integer)' },
        { name: 'b', type: 'number', defaultValue: -3, description: 'Multiplier (signed integer)' },
        { name: 'bitWidth', type: 'number', defaultValue: 8, description: 'Register bit width (4..16)' }
      ],
      examplePayload: { a: 7, b: -3, bitWidth: 8 }
    },
    outputSchema: {
      description: 'Resulting signed product and step-by-step register states',
      fields: ['product', 'binaryProduct', 'steps', 'overflow']
    },
    execute: (input: any) => boothMultiply(Number(input.a), Number(input.b), input.bitWidth ? Number(input.bitWidth) : 8)
  },
  {
    id: 'ACC-02',
    slug: 'euclid',
    name: "Euclid's GCD Algorithm",
    category: 'Arithmetic',
    description: "Iterative Euclidean algorithm to find the greatest common divisor of sampling intervals.",
    problemStatement: "Computes the greatest common divisor of two integers through successive modulo remainder operations.",
    sourceFile: 'packages/algorithms/src/euclid.ts',
    exportedFunction: 'gcd',
    testFile: 'packages/algorithms/tests/euclid.test.ts',
    applicationUseCase: 'Analytics -> Sampling Interval Analysis',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/euclid',
    timeComplexity: 'O(log(min(a, b)))',
    spaceComplexity: 'O(log(min(a, b))) for trace',
    inputSchema: {
      description: 'Two candle time intervals in minutes',
      fields: [
        { name: 'a', type: 'number', defaultValue: 15, description: 'First sampling interval in minutes' },
        { name: 'b', type: 'number', defaultValue: 30, description: 'Second sampling interval in minutes' }
      ],
      examplePayload: { a: 15, b: 30 }
    },
    outputSchema: {
      description: 'Greatest common divisor interval and division equations',
      fields: ['gcd', 'steps', 'iterations']
    },
    execute: (input: any) => gcd(Number(input.a), Number(input.b))
  },
  {
    id: 'ACC-03',
    slug: 'karatsuba',
    name: 'Karatsuba Fast Multiplication',
    category: 'Arithmetic',
    description: 'Recursive divide-and-conquer multiplication algorithm using 3 sub-products.',
    problemStatement: 'Multiplies arbitrarily large integers in sub-quadratic time using bigint precision.',
    sourceFile: 'packages/algorithms/src/karatsuba.ts',
    exportedFunction: 'karatsubaMultiply',
    testFile: 'packages/algorithms/tests/karatsuba.test.ts',
    applicationUseCase: 'Algorithm Lab -> Large Integer Benchmark',
    actualCaller: 'apps/api/src/services/algorithm-execution.service.ts',
    route: '/algorithms/karatsuba',
    timeComplexity: 'O(n^1.585)',
    spaceComplexity: 'O(n) recursive stack',
    inputSchema: {
      description: 'Two large integers or numeric strings',
      fields: [
        { name: 'a', type: 'string', defaultValue: '1234567890123456', description: 'Large integer A' },
        { name: 'b', type: 'string', defaultValue: '9876543210987654', description: 'Large integer B' }
      ],
      examplePayload: { a: '1234567890123456', b: '9876543210987654' }
    },
    outputSchema: {
      description: 'High-precision product string and recursive trace',
      fields: ['product', 'steps', 'comparisons', 'asymptoticComplexity']
    },
    execute: (input: any) => karatsubaMultiply(input.a, input.b)
  },
  {
    id: 'ACC-04',
    slug: 'longest-ones-flip',
    name: 'Longest Sequence of 1s After Flipping a Bit',
    category: 'Bit Manipulation',
    description: 'Sliding window algorithm to find the longest sequence of ones achievable by flipping at most one zero.',
    problemStatement: 'Locates the largest contiguous subarray containing at most one 0 in a binary sequence.',
    sourceFile: 'packages/algorithms/src/longestOnesAfterFlip.ts',
    exportedFunction: 'longestOnesAfterFlip',
    testFile: 'packages/algorithms/tests/longestOnesAfterFlip.test.ts',
    applicationUseCase: 'Algorithm Lab -> Binary Signal Tolerance',
    actualCaller: 'apps/api/src/services/algorithm-execution.service.ts',
    route: '/algorithms/longest-ones-flip',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) auxiliary',
    inputSchema: {
      description: 'Array of binary bits (0 or 1)',
      fields: [
        { name: 'bits', type: 'array', defaultValue: [1, 1, 0, 1, 1, 0, 1, 1, 1], description: 'Binary sequence' }
      ],
      examplePayload: { bits: [1, 1, 0, 1, 1, 0, 1, 1, 1] }
    },
    outputSchema: {
      description: 'Maximum sequence length, optimal flip index, and window bounds',
      fields: ['maxSequenceLength', 'bestFlipIndex', 'windowStart', 'windowEnd']
    },
    execute: (input: any) => longestOnesAfterFlip(input.bits)
  },
  {
    id: 'ACC-05',
    slug: 'swap-nibbles',
    name: 'Swap Two Nibbles in a Byte',
    category: 'Bit Manipulation',
    description: 'Exchanges the upper 4 bits and lower 4 bits of an 8-bit byte.',
    problemStatement: 'Transposes the higher and lower nibbles of a byte using bitwise shifts and bitwise OR.',
    sourceFile: 'packages/algorithms/src/swapNibbles.ts',
    exportedFunction: 'swapNibbles',
    testFile: 'packages/algorithms/tests/swapNibbles.test.ts',
    applicationUseCase: 'Algorithm Lab -> Binary Encoding',
    actualCaller: 'apps/api/src/services/algorithm-execution.service.ts',
    route: '/algorithms/swap-nibbles',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    inputSchema: {
      description: 'Unsigned byte integer (0 to 255)',
      fields: [
        { name: 'byte', type: 'number', defaultValue: 100, description: 'Byte value (0..255)' }
      ],
      examplePayload: { byte: 100 }
    },
    outputSchema: {
      description: 'Swapped byte, binary representation, and hexadecimal values',
      fields: ['swappedByte', 'originalBinary', 'swappedBinary', 'swappedHex']
    },
    execute: (input: any) => swapNibbles(Number(input.byte))
  },
  {
    id: 'ACC-06',
    slug: 'block-swap',
    name: 'Block Swap Array Rotation',
    category: 'Array Processing',
    description: 'In-place array rotation algorithm by disjoint block swapping in O(n) time and O(1) space.',
    problemStatement: 'Rotates an array left by d positions without allocating a secondary buffer.',
    sourceFile: 'packages/algorithms/src/blockSwap.ts',
    exportedFunction: 'rotateLeftBlockSwap',
    testFile: 'packages/algorithms/tests/blockSwap.test.ts',
    applicationUseCase: 'Analytics -> Rolling Sample Window',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/block-swap',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) in-place',
    inputSchema: {
      description: 'Array of elements and rotation offset',
      fields: [
        { name: 'array', type: 'array', defaultValue: [10, 20, 30, 40, 50, 60, 70], description: 'Array to rotate' },
        { name: 'rotationCount', type: 'number', defaultValue: 2, description: 'Positions to rotate left' }
      ],
      examplePayload: { array: [10, 20, 30, 40, 50, 60, 70], rotationCount: 2 }
    },
    outputSchema: {
      description: 'Rotated array, effective rotation, and swap step trace',
      fields: ['rotated', 'effectiveRotation', 'swapsPerformed', 'steps']
    },
    execute: (input: any) => rotateLeftBlockSwap(input.array, Number(input.rotationCount))
  },
  {
    id: 'ACC-07',
    slug: 'max-product-subarray',
    name: 'Maximum Product Subarray',
    category: 'Dynamic Programming',
    description: 'Linear-time algorithm tracking min and max products ending at each position for sign flips.',
    problemStatement: 'Finds the contiguous subarray having the maximum product of numbers or return multipliers.',
    sourceFile: 'packages/algorithms/src/maxProductSubarray.ts',
    exportedFunction: 'maxProductSubarray',
    testFile: 'packages/algorithms/tests/maxProductSubarray.test.ts',
    applicationUseCase: 'Stock Analytics -> Best Compounded-Return Window',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/max-product-subarray',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) auxiliary',
    inputSchema: {
      description: 'Return multipliers (1 + r) or numerical series',
      fields: [
        { name: 'values', type: 'array', defaultValue: [1.02, 1.05, 0.98, 1.04, 1.03, 0.95], description: 'Multiplier series' }
      ],
      examplePayload: { values: [1.02, 1.05, 0.98, 1.04, 1.03, 0.95] }
    },
    outputSchema: {
      description: 'Maximum compounded product, subarray bounds, and compounded return percent',
      fields: ['maxProduct', 'startIndex', 'endIndex', 'compoundedReturnPercent', 'subarray']
    },
    execute: (input: any) => maxProductSubarray(input.values)
  },
  {
    id: 'ACC-08',
    slug: 'max-hourglass-sum',
    name: 'Maximum Sum of Hourglass in Matrix',
    category: 'Array Processing',
    description: 'Evaluates all 7-cell hourglass patterns in a grid to find the maximum localized cluster sum.',
    problemStatement: 'Computes max sum across coordinates [r,c], [r,c+1], [r,c+2], [r+1,c+1], [r+2,c], [r+2,c+1], [r+2,c+2].',
    sourceFile: 'packages/algorithms/src/maxHourglassSum.ts',
    exportedFunction: 'maxHourglassSum',
    testFile: 'packages/algorithms/tests/maxHourglassSum.test.ts',
    applicationUseCase: 'Market Analytics -> Performance Heatmap',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/max-hourglass-sum',
    timeComplexity: 'O(R * C)',
    spaceComplexity: 'O(1) auxiliary',
    inputSchema: {
      description: '2D matrix with dimensions at least 3x3',
      fields: [
        {
          name: 'matrix',
          type: 'matrix',
          defaultValue: [
            [1, 1, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [1, 1, 1, 0, 0],
            [0, 0, 2, 4, 4],
            [0, 0, 0, 2, 0],
            [0, 0, 1, 2, 4]
          ],
          description: 'Numerical grid'
        }
      ],
      examplePayload: {
        matrix: [
          [1, 1, 1, 0, 0],
          [0, 1, 0, 0, 0],
          [1, 1, 1, 0, 0],
          [0, 0, 2, 4, 4],
          [0, 0, 0, 2, 0],
          [0, 0, 1, 2, 4]
        ]
      }
    },
    outputSchema: {
      description: 'Maximum hourglass sum, optimal grid coordinates, and included cell values',
      fields: ['maxSum', 'bestRow', 'bestCol', 'cells']
    },
    execute: (input: any) => maxHourglassSum(input.matrix)
  },
  {
    id: 'ACC-09',
    slug: 'max-equilibrium-sum',
    name: 'Maximum Equilibrium Sum',
    category: 'Array Processing',
    description: 'Finds the equilibrium position where prefix sum equals suffix sum, maximizing the equilibrium value.',
    problemStatement: 'Identifies partition points in an array where left sum equals right sum.',
    sourceFile: 'packages/algorithms/src/maxEquilibriumSum.ts',
    exportedFunction: 'maxEquilibriumSum',
    testFile: 'packages/algorithms/tests/maxEquilibriumSum.test.ts',
    applicationUseCase: 'Portfolio Analytics -> Contribution Balance',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/max-equilibrium-sum',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) auxiliary',
    inputSchema: {
      description: 'Array of signed portfolio contributions or P&L values',
      fields: [
        { name: 'values', type: 'array', defaultValue: [-7, 1, 5, 2, -4, 3, 0], description: 'Signed values' }
      ],
      examplePayload: { values: [-7, 1, 5, 2, -4, 3, 0] }
    },
    outputSchema: {
      description: 'Maximum equilibrium sum, best index, and all valid equilibrium points',
      fields: ['maxEquilibriumSum', 'bestIndex', 'allEquilibriumPoints', 'totalSum']
    },
    execute: (input: any) => maxEquilibriumSum(input.values)
  },
  {
    id: 'ACC-10',
    slug: 'leaders-in-array',
    name: 'Leaders in an Array',
    category: 'Array Processing',
    description: 'Right-to-left linear scan identifying historical closing price peaks unbroken by subsequent days.',
    problemStatement: 'An element is a leader if it is greater than or equal to all elements to its right.',
    sourceFile: 'packages/algorithms/src/leadersInArray.ts',
    exportedFunction: 'findLeaders',
    testFile: 'packages/algorithms/tests/leadersInArray.test.ts',
    applicationUseCase: 'Stock Detail -> Historical Price Leaders',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/leaders-in-array',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k) where k is number of leaders',
    inputSchema: {
      description: 'Chronological price observations',
      fields: [
        { name: 'values', type: 'array', defaultValue: [16, 17, 4, 3, 5, 2], description: 'Closing price series' }
      ],
      examplePayload: { values: [16, 17, 4, 3, 5, 2] }
    },
    outputSchema: {
      description: 'Array of leader items with original value and index',
      fields: ['leaders', 'steps']
    },
    execute: (input: any) => findLeaders(input.values)
  },
  {
    id: 'ACC-11',
    slug: 'majority-element',
    name: 'Boyer-Moore Majority Element',
    category: 'Array Processing',
    description: 'Two-pass voting algorithm to determine if a market move category strictly exceeds 50% frequency.',
    problemStatement: 'Finds the element appearing strictly more than n / 2 times with a verification pass.',
    sourceFile: 'packages/algorithms/src/majorityElement.ts',
    exportedFunction: 'findMajorityElement',
    testFile: 'packages/algorithms/tests/majorityElement.test.ts',
    applicationUseCase: 'Market Analytics -> Market Breadth',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/majority-element',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) auxiliary',
    inputSchema: {
      description: 'Array of market breadth categories or values',
      fields: [
        {
          name: 'values',
          type: 'array',
          defaultValue: ['POSITIVE', 'POSITIVE', 'NEGATIVE', 'POSITIVE', 'UNCHANGED', 'POSITIVE'],
          description: 'Classification sequence'
        }
      ],
      examplePayload: { values: ['POSITIVE', 'POSITIVE', 'NEGATIVE', 'POSITIVE', 'UNCHANGED', 'POSITIVE'] }
    },
    outputSchema: {
      description: 'Candidate element, verified count, percentage, and hasMajority boolean',
      fields: ['candidate', 'count', 'percentage', 'hasMajority', 'total']
    },
    execute: (input: any) => findMajorityElement(input.values)
  },
  {
    id: 'ACC-12',
    slug: 'lexicographic-palindrome',
    name: 'Lexicographically First Palindromic String',
    category: 'String Processing',
    description: 'Constructs the lexicographically smallest palindrome from input characters or validates infeasibility.',
    problemStatement: 'Sorts character frequencies to construct a symmetric string, allowing at most one odd-count character.',
    sourceFile: 'packages/algorithms/src/lexicographicPalindrome.ts',
    exportedFunction: 'lexicographicallyFirstPalindrome',
    testFile: 'packages/algorithms/tests/lexicographicPalindrome.test.ts',
    applicationUseCase: 'Algorithm Lab -> Symmetric Reference Generator',
    actualCaller: 'apps/api/src/services/algorithm-execution.service.ts',
    route: '/algorithms/lexicographic-palindrome',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(n)',
    inputSchema: {
      description: 'String of characters to rearrange',
      fields: [
        { name: 'input', type: 'string', defaultValue: 'malayalam', description: 'Input string' }
      ],
      examplePayload: { input: 'malayalam' }
    },
    outputSchema: {
      description: 'Smallest palindrome string, feasibility flag, and character frequencies',
      fields: ['palindrome', 'isPossible', 'oddCharacter', 'frequencies']
    },
    execute: (input: any) => lexicographicallyFirstPalindrome(String(input.input))
  },
  {
    id: 'ACC-13',
    slug: 'natural-sort',
    name: 'Natural Sort Order Comparator',
    category: 'String Processing',
    description: 'Custom comparator that segments strings into numeric and text tokens for natural human ordering.',
    problemStatement: 'Orders alphanumeric strings such that numeric segments sort by value rather than character code.',
    sourceFile: 'packages/algorithms/src/naturalSort.ts',
    exportedFunction: 'naturalSort',
    testFile: 'packages/algorithms/tests/naturalSort.test.ts',
    applicationUseCase: 'Markets, watchlists, order history, and registry',
    actualCaller: 'apps/api/src/services/market-analytics.service.ts',
    route: '/algorithms/natural-sort',
    timeComplexity: 'O(n log n * m)',
    spaceComplexity: 'O(n * m)',
    inputSchema: {
      description: 'Array of alphanumeric ticker or lot identifiers',
      fields: [
        {
          name: 'values',
          type: 'array',
          defaultValue: ['STOCK-10', 'STOCK-2', 'STOCK-1', 'STOCK-20', 'STOCK-3'],
          description: 'Identifier strings'
        }
      ],
      examplePayload: { values: ['STOCK-10', 'STOCK-2', 'STOCK-1', 'STOCK-20', 'STOCK-3'] }
    },
    outputSchema: {
      description: 'Naturally sorted array and parsed token chunks',
      fields: ['sorted', 'original', 'comparisons']
    },
    execute: (input: any) => naturalSort(input.values)
  }
];

export function getAlgorithmById(id: string): AlgorithmMetadata | undefined {
  return ALGORITHM_REGISTRY.find((a) => a.id.toLowerCase() === id.toLowerCase());
}

export function getAlgorithmBySlug(slug: string): AlgorithmMetadata | undefined {
  return ALGORITHM_REGISTRY.find((a) => a.slug.toLowerCase() === slug.toLowerCase());
}
