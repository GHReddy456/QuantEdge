import { describe, it, expect } from 'vitest';
import { naturalSort, compareNatural } from '../src/naturalSort.js';

describe('ACC-13: Natural Sort Order', () => {
  it('correctly sorts stock tickers with numerical suffixes', () => {
    const input = ['STOCK-10', 'STOCK-2', 'STOCK-1'];
    const res = naturalSort(input);
    expect(res.sorted).toEqual(['STOCK-1', 'STOCK-2', 'STOCK-10']);
  });

  it('handles multi-stage mixed alphanumeric symbols', () => {
    const input = ['LOT-100-B', 'LOT-2-A', 'LOT-10-A', 'LOT-2-B'];
    const res = naturalSort(input);
    expect(res.sorted).toEqual(['LOT-2-A', 'LOT-2-B', 'LOT-10-A', 'LOT-100-B']);
  });

  it('handles leading zeros and repeated numbers', () => {
    const input = ['FILE01', 'FILE1', 'FILE002', 'FILE2'];
    const res = naturalSort(input);
    expect(res.sorted.length).toBe(4);
    // FILE01 and FILE1 have numerical value 1, followed by FILE002 and FILE2
    expect(res.sorted[0]).toMatch(/FILE0?1/);
  });

  it('handles pure strings without numbers', () => {
    const input = ['RELIANCE', 'AAPL', 'TCS', 'INFY'];
    const res = naturalSort(input);
    expect(res.sorted).toEqual(['AAPL', 'INFY', 'RELIANCE', 'TCS']);
  });

  it('handles pure numbers as strings', () => {
    const input = ['100', '20', '3', '10', '2'];
    const res = naturalSort(input);
    expect(res.sorted).toEqual(['2', '3', '10', '20', '100']);
  });

  it('preserves stability on duplicate elements', () => {
    const input = ['AAPL', 'AAPL', 'MSFT'];
    const res = naturalSort(input);
    expect(res.sorted).toEqual(['AAPL', 'AAPL', 'MSFT']);
  });

  it('handles empty array', () => {
    expect(naturalSort([]).sorted).toEqual([]);
  });

  it('rejects arrays with non-string elements', () => {
    expect(() => naturalSort(['AAPL', 123 as any])).toThrow();
  });

  it('compareNatural helper returns correct order sign', () => {
    expect(compareNatural('A-1', 'A-2')).toBeLessThan(0);
    expect(compareNatural('A-10', 'A-2')).toBeGreaterThan(0);
    expect(compareNatural('A-2', 'A-2')).toBe(0);
  });
});
