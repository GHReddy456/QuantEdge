import { describe, it, expect } from 'vitest';
import { rotateLeftBlockSwap } from '../src/blockSwap.js';

describe('ACC-06: Block Swap Algorithm', () => {
  it('correctly rotates array left by d positions', () => {
    const input = [1, 2, 3, 4, 5, 6, 7];
    const res = rotateLeftBlockSwap([...input], 2);
    expect(res.rotated).toEqual([3, 4, 5, 6, 7, 1, 2]);
    expect(res.effectiveRotation).toBe(2);
    expect(res.swapsPerformed).toBeGreaterThan(0);
  });

  it('handles rotation where d equals half the array length', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const res = rotateLeftBlockSwap([...input], 3);
    expect(res.rotated).toEqual([4, 5, 6, 1, 2, 3]);
  });

  it('handles rotation larger than array length (modulo arithmetic)', () => {
    const input = [10, 20, 30, 40, 50];
    const res = rotateLeftBlockSwap([...input], 12); // 12 % 5 = 2
    expect(res.rotated).toEqual([30, 40, 50, 10, 20]);
    expect(res.effectiveRotation).toBe(2);
  });

  it('handles zero rotation', () => {
    const input = [1, 2, 3];
    const res = rotateLeftBlockSwap([...input], 0);
    expect(res.rotated).toEqual([1, 2, 3]);
    expect(res.swapsPerformed).toBe(0);
  });

  it('handles empty and single-element arrays', () => {
    expect(rotateLeftBlockSwap([], 5).rotated).toEqual([]);
    expect(rotateLeftBlockSwap([42], 10).rotated).toEqual([42]);
  });

  it('preserves generic object data types (e.g. timestamped candles)', () => {
    const candles = [
      { t: '10:00', close: 100 },
      { t: '10:05', close: 102 },
      { t: '10:10', close: 105 }
    ];
    const res = rotateLeftBlockSwap([...candles], 1);
    expect(res.rotated).toEqual([
      { t: '10:05', close: 102 },
      { t: '10:10', close: 105 },
      { t: '10:00', close: 100 }
    ]);
  });

  it('rejects negative rotation counts', () => {
    expect(() => rotateLeftBlockSwap([1, 2, 3], -1)).toThrow();
  });
});
