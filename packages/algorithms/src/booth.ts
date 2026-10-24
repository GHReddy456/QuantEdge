/**
 * Algorithm ID: ACC-01
 * Algorithm: Booth's Algorithm
 *
 * Problem Definition:
 * Multiply two signed integers using Booth's multiplication algorithm in two's complement
 * representation, operating over explicit fixed-width registers (A, Q, Q_-1, M) with arithmetic
 * right shifts, conditional additions, and subtractions.
 *
 * Exported Function:
 * boothMultiply(a, b, bitWidth)
 *
 * Input:
 * a: number (multiplicand)
 * b: number (multiplier)
 * bitWidth?: number (bit width, default 8, valid range 4..16)
 *
 * Output:
 * BoothResult { product: number, binaryProduct: string, steps: BoothStep[], overflow: boolean }
 *
 * Time Complexity: O(n) where n is bitWidth
 * Auxiliary Space: O(n) for trace steps
 *
 * Business Application:
 * Algorithm Lab -> Fixed-Width Signed Arithmetic.
 * Demonstrates multiplication of signed integers and synthetic scaled fixed-point numbers.
 *
 * Caller:
 * apps/api/src/services/algorithm-execution.service.ts
 *
 * Tests:
 * packages/algorithms/tests/booth.test.ts
 */

export interface BoothStep {
  step: number;
  operation: string;
  registerA: string;
  registerQ: string;
  qMinus1: number;
  description: string;
}

export interface BoothResult {
  multiplicand: number;
  multiplier: number;
  bitWidth: number;
  product: number;
  binaryProduct: string;
  steps: BoothStep[];
  overflow: boolean;
}

function toTwosComplement(val: number, bits: number): number {
  const mask = (1 << bits) - 1;
  return val & mask;
}

function toSigned(val: number, bits: number): number {
  const signBit = 1 << (bits - 1);
  if ((val & signBit) !== 0) {
    return val - (1 << bits);
  }
  return val;
}

function toBinaryString(val: number, bits: number): string {
  const masked = toTwosComplement(val, bits);
  return (masked >>> 0).toString(2).padStart(bits, '0');
}

export function boothMultiply(a: number, b: number, bitWidth: number = 8): BoothResult {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error('Operands for Booth multiplication must be integers.');
  }
  if (!Number.isInteger(bitWidth) || bitWidth < 4 || bitWidth > 16) {
    throw new Error('bitWidth must be an integer between 4 and 16.');
  }

  const minVal = -(1 << (bitWidth - 1));
  const maxVal = (1 << (bitWidth - 1)) - 1;

  if (a < minVal || a > maxVal || b < minVal || b > maxVal) {
    throw new Error(`Operands must be in range [${minVal}, ${maxVal}] for bitWidth ${bitWidth}.`);
  }

  const steps: BoothStep[] = [];
  // Use w = bitWidth + 1 internally to prevent two's complement negation overflow of minVal (-2^(n-1))
  const w = bitWidth + 1;
  const bitMask = (1 << w) - 1;
  const M = toTwosComplement(a, w);
  let A = 0;
  let Q = toTwosComplement(b, bitWidth);
  let qMinus1 = 0;

  steps.push({
    step: 0,
    operation: 'INITIAL',
    registerA: toBinaryString(A, bitWidth),
    registerQ: toBinaryString(Q, bitWidth),
    qMinus1,
    description: `Initial state: M=${a} (${toBinaryString(M, bitWidth)}), Q=${b} (${toBinaryString(Q, bitWidth)})`
  });

  for (let i = 1; i <= bitWidth; i++) {
    const q0 = Q & 1;
    let opDesc = '';

    if (q0 === 1 && qMinus1 === 0) {
      // Subtract M from A (A = A - M)
      A = (A - M) & bitMask;
      opDesc = 'A = A - M (since Q0=1, Q-1=0)';
    } else if (q0 === 0 && qMinus1 === 1) {
      // Add M to A (A = A + M)
      A = (A + M) & bitMask;
      opDesc = 'A = A + M (since Q0=0, Q-1=1)';
    } else {
      opDesc = 'No arithmetic op (Q0 == Q-1)';
    }

    if (q0 !== qMinus1) {
      steps.push({
        step: i,
        operation: q0 === 1 ? 'A - M' : 'A + M',
        registerA: toBinaryString(A, bitWidth),
        registerQ: toBinaryString(Q, bitWidth),
        qMinus1,
        description: `${opDesc} before shift`
      });
    }

    // Arithmetic Right Shift [A, Q, qMinus1]
    const aSign = (A >> (w - 1)) & 1;
    const aLsb = A & 1;
    qMinus1 = Q & 1;

    // Shift Q right by 1, with MSB from A's LSB
    Q = ((Q >>> 1) | (aLsb << (bitWidth - 1))) & ((1 << bitWidth) - 1);
    // Shift A right by 1, preserving sign bit
    A = ((A >>> 1) | (aSign << (w - 1))) & bitMask;

    steps.push({
      step: i,
      operation: 'ASR',
      registerA: toBinaryString(A, bitWidth),
      registerQ: toBinaryString(Q, bitWidth),
      qMinus1,
      description: `Step ${i}: Arithmetic shift right [A, Q, Q-1]`
    });
  }

  // Combine A and Q into 2 * bitWidth result
  const productBits = bitWidth * 2;
  const combined = ((toTwosComplement(A, bitWidth) << bitWidth) | Q) & ((1 << productBits) - 1);
  const signedProduct = toSigned(combined, productBits);
  const expectedProduct = a * b;

  return {
    multiplicand: a,
    multiplier: b,
    bitWidth,
    product: signedProduct,
    binaryProduct: toBinaryString(combined, productBits),
    steps,
    overflow: signedProduct !== expectedProduct
  };
}
