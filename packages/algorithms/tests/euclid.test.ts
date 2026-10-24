import { describe, it, expect } from 'vitest';
import { gcd } from '../src/euclid.js';

describe("ACC-02: Euclid's Algorithm", () => {
  it('correctly calculates the GCD of common stock sampling intervals', () => {
    // 15m and 30m intervals have GCD of 15m
    const res = gcd(15, 30);
    expect(res.gcd).toBe(15);
    expect(res.steps.length).toBeGreaterThan(0);

    // 60m and 240m intervals
    expect(gcd(60, 240).gcd).toBe(60);

    // 15m and 25m intervals
    expect(gcd(15, 25).gcd).toBe(5);
  });

  it('handles prime and co-prime numbers', () => {
    expect(gcd(17, 19).gcd).toBe(1);
    expect(gcd(13, 27).gcd).toBe(1);
  });

  it('handles zero cases according to mathematical contract', () => {
    expect(gcd(0, 45).gcd).toBe(45);
    expect(gcd(30, 0).gcd).toBe(30);
    expect(gcd(0, 0).gcd).toBe(0);
  });

  it('handles negative integers by taking absolute values', () => {
    expect(gcd(-15, 30).gcd).toBe(15);
    expect(gcd(15, -30).gcd).toBe(15);
    expect(gcd(-48, -18).gcd).toBe(6);
  });

  it('rejects non-integer operands', () => {
    expect(() => gcd(15.5, 30)).toThrow();
    expect(() => gcd(15, 30.2)).toThrow();
  });
});
