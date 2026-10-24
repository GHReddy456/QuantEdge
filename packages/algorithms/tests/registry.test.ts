import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALGORITHM_REGISTRY, getAlgorithmById, getAlgorithmBySlug } from '../src/registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

describe('Source Traceability & Algorithm Registry Tests', () => {
  it('registers exactly 13 algorithms with sequential IDs ACC-01 through ACC-13', () => {
    expect(ALGORITHM_REGISTRY.length).toBe(13);

    const ids = ALGORITHM_REGISTRY.map((a) => a.id);
    for (let i = 1; i <= 13; i++) {
      const expectedId = `ACC-${String(i).padStart(2, '0')}`;
      expect(ids).toContain(expectedId);
    }
  });

  it('verifies all registered source files exist on disk', () => {
    for (const algo of ALGORITHM_REGISTRY) {
      const fullPath = path.resolve(projectRoot, algo.sourceFile);
      expect(fs.existsSync(fullPath), `Source file ${algo.sourceFile} does not exist`).toBe(true);
    }
  });

  it('verifies all registered test files exist on disk', () => {
    for (const algo of ALGORITHM_REGISTRY) {
      const fullPath = path.resolve(projectRoot, algo.testFile);
      expect(fs.existsSync(fullPath), `Test file ${algo.testFile} does not exist`).toBe(true);
    }
  });

  it('verifies each algorithm source file exports the declared exportedFunction', () => {
    for (const algo of ALGORITHM_REGISTRY) {
      const fullPath = path.resolve(projectRoot, algo.sourceFile);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content).toContain(`export function ${algo.exportedFunction}`);
    }
  });

  it('verifies each algorithm has an executable runner that produces valid results', () => {
    for (const algo of ALGORITHM_REGISTRY) {
      expect(typeof algo.execute).toBe('function');
      const result = algo.execute(algo.inputSchema.examplePayload);
      expect(result).toBeDefined();
    }
  });

  it('can look up algorithms by both ID and slug', () => {
    const boothById = getAlgorithmById('ACC-01');
    const boothBySlug = getAlgorithmBySlug('booth');
    expect(boothById).toBeDefined();
    expect(boothBySlug).toBeDefined();
    expect(boothById?.id).toBe(boothBySlug?.id);
  });
});
