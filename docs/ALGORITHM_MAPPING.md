# QuantEdge Algorithm-to-Feature Traceability Matrix
## STS3007 Advanced Competitive Coding-I — Academic Core Specification

QuantEdge integrates 13 independently implemented algorithms from scratch into real-world traditional financial market analytics and quantitative research features. No third-party algorithm libraries or language built-in shortcuts are substituted for the core implementations.

---

### Master Traceability Table

| ID | Algorithm Name | Category | Source Path | Exported Function | Application Feature | Actual Caller | Unit Test File | Time Complexity | Space Complexity |
|---|---|---|---|---|---|---|---|---|---|
| **ACC-01** | Booth's Algorithm | Arithmetic | `packages/algorithms/src/booth.ts` | `boothMultiply(a, b, bitWidth)` | **Algorithm Lab** &rarr; Fixed-Width Signed Arithmetic | `apps/api/src/services/algorithm-execution.service.ts` | `packages/algorithms/tests/booth.test.ts` | $O(n)$ where $n$ is bit width | $O(n)$ trace |
| **ACC-02** | Euclid's Algorithm | Arithmetic | `packages/algorithms/src/euclid.ts` | `gcd(a, b)` | **Analytics** &rarr; Sampling Interval Analysis | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/euclid.test.ts` | $O(\log(\min(a, b)))$ | $O(\log(\min(a, b)))$ trace |
| **ACC-03** | Karatsuba Algorithm | Arithmetic | `packages/algorithms/src/karatsuba.ts` | `karatsubaMultiply(a, b)` | **Algorithm Lab** &rarr; Large Integer Benchmark | `apps/api/src/services/algorithm-execution.service.ts` | `packages/algorithms/tests/karatsuba.test.ts` | $O(n^{1.585})$ | $O(n)$ stack |
| **ACC-04** | Longest 1s After Bit Flip | Bit Manipulation | `packages/algorithms/src/longestOnesAfterFlip.ts` | `longestOnesAfterFlip(bits)` | **Algorithm Lab** &rarr; Binary Signal Tolerance | `apps/api/src/services/algorithm-execution.service.ts` | `packages/algorithms/tests/longestOnesAfterFlip.test.ts` | $O(n)$ | $O(1)$ aux |
| **ACC-05** | Swap Nibbles in a Byte | Bit Manipulation | `packages/algorithms/src/swapNibbles.ts` | `swapNibbles(byte)` | **Algorithm Lab** &rarr; Binary Encoding | `apps/api/src/services/algorithm-execution.service.ts` | `packages/algorithms/tests/swapNibbles.test.ts` | $O(1)$ | $O(1)$ |
| **ACC-06** | Block Swap Algorithm | Array Processing | `packages/algorithms/src/blockSwap.ts` | `rotateLeftBlockSwap(array, rotationCount)` | **Analytics** &rarr; Rolling Sample Window | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/blockSwap.test.ts` | $O(n)$ in-place | $O(1)$ in-place |
| **ACC-07** | Maximum Product Subarray | Dynamic Programming | `packages/algorithms/src/maxProductSubarray.ts` | `maxProductSubarray(values)` | **Stock Analytics** &rarr; Best Compounded-Return Window | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/maxProductSubarray.test.ts` | $O(n)$ | $O(1)$ aux |
| **ACC-08** | Max Hourglass Sum | Array Processing | `packages/algorithms/src/maxHourglassSum.ts` | `maxHourglassSum(matrix)` | **Market Analytics** &rarr; Performance Heatmap | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/maxHourglassSum.test.ts` | $O(R \times C)$ | $O(1)$ aux |
| **ACC-09** | Maximum Equilibrium Sum | Array Processing | `packages/algorithms/src/maxEquilibriumSum.ts` | `maxEquilibriumSum(values)` | **Portfolio Analytics** &rarr; Contribution Balance | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/maxEquilibriumSum.test.ts` | $O(n)$ | $O(1)$ aux |
| **ACC-10** | Leaders in an Array | Array Processing | `packages/algorithms/src/leadersInArray.ts` | `findLeaders(values)` | **Stock Detail** &rarr; Historical Price Leaders | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/leadersInArray.test.ts` | $O(n)$ | $O(k)$ leaders |
| **ACC-11** | Majority Element | Array Processing | `packages/algorithms/src/majorityElement.ts` | `findMajorityElement(values)` | **Market Analytics** &rarr; Market Breadth | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/majorityElement.test.ts` | $O(n)$ (two passes) | $O(1)$ aux |
| **ACC-12** | Lexicographical Palindrome | String Processing | `packages/algorithms/src/lexicographicPalindrome.ts` | `lexicographicallyFirstPalindrome(input)` | **Algorithm Lab** &rarr; Symmetric Reference Generator | `apps/api/src/services/algorithm-execution.service.ts` | `packages/algorithms/tests/lexicographicPalindrome.test.ts` | $O(n \log k)$ | $O(n)$ |
| **ACC-13** | Natural Sort Order | String Processing | `packages/algorithms/src/naturalSort.ts` | `naturalSort(values)` | **Markets, Watchlists & Registry** &rarr; Identifiers Sort | `apps/api/src/services/market-analytics.service.ts` | `packages/algorithms/tests/naturalSort.test.ts` | $O(n \log n \cdot m)$ | $O(n \cdot m)$ tokens |

---

### Detailed Specification by Algorithm

#### ACC-01: Booth's Multiplication Algorithm
- **Problem Statement**: Performs signed two's complement multiplication using Booth's encoding over explicit fixed-width registers ($A, Q, Q_{-1}, M$).
- **Application**: Algorithm Lab &rarr; Fixed-Width Signed Arithmetic. Demonstrates fixed-width binary register arithmetic for synthetic scaled fixed-point numbers.
- **Contract**: `boothMultiply(a: number, b: number, bitWidth?: number = 8): BoothResult`
- **Output**: Returns `{ product, binaryProduct, steps, overflow }`.

#### ACC-02: Euclid's GCD Algorithm
- **Problem Statement**: Computes the greatest common divisor of two integers via iterative modulo reductions.
- **Application**: Analytics &rarr; Sampling Interval Analysis. Computes common divisor for multi-timeframe candle aggregations (e.g. $\gcd(15, 30) = 15$ mins).
- **Contract**: `gcd(a: number, b: number): EuclidResult`

#### ACC-03: Karatsuba Fast Multiplication
- **Problem Statement**: Divides numbers into high and low halves and evaluates only 3 recursive multiplications: $z_0, z_2, z_1 = (high_1 + low_1)(high_2 + low_2) - z_2 - z_0$.
- **Application**: Algorithm Lab &rarr; Large Integer Benchmark. High-precision calculations avoiding floating-point precision loss using native `bigint`.
- **Contract**: `karatsubaMultiply(a: bigint | string | number, b: bigint | string | number): KaratsubaResult`

#### ACC-04: Longest Sequence of 1s After Flipping a Bit
- **Problem Statement**: Sliding window tracking at most one zero in a binary stream to achieve maximum consecutive ones.
- **Application**: Algorithm Lab &rarr; Binary Signal Tolerance. Analyzes fault tolerance in market feed uptime or packet drop streams.
- **Contract**: `longestOnesAfterFlip(bits: number[]): LongestOnesResult`

#### ACC-05: Swap Two Nibbles in a Byte
- **Problem Statement**: Transposes upper bits 7-4 and lower bits 3-0: `((byte & 0x0F) << 4) | ((byte & 0xF0) >> 4)`.
- **Application**: Algorithm Lab &rarr; Binary Encoding. Low-level byte and nibble manipulation used in compact binary market data framing (e.g. ITCH/FAST).
- **Contract**: `swapNibbles(byte: number): SwapNibblesResult`

#### ACC-06: Block Swap Array Rotation
- **Problem Statement**: In-place array rotation by $d$ positions in $O(n)$ time and $O(1)$ auxiliary space by swapping disjoint blocks $A$ and $B$.
- **Application**: Analytics &rarr; Rolling Sample Window. In-place rotation of a fixed-size historical candle sample buffer.
- **Contract**: `rotateLeftBlockSwap<T>(array: T[], rotationCount: number): BlockSwapResult<T>`

#### ACC-07: Maximum Product Subarray
- **Problem Statement**: Linear-time Kadane variant tracking both running maximum and minimum products ending at each index to account for negative sign flips.
- **Application**: Stock Analytics &rarr; Best Compounded-Return Window. Evaluates daily return multipliers $1 + r$ to locate the highest historical compounding interval.
- **Contract**: `maxProductSubarray(values: number[]): MaxProductResult`

#### ACC-08: Maximum Sum of Hourglass in Matrix
- **Problem Statement**: Calculates max sum of any 7-cell hourglass coordinate pattern in a 2D matrix ($R \ge 3, C \ge 3$).
- **Application**: Market Analytics &rarr; Performance Heatmap. Identifies localized clusters of performance across sector grids.
- **Contract**: `maxHourglassSum(matrix: number[][]): HourglassResult`

#### ACC-09: Maximum Equilibrium Sum
- **Problem Statement**: Locates partition index where prefix sum equals suffix sum, maximizing the equilibrium value.
- **Application**: Portfolio Analytics &rarr; Contribution Balance. Analyzes ordered signed trade contributions / cashflows to identify points of balance.
- **Contract**: `maxEquilibriumSum(values: number[]): EquilibriumResult`

#### ACC-10: Leaders in an Array
- **Problem Statement**: Scans array right-to-left maintaining running maximum; an element is a leader if it is $\ge$ all elements to its right.
- **Application**: Stock Detail &rarr; Historical Price Leaders. Identifies historical closing price peaks unbroken by subsequent trading sessions.
- **Contract**: `findLeaders(values: number[]): LeadersResult`

#### ACC-11: Boyer-Moore Majority Element
- **Problem Statement**: Pass 1 votes on candidate in $O(n)$ time; Pass 2 strictly verifies that candidate appears strictly more than $n / 2$ times.
- **Application**: Market Analytics &rarr; Market Breadth. Classifies market moves (Positive, Negative, Unchanged) and verifies if a strict directional majority exists.
- **Contract**: `findMajorityElement<T>(values: T[]): MajorityResult<T>`

#### ACC-12: Lexicographically First Palindromic String
- **Problem Statement**: Frequency counting, at most one odd-count character check, sorted-half construction, middle char, and mirroring.
- **Application**: Algorithm Lab &rarr; Symmetric Reference Generator. Deterministic canonical identifier and symmetric hash tag generation.
- **Contract**: `lexicographicallyFirstPalindrome(input: string): PalindromeResult`

#### ACC-13: Natural Sort Order
- **Problem Statement**: Chunks strings into alternating text and digit tokens, comparing numeric tokens numerically and text tokens lexicographically.
- **Application**: Markets, Watchlists, Order History & Registry. Guarantees human-friendly ordering of ticker symbols and lot identifiers (e.g. `STOCK-1`, `STOCK-2`, `STOCK-10`).
- **Contract**: `naturalSort(values: string[]): NaturalSortResult`
