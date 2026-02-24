import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../api/groupService";
import { getFollowers, getFollowing } from "../api/followService";
import Navbar from "../components/Navbar";
import { FaArrowLeft, FaUsers, FaFileAlt } from "react-icons/fa";

export default function CreateGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    groupName: "",
    description: "",
  });
  const [allowAllMembersChat, setAllowAllMembersChat] = useState(true);
  const [friends, setFriends] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeUserList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.content)) return value.content;
    if (Array.isArray(value?.users)) return value.users;
    return [];
  };

  useEffect(() => {
    if (!user?.id) return;
    Promise.allSettled([getFollowing(user.id), getFollowers(user.id)])
      .then(([followingRes, followersRes]) => {
        const following = followingRes.status === "fulfilled" ? normalizeUserList(followingRes.value) : [];
        const followers = followersRes.status === "fulfilled" ? normalizeUserList(followersRes.value) : [];

        const map = new Map();
        for (const u of [...following, ...followers]) {
          if (!u?.id || u.id === user.id) continue;
          map.set(u.id, u);
        }
        setFriends(Array.from(map.values()));
      })
      .catch(() => setFriends([]));
  }, [user?.id]);

  const selectedMembers = useMemo(() => {
    const byId = new Map(friends.map((u) => [u.id, u]));
    return selectedMemberIds.map((id) => byId.get(id)).filter(Boolean);
  }, [friends, selectedMemberIds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.groupName.trim()) {
      setError("Tên nhóm không được để trống");
      return;
    }

    setLoading(true);
    try {
      const response = await createGroup({
        groupName: form.groupName,
        description: form.description,
        initialMembers: selectedMemberIds,
        allowAllMembersChat,
        // In "selected" mode, default to allowing invited members to chat.
        allowedChatMemberIds: allowAllMembersChat ? [] : selectedMemberIds,
      });
      
      // createGroup returns a GroupConversation directly (no wrapped data)
      navigate(`/groups/${response.id}`);
    } catch (err) {
      setError(err.message || "Không thể tạo nhóm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-light me-3"
                onClick={() => navigate("/groups")}
              >
                <FaArrowLeft />
              </button>
              <div>
                <h2 className="mb-0">Tạo Nhóm Chat</h2>
                <p className="text-muted mb-0">Tạo nhóm để trò chuyện theo chủ đề</p>
              </div>
            </div>

            {/* Form */}
            <div className="card">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Group Name */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <FaUsers className="me-2" />
                      Tên nhóm <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="groupName"
                      className="form-control form-control-lg"
                      value={form.groupName}
                      onChange={handleChange}
                      placeholder="VD: Cộng đồng fans Sơn Tùng MTP"
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Artist Name */}
                  {/* Description */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <FaFileAlt className="me-2" />
                      Mô tả nhóm
                    </label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="4"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Giới thiệu về nhóm của bạn..."
                      disabled={loading}
                    />
                  </div>

                  {/* Chat permissions */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Quyền nhắn tin</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="chatPermission"
                        id="chatAll"
                        checked={allowAllMembersChat}
                        onChange={() => setAllowAllMembersChat(true)}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="chatAll">
                        Tất cả thành viên được nhắn tin
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="chatPermission"
                        id="chatSelected"
                        checked={!allowAllMembersChat}
                        onChange={() => setAllowAllMembersChat(false)}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="chatSelected">
                        Chỉ thành viên được chọn (và chủ nhóm) được nhắn tin
                      </label>
                    </div>
                    <div className="text-muted small mt-1">
                      Chủ nhóm luôn có thể nhắn tin.
                    </div>
                  </div>

                  {/* Initial members */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <FaUsers className="me-2" />
                      Thêm thành viên ban đầu (tuỳ chọn)
                    </label>

                    {friends.length === 0 ? (
                      <div className="text-muted small">Chưa có danh sách bạn bè để chọn.</div>
                    ) : (
                      <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: "auto" }}>
                        {friends.map((u) => (
                          <div key={u.id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`member-${u.id}`}
                              checked={selectedMemberIds.includes(u.id)}
                              disabled={loading}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedMemberIds((prev) =>
                                  checked ? [...prev, u.id] : prev.filter((x) => x !== u.id)
                                );
                              }}
                            />
                            <label className="form-check-label" htmlFor={`member-${u.id}`}>
                              {u.fullName || u.username || `User ${u.id}`}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedMembers.length > 0 && (
                      <div className="text-muted small mt-2">
                        Đã chọn: {selectedMembers.map((u) => u.username || u.fullName || u.id).join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="alert alert-info">
                    <strong>Lưu ý:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Người dùng có thể tham gia nhóm</li>
                      <li>Nhóm dùng để trò chuyện theo chủ đề</li>
                    </ul>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-light flex-grow-1"
                      onClick={() => navigate("/groups")}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-grow-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <FaUsers className="me-2" />
                          Tạo nhóm
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
