import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.reports;

// Get all reports (admin only)
export async function getAllReports(page = 0, size = 20, status = null) {
  try {
    const params = new URLSearchParams({ page, size });
    if (status) params.append('status', status);
    
    const res = await fetch(`${API_URL}?${params.toString()}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch reports');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load reports');
  }
}

// Get report by ID
export async function getReportById(reportId) {
  try {
    const res = await fetch(`${API_URL}/${reportId}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Report not found');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load report');
  }
}

// Create report
export async function createReport(reportData) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(reportData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create report');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create report');
  }
}

// Update report status (admin only)
export async function updateReportStatus(reportId, status, resolution) {
  try {
    const res = await fetch(`${API_URL}/${reportId}/status`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify({ status, resolution }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update report');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update report');
  }
}

// Delete report (admin only)
export async function deleteReport(reportId) {
  try {
    const res = await fetch(`${API_URL}/${reportId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete report');
    }
    
    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete report');
  }
}

// Get reports by user
export async function getUserReports() {
  try {
    const res = await fetch(`${API_URL}/my-reports`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch user reports');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load user reports');
  }
}

// Get report statistics (admin only)
export async function getReportStatistics() {
  try {
    const res = await fetch(`${API_URL}/statistics`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch report statistics');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load statistics');
  }
}
