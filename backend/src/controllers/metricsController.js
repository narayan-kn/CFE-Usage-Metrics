import metricsService from '../services/metricsService.js';
import metricsCache from '../utils/cache.js';

/**
 * Controller for metrics endpoints
 */
class MetricsController {
  /**
   * Get database schema
   */
  async getSchema(req, res) {
    try {
      const schema = await metricsService.getDatabaseSchema();
      res.json({
        success: true,
        data: schema
      });
    } catch (error) {
      console.error('Error fetching schema:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get table counts
   */
  async getTableCounts(req, res) {
    try {
      const counts = await metricsService.getTableCounts();
      res.json({
        success: true,
        data: counts
      });
    } catch (error) {
      console.error('Error fetching table counts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get columns for a specific table
   */
  async getTableColumns(req, res) {
    try {
      const { schema, table } = req.params;
      const columns = await metricsService.getTableColumns(schema, table);
      res.json({
        success: true,
        data: columns
      });
    } catch (error) {
      console.error('Error fetching table columns:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Execute custom query
   */
  async executeQuery(req, res) {
    try {
      const { query, params } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query is required'
        });
      }

      const result = await metricsService.executeCustomQuery(query, params);
      res.json(result);
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(req, res) {
    try {
      const stats = await metricsService.getDatabaseStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching database stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Search tables
   */
  async searchTables(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query parameter "q" is required'
        });
      }

      const results = await metricsService.searchTables(q);
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error searching tables:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get sample data from a table
   */
  async getTableSample(req, res) {
    try {
      const { schema, table } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await metricsService.getTableSample(schema, table, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching table sample:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get worktype counts
   */
  async getWorktypeCounts(req, res) {
    try {
      const startDate = req.query.startDate || '2025-04-21';
      const result = await metricsService.getWorktypeCounts(startDate);
      res.json(result);
    } catch (error) {
      console.error('Error fetching worktype counts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get CSR Metrics Report
   */
  async getCSRMetrics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const result = await metricsService.getCSRMetrics(startDate, endDate);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error fetching CSR metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get Back Office Users metrics
  async getBackOfficeMetrics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const result = await metricsService.getBackOfficeMetrics(startDate, endDate);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error fetching back office metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get User Personas metrics (with caching support)
  async getUserPersonasMetrics(req, res) {
    try {
      const { startDate, endDate, useCache = 'true', cacheTTL } = req.query;
      
      // Generate cache key
      const cacheKey = metricsCache.generateKey('user-personas', startDate, endDate);
      
      // Option 1: Time-based cache (default behavior when useCache=true)
      // Option 2: Manual cache control (when useCache=false, skip cache)
      if (useCache === 'true') {
        const cachedData = metricsCache.get(cacheKey);
        if (cachedData) {
          console.log(`✅ Returning cached User Personas data (cached at: ${cachedData.cachedAt})`);
          return res.json({
            ...cachedData.data,
            fromCache: true,
            cachedAt: cachedData.cachedAt
          });
        }
      }
      
      // Cache miss or cache disabled - fetch fresh data
      console.log('⏳ Fetching fresh User Personas data from database...');
      const startTime = Date.now();
      const result = await metricsService.getUserPersonasMetrics(startDate, endDate);
      const duration = Date.now() - startTime;
      
      console.log(`✅ User Personas query completed in ${duration}ms`);
      
      if (result.success) {
        // Store in cache with custom TTL if provided
        const ttl = cacheTTL ? parseInt(cacheTTL) * 1000 : undefined;
        metricsCache.set(cacheKey, result, ttl);
        
        res.json({
          ...result,
          fromCache: false,
          queryDuration: duration
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error fetching user personas metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get cache statistics
  async getCacheStats(req, res) {
    try {
      const stats = metricsCache.getStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Clear cache
  async clearCache(req, res) {
    try {
      const { key } = req.query;
      
      if (key) {
        metricsCache.delete(key);
        res.json({
          success: true,
          message: `Cache entry '${key}' cleared`
        });
      } else {
        metricsCache.clear();
        res.json({
          success: true,
          message: 'All cache entries cleared'
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new MetricsController();

// Made with Bob
