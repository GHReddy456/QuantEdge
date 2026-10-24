import { describe, it, expect } from 'vitest';
import { maxProductSubarray } from '../src/maxProductSubarray.js';

describe('ACC-07: Maximum Product Subarray', () => {
  it('identifies best compounded return window with positive multipliers', () => {
    // Return multipliers: +2%, +5%, -2%, +4%, +3%
    const multipliers = [1.02, 1.05, 0.98, 1.04, 1.03];
    const res = maxProductSubarray(multipliers);
    expect(res.maxProduct).toBeGreaterThan(1.0);
    expect(res.compoundedReturnPercent).toBeCloseTo((res.maxProduct - 1) * 100, 3);
    expect(res.subarray.length).toBeGreaterThan(0);
  });

  it('correctly tracks sign flips when multiplying pairs of negative numbers', () => {
    // [-2, -3, -4] -> -2 * -3 = 6 (subarray [-2, -3]); -3 * -4 = 12 (subarray [-3, -4])
    const res = maxProductSubarray([-2, -3, -4]);
    expect(res.maxProduct).toBe(12);
    expect(res.startIndex).toBe(1);
    expect(res.endIndex).toBe(2);
    expect(res.subarray).toEqual([-3, -4]);
  });

  it('handles array with zero resetting products', () => {
    // [-2, 0, -1] -> max product is 0 (or subarray [0])
    const res = maxProductSubarray([-2, 0, -1]);
    expect(res.maxProduct).toBe(0);
  });

  it('handles single positive and single negative element', () => {
    expect(maxProductSubarray([5]).maxProduct).toBe(5);
    expect(maxProductSubarray([-5]).maxProduct).toBe(-5);
  });

  it('handles mixed array [2, 3, -2, 4]', () => {
    const res = maxProductSubarray([2, 3, -2, 4]);
    expect(res.maxProduct).toBe(6);
    expect(res.subarray).toEqual([2, 3]);
  });

  it('handles empty array', () => {
    const res = maxProductSubarray([]);
    expect(res.maxProduct).toBe(0);
    expect(res.subarray).toEqual([]);
  });

  it('rejects invalid inputs', () => {
    expect(() => maxProductSubarray([1, NaN, 3])).toThrow();
  });
});
