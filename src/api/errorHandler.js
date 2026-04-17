/**
 * API Error Handling Utility
 * Provides consistent error handling across the application
 * Categorizes errors and enables better error recovery
 */

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status, originalError = null, endpoint = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.originalError = originalError;
    this.endpoint = endpoint;
    this.timestamp = new Date().toISOString();
  }

  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  isServerError() {
    return this.status >= 500;
  }

  isNetworkError() {
    return !this.status;
  }

  isValidationError() {
    return this.status === 400;
  }

  isAuthError() {
    return this.status === 401;
  }

  isForbiddenError() {
    return this.status === 403;
  }

  isNotFoundError() {
    return this.status === 404;
  }

  isTimeoutError() {
    return this.status === 408;
  }

  isConflictError() {
    return this.status === 409;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      endpoint: this.endpoint,
      timestamp: this.timestamp,
      userMessage: this.getUserMessage()
    };
  }

  /**
   * Get user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    if (this.isNetworkError()) {
      return 'Network error. Please check your connection.';
    }
    if (this.isAuthError()) {
      return 'Your session has expired. Please log in again.';
    }
    if (this.isForbiddenError()) {
      return 'You do not have permission to perform this action.';
    }
    if (this.isNotFoundError()) {
      return 'The requested resource was not found.';
    }
    if (this.isServerError()) {
      return 'A server error occurred. Please try again later.';
    }
    if (this.isClientError()) {
      return 'An error occurred. Please check your input.';
    }
    return 'An unexpected error occurred.';
  }
}

/**
 * Handle and normalize axios errors
 * @param {Error} error - Axios error object
 * @param {string} endpoint - API endpoint
 * @returns {APIError} Normalized API error
 */
export function handleAPIError(error, endpoint = 'Unknown') {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    // Try multiple message extraction patterns
    let message = 'API Error';
    if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    } else if (data?.msg) {
      message = data.msg;
    } else if (typeof data === 'string') {
      message = data;
    }
    
    // Log full error details for debugging
    console.error(`[${status}] API Error at ${endpoint}:`, {
      message,
      data,
      status
    });
    
    return new APIError(message, status, error, endpoint);
  } else if (error.request) {
    // Request made but no response
    console.error(`No response from server for ${endpoint}:`, {
      request: error.request,
      code: error.code,
      errno: error.errno
    });
    return new APIError(
      'No response from server',
      null,
      error,
      endpoint
    );
  } else if (error.message === 'Network Error') {
    // Network error
    console.error(`Network error for ${endpoint}:`, error);
    return new APIError(
      'Network connection failed',
      null,
      error,
      endpoint
    );
  }
  
  // Other errors
  console.error(`Unknown error for ${endpoint}:`, error);
  return new APIError(
    error.message || 'Unknown Error',
    null,
    error,
    endpoint
  );
}

/**
 * Log error with structured format
 * @param {Error} error - Error to log
 * @param {object} context - Additional context
 */
export function logError(error, context = {}) {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    error: {
      name: error.name,
      message: error.message,
      status: error.status,
      endpoint: error.endpoint
    },
    context
  };

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${timestamp}] Error:`, errorLog);
  }

  // Log to error tracking service in production
  if (process.env.NODE_ENV === 'production' && window.__errorReporter) {
    window.__errorReporter(errorLog);
  }

  return errorLog;
}

/**
 * Retry failed API calls with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} Result of function call
 */
export async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Create error recovery strategies
 */
export const ErrorRecovery = {
  /**
   * Handle 401 Unauthorized error
   * @param {APIError} error - Error object
   */
  handle401: async (error) => {
    // Clear auth token
    localStorage.removeItem('authToken');
    
    // Redirect to login
    window.location.href = '/login';
    
    logError(error, { recovery: '401_redirect_to_login' });
  },

  /**
   * Handle 403 Forbidden error
   * @param {APIError} error - Error object
   */
  handle403: async (error) => {
    logError(error, { recovery: '403_permission_denied' });
    // Show permission denied message to user
    throw error;
  },

  /**
   * Handle 404 Not Found error
   * @param {APIError} error - Error object
   */
  handle404: async (error) => {
    logError(error, { recovery: '404_resource_not_found' });
    throw error;
  },

  /**
   * Handle network errors with retry
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Max retries
   */
  handleNetworkError: async (fn, maxRetries = 3) => {
    return await retryWithBackoff(fn, maxRetries, 1000);
  },

  /**
   * Handle rate limit errors (429)
   * @param {APIError} error - Error object
   */
  handle429: async (error) => {
    const retryAfter = error.originalError?.response?.headers['retry-after'] || 60;
    logError(error, { recovery: `429_rate_limit_wait_${retryAfter}s` });
    
    // Wait and retry
    return new Promise(resolve => {
      setTimeout(resolve, retryAfter * 1000);
    });
  }
};

export default {
  APIError,
  handleAPIError,
  logError,
  retryWithBackoff,
  ErrorRecovery
};
