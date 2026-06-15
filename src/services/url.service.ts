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

  // Cache in Redis (TTL = 3600 seconds)
  await redis.setex(`url:${shortCode}`, 3600, originalUrl);

  return newUrl;
};

export const resolveUrl = async (shortCode: string) => {
  const cacheKey = `url:${shortCode}`;
  
  // 1. Check Redis cache
  const cachedUrl = await redis.get(cacheKey);
  if (cachedUrl) {
    return { originalUrl: cachedUrl, isCached: true };
  }

  // 2. Cache MISS: query PostgreSQL
  const dbUrl = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!dbUrl) {
    return null;
  }

  // 3. Store in Redis
  await redis.setex(cacheKey, 3600, dbUrl.originalUrl);

  return { originalUrl: dbUrl.originalUrl, dbUrl, isCached: false };
};
