// Global token expiration handler
const handleTokenExpiration = () => {
  // Clear user data
  localStorage.removeItem('user');
  localStorage.removeItem('lastAuthCheck');
  
  // Show alert to user
  alert('Your session has expired. Please login again.');
  
  // Reload the page to reset all state
  window.location.reload();
};

// Override fetch to intercept responses globally
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch(...args);
  
  // Check for token expiration
  if (response.status === 401 && response.headers.get('X-Token-Expired') === 'true') {
    handleTokenExpiration();
    return response;
  }
  
  return response;
};

// Enhanced fetch wrapper that handles token expiration
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // The global fetch interceptor will handle token expiration
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default handleTokenExpiration;
