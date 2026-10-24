import { describe, it, expect } from 'vitest';
import { lexicographicallyFirstPalindrome } from '../src/lexicographicPalindrome.js';

describe('ACC-12: Lexicographically First Palindrome', () => {
  it('constructs lexicographically first palindrome for feasible strings', () => {
    // "malayalam" -> characters: a:4, l:2, m:2, y:1
    // Sorted half: "aalm" + "y" + "mlaa" -> "aalmymlaa"
    const res = lexicographicallyFirstPalindrome('malayalam');
    expect(res.isPossible).toBe(true);
    expect(res.palindrome).toBe('aalmymlaa');
    expect(res.oddCharacter).toBe('y');
  });

  it('handles strings where all characters have even counts', () => {
    // "bbaa" -> a:2, b:2 -> half: "ab" -> palindrome: "abba"
    const res = lexicographicallyFirstPalindrome('bbaa');
    expect(res.isPossible).toBe(true);
    expect(res.palindrome).toBe('abba');
    expect(res.oddCharacter).toBeNull();
  });

  it('detects infeasible strings with more than one odd character count', () => {
    // "abc" -> a:1, b:1, c:1 (3 odds)
    const res = lexicographicallyFirstPalindrome('abc');
    expect(res.isPossible).toBe(false);
    expect(res.palindrome).toBeNull();
  });

  it('handles single-character string', () => {
    const res = lexicographicallyFirstPalindrome('z');
    expect(res.isPossible).toBe(true);
    expect(res.palindrome).toBe('z');
    expect(res.oddCharacter).toBe('z');
  });

  it('handles empty string', () => {
    const res = lexicographicallyFirstPalindrome('');
    expect(res.isPossible).toBe(true);
    expect(res.palindrome).toBe('');
  });

  it('rejects non-string inputs', () => {
    expect(() => lexicographicallyFirstPalindrome(123 as any)).toThrow();
  });
});
