import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDatabase } from './db/connection.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

export { app };

// Connect database asynchronously without blocking serverless function cold starts
connectDatabase().catch((err) => console.warn('Async DB connection warning:', err));

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`QuantEdge API Server listening on http://localhost:${PORT}`);
  });
}

export default app;
