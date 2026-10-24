import app from '../dist/index.js';

export default async function handler(req, res) {
  // Preserve original client request path across Vercel URL rewrites
  const originalPath = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (originalPath) {
    req.url = originalPath;
  } else if (req.url === '/api/index.js' || req.url === '/api/index') {
    req.url = '/';
  }

  return app(req, res);
}
