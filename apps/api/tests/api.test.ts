import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('QuantEdge Backend API Tests', () => {
  it('GET /health returns status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /api/algorithms/registry returns exactly 13 algorithms', async () => {
    const res = await request(app).get('/api/algorithms/registry');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(13);
    expect(res.body.data.length).toBe(13);
  });

  it('POST /api/algorithms/booth/run executes Booth algorithm correctly', async () => {
    const res = await request(app)
      .post('/api/algorithms/booth/run')
      .send({ a: 7, b: -3, bitWidth: 8 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.output.product).toBe(-21);
    expect(res.body.data.output.steps.length).toBeGreaterThan(0);
  });

  it('GET /api/algorithms/booth/source returns real source code and line count', async () => {
    const res = await request(app).get('/api/algorithms/booth/source');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exportedFunction).toBe('boothMultiply');
    expect(res.body.data.lineCount).toBeGreaterThan(50);
    expect(res.body.data.sourceCode).toContain('export function boothMultiply');
  });

  it('GET /api/algorithms/booth/source blocks path traversal or unauthorized files', async () => {
    const res = await request(app).get('/api/algorithms/booth/source?path=../../.env');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Access denied');
  });

  it('GET /api/markets/quote returns quote with traditional equity details', async () => {
    const res = await request(app).get('/api/markets/quote?symbol=AAPL');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.symbol).toBe('AAPL');
    expect(res.body.data.price).toBeGreaterThan(0);
    expect(['USD', 'INR']).toContain(res.body.data.currency);
  });

  it('POST /api/paper/orders executes simulated paper purchase and updates cash balance', async () => {
    // Reset portfolio first
    await request(app).post('/api/portfolio/reset').send({ startingCapital: 10000 });

    const buyRes = await request(app)
      .post('/api/paper/orders')
      .send({
        symbol: 'AAPL',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 5
      });

    expect(buyRes.status).toBe(201);
    expect(buyRes.body.success).toBe(true);
    expect(buyRes.body.data.status).toBe('FILLED');
    expect(buyRes.body.data.quantity).toBe(5);

    // Verify portfolio updated
    const pfRes = await request(app).get('/api/portfolio');
    expect(pfRes.body.data.cashBalance).toBeLessThan(10000);
    expect(pfRes.body.data.positions.some((p: any) => p.symbol === 'AAPL' && p.quantity === 5)).toBe(true);
  });

  it('POST /api/paper/orders rejects order when cash is insufficient', async () => {
    const res = await request(app)
      .post('/api/paper/orders')
      .send({
        symbol: 'AAPL',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 999999 // Exceeds cash
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Insufficient');
  });

  it('POST /api/paper/orders rejects selling more shares than held (overselling)', async () => {
    const res = await request(app)
      .post('/api/paper/orders')
      .send({
        symbol: 'MSFT',
        side: 'SELL',
        orderType: 'MARKET',
        quantity: 50 // Not held
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Cannot sell');
  });

  it('GET /api/analytics/leaders/AAPL returns historical price leaders', async () => {
    const res = await request(app).get('/api/analytics/leaders/AAPL');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leaders.length).toBeGreaterThan(0);
  });

  it('GET /api/settings returns provider and database status without exposing secrets', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.marketDataProvider).toBeDefined();
    expect(res.body.data.database).toBeDefined();
    // Verify no secret leak
    expect(JSON.stringify(res.body)).not.toContain('TWELVE_DATA_API_KEY');
  });
});
