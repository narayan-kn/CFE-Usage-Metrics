// Simple in-memory cache for metrics data
class MetricsCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 10 * 60 * 1000; // 10 minutes in milliseconds
  }

  // Generate cache key from parameters
  generateKey(reportName, startDate, endDate) {
    return `${reportName}:${startDate}:${endDate}`;
  }

  // Set cache entry with TTL
  set(key, data, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiresAt,
      cachedAt: new Date().toISOString()
    });
    console.log(`Cache SET: ${key} (expires in ${ttl/1000}s)`);
  }

  // Get cache entry if not expired
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`Cache MISS: ${key}`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      console.log(`Cache EXPIRED: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache HIT: ${key} (cached at ${entry.cachedAt})`);
    return {
      data: entry.data,
      cachedAt: entry.cachedAt,
      fromCache: true
    };
  }

  // Clear specific cache entry
  delete(key) {
    this.cache.delete(key);
    console.log(`Cache DELETE: ${key}`);
  }

  // Clear all cache entries
  clear() {
    this.cache.clear();
    console.log('Cache CLEARED: All entries removed');
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    return {
      totalEntries: entries.length,
      activeEntries: entries.filter(([_, v]) => now <= v.expiresAt).length,
      expiredEntries: entries.filter(([_, v]) => now > v.expiresAt).length,
      entries: entries.map(([key, value]) => ({
        key,
        cachedAt: value.cachedAt,
        expiresAt: new Date(value.expiresAt).toISOString(),
        isExpired: now > value.expiresAt,
        size: JSON.stringify(value.data).length
      }))
    };
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cache CLEANUP: Removed ${cleaned} expired entries`);
    }
    
    return cleaned;
  }
}

// Create singleton instance
const metricsCache = new MetricsCache();

// Run cleanup every 5 minutes
setInterval(() => {
  metricsCache.cleanup();
}, 5 * 60 * 1000);

export default metricsCache;

// Made with Bob
