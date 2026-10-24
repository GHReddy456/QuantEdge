import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDatabase } from './db/connection.js';

let initialized = false;
export const app = createApp();

export default async function handler(req: any, res: any) {
  if (!initialized) {
    connectDatabase().catch((err) => console.warn('Async DB connection:', err));
    initialized = true;
  }

  // Preserve original client request path across Vercel URL rewrites
  const originalPath = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (originalPath) {
    req.url = originalPath;
  } else if (req.url === '/api/index.js' || req.url === '/api/index') {
    req.url = '/';
  }

  return app(req, res);
}
