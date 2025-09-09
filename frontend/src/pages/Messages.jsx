import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import UserAvatar from "../components/UserAvatar";
import { useEffect, useState, useRef } from "react";
import {
  getConversations,
  getMessagesWithUser,
  sendMessage,
  startConversation,
} from "../api/messageService";
import { globalSearch } from "../api/searchService";
import LoginRequireModal from "../components/LoginRequireModal";
import { FaLock, FaMusic, FaSearch, FaPlus, FaTimes } from "react-icons/fa";

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

  // Check if user is ARTIST (case insensitive)
  const isArtist = user && user.role && user.role.toUpperCase() === 'ARTIST';

  // Lấy danh sách hội thoại
  useEffect(() => {
    if (!user || !isArtist) return;
    setLoading(true);
    getConversations()
      .then((response) => {
        setConversations(response.data || []);
      })
      .catch((error) => {
        console.error("Error loading conversations:", error);
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, [user, isArtist]);

  // Lấy tin nhắn khi chọn hội thoại
  useEffect(() => {
    if (!selectedConv || !isArtist) return;
    
    console.log("Loading messages for conversation:", selectedConv.id);
    
    const receiverId = selectedConv.user1.id === user.id 
      ? selectedConv.user2.id 
      : selectedConv.user1.id;
    
    console.log("Receiver ID:", receiverId);
    
    getMessagesWithUser(receiverId)
      .then((response) => {
        console.log("Messages API response:", response);
        console.log("Messages data:", response.data);
        setMessages(response.data || []);
      })
      .catch((error) => {
        console.error("Error loading messages:", error);
        setMessages([]);
      });
  }, [selectedConv, isArtist, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!user || !isArtist) {
      setShowModal(true);
      return;
    }
    if (!input.trim() || !selectedConv) return;
    
    try {
      const receiverId =
        selectedConv.user1.id === user.id
          ? selectedConv.user2.id
          : selectedConv.user1.id;
      
      await sendMessage(receiverId, input);
      setInput("");
      
      // Reload messages
      const response = await getMessagesWithUser(receiverId);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error sending message:", error);
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
      // Filter only artists
      const artists = (results.users || []).filter(u => u.role === 'ARTIST' && u.id !== user.id);
      setSearchResults(artists);
    } catch (error) {
      console.error("Error searching artists:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStartNewConversation = async (artistId) => {
    try {
      await startConversation(artistId);
      setShowNewChat(false);
      setSearchQuery("");
      setSearchResults([]);
      
      // Reload conversations
      const response = await getConversations();
      setConversations(response.data || []);
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
  if (!isArtist) {
    return (
      <MainLayout>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <FaLock size={64} className="text-muted" />
                  </div>
                  <h3 className="fw-bold mb-3">Messages Restricted</h3>
                  <p className="text-muted mb-4">
                    The messaging feature is exclusively available for artists. 
                    Only verified artists can send and receive messages with other artists.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => window.location.href = '/register'}
                    >
                      <FaMusic className="me-2" />
                      Become an Artist
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/discover'}
                    >
                      Discover Music
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                  <div>
                    <div className="fw-bold">{partner.username}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      {partner.email}
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
                      placeholder="Search for artists..."
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
                  {searchResults.map((artist) => (
                    <button
                      key={artist.id}
                      className="list-group-item list-group-item-action d-flex align-items-center"
                      onClick={() => handleStartNewConversation(artist.id)}
                    >
                      <UserAvatar 
                        user={artist} 
                        size={40} 
                        className="me-3"
                      />
                      <div>
                        <div className="fw-bold">{artist.fullName || artist.username}</div>
                        <div className="text-muted small">@{artist.username}</div>
                      </div>
                    </button>
                  ))}
                  {searchQuery && !searchLoading && searchResults.length === 0 && (
                    <div className="text-muted text-center py-3">
                      No artists found
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