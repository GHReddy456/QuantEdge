export default async function handler(req, res) {
  try {
    const { default: app } = await import('../dist/index.js');

    // Preserve original client request path across Vercel URL rewrites
    const originalPath = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (originalPath) {
      req.url = originalPath;
    } else if (req.url === '/api/index.js' || req.url === '/api/index') {
      req.url = '/';
    }

    return app(req, res);
  } catch (err) {
    console.error('Serverless Execution Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Serverless invocation error',
      name: err?.name,
      stack: err?.stack
    });
  }
}
