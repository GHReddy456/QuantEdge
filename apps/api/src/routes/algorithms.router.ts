import { Router, Request, Response } from 'express';
import { algorithmExecutionService } from '../services/algorithm-execution.service.js';

export const algorithmsRouter = Router();

// GET /api/algorithms/registry
algorithmsRouter.get('/registry', (_req: Request, res: Response) => {
  try {
    const list = algorithmExecutionService.getAllRegistry().map((algo) => ({
      id: algo.id,
      slug: algo.slug,
      name: algo.name,
      category: algo.category,
      description: algo.description,
      sourceFile: algo.sourceFile,
      exportedFunction: algo.exportedFunction,
      testFile: algo.testFile,
      applicationUseCase: algo.applicationUseCase,
      actualCaller: algo.actualCaller,
      route: algo.route,
      timeComplexity: algo.timeComplexity,
      spaceComplexity: algo.spaceComplexity
    }));

    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/algorithms/:identifier
algorithmsRouter.get('/:identifier', (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const algo = algorithmExecutionService.getAlgorithm(identifier);
    if (!algo) {
      return res.status(404).json({ success: false, error: `Algorithm "${identifier}" not found.` });
    }

    res.json({
      success: true,
      data: {
        id: algo.id,
        slug: algo.slug,
        name: algo.name,
        category: algo.category,
        description: algo.description,
        problemStatement: algo.problemStatement,
        sourceFile: algo.sourceFile,
        exportedFunction: algo.exportedFunction,
        testFile: algo.testFile,
        applicationUseCase: algo.applicationUseCase,
        actualCaller: algo.actualCaller,
        route: algo.route,
        timeComplexity: algo.timeComplexity,
        spaceComplexity: algo.spaceComplexity,
        inputSchema: algo.inputSchema,
        outputSchema: algo.outputSchema
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/algorithms/:identifier/run
algorithmsRouter.post('/:identifier/run', (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const payload = req.body;
    const result = algorithmExecutionService.executeAlgorithm(identifier, payload);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/algorithms/:identifier/source?path=...
algorithmsRouter.get('/:identifier/source', (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const requestedPath = req.query.path ? String(req.query.path) : undefined;
    const sourceData = algorithmExecutionService.getAlgorithmSource(identifier, requestedPath);
    res.json({ success: true, data: sourceData });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
