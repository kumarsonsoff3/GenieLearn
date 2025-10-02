import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../utils/enhancedApi";

/**
 * Custom hook for making authenticated API calls with loading states and error handling
 * @param {string} baseUrl - Optional base URL for API calls
 * @returns {object} API methods and states
 */
const useApi = (baseUrl = "") => {
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create authenticated config
  const getConfig = useCallback(() => {
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  }, [token]);

  // Generic API call wrapper
  const makeRequest = useCallback(
    async (method, url, data = null, customConfig = {}) => {
      setLoading(true);
      setError(null);

      try {
        const config = { ...getConfig(), ...customConfig };
        const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

        let response;
        switch (method.toLowerCase()) {
          case "get":
            response = await api.get(fullUrl, config);
            break;
          case "post":
            response = await api.post(fullUrl, data, config);
            break;
          case "put":
            response = await api.put(fullUrl, data, config);
            break;
          case "delete":
            response = await api.delete(fullUrl, config);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || err.message || "An error occurred";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, getConfig]
  );

  // Convenience methods
  const get = useCallback(
    (url, config) => makeRequest("get", url, null, config),
    [makeRequest]
  );
  const post = useCallback(
    (url, data, config) => makeRequest("post", url, data, config),
    [makeRequest]
  );
  const put = useCallback(
    (url, data, config) => makeRequest("put", url, data, config),
    [makeRequest]
  );
  const del = useCallback(
    (url, config) => makeRequest("delete", url, null, config),
    [makeRequest]
  );

  // Clear error manually
  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
    get,
    post,
    put,
    delete: del,
    makeRequest,
  };
};

export default useApi;
