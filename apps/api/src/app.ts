import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import aiRouter from './routes/ai.js';
import playerRouter from './routes/player.js';

/**
 * Creates and configures the Express application.
 *
 * This function is separated from server startup so the app can be reused
 * later in tests without opening a network port.
 */
const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
app.use('/api/ai', aiRouter);
app.use('/api/player', playerRouter);

export default app;
