import { describe, it, expect } from 'vitest';
import { boothMultiply } from '../src/booth.js';

describe('ACC-01: Booth Multiplication Algorithm', () => {
  it('correctly multiplies two positive integers', () => {
    const res = boothMultiply(7, 3, 8);
    expect(res.product).toBe(21);
    expect(res.overflow).toBe(false);
    expect(res.steps.length).toBeGreaterThan(0);
  });

  it('correctly multiplies positive and negative integers', () => {
    const res1 = boothMultiply(7, -3, 8);
    expect(res1.product).toBe(-21);
    expect(res1.overflow).toBe(false);

    const res2 = boothMultiply(-7, 3, 8);
    expect(res2.product).toBe(-21);
    expect(res2.overflow).toBe(false);
  });

  it('correctly multiplies two negative integers', () => {
    const res = boothMultiply(-6, -4, 8);
    expect(res.product).toBe(24);
    expect(res.overflow).toBe(false);
  });

  it('correctly handles multiplication with zero', () => {
    const res1 = boothMultiply(0, 15, 8);
    expect(res1.product).toBe(0);

    const res2 = boothMultiply(-12, 0, 8);
    expect(res2.product).toBe(0);

    const res3 = boothMultiply(0, 0, 8);
    expect(res3.product).toBe(0);
  });

  it('handles boundary values for 8-bit width (-128 to 127)', () => {
    const res = boothMultiply(127, 1, 8);
    expect(res.product).toBe(127);

    const resMin = boothMultiply(-128, 1, 8);
    expect(resMin.product).toBe(-128);
  });

  it('rejects operands outside bit width limits', () => {
    expect(() => boothMultiply(200, 3, 8)).toThrow();
    expect(() => boothMultiply(-150, 2, 8)).toThrow();
  });

  it('rejects invalid bitWidth specifications', () => {
    expect(() => boothMultiply(5, 5, 2)).toThrow();
    expect(() => boothMultiply(5, 5, 20)).toThrow();
  });
});
