import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane, FaUsers } from "react-icons/fa";

import { useAuth } from "../contexts/AuthContext";
import {
  getGroupById,
  getGroupMessages,
  joinGroup,
  leaveGroup,
  sendGroupMessage,
} from "../api/groupService";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadGroup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getGroupById(groupId);
      setGroup(res.data);
    } catch (err) {
      setError(err.message || "Không thể tải nhóm");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!user || !group?.isMember) return;
    try {
      const res = await getGroupMessages(groupId);
      setMessages(Array.isArray(res) ? res : []);
      scrollToBottom();
    } catch (err) {
      // ignore polling errors
    }
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  useEffect(() => {
    if (!user || !group?.isMember) {
      setMessages([]);
      return;
    }
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [groupId, user?.id, group?.isMember]);

  const handleJoin = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await joinGroup(groupId);
      await loadGroup();
      await loadMessages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Bạn có chắc muốn rời nhóm?")) return;
    try {
      await leaveGroup(groupId);
      navigate("/groups");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await sendGroupMessage(groupId, newMessage);
      setNewMessage("");
      await loadMessages();
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="text-center py-5" style={{ marginTop: "100px" }}>
          <div className="spinner-border" role="status" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5" style={{ marginTop: "100px" }}>
          <div className="alert alert-danger">{error || "Nhóm không tồn tại"}</div>
        </div>
      </div>
    );
  }

  const isMember = (group?.isMember ?? group?.member) === true;
  const canSendMessages = group?.canSendMessages !== false;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex align-items-start">
              <button className="btn btn-light me-3" onClick={() => navigate("/groups")}>
                <FaArrowLeft />
              </button>

              {group.groupImageUrl ? (
                <img
                  src={group.groupImageUrl}
                  alt={group.groupName}
                  className="rounded-circle me-3"
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-primary text-white"
                  style={{ width: 80, height: 80 }}
                >
                  <FaUsers size={36} />
                </div>
              )}

              <div className="flex-grow-1">
                <h3 className="mb-1">{group.groupName}</h3>
                <p className="text-muted mb-2">
                  {group.groupType === "ARTIST" ? "Nghệ sĩ" : "Người dùng"}: {group.creatorName || group.createdBy}
                </p>
                <p className="text-muted small mb-2">{group.description || "Không có mô tả"}</p>
                <div className="d-flex gap-3 text-muted small">
                  <span>
                    <FaUsers className="me-1" />
                    {group.memberCount} thành viên
                  </span>
                </div>
              </div>

              {user && isMember ? (
                <button className="btn btn-outline-danger" onClick={handleLeave}>
                  Rời nhóm
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleJoin}>
                  Tham gia
                </button>
              )}
            </div>
          </div>
        </div>

        {user && isMember ? (
          <div className="card">
            <div className="card-body" style={{ height: "500px", overflowY: "auto" }}>
              {messages.length === 0 ? (
                <div className="text-center text-muted py-5">Chưa có tin nhắn</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 d-flex ${msg.senderId === user?.id ? "justify-content-end" : "justify-content-start"}`}
                  >
                    <div
                      className={`p-2 rounded ${msg.senderId === user?.id ? "bg-primary text-white" : "bg-light"}`}
                      style={{ maxWidth: "70%" }}
                    >
                      <div>{msg.content}</div>
                      <div className="small opacity-75">
                        {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="card-footer">
              {!canSendMessages && (
                <div className="alert alert-warning mb-2">
                  Bạn có thể xem tin nhắn nhưng không có quyền nhắn tin trong nhóm này.
                </div>
              )}
              <form onSubmit={handleSend} className="d-flex gap-2">
                <input
                  className="form-control"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMessage || !canSendMessages}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sendingMessage || !newMessage.trim() || !canSendMessages}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            {user ? "Tham gia nhóm để xem và gửi tin nhắn." : "Đăng nhập để tham gia nhóm và trò chuyện."}
          </div>
        )}
      </div>

      <MusicPlayer />
    </div>
  );
}
