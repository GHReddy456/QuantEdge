import { describe, it, expect } from 'vitest';
import { findMajorityElement } from '../src/majorityElement.js';

describe('ACC-11: Majority Element (Boyer-Moore with Verification)', () => {
  it('correctly identifies verified majority in market moves', () => {
    // 4 POSITIVE out of 6 is strictly > 3
    const moves = ['POSITIVE', 'POSITIVE', 'NEGATIVE', 'POSITIVE', 'UNCHANGED', 'POSITIVE'];
    const res = findMajorityElement(moves);
    expect(res.hasMajority).toBe(true);
    expect(res.candidate).toBe('POSITIVE');
    expect(res.count).toBe(4);
    expect(res.percentage).toBeCloseTo((4 / 6) * 100, 1);
  });

  it('rejects candidate when frequency is equal to or less than n / 2', () => {
    // 3 POSITIVE out of 6 is NOT strictly > 3 (half is not strict majority)
    const moves = ['POSITIVE', 'POSITIVE', 'POSITIVE', 'NEGATIVE', 'NEGATIVE', 'NEGATIVE'];
    const res = findMajorityElement(moves);
    expect(res.hasMajority).toBe(false);
    expect(res.candidate).toBeNull();
    expect(res.count).toBe(3);
  });

  it('handles array with no clear plurality', () => {
    const moves = ['A', 'B', 'C', 'D'];
    const res = findMajorityElement(moves);
    expect(res.hasMajority).toBe(false);
    expect(res.candidate).toBeNull();
  });

  it('handles single-element array', () => {
    const res = findMajorityElement(['BUY']);
    expect(res.hasMajority).toBe(true);
    expect(res.candidate).toBe('BUY');
    expect(res.count).toBe(1);
  });

  it('handles numerical inputs', () => {
    const res = findMajorityElement([2, 2, 1, 1, 2, 2, 2]);
    expect(res.hasMajority).toBe(true);
    expect(res.candidate).toBe(2);
    expect(res.count).toBe(5);
  });

  it('handles empty array', () => {
    const res = findMajorityElement([]);
    expect(res.hasMajority).toBe(false);
    expect(res.candidate).toBeNull();
    expect(res.total).toBe(0);
  });
});
