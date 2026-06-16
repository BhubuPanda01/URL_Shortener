import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${ip}`;
    const limit = 100;
    const windowSeconds = 3600;

    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);
    
    const results = await pipeline.exec();
    
    if (!results) {
      return next(new Error('Redis pipeline failed'));
    }

    const currentCount = results[0][1] as number;
    let ttl = results[1][1] as number;

    // If it's the first request (or TTL wasn't set somehow), set TTL
    if (currentCount === 1 || ttl === -1) {
      await redis.expire(key, windowSeconds);
      ttl = windowSeconds;
    }

    if (currentCount > limit) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Maximum 100 URLs per hour per IP.",
        retryAfter: ttl > 0 ? ttl : windowSeconds
      });
    }

    next();
  } catch (error) {
    console.error('Redis Rate Limiter Error (Skipping rate limit):', error.message);
    // Fail open: if Redis is down, we still want to allow URL shortening to work
    next();
  }
};
