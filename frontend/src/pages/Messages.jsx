import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import UserAvatar from "../components/UserAvatar";
import { useEffect, useState, useRef } from "react";
import {
  getConversations,
  getMessagesWithUser,
  sendMessage,
  startConversation,
  markConversationAsRead,
} from "../api/messageService";
import { getFollowers, getFollowing } from "../api/followService";
import { globalSearch } from "../api/searchService";
import { useWebSocket } from "../hooks/useWebSocket";
import { WS_ENDPOINTS } from "../config/api.config";
import LoginRequireModal from "../components/LoginRequireModal";
import { FaLock, FaMusic, FaSearch, FaPlus, FaTimes, FaPlug } from "react-icons/fa";

export default function Messages() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const chatEndRef = useRef(null);

  const normalizeUserList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.content)) return value.content;
    if (Array.isArray(value?.users)) return value.users;
    return [];
  };

  // Check if user is ARTIST (case insensitive)
  const isArtist = user && user.role && user.role.toUpperCase() === 'ARTIST';

  // WebSocket connection for real-time messaging
  const { isConnected, connectionStatus, lastMessage, sendMessage: sendWsMessage } = useWebSocket(
    WS_ENDPOINTS.messages,
    {
      autoConnect: true, // Connect for everyone
      onMessage: (message) => {
        console.log('New message received via WebSocket:', message);
        if (message.type === 'message' && selectedConv) {
          // Check if message belongs to current conversation
          const receiverId = selectedConv.user1.id === user.id 
            ? selectedConv.user2.id 
            : selectedConv.user1.id;
          
          if (message.senderId === receiverId || message.receiverId === receiverId) {
            setMessages(prev => [...prev, {
              id: message.id || Date.now(),
              content: message.content,
              senderId: message.senderId,
              receiverId: message.receiverId,
              timestamp: message.timestamp || new Date().toISOString()
            }]);
          }
        }
      },
      onOpen: () => console.log('Messages WebSocket connected'),
      onClose: () => console.log('Messages WebSocket disconnected'),
      onError: (error) => console.error('Messages WebSocket error:', error)
    }
  );

  // Lấy danh sách hội thoại
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.allSettled([
      getConversations(0, 50, user.id),
      getFollowing(user.id),
      getFollowers(user.id),
    ])
      .then(([convRes, followingRes, followersRes]) => {
        const convPayload = convRes.status === "fulfilled" ? convRes.value : null;
        const baseConversations = normalizeUserList(convPayload?.data ?? convPayload);

        const following = followingRes.status === "fulfilled" ? normalizeUserList(followingRes.value) : [];
        const followers = followersRes.status === "fulfilled" ? normalizeUserList(followersRes.value) : [];

        const friendById = new Map();
        for (const u of [...following, ...followers]) {
          if (!u?.id || u.id === user.id) continue;
          friendById.set(u.id, u);
        }

        const partnerIdsInConversations = new Set();
        for (const conv of baseConversations) {
          const partner = conv?.user1?.id === user.id ? conv?.user2 : conv?.user1;
          if (partner?.id) partnerIdsInConversations.add(partner.id);
        }

        const placeholders = [];
        for (const friend of friendById.values()) {
          if (partnerIdsInConversations.has(friend.id)) continue;
          placeholders.push({
            id: `friend:${friend.id}`,
            user1: user,
            user2: friend,
            _placeholder: true,
          });
        }

        setConversations([...baseConversations, ...placeholders]);
      })
      .catch((error) => {
        console.error("Error loading conversations/friends:", error);
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Lấy tin nhắn khi chọn hội thoại
  useEffect(() => {
    if (!selectedConv) return;
    
    console.log("Loading messages for conversation:", selectedConv.id);
    
    const receiverId = selectedConv.user1.id === user.id 
      ? selectedConv.user2.id 
      : selectedConv.user1.id;
    
    console.log("Receiver ID:", receiverId);
    
    getMessagesWithUser(receiverId)
      .then((response) => {
        console.log("Messages API response:", response);
        console.log("Messages data:", response.data);
        const data = response?.data ?? response;
        setMessages(Array.isArray(data) ? data : []);

        // Mark as read (best-effort)
        if (selectedConv?.id) {
          markConversationAsRead(selectedConv.id, user.id)
            .then(() => {
              setConversations((prev) =>
                prev.map((c) => (c.id === selectedConv.id ? { ...c, unreadCount: 0, isUnread: false } : c))
              );
            })
            .catch(() => {});
        }
      })
      .catch((error) => {
        console.error("Error loading messages:", error);
        setMessages([]);
      });
  }, [selectedConv, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    if (!input.trim() || !selectedConv) return;
    
    try {
      const receiverId =
        selectedConv.user1.id === user.id
          ? selectedConv.user2.id
          : selectedConv.user1.id;
      
      // Send via API
      await sendMessage(receiverId, input);
      
      // Also send via WebSocket for real-time delivery
      if (isConnected) {
        sendWsMessage({
          type: 'message',
          receiverId: receiverId,
          content: input,
          timestamp: new Date().toISOString()
        });
      }
      
      setInput("");
      
      // Reload messages
      const response = await getMessagesWithUser(receiverId);
      const data = response?.data ?? response;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error sending message:", error);
      // Show user-friendly error message
      if (error.message && error.message.includes("cannot send direct messages")) {
        alert("⛔ You cannot send direct messages to this artist.\n\nPlease use group chat instead or wait for the artist to enable direct messages.");
      } else {
        alert("Failed to send message: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await globalSearch(query);
      const users = results?.users || [];

      const filteredUsers = isArtist
        ? users.filter((u) => u?.id && u.id !== user.id)
        : users.filter((u) => {
            if (!u?.id || u.id === user.id) return false;
            const role = String(u.role || '').toUpperCase();
            return role !== 'ARTIST';
          });

      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error searching artists:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStartNewConversation = async (targetUserId) => {
    try {
      await startConversation(targetUserId);
      setShowNewChat(false);
      setSearchQuery("");
      setSearchResults([]);
      
      // Reload conversations
      const response = await getConversations(0, 20, user.id);
      const data = response?.data ?? response;
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to start conversation: " + error.message);
    }
  };

  // Show login modal for non-authenticated users
  if (!user) {
    return (
      <MainLayout>
        <LoginRequireModal show={true} onClose={() => setShowModal(false)} />
      </MainLayout>
    );
  }

  // Show restriction message for non-artists
  // if (!isArtist) { ... } - REMOVED RESTRICTION

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Messages</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewChat(true)}
        >
          <FaPlus className="me-2" />
          New Chat
        </button>
      </div>
      <div className="row" style={{ minHeight: 500 }}>
        {/* Danh sách hội thoại */}
        <div className="col-md-4 border-end" style={{ maxHeight: 600, overflowY: "auto" }}>
          <div className="list-group">
            {loading && <div className="text-muted p-3">Đang tải...</div>}
            {conversations.length === 0 && !loading && (
              <div className="text-muted p-3">Chưa có hội thoại nào.</div>
            )}
            {conversations.map((conv) => {
              // Hiển thị tên người còn lại
              const partner =
                conv.user1.id === user.id ? conv.user2 : conv.user1;
              return (
                <button
                  key={conv.id}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${
                    selectedConv?.id === conv.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedConv(conv)}
                >
                  <UserAvatar 
                    user={partner} 
                    size={36} 
                    className="me-2"
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold">{partner.username}</div>
                      {conv?.unreadCount > 0 && (
                        <span className="badge bg-danger ms-2">{conv.unreadCount}</span>
                      )}
                    </div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      {conv?.lastMessage || partner.email}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Khung chat */}
        <div className="col-md-8 d-flex flex-column" style={{ height: 600 }}>
          {selectedConv ? (
            <>
              <div className="d-flex align-items-center border-bottom py-2 px-3 bg-light" style={{ minHeight: 60 }}>
                <UserAvatar 
                  user={selectedConv.user1.id === user.id ? selectedConv.user2 : selectedConv.user1} 
                  size={40} 
                  className="me-2"
                />
                <div>
                  <div className="fw-bold">
                    {selectedConv.user1.id === user.id
                      ? selectedConv.user2.username
                      : selectedConv.user1.username}
                  </div>
                </div>
              </div>
              <div
                className="flex-grow-1 px-3 py-2"
                style={{ overflowY: "auto", background: "#f8f9fa" }}
              >
                {console.log("Rendering messages, count:", messages.length, "messages:", messages)}
                {messages.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                  </div>
                ) : (
                  messages.map((msg) => {
                    console.log("Rendering message:", msg);
                    return (
                      <div
                        key={msg.id}
                        className={`d-flex mb-3 ${
                          msg.senderId === user.id
                            ? "justify-content-end"
                            : "justify-content-start"
                        }`}
                      >
                    {msg.senderId !== user.id && (
                        <UserAvatar 
                          user={selectedConv.user1.id === user.id ? selectedConv.user2 : selectedConv.user1} 
                          size={32} 
                          className="me-2"
                        />
                    )}
                    <div
                      className={`p-2 px-3 rounded-4 ${
                        msg.senderId === user.id
                          ? "bg-primary text-white"
                          : "bg-light border"
                      }`}
                      style={{ maxWidth: 320 }}
                    >
                      {msg.message || msg.content || "No content"}
                    </div>
                    {msg.senderId === user.id && (
                        <UserAvatar 
                          user={user} 
                          size={32} 
                          className="ms-2"
                        />
                    )}
                  </div>
                    );
                  })
                )}
                <div ref={chatEndRef}></div>
              </div>
              <form
                className="d-flex align-items-center p-2 border-top"
                onSubmit={handleSend}
                style={{ background: "#f8f9fa" }}
              >
                <input
                  className="form-control me-2"
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!user}
                />
                <button className="btn btn-primary" type="submit" disabled={!user}>
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div className="d-flex h-100 align-items-center justify-content-center text-muted">
              Chọn một hội thoại để bắt đầu chat
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Start New Conversation</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowNewChat(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isArtist ? "Search for users..." : "Search for users..."}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                      }}
                    />
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                  </div>
                </div>
                
                {searchLoading && (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                
                <div className="list-group" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {searchResults.map((targetUser) => (
                    <button
                      key={targetUser.id}
                      className="list-group-item list-group-item-action d-flex align-items-center"
                      onClick={() => handleStartNewConversation(targetUser.id)}
                    >
                      <UserAvatar 
                        user={targetUser} 
                        size={40} 
                        className="me-3"
                      />
                      <div>
                        <div className="fw-bold">{targetUser.fullName || targetUser.username}</div>
                        <div className="text-muted small">@{targetUser.username}</div>
                      </div>
                    </button>
                  ))}
                  {searchQuery && !searchLoading && searchResults.length === 0 && (
                    <div className="text-muted text-center py-3">
                      No users found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginRequireModal show={showModal && !user} onClose={() => setShowModal(false)} />
    </MainLayout>
  );
}