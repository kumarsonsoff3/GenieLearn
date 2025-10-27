// Performance optimization utilities for caching and faster page loads

class PageCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 10; // Maximum number of cached items
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL (default)
    // Shorter TTL for specific endpoints that need fresh data
    this.customTTL = {
      "/groups/list": 30 * 1000, // 30 seconds for public groups list
      "/groups/my-groups": 60 * 1000, // 1 minute for user's groups
    };
  }

  set(key, data) {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Get TTL for this specific key or use default
    const ttl = this.customTTL[key] || this.ttl;

    // Check if data is still fresh
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global page cache instance
export const pageCache = new PageCache();

// Helper to generate cache keys
export const generateCacheKey = (endpoint, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join("&");

  return paramString ? `${endpoint}?${paramString}` : endpoint;
};

// Preload critical resources
export const preloadCriticalData = async () => {
  try {
    // Preload user data if authenticated
    if (document.cookie.includes("session=")) {
      const userResponse = await fetch("/api/auth/me");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        pageCache.set("user", userData);
      }
    }
  } catch (error) {
    console.warn("Failed to preload critical data:", error);
  }
};

// Prefetch data for faster navigation
export const prefetchPageData = async page => {
  switch (page) {
    case "groups":
      try {
        const [groupsResponse, myGroupsResponse, statsResponse] =
          await Promise.all([
            fetch("/api/groups/list"),
            fetch("/api/groups/my-groups"),
            fetch("/api/groups/stats"),
          ]);

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          pageCache.set("groups/list", groupsData);
        }

        if (myGroupsResponse.ok) {
          const myGroupsData = await myGroupsResponse.json();
          pageCache.set("groups/my-groups", myGroupsData);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          pageCache.set("groups/stats", statsData);
        }
      } catch (error) {
        console.warn("Failed to prefetch groups data:", error);
      }
      break;

    case "dashboard":
      try {
        const myGroupsResponse = await fetch("/api/groups/my-groups");
        if (myGroupsResponse.ok) {
          const myGroupsData = await myGroupsResponse.json();
          pageCache.set("groups/my-groups", myGroupsData);
        }
      } catch (error) {
        console.warn("Failed to prefetch dashboard data:", error);
      }
      break;

    default:
      break;
  }
};

// Enhanced API call with caching
export const cachedApiCall = async (endpoint, options = {}) => {
  const cacheKey = generateCacheKey(endpoint, options.params);

  // Try to get from cache first
  if (options.method === "GET" || !options.method) {
    const cached = pageCache.get(cacheKey);
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }

  // Make the API call
  try {
    const url = options.params
      ? `${endpoint}?${new URLSearchParams(options.params).toString()}`
      : endpoint;

    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache GET requests
    if (options.method === "GET" || !options.method) {
      pageCache.set(cacheKey, data);
    }

    return { data, fromCache: false };
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export default pageCache;
