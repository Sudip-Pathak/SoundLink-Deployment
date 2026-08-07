/**
 * Centralized API configuration
 * This file provides a single source of truth for API URL configuration
 */

// Production backend URL - used as fallback and for deployed environments
const PRODUCTION_BACKEND = 'https://soundlink-by-sudip.onrender.com';

/**
 * Resolve the backend URL intelligently:
 * - In production builds, always use the production backend
 * - In development, use the env variable if set, otherwise fallback to production
 */
function resolveBackendUrl() {
  const envUrl = import.meta.env.VITE_BACKEND_URL;

  // If no env variable is set, use production
  if (!envUrl) return PRODUCTION_BACKEND;

  // In production builds, if env var still points to localhost, override to production
  if (import.meta.env.PROD && envUrl.includes('localhost')) {
    return PRODUCTION_BACKEND;
  }

  return envUrl;
}

export const API_BASE_URL = resolveBackendUrl();

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  // Make sure the endpoint starts with a slash if not already
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

// Common API request headers
export const getAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Auto-retry functionality for API requests
export const fetchWithRetry = async (url, options = {}, maxRetries = 2) => {
  let retries = 0;
  let lastError = null;
  
  // Set a timeout by default
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
  
  while (retries <= maxRetries) {
    try {
      // Add abort signal if not already present
      const fetchOptions = { 
        ...options,
        signal: options.signal || controller.signal
      };
      
      const response = await fetch(url, fetchOptions);
      
      // Clear the timeout since request completed
      clearTimeout(timeoutId);
      
      // Return successful response
      return response;
    } catch (error) {
      lastError = error;
      
      // Don't retry if request was aborted or timeout
      if (error.name === 'AbortError') {
        console.log(`Request to ${url} timed out or aborted`);
        break;
      }
      
      retries++;
      
      // Only retry on network errors or 5xx server errors
      if (retries <= maxRetries) {
        // Exponential backoff: 300ms, 900ms, 2700ms, etc.
        const delay = Math.min(300 * Math.pow(3, retries - 1), 10000);
        console.log(`Retrying request to ${url} (${retries}/${maxRetries}) after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Clear timeout if we broke out of the loop
  clearTimeout(timeoutId);
  
  // All retries failed
  throw lastError || new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
};