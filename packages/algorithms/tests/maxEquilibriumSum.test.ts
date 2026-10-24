import { describe, it, expect } from 'vitest';
import { maxEquilibriumSum } from '../src/maxEquilibriumSum.js';

describe('ACC-09: Maximum Equilibrium Sum', () => {
  it('finds equilibrium index and sum in balanced array with single equilibrium', () => {
    // Array: [-7, 1, 5, 2, -4, 3]
    // At index 3 (value 2):
    // Left: -7 + 1 + 5 = -1
    // Right: -4 + 3 = -1
    // Equilibrium sum = -1
    const res = maxEquilibriumSum([-7, 1, 5, 2, -4, 3]);
    expect(res.maxEquilibriumSum).toBe(-1);
    expect(res.bestIndex).toBe(3);
    expect(res.allEquilibriumPoints.length).toBe(1);
  });

  it('correctly picks maximum equilibrium sum when multiple equilibrium points exist', () => {
    // Array: [-7, 1, 5, 2, -4, 3, 0]
    // Index 3: left = -1, right = -1 (sum = -1)
    // Index 6: left = 0, right = 0 (sum = 0)
    // Maximum equilibrium sum = max(-1, 0) = 0
    const res = maxEquilibriumSum([-7, 1, 5, 2, -4, 3, 0]);
    expect(res.maxEquilibriumSum).toBe(0);
    expect(res.bestIndex).toBe(6);
    expect(res.allEquilibriumPoints.length).toBe(2);
  });

  it('handles boundary equilibrium points (e.g. at index 0 where left sum is 0)', () => {
    // [0, 1, -1] -> index 0: left=0, right=0 -> sum=0
    const res = maxEquilibriumSum([0, 1, -1]);
    expect(res.allEquilibriumPoints.some((p) => p.index === 0)).toBe(true);
  });

  it('returns null when no equilibrium point exists', () => {
    const res = maxEquilibriumSum([1, 2, 3]);
    expect(res.maxEquilibriumSum).toBeNull();
    expect(res.bestIndex).toBeNull();
    expect(res.allEquilibriumPoints).toEqual([]);
  });

  it('handles empty array', () => {
    const res = maxEquilibriumSum([]);
    expect(res.maxEquilibriumSum).toBeNull();
    expect(res.bestIndex).toBeNull();
  });

  it('handles single-element array', () => {
    // [10] -> left=0, right=0 -> eq sum=0 at index 0
    const res = maxEquilibriumSum([10]);
    expect(res.maxEquilibriumSum).toBe(0);
    expect(res.bestIndex).toBe(0);
  });

  it('rejects invalid inputs', () => {
    expect(() => maxEquilibriumSum([1, NaN, 3])).toThrow();
  });
});
