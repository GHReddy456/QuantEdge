import { describe, it, expect } from 'vitest';
import { swapNibbles } from '../src/swapNibbles.js';

describe('ACC-05: Swap Two Nibbles in a Byte', () => {
  it('correctly swaps nibbles of 100 (0x64 -> 0x46 = 70)', () => {
    // 100 in binary: 0110 0100 (0x64)
    // Swapped:       0100 0110 (0x46 = 70)
    const res = swapNibbles(100);
    expect(res.swappedByte).toBe(70);
    expect(res.originalHex).toBe('0x64');
    expect(res.swappedHex).toBe('0x46');
    expect(res.upperNibble).toBe(6);
    expect(res.lowerNibble).toBe(4);
  });

  it('handles zero (0x00 -> 0x00 = 0)', () => {
    const res = swapNibbles(0);
    expect(res.swappedByte).toBe(0);
  });

  it('handles 255 (0xFF -> 0xFF = 255)', () => {
    const res = swapNibbles(255);
    expect(res.swappedByte).toBe(255);
  });

  it('handles symmetric nibbles (e.g. 0x55, 0xAA)', () => {
    expect(swapNibbles(0x55).swappedByte).toBe(0x55);
    expect(swapNibbles(0xaa).swappedByte).toBe(0xaa);
  });

  it('handles asymmetric single nibbles (e.g. 0x0F -> 0xF0)', () => {
    // 15 = 0x0F -> 240 = 0xF0
    expect(swapNibbles(15).swappedByte).toBe(240);
    expect(swapNibbles(240).swappedByte).toBe(15);
  });

  it('rejects values outside [0, 255]', () => {
    expect(() => swapNibbles(-1)).toThrow();
    expect(() => swapNibbles(256)).toThrow();
    expect(() => swapNibbles(12.5)).toThrow();
  });
});
