import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllGroups, getMyGroups, joinGroup } from "../api/groupService";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";
import { FaUsers, FaMusic, FaLock, FaPlus, FaUserFriends } from "react-icons/fa";

export default function ArtistGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allGroups, setAllGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchAll, setSearchAll] = useState("");
  const [searchMy, setSearchMy] = useState("");

  const normalize = (value) => String(value || "").toLowerCase().trim();
  const matchesQuery = (group, query) => {
    const q = normalize(query);
    if (!q) return true;
    const name = normalize(group?.groupName);
    const creator = normalize(group?.creatorName);
    return name.includes(q) || creator.includes(q);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const [allResponse, myResponse] = await Promise.all([
        getAllGroups(),
        user ? getMyGroups() : Promise.resolve({ data: [] })
      ]);
      
      setAllGroups(allResponse.data || []);
      setMyGroups(myResponse.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (groupId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    try {
      await joinGroup(groupId);
      await loadGroups();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const GroupCard = ({ group, isMember }) => (
    <div className="card h-100 hover-shadow">
      <div className="card-body">
        <div className="d-flex align-items-start mb-3">
          {group.groupImageUrl ? (
            <img
              src={group.groupImageUrl}
              alt={group.groupName}
              className="rounded-circle me-3"
              style={{ width: 64, height: 64, objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-primary text-white"
              style={{ width: 64, height: 64 }}
            >
              <FaMusic size={28} />
            </div>
          )}
          <div className="flex-grow-1">
            <h5 className="mb-1">{group.groupName}</h5>
            <p className="text-muted small mb-1">
              <FaUserFriends className="me-1" />
                  {group.groupType === "ARTIST" ? "Nghệ sĩ" : "Người dùng"}: {group.creatorName || group.createdBy}
            </p>
            <p className="text-muted small mb-0">
                  {group.memberCount} thành viên
            </p>
            {group?.isUnread && (
              <div className="mt-1">
                <span className="badge bg-danger">Chưa đọc</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-muted small mb-3" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {group.description || "Không có mô tả"}
        </p>

        <div className="text-muted small mb-3" style={{
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          <strong>Tin nhắn cuối:</strong> {group.lastMessage || "Chưa có"}
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm flex-grow-1"
            onClick={() => handleViewGroup(group.id)}
          >
            Xem nhóm
          </button>
          {!isMember && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleJoin(group.id)}
            >
              <FaPlus className="me-1" />
              Tham gia
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Nhóm Chat</h2>
            <p className="text-muted">Tham gia và trò chuyện theo chủ đề</p>
          </div>
          {user && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/groups/create")}
            >
              <FaPlus className="me-2" />
              Tạo nhóm mới
            </button>
          )}
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <FaUsers className="me-2" />
              Tất cả nhóm
            </button>
          </li>
          {user && (
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "my" ? "active" : ""}`}
                onClick={() => setActiveTab("my")}
              >
                <FaUserFriends className="me-2" />
                Nhóm của tôi
              </button>
            </li>
          )}
        </ul>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* All Groups Tab */}
            {activeTab === "all" && (
              <>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Tìm kiếm nhóm nghệ sĩ..."
                    value={searchAll}
                    onChange={(e) => setSearchAll(e.target.value)}
                  />
                </div>

                <div className="row g-4">
                {allGroups.length === 0 ? (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <FaMusic size={64} className="text-muted mb-3" />
                      <h5 className="text-muted">Chưa có nhóm nào</h5>
                    </div>
                  </div>
                ) : (
                  allGroups
                    .filter((g) => matchesQuery(g, searchAll))
                    .map((group) => (
                    <div key={group.id} className="col-md-6 col-lg-4">
                      <GroupCard 
                        group={group} 
                        isMember={myGroups.some(g => g.id === group.id)}
                      />
                    </div>
                  ))
                )}
                </div>
              </>
            )}

            {/* My Groups Tab */}
            {activeTab === "my" && (
              <>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Tìm kiếm nhóm bạn đã tham gia..."
                    value={searchMy}
                    onChange={(e) => setSearchMy(e.target.value)}
                  />
                </div>

                <div className="row g-4">
                {myGroups.length === 0 ? (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <FaUserFriends size={64} className="text-muted mb-3" />
                      <h5 className="text-muted">Bạn chưa tham gia nhóm nào</h5>
                      <button
                        className="btn btn-primary mt-3"
                        onClick={() => setActiveTab("all")}
                      >
                        Khám phá nhóm
                      </button>
                    </div>
                  </div>
                ) : (
                  myGroups
                    .filter((g) => matchesQuery(g, searchMy))
                    .map((group) => (
                    <div key={group.id} className="col-md-6 col-lg-4">
                      <GroupCard group={group} isMember={true} />
                    </div>
                  ))
                )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <MusicPlayer />
    </div>
  );
}
