import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.devices;

// Get all user devices
export async function getUserDevices() {
  try {
    const res = await fetch(API_URL, {
      headers: createHeaders(true)
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch devices");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Get devices error:", error);
    throw error;
  }
}

// Record (upsert) current device for this user
export async function recordCurrentDevice(device) {
  try {
    const res = await fetch(`${API_URL}/record`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(device || {})
    });

    if (!res.ok) {
      throw new Error('Failed to record device');
    }

    return await res.json();
  } catch (error) {
    console.error('Record device error:', error);
    throw error;
  }
}

// Mark device as trusted
export async function trustDevice(deviceId) {
  try {
    const res = await fetch(`${API_URL}/${deviceId}/trust`, {
      method: 'POST',
      headers: createHeaders(true)
    });
    
    if (!res.ok) {
      throw new Error("Failed to trust device");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Trust device error:", error);
    throw error;
  }
}

// Remove device (logout from device)
export async function removeDevice(deviceId) {
  try {
    const res = await fetch(`${API_URL}/${deviceId}`, {
      method: 'DELETE',
      headers: createHeaders(true)
    });
    
    if (!res.ok) {
      throw new Error("Failed to remove device");
    }
    
    return true;
  } catch (error) {
    console.error("Remove device error:", error);
    throw error;
  }
}

// Update device location
export async function updateDeviceLocation(deviceId, location, latitude, longitude) {
  try {
    const params = new URLSearchParams({
      location: location
    });
    
    if (latitude !== undefined && latitude !== null) {
      params.append('latitude', latitude.toString());
    }
    if (longitude !== undefined && longitude !== null) {
      params.append('longitude', longitude.toString());
    }
    
    const res = await fetch(`${API_URL}/${deviceId}/location?${params.toString()}`, {
      method: 'POST',
      headers: createHeaders(true)
    });
    
    if (!res.ok) {
      throw new Error("Failed to update device location");
    }
    
    return true;
  } catch (error) {
    console.error("Update device location error:", error);
    throw error;
  }
}

// Get current device fingerprint
export function getDeviceFingerprint() {
  const navigator = window.navigator;
  const screen = window.screen;
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deviceMemory: navigator.deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
  };
  
  // Create a simple hash
  const str = JSON.stringify(fingerprint);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

// Get device type
export function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Get browser name
export function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown';
}

// Get OS name
export function getOSName() {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}
