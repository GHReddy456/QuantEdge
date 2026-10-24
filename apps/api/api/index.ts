import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/db/connection.js';

await connectDatabase().catch(console.error);
const app = createApp();

export default app;
