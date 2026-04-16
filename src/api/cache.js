/**
 * Request Cache Utility
 * Provides time-based caching for API responses
 * Reduces redundant network requests and improves perceived performance
 */

class RequestCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl; // Time to live in milliseconds
  }

  /**
   * Retrieve cached value
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if cache has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Store value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  set(key, value) {
    this.cache.set(key, {
      data: value,
      expiry: Date.now() + this.ttl,
      createdAt: new Date()
    });
  }

  /**
   * Clear all cached items
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear cache for a specific pattern
   * @param {RegExp|string} pattern - Pattern to match keys
   */
  clearPattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  stats() {
    return {
      size: this.cache.size,
      ttl: this.ttl,
      items: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.createdAt.getTime(),
        expired: Date.now() > value.expiry
      }))
    };
  }
}

// Create singleton instance
export const apiCache = new RequestCache(60000); // 60 second TTL

export default RequestCache;
