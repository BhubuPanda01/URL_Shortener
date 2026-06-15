import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import urlRoutes from './routes/url.routes';
import analyticsRoutes from './routes/analytics.routes';
import { redirectUrl } from './controllers/url.controller';
import { errorHandler } from './middleware/errorHandler';
import prisma from './config/database';
import redis from './config/redis';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// 4. GET /api/v1/health
app.get('/api/v1/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {}

  if (redis.status === 'ready') {
    redisStatus = 'connected';
  }

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus
    }
  });
});

// Versioned API Routes
app.use('/api/v1', urlRoutes); // Handles POST /api/v1/shorten
app.use('/api/v1/analytics', analyticsRoutes); // Handles GET /api/v1/analytics/:shortCode

// Root Route for redirection
// This must be declared after /api so it doesn't eagerly catch /api
app.get('/:shortCode', redirectUrl); // Handles GET /:shortCode

// Global Error Handler
app.use(errorHandler);

export default app;
