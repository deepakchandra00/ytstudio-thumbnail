const express = require('express');
const router = express.Router();
const { getSystemMetrics } = require('../services/monitoringService');
const cacheService = require('../services/cacheService');
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check Redis connection
    let redisStatus = 'disconnected';
    try {
      await cacheService.redis.ping();
      redisStatus = 'connected';
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // Get system metrics
    const metrics = getSystemMetrics();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        cache: redisStatus
      },
      system: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router; 