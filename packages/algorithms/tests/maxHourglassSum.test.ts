import { describe, it, expect } from 'vitest';
import { maxHourglassSum } from '../src/maxHourglassSum.js';

describe('ACC-08: Maximum Sum of Hourglass in Matrix', () => {
  it('correctly calculates maximum 7-cell hourglass sum in a 6x6 grid', () => {
    const matrix = [
      [1, 1, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0],
      [0, 0, 2, 4, 4, 0],
      [0, 0, 0, 2, 0, 0],
      [0, 0, 1, 2, 4, 0]
    ];
    // Hourglass at row 3, col 2:
    // [2, 4, 4] -> sum 10
    //    [2]    -> sum 2
    // [1, 2, 4] -> sum 7
    // Total = 19
    const res = maxHourglassSum(matrix);
    expect(res.maxSum).toBe(19);
    expect(res.bestRow).toBe(3);
    expect(res.bestCol).toBe(2);
    expect(res.cells).toEqual([2, 4, 4, 2, 1, 2, 4]);
  });

  it('handles negative cell values', () => {
    const matrix = [
      [-1, -1, 0, -9, -2, -2],
      [-2, -1, -6, -8, -2, -5],
      [-1, -1, -1, -2, -3, -4],
      [-1, -9, -2, -4, -4, -5],
      [-7, -3, -3, -2, -9, -9],
      [-1, -3, -1, -2, -4, -5]
    ];
    const res = maxHourglassSum(matrix);
    expect(res.maxSum).toBeLessThan(0);
    expect(Number.isFinite(res.maxSum)).toBe(true);
  });

  it('handles exact 3x3 minimal matrix', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    // 1 + 2 + 3 + 5 + 7 + 8 + 9 = 35
    const res = maxHourglassSum(matrix);
    expect(res.maxSum).toBe(35);
    expect(res.bestRow).toBe(0);
    expect(res.bestCol).toBe(0);
    expect(res.cells).toEqual([1, 2, 3, 5, 7, 8, 9]);
  });

  it('rejects matrices with less than 3 rows or 3 columns', () => {
    expect(() => maxHourglassSum([[1, 2], [3, 4]])).toThrow();
    expect(() => maxHourglassSum([[1, 2, 3], [4, 5, 6]])).toThrow();
  });

  it('rejects ragged matrices', () => {
    const ragged = [
      [1, 2, 3],
      [4, 5],
      [6, 7, 8]
    ];
    expect(() => maxHourglassSum(ragged)).toThrow();
  });
});
