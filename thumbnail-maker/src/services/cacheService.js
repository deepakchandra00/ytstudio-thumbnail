const Redis = require('ioredis');

class CacheService {
  constructor() {
    // Only initialize Redis if URL is provided
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => {
            if (times > 3) {
              this.redis = null;
              return null; // stop retrying
            }
            return Math.min(times * 100, 3000);
          }
        });

        this.redis.on('error', (error) => {
          console.warn('Redis connection failed, continuing without cache:', error.message);
          this.redis = null;
        });

        this.redis.on('connect', () => {
          console.info('Connected to Redis');
        });
      } catch (error) {
        console.warn('Failed to initialize Redis, continuing without cache:', error.message);
        this.redis = null;
      }
    } else {
      console.info('No Redis URL provided, continuing without cache');
      this.redis = null;
    }
  }

  async get(key) {
    if (!this.redis) return null;
    
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error.message);
      return null;
    }
  }

  async set(key, value, expirySeconds = 3600) {
    if (!this.redis) return false;
    
    try {
      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        expirySeconds
      );
      return true;
    } catch (error) {
      console.error('Redis set error:', error.message);
      return false;
    }
  }

  async delete(key) {
    if (!this.redis) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error.message);
      return false;
    }
  }

  isConnected() {
    return this.redis !== null;
  }
}

// Export a singleton instance
module.exports = new CacheService(); 