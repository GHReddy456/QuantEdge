/**
 * Algorithm ID: ACC-12
 * Algorithm: Lexicographically First Palindromic String
 *
 * Problem Definition:
 * Given a string, rearrange its characters to form the lexicographically smallest palindrome possible.
 * If no rearrangement can form a palindrome (i.e. more than one character has an odd frequency),
 * report that no palindromic rearrangement exists.
 *
 * Exported Function:
 * lexicographicallyFirstPalindrome(input)
 *
 * Input:
 * input: string (alphanumeric or character string)
 *
 * Output:
 * PalindromeResult {
 *   input: string,
 *   isPossible: boolean,
 *   palindrome: string | null,
 *   oddCharacter: string | null,
 *   frequencies: Record<string, number>,
 *   steps: PalindromeStep[]
 * }
 *
 * Time Complexity: O(n log k) where n is string length and k is number of distinct characters (for sorting)
 * Auxiliary Space: O(n) for palindrome construction and character frequency map
 *
 * Business Application:
 * Algorithm Lab -> Symmetric Reference Generator.
 * Demonstrates deterministic canonical identifier and symmetric hash tag generation for
 * synthetic order matching tags and benchmark identifiers.
 * Note: Educational algorithm; not for cryptographic key derivation or secure passwords.
 *
 * Caller:
 * apps/api/src/services/algorithm-execution.service.ts
 *
 * Tests:
 * packages/algorithms/tests/lexicographicPalindrome.test.ts
 */

export interface PalindromeStep {
  phase: string;
  detail: string;
}

export interface PalindromeResult {
  input: string;
  isPossible: boolean;
  palindrome: string | null;
  oddCharacter: string | null;
  frequencies: Record<string, number>;
  steps: PalindromeStep[];
}

export function lexicographicallyFirstPalindrome(input: string): PalindromeResult {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.');
  }

  const steps: PalindromeStep[] = [];
  const n = input.length;

  if (n === 0) {
    return {
      input,
      isPossible: true,
      palindrome: '',
      oddCharacter: null,
      frequencies: {},
      steps: [{ phase: 'EMPTY_STRING', detail: 'Empty string is trivially a palindrome.' }]
    };
  }

  // Count frequencies
  const freq: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const char = input[i];
    freq[char] = (freq[char] || 0) + 1;
  }

  steps.push({
    phase: 'FREQUENCY_COUNT',
    detail: `Counted occurrences: ${JSON.stringify(freq)}`
  });

  // Check feasibility: at most one character can have an odd count
  let oddCount = 0;
  let oddChar: string | null = null;

  for (const [char, count] of Object.entries(freq)) {
    if (count % 2 !== 0) {
      oddCount++;
      oddChar = char;
    }
  }

  if (oddCount > 1) {
    steps.push({
      phase: 'FEASIBILITY_CHECK',
      detail: `Infeasible: found ${oddCount} characters with odd frequencies. Maximum allowed is 1.`
    });
    return {
      input,
      isPossible: false,
      palindrome: null,
      oddCharacter: oddChar,
      frequencies: freq,
      steps
    };
  }

  steps.push({
    phase: 'FEASIBILITY_CHECK',
    detail: `Feasible: odd character count = ${oddCount} (${oddChar ?? 'none'})`
  });

  // Sort distinct characters lexicographically
  const sortedChars = Object.keys(freq).sort();

  // Build the first half
  let firstHalf = '';
  for (const char of sortedChars) {
    const halfCount = Math.floor(freq[char] / 2);
    firstHalf += char.repeat(halfCount);
  }

  steps.push({
    phase: 'FIRST_HALF_CONSTRUCTION',
    detail: `Constructed sorted first half: "${firstHalf}"`
  });

  // Middle character (if any odd frequency)
  const middle = oddChar ? oddChar : '';

  // Reverse first half for second half
  const secondHalf = firstHalf.split('').reverse().join('');

  const resultPalindrome = firstHalf + middle + secondHalf;

  steps.push({
    phase: 'MIRROR_ASSEMBLY',
    detail: `Assembled complete palindrome: "${resultPalindrome}"`
  });

  return {
    input,
    isPossible: true,
    palindrome: resultPalindrome,
    oddCharacter: oddChar,
    frequencies: freq,
    steps
  };
}
