import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let redis: Redis;

if (redisUrl) {
  // If a full connection string is provided (e.g. redis:// or rediss://)
  redis = new Redis(redisUrl);
} else {
  // Fallback to host/port
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  
  redis = new Redis({
    host: redisHost,
    port: redisPort,
  });
}

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export default redis;
