const cacheService = require('../services/cacheService');
const logger = require('../services/loggerService');

const cache = (duration = 3600) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!cacheService.isConnected()) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl}:${req.user ? req.user._id : 'public'}`;

    try {
      const cachedData = await cacheService.get(key);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original send function
      const originalSend = res.json;

      // Override res.json method
      res.json = function(body) {
        // Restore original send
        res.json = originalSend;

        // Cache the response
        cacheService.set(key, body, duration).catch(error => {
          logger.error('Cache set error:', error.message);
        });

        // Send the response
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error.message);
      next();
    }
  };
};

module.exports = { cache }; 