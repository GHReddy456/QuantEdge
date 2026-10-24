import { describe, it, expect } from 'vitest';
import { findLeaders } from '../src/leadersInArray.js';

describe('ACC-10: Leaders in Array', () => {
  it('identifies price leaders in chronological series', () => {
    // [16, 17, 4, 3, 5, 2] -> leaders are 17, 5, 2
    const res = findLeaders([16, 17, 4, 3, 5, 2]);
    expect(res.leaders.map((l) => l.value)).toEqual([17, 5, 2]);
    expect(res.leaders.map((l) => l.index)).toEqual([1, 4, 5]);
  });

  it('handles strictly increasing array where only the last element is leader', () => {
    // [1, 2, 3, 4, 5] -> only 5 is leader
    const res = findLeaders([1, 2, 3, 4, 5]);
    expect(res.leaders.map((l) => l.value)).toEqual([5]);
  });

  it('handles strictly decreasing array where every element is leader', () => {
    // [5, 4, 3, 2, 1] -> all elements are leaders
    const res = findLeaders([5, 4, 3, 2, 1]);
    expect(res.leaders.map((l) => l.value)).toEqual([5, 4, 3, 2, 1]);
  });

  it('handles duplicate values (greater than or equal)', () => {
    const res = findLeaders([4, 4, 4]);
    expect(res.leaders.length).toBe(3);
  });

  it('handles single-element array', () => {
    const res = findLeaders([100]);
    expect(res.leaders).toEqual([{ value: 100, index: 0 }]);
  });

  it('handles empty array', () => {
    const res = findLeaders([]);
    expect(res.leaders).toEqual([]);
  });

  it('rejects invalid inputs', () => {
    expect(() => findLeaders([1, NaN, 3])).toThrow();
  });
});
