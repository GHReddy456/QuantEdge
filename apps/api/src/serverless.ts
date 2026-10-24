import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDatabase } from './db/connection.js';

// Non-blocking connection on module boot
connectDatabase().catch((err) => console.warn('Async DB connection:', err));

export const app = createApp();

// Restore original client request path across Vercel URL rewrites
app.use((req, _res, next) => {
  const originalPath = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (originalPath && typeof originalPath === 'string') {
    req.url = originalPath;
  }
  next();
});

export default app;
