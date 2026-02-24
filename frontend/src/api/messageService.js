import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.messages;

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function headersForGet(includeAuth = false) {
  const headers = createHeaders(includeAuth);
  // Avoid Content-Type on GET to prevent unnecessary preflight requests
  delete headers['Content-Type'];
  return headers;
}

async function safeReadJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

// Send a message
export async function sendMessage(receiverId, content) {
  try {
    const me = getCurrentUser();
    if (!me?.id) {
      throw new Error('Missing current user');
    }

    const res = await fetch(`${API_URL}/send`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify({
        senderId: me.id,
        receiverId,
        content,
      }),
    });

    const data = await safeReadJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed to send message (${res.status})`);
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get conversations
export async function getConversations(page = 0, size = 20, userId) {
  try {
    const me = getCurrentUser();
    const resolvedUserId = userId || me?.id;
    if (!resolvedUserId) {
      throw new Error('Missing userId');
    }

    // Backend: GET /api/messages/user/{userId}/conversations
    const res = await fetch(`${API_URL}/user/${resolvedUserId}/conversations`, {
      headers: headersForGet(true),
    });

    const data = await safeReadJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed to fetch conversations (${res.status})`);

    // Backend may return either an array or a Spring Data Page ({ content, totalElements, ... })
    const conversations = Array.isArray(data)
      ? data
      : (Array.isArray(data?.content) ? data.content : (data?.data ?? []));

    const total = Number.isFinite(data?.totalElements) ? data.totalElements : conversations.length;

    // If backend already paged (content + pageable), return as-is
    if (Array.isArray(data?.content)) {
      return { data: conversations, total };
    }

    // Otherwise do client-side slice
    const start = page * size;
    const end = start + size;
    return { data: conversations.slice(start, end), total };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Legacy function for compatibility
export async function getConversationsByUserId() {
  return getConversations();
}

// Get messages with a specific user
export async function getMessagesWithUser(userId) {
  try {
    const me = getCurrentUser();
    if (!me?.id) {
      throw new Error('Missing current user');
    }

    // 1) Get (or create) conversation between two users
    const convUrl = new URL(`${API_URL}/conversation`);
    convUrl.searchParams.set('user1Id', me.id);
    convUrl.searchParams.set('user2Id', userId);

    const convRes = await fetch(convUrl, { headers: headersForGet(true) });
    const conv = await safeReadJson(convRes);
    if (!convRes.ok) throw new Error(conv?.message || `Failed to get conversation (${convRes.status})`);

    // 2) Get messages by conversationId
    const conversationId = conv?.id;
    if (!conversationId) {
      return { data: [] };
    }

    const msgRes = await fetch(`${API_URL}/conversation/${conversationId}`, {
      headers: headersForGet(true),
    });

    const messages = await safeReadJson(msgRes);
    if (!msgRes.ok) throw new Error(messages?.message || `Failed to fetch messages (${msgRes.status})`);

    return { data: Array.isArray(messages) ? messages : (messages?.data ?? []) };
  } catch (error) {
    console.error("Messages API error:", error);
    throw new Error(error.message || "Network error");
  }
}

// Legacy function for compatibility
export async function getMessages(convId) {
  return getMessagesWithUser(convId);
}

// Start a conversation with another artist
export async function startConversation(receiverId) {
  try {
    const me = getCurrentUser();
    if (!me?.id) {
      throw new Error('Missing current user');
    }

    // Backend creates conversation via GET /conversation?user1Id&user2Id
    const url = new URL(`${API_URL}/conversation`);
    url.searchParams.set('user1Id', me.id);
    url.searchParams.set('user2Id', receiverId);

    const res = await fetch(url, {
      headers: headersForGet(true),
    });

    const data = await safeReadJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed to start conversation (${res.status})`);
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

export async function markConversationAsRead(conversationId, userId) {
  const me = getCurrentUser();
  const resolvedUserId = userId || me?.id;
  if (!conversationId) throw new Error('Missing conversationId');
  if (!resolvedUserId) throw new Error('Missing userId');

  const url = new URL(`${API_URL}/conversation/${conversationId}/read`);
  url.searchParams.set('userId', resolvedUserId);

  const res = await fetch(url, {
    method: 'PUT',
    headers: headersForGet(true),
  });

  if (!res.ok) {
    const data = await safeReadJson(res);
    throw new Error(data?.message || `Failed to mark conversation as read (${res.status})`);
  }
  return { success: true };
}