import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';
import { getDeviceFingerprint, getBrowserName, getOSName } from './deviceService';

const AUTH_URL = API_ENDPOINTS.auth;
const USER_URL = API_ENDPOINTS.users;

function handleAuthResponse(body, fallbackEmail) {
  if (!body?.success) {
    throw new Error(body?.message || "Authentication failed");
  }

  const payload = body.data || {};
  const user = payload.user || {};
  const token = payload.accessToken || payload.token;

  if (!token) {
    throw new Error("Máy chủ không trả về access token");
  }

  const normalizedUser = {
    ...user,
    email: user.email || fallbackEmail,
    id: user.id || user._id,
    token,
    refreshToken: payload.refreshToken,
  };

  localStorage.setItem("user", JSON.stringify(normalizedUser));
  return normalizedUser;
}

function splitName(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstName: "", lastName: "" };
  }
  const firstName = parts.shift();
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

// Login
export async function login(identifier, password) {
  try {
    let deviceId;
    let deviceName;
    let userAgent;
    try {
      deviceId = getDeviceFingerprint();
      if (!deviceId) {
        const stored = localStorage.getItem('deviceId');
        if (stored) {
          deviceId = stored;
        } else {
          const fallback = (globalThis.crypto?.randomUUID?.() || `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`);
          localStorage.setItem('deviceId', fallback);
          deviceId = fallback;
        }
      }
      deviceName = `${getBrowserName()} on ${getOSName()}`;
      userAgent = navigator?.userAgent;
    } catch {
      // Best-effort only (e.g., non-browser test env)
    }

    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({
        usernameOrEmail: identifier,
        password,
        deviceId,
        deviceName,
        userAgent,
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    return handleAuthResponse(data, identifier);
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Register
export async function register({ email, password, username, fullName }) {
  try {
    const { firstName, lastName } = splitName(fullName);

    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({
        email,
        password,
        username,
        firstName,
        lastName,
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    if (data?.data?.accessToken || data?.data?.token) {
      return handleAuthResponse(data, email);
    }

    // Fallback: if backend skips tokens, login manually
    return await login(email, password);
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Cancel pending artist verification
export async function cancelArtistApplication() {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw new Error("Bạn chưa đăng nhập");
    }
    const currentUser = JSON.parse(userStr);
    const userId = currentUser?.id;
    if (!userId) {
      throw new Error("Không tìm thấy userId");
    }

    const res = await fetch(`${AUTH_URL}/artist/cancel`, {
      method: "POST",
      headers: {
        ...createHeaders(true),
        "X-User-Id": userId,
      },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || "Hủy đăng ký nghệ sĩ thất bại");
    }

    // backend returns ApiResponse<User>
    const updatedUser = data?.data || data?.user || null;
    if (updatedUser && typeof updatedUser === "object") {
      const merged = { ...currentUser, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    }

    return currentUser;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Logout
export async function logout() {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${AUTH_URL}/logout`, {
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
    const res = await fetch(`${USER_URL}/${userInfo.id}`, {
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
    const res = await fetch(`${AUTH_URL}/refresh`, {
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

// ========== EMAIL VERIFICATION ==========

async function safeReadJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function verifyEmail(token) {
  const encodedToken = encodeURIComponent(token ?? "");
  const res = await fetch(`${AUTH_URL}/verify-email?token=${encodedToken}`, {
    method: "GET",
    headers: createHeaders(),
  });

  const data = await safeReadJson(res);

  if (!res.ok) {
    throw new Error(data.message || res.statusText || "Email verification failed");
  }

  return data;
}

export async function resendVerification(email) {
  const res = await fetch(`${AUTH_URL}/resend-verification`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({ email }),
  });

  const data = await safeReadJson(res);

  if (!res.ok) {
    throw new Error(data.message || res.statusText || "Failed to resend verification email");
  }

  return data;
}

// ========== PASSWORD RESET ==========

export async function forgotPassword(email) {
  const res = await fetch(`${AUTH_URL}/forgot-password`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to send reset email");
  }

  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${AUTH_URL}/reset-password`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
}

export async function changePassword(oldPassword, newPassword) {
  const res = await fetch(`${AUTH_URL}/change-password`, {
    method: "POST",
    headers: createHeaders(true),
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to change password");
  }

  return data;
}

export async function sendVerificationCode(email) {
  try {
    const res = await fetch(`${AUTH_URL}/send-verification-code`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ email }),
    });

    const data = await safeReadJson(res);
    if (!res.ok) throw new Error(data.message || res.statusText || "Failed to send verification code");
    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

export async function verifyCode(email, code) {
  try {
    const res = await fetch(`${AUTH_URL}/verify-code`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ email, code }),
    });

    const data = await safeReadJson(res);
    if (!res.ok) throw new Error(data.message || res.statusText || "Verification failed");
    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}