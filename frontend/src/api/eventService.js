import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.events;

// Get user events feed
export async function getUserEvents(page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${API_URL}?${params.toString()}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load events');
  }
}

// Get event by ID
export async function getEventById(eventId) {
  try {
    const res = await fetch(`${API_URL}/${eventId}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Event not found');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load event');
  }
}

// Create event
export async function createEvent(eventData) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(eventData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create event');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create event');
  }
}

// Get events by type
export async function getEventsByType(type, page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ type, page, size });
    const res = await fetch(`${API_URL}/type?${params.toString()}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch events by type');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load events');
  }
}

// Mark event as read
export async function markEventAsRead(eventId) {
  try {
    const res = await fetch(`${API_URL}/${eventId}/read`, {
      method: 'PUT',
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to mark event as read');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to update event');
  }
}
