import { describe, it, expect } from 'vitest';
import { karatsubaMultiply } from '../src/karatsuba.js';

describe('ACC-03: Karatsuba Algorithm', () => {
  it('correctly multiplies small integers matching ordinary multiplication', () => {
    const res = karatsubaMultiply(12, 34);
    expect(res.product).toBe((12 * 34).toString());
    expect(res.asymptoticComplexity).toBe('O(n^1.585)');
  });

  it('correctly multiplies multi-digit large integers using bigints', () => {
    const a = 1234567890123456n;
    const b = 9876543210987654n;
    const expected = (a * b).toString();
    const res = karatsubaMultiply(a, b);
    expect(res.product).toBe(expected);
  });

  it('handles negative operands', () => {
    const res1 = karatsubaMultiply('-1234', '5678');
    expect(res1.product).toBe((-1234 * 5678).toString());

    const res2 = karatsubaMultiply('-500', '-600');
    expect(res2.product).toBe((300000).toString());
  });

  it('handles zero values', () => {
    expect(karatsubaMultiply(0, 9999).product).toBe('0');
    expect(karatsubaMultiply('999999', '0').product).toBe('0');
  });

  it('handles string and bigint input types interchangeably', () => {
    const res = karatsubaMultiply('999999999999999999', '888888888888888888');
    const expected = (999999999999999999n * 888888888888888888n).toString();
    expect(res.product).toBe(expected);
  });

  it('rejects invalid inputs', () => {
    expect(() => karatsubaMultiply('abc', '123')).toThrow();
  });
});
