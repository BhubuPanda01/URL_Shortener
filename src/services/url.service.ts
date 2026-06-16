import prisma from '../config/database';
import redis from '../config/redis';
import { generateShortCode } from '../utils/shortCode';

export const shortenUrl = async (originalUrl: string, customCode?: string) => {
  const shortCode = customCode || generateShortCode();

  // The Prisma query will throw a P2002 error if the customCode is already taken,
  // which is handled by our global error handler.
  const newUrl = await prisma.url.create({
    data: {
      originalUrl,
      shortCode,
    },
  });

  try {
    // Cache in Redis (TTL = 3600 seconds)
    await redis.setex(`url:${shortCode}`, 3600, originalUrl);
  } catch (err) {
    console.error('Redis Cache Error (Skipping cache set):', err.message);
  }

  return newUrl;
};

export const resolveUrl = async (shortCode: string) => {
  const cacheKey = `url:${shortCode}`;
  
  // 1. Check Redis cache gracefully
  try {
    const cachedUrl = await redis.get(cacheKey);
    if (cachedUrl) {
      return { originalUrl: cachedUrl, isCached: true };
    }
  } catch (err) {
    console.error('Redis Cache Error (Skipping cache read):', err.message);
  }

  // 2. Cache MISS: query PostgreSQL
  const dbUrl = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!dbUrl) {
    return null;
  }

  // 3. Store in Redis gracefully
  try {
    await redis.setex(cacheKey, 3600, dbUrl.originalUrl);
  } catch (err) {
    console.error('Redis Cache Error (Skipping cache set):', err.message);
  }

  return { originalUrl: dbUrl.originalUrl, dbUrl, isCached: false };
};
