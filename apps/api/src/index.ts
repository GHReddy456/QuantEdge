import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDatabase } from './db/connection.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

export const app = createApp();

async function bootstrap() {
  await connectDatabase();

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`QuantEdge API Server listening on http://localhost:${PORT}`);
    });
  }
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

export default app;
