import axios from "axios";
import { pageCache, generateCacheKey } from "./pageCache";

// Create axios instance
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Important: Send cookies with requests
});

// Enhanced GET method with caching
const cachedGet = async (url, config = {}) => {
  const cacheKey = generateCacheKey(url, config.params);

  // Check cache first
  if (!config.skipCache) {
    const cached = pageCache.get(cacheKey);
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }

  // Make API call
  const response = await api.get(url, config);

  // Cache the response (but not if skipCache was requested)
  if (response.data && !config.skipCache) {
    pageCache.set(cacheKey, response.data);
  }

  return response;
};

// Enhanced API object with caching
const enhancedApi = {
  // GET with caching
  get: cachedGet,

  // POST, PUT, DELETE without caching but with cache invalidation
  post: async (url, data, config = {}) => {
    const response = await api.post(url, data, config);

    // Invalidate related cache entries
    if (url.includes("/groups")) {
      pageCache.invalidate("groups");
    }
    if (url.includes("/messages")) {
      pageCache.invalidate("messages");
    }
    if (url.includes("/auth/profile")) {
      pageCache.invalidate("user");
    }

    return response;
  },

  put: async (url, data, config = {}) => {
    const response = await api.put(url, data, config);

    // Invalidate related cache entries
    if (url.includes("/groups")) {
      pageCache.invalidate("groups");
    }
    if (url.includes("/auth/profile")) {
      pageCache.invalidate("user");
    }

    return response;
  },

  delete: async (url, config = {}) => {
    const response = await api.delete(url, config);

    // Invalidate related cache entries
    if (url.includes("/groups")) {
      pageCache.invalidate("groups");
    }

    return response;
  },
};

// Response interceptor to handle errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // Clear cache on authentication errors
      pageCache.clear();

      // Redirect to login on unauthorized
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default enhancedApi;
