import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALGORITHM_REGISTRY,
  getAlgorithmById,
  getAlgorithmBySlug,
  type AlgorithmMetadata
} from '@quantedge/algorithms';
import { store } from '../models/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../../');

// Strict Allowlist of permitted algorithm source and test files
const ALLOWLISTED_FILES = new Set([
  'packages/algorithms/src/booth.ts',
  'packages/algorithms/src/euclid.ts',
  'packages/algorithms/src/karatsuba.ts',
  'packages/algorithms/src/longestOnesAfterFlip.ts',
  'packages/algorithms/src/swapNibbles.ts',
  'packages/algorithms/src/blockSwap.ts',
  'packages/algorithms/src/maxProductSubarray.ts',
  'packages/algorithms/src/maxHourglassSum.ts',
  'packages/algorithms/src/maxEquilibriumSum.ts',
  'packages/algorithms/src/leadersInArray.ts',
  'packages/algorithms/src/majorityElement.ts',
  'packages/algorithms/src/lexicographicPalindrome.ts',
  'packages/algorithms/src/naturalSort.ts',
  'packages/algorithms/src/registry.ts',
  'packages/algorithms/src/index.ts',
  'packages/algorithms/tests/booth.test.ts',
  'packages/algorithms/tests/euclid.test.ts',
  'packages/algorithms/tests/karatsuba.test.ts',
  'packages/algorithms/tests/longestOnesAfterFlip.test.ts',
  'packages/algorithms/tests/swapNibbles.test.ts',
  'packages/algorithms/tests/blockSwap.test.ts',
  'packages/algorithms/tests/maxProductSubarray.test.ts',
  'packages/algorithms/tests/maxHourglassSum.test.ts',
  'packages/algorithms/tests/maxEquilibriumSum.test.ts',
  'packages/algorithms/tests/leadersInArray.test.ts',
  'packages/algorithms/tests/majorityElement.test.ts',
  'packages/algorithms/tests/lexicographicPalindrome.test.ts',
  'packages/algorithms/tests/naturalSort.test.ts',
  'packages/algorithms/tests/registry.test.ts'
]);

export class AlgorithmExecutionService {
  public getAllRegistry(): AlgorithmMetadata[] {
    return ALGORITHM_REGISTRY;
  }

  public getAlgorithm(identifier: string): AlgorithmMetadata | undefined {
    return getAlgorithmById(identifier) || getAlgorithmBySlug(identifier);
  }

  public executeAlgorithm(identifier: string, inputPayload: any) {
    const algo = this.getAlgorithm(identifier);
    if (!algo) {
      throw new Error(`Algorithm "${identifier}" is not registered.`);
    }

    const startTime = performance.now();
    try {
      const output = algo.execute(inputPayload);
      const executionTimeMs = Number((performance.now() - startTime).toFixed(3));

      // Record audit run in store
      store.analysisRuns.push({
        id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        symbol: inputPayload.symbol || 'N/A',
        algorithmId: algo.id,
        algorithmName: algo.name,
        timestamp: new Date().toISOString(),
        inputSnapshot: inputPayload,
        outputSnapshot: output,
        executionTimeMs
      });

      return {
        algorithmId: algo.id,
        algorithmName: algo.name,
        slug: algo.slug,
        executionTimeMs,
        input: inputPayload,
        output
      };
    } catch (err: any) {
      throw new Error(`Execution error in ${algo.name}: ${err.message}`);
    }
  }

  public getAlgorithmSource(identifier: string, requestedPath?: string) {
    const algo = this.getAlgorithm(identifier);
    if (!algo) {
      throw new Error(`Algorithm "${identifier}" not found in registry.`);
    }

    const relativePath = (requestedPath || algo.sourceFile).replace(/\\/g, '/');

    if (!ALLOWLISTED_FILES.has(relativePath)) {
      throw new Error(`Access denied: File "${relativePath}" is not in the permitted algorithm allowlist.`);
    }

    const absolutePath = path.resolve(projectRoot, relativePath);

    // Path traversal check
    if (!absolutePath.startsWith(projectRoot)) {
      throw new Error('Access denied: Path traversal detected.');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Source file "${relativePath}" does not exist on disk.`);
    }

    const code = fs.readFileSync(absolutePath, 'utf8');
    const lines = code.split('\n');

    return {
      algorithmId: algo.id,
      algorithmName: algo.name,
      filePath: relativePath,
      exportedFunction: algo.exportedFunction,
      testFile: algo.testFile,
      actualCaller: algo.actualCaller,
      timeComplexity: algo.timeComplexity,
      spaceComplexity: algo.spaceComplexity,
      lineCount: lines.length,
      sourceCode: code,
      lines
    };
  }
}

export const algorithmExecutionService = new AlgorithmExecutionService();
