import { describe, it, expect } from 'vitest';
import { longestOnesAfterFlip } from '../src/longestOnesAfterFlip.js';

describe('ACC-04: Longest Sequence of 1s After Flipping a Bit', () => {
  it('finds longest sequence by flipping single 0 in binary stream', () => {
    // [1, 1, 0, 1, 1, 0, 1, 1, 1] -> flipping index 5 gives 6 consecutive ones ([1,1,0, 1,1,1,1,1,1] from index 3 to 8 is 6)
    const res = longestOnesAfterFlip([1, 1, 0, 1, 1, 0, 1, 1, 1]);
    expect(res.maxSequenceLength).toBe(6);
    expect(res.bestFlipIndex).toBe(5);
  });

  it('handles all 1s sequence', () => {
    const res = longestOnesAfterFlip([1, 1, 1, 1]);
    expect(res.maxSequenceLength).toBe(4);
  });

  it('handles all 0s sequence', () => {
    const res = longestOnesAfterFlip([0, 0, 0]);
    expect(res.maxSequenceLength).toBe(1);
    expect(res.bestFlipIndex).toBe(0);
  });

  it('handles empty array', () => {
    const res = longestOnesAfterFlip([]);
    expect(res.maxSequenceLength).toBe(0);
    expect(res.bestFlipIndex).toBe(-1);
  });

  it('handles single element arrays', () => {
    expect(longestOnesAfterFlip([1]).maxSequenceLength).toBe(1);
    expect(longestOnesAfterFlip([0]).maxSequenceLength).toBe(1);
  });

  it('handles multiple zeros with alternating ones', () => {
    const res = longestOnesAfterFlip([1, 0, 1, 0, 1, 0, 1]);
    expect(res.maxSequenceLength).toBe(3);
  });

  it('rejects arrays with non-binary values', () => {
    expect(() => longestOnesAfterFlip([1, 2, 0])).toThrow();
    expect(() => longestOnesAfterFlip([1, -1, 0])).toThrow();
  });
});
