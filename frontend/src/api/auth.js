const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).token : null;
};

// Create headers with auth token
const createHeaders = (includeAuth = false) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Login
export async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    
    if (data.success && data.token) {
      // Store the token and user info
      const userInfo = { 
        token: data.token,
        email: email,
        // Include all user fields from backend
        ...(data.user || {}),
        // Ensure id is available 
        id: data.user?.id
      };
      localStorage.setItem("user", JSON.stringify(userInfo));
      return userInfo;
    } else {
      throw new Error(data.message || "Invalid credentials");
    }
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Register
export async function register({ email, password, username, fullName }) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({
        email,
        password,
        confirmPassword: password, // Add confirmPassword same as password
        username,
        fullName,
        role: "USER"
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }
    
    if (data.success && data.user) {
      // After registration, automatically login
      return await login(email, password);
    } else {
      throw new Error(data.message || "Registration failed");
    }
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Logout
export async function logout() {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: createHeaders(true),
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("user");
  }
}

// Get current user profile
export async function getCurrentUser() {
  try {
    const user = localStorage.getItem("user");
    if (!user) return null;
    
    const userInfo = JSON.parse(user);
    if (!userInfo.token || !userInfo.id) return null;
    
    // Use the existing /{id} endpoint
    const res = await fetch(`${API_URL}/${userInfo.id}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("user");
        return null;
      }
      // If user not found but token is valid, return stored user
      return userInfo;
    }
    
    const userData = await res.json();
    
    // Update localStorage with fresh user data, keep the token
    const updatedUser = { 
      ...userData,
      token: userInfo.token,
      email: userInfo.email
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    console.error("Get current user error:", error);
    // Return stored user instead of null to maintain login state
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

// Refresh token
export async function refreshToken() {
  try {
    const res = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Token refresh failed");
    }
    
    const data = await res.json();
    if (data.success && data.token) {
      const user = JSON.parse(localStorage.getItem("user"));
      user.token = data.token;
      localStorage.setItem("user", JSON.stringify(user));
      return data.token;
    }
    
    throw new Error("Token refresh failed");
  } catch (error) {
    localStorage.removeItem("user");
    throw error;
  }
}