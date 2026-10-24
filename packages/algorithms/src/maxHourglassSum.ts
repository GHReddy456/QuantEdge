/**
 * Algorithm ID: ACC-08
 * Algorithm: Maximum Sum of Hourglass in Matrix
 *
 * Problem Definition:
 * Given a 2D numerical matrix of size R x C (with R >= 3 and C >= 3), compute the maximum sum
 * of any 7-cell hourglass pattern defined by coordinates:
 * [r, c], [r, c+1], [r, c+2], [r+1, c+1], [r+2, c], [r+2, c+1], [r+2, c+2].
 *
 * Exported Function:
 * maxHourglassSum(matrix)
 *
 * Input:
 * matrix: number[][] (2D array with at least 3 rows and 3 columns)
 *
 * Output:
 * HourglassResult {
 *   maxSum: number,
 *   bestRow: number,
 *   bestCol: number,
 *   cells: number[],
 *   gridRows: number,
 *   gridCols: number,
 *   steps: HourglassStep[]
 * }
 *
 * Time Complexity: O((R - 2) * (C - 2)) ~ O(R * C)
 * Auxiliary Space: O(1) auxiliary (O((R - 2) * (C - 2)) for evaluation steps)
 *
 * Business Application:
 * Market Analytics -> Performance Heatmap.
 * Identifies concentrated clusters of localized sector/factor performance within an industry-by-time
 * or valuation-by-momentum grid.
 * Note: Educational custom grid scan; not an industry standard risk factor.
 *
 * Caller:
 * apps/api/src/services/market-analytics.service.ts
 *
 * Tests:
 * packages/algorithms/tests/maxHourglassSum.test.ts
 */

export interface HourglassStep {
  row: number;
  col: number;
  cells: number[];
  sum: number;
  isCurrentMax: boolean;
}

export interface HourglassResult {
  maxSum: number;
  bestRow: number;
  bestCol: number;
  cells: number[];
  gridRows: number;
  gridCols: number;
  steps: HourglassStep[];
}

export function maxHourglassSum(matrix: number[][]): HourglassResult {
  if (!Array.isArray(matrix) || matrix.length < 3) {
    throw new Error('Matrix must have at least 3 rows.');
  }

  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  if (cols < 3) {
    throw new Error('Matrix must have at least 3 columns.');
  }

  for (let r = 0; r < rows; r++) {
    if (!Array.isArray(matrix[r]) || matrix[r].length !== cols) {
      throw new Error(`Row ${r} has invalid column count. All rows must have exactly ${cols} columns.`);
    }
    for (let c = 0; c < cols; c++) {
      if (typeof matrix[r][c] !== 'number' || !Number.isFinite(matrix[r][c])) {
        throw new Error(`Matrix cell at [${r}, ${c}] is not a valid finite number.`);
      }
    }
  }

  let maxSum = -Infinity;
  let bestRow = -1;
  let bestCol = -1;
  let bestCells: number[] = [];
  const steps: HourglassStep[] = [];

  for (let r = 0; r <= rows - 3; r++) {
    for (let c = 0; c <= cols - 3; c++) {
      const top1 = matrix[r][c];
      const top2 = matrix[r][c + 1];
      const top3 = matrix[r][c + 2];
      const mid = matrix[r + 1][c + 1];
      const bot1 = matrix[r + 2][c];
      const bot2 = matrix[r + 2][c + 1];
      const bot3 = matrix[r + 2][c + 2];

      const sum = top1 + top2 + top3 + mid + bot1 + bot2 + bot3;
      const cells = [top1, top2, top3, mid, bot1, bot2, bot3];

      const isCurrentMax = sum > maxSum;
      if (isCurrentMax) {
        maxSum = sum;
        bestRow = r;
        bestCol = c;
        bestCells = cells;
      }

      steps.push({
        row: r,
        col: c,
        cells,
        sum,
        isCurrentMax
      });
    }
  }

  return {
    maxSum,
    bestRow,
    bestCol,
    cells: bestCells,
    gridRows: rows,
    gridCols: cols,
    steps
  };
}
