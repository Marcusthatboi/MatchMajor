/**
 * Health Check Endpoint
 * Monitors API, Database, and external services
 * Add to server/routes/health.js
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * GET /health - Basic health check
 */
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      checks: {}
    };

    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.checks.database = { status: 'UP' };
    } else {
      health.checks.database = {
        status: 'DOWN',
        message: 'MongoDB connection failed'
      };
      health.status = 'PARTIAL';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      status: 'UP',
      usage: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      }
    };

    // Check disk space (if available)
    try {
      const diskUsage = require('diskusage').check('/');
      health.checks.disk = {
        status: 'UP',
        usage: {
          free: `${Math.round(diskUsage.available / 1024 / 1024 / 1024)}GB`,
          total: `${Math.round(diskUsage.total / 1024 / 1024 / 1024)}GB`
        }
      };
    } catch (e) {
      health.checks.disk = { status: 'UNKNOWN' };
    }

    const statusCode = health.status === 'UP' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/detailed - Detailed health report
 */
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION || '1.0.0',
      components: {}
    };

    // API Health
    health.components.api = {
      status: 'UP',
      responseTime: 'ok',
      port: process.env.PORT || 5000
    };

    // Database Health with query test
    try {
      const startTime = Date.now();
      
      // Simple ping command
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        const responseTime = Date.now() - startTime;
        
        health.components.database = {
          status: 'UP',
          responseTime: `${responseTime}ms`,
          connection: {
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            database: mongoose.connection.name
          }
        };
      }
    } catch (error) {
      health.components.database = {
        status: 'DOWN',
        error: error.message
      };
      health.status = 'DEGRADED';
    }

    // Security
    health.components.security = {
      helmet: process.env.ENABLE_HELMET === 'true' ? 'ENABLED' : 'DISABLED',
      cors: process.env.ENABLE_CORS === 'true' ? 'ENABLED' : 'DISABLED',
      rateLimiting: process.env.ENABLE_RATE_LIMIT === 'true' ? 'ENABLED' : 'DISABLED',
      csrf: process.env.ENABLE_CSRF === 'true' ? 'ENABLED' : 'DISABLED'
    };

    // System Resources
    const memUsage = process.memoryUsage();
    health.components.system = {
      memory: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      },
      nodejs: process.version,
      platform: process.platform,
      architecture: process.arch,
      cpuUsage: process.cpuUsage()
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/ready - Kubernetes readiness probe
 */
router.get('/ready', async (req, res) => {
  try {
    // Check all critical components
    const mongoReady = mongoose.connection.readyState === 1;
    
    if (mongoReady) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false });
    }
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});

/**
 * GET /health/live - Kubernetes liveness probe
 */
router.get('/live', (req, res) => {
  // Simple endpoint that indicates the container is running
  res.status(200).json({ alive: true });
});

module.exports = router;
