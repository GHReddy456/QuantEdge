/**
 * Algorithm ID: ACC-05
 * Algorithm: Swap Two Nibbles in a Byte
 *
 * Problem Definition:
 * Given an 8-bit unsigned integer (a byte, 0-255), swap its two 4-bit nibbles (higher nibble bits 7-4
 * with lower nibble bits 3-0) using bitwise masking, shifts, and OR logic:
 * result = ((byte & 0x0F) << 4) | ((byte & 0xF0) >> 4).
 *
 * Exported Function:
 * swapNibbles(byte)
 *
 * Input:
 * byte: number (integer in range 0..255)
 *
 * Output:
 * SwapNibblesResult {
 *   originalByte: number,
 *   swappedByte: number,
 *   originalBinary: string,
 *   swappedBinary: string,
 *   originalHex: string,
 *   swappedHex: string,
 *   upperNibble: number,
 *   lowerNibble: number,
 *   steps: SwapStep[]
 * }
 *
 * Time Complexity: O(1)
 * Auxiliary Space: O(1)
 *
 * Business Application:
 * Algorithm Lab -> Binary Encoding.
 * Demonstrates low-level byte and nibble manipulation used in compact binary market-data protocols
 * (e.g. ITCH/OUCH market data feed framing, FIX FAST compact encoding, and hardware endianness conversions).
 *
 * Caller:
 * apps/api/src/services/algorithm-execution.service.ts
 *
 * Tests:
 * packages/algorithms/tests/swapNibbles.test.ts
 */

export interface SwapStep {
  step: number;
  operation: string;
  resultBinary: string;
  resultHex: string;
  description: string;
}

export interface SwapNibblesResult {
  originalByte: number;
  swappedByte: number;
  originalBinary: string;
  swappedBinary: string;
  originalHex: string;
  swappedHex: string;
  upperNibble: number;
  lowerNibble: number;
  steps: SwapStep[];
}

export function swapNibbles(byte: number): SwapNibblesResult {
  if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
    throw new Error(`Input must be an unsigned 8-bit integer between 0 and 255 (received: ${byte}).`);
  }

  const toBin8 = (n: number) => (n >>> 0).toString(2).padStart(8, '0');
  const toHex2 = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(2, '0');

  const steps: SwapStep[] = [];

  const lowerNibble = byte & 0x0f;
  const upperNibble = (byte & 0xf0) >> 4;

  steps.push({
    step: 1,
    operation: 'ISOLATE_LOWER',
    resultBinary: toBin8(lowerNibble),
    resultHex: toHex2(lowerNibble),
    description: `Extracted lower 4 bits (0x0F mask): ${lowerNibble.toString(2).padStart(4, '0')}`
  });

  const shiftedLower = lowerNibble << 4;
  steps.push({
    step: 2,
    operation: 'SHIFT_LOWER_LEFT',
    resultBinary: toBin8(shiftedLower),
    resultHex: toHex2(shiftedLower),
    description: `Shifted lower nibble left by 4 bits to become new upper nibble: ${shiftedLower.toString(2).padStart(8, '0')}`
  });

  const shiftedUpper = (byte & 0xf0) >> 4;
  steps.push({
    step: 3,
    operation: 'SHIFT_UPPER_RIGHT',
    resultBinary: toBin8(shiftedUpper),
    resultHex: toHex2(shiftedUpper),
    description: `Shifted upper nibble right by 4 bits to become new lower nibble: ${shiftedUpper.toString(2).padStart(8, '0')}`
  });

  const swapped = shiftedLower | shiftedUpper;
  steps.push({
    step: 4,
    operation: 'BITWISE_OR',
    resultBinary: toBin8(swapped),
    resultHex: toHex2(swapped),
    description: `Combined shifted nibbles using bitwise OR: ${toBin8(swapped)} (${swapped})`
  });

  return {
    originalByte: byte,
    swappedByte: swapped,
    originalBinary: toBin8(byte),
    swappedBinary: toBin8(swapped),
    originalHex: toHex2(byte),
    swappedHex: toHex2(swapped),
    upperNibble,
    lowerNibble,
    steps
  };
}
