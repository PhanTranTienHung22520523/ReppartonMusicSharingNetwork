import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginRequireModal from "../components/LoginRequireModal";
import SongAIAnalysis from "../components/SongAIAnalysis";
import { analyzeSong, analyzeChords, getAIAnalysis, getChordAnalysis } from "../api/aiService";
import { uploadSong, searchSongs, updateSongLyrics } from "../api/songService";
import { createPost } from "../api/postService";
import { createStory } from "../api/storyService";
import { getAllGenres } from "../api/genreService";
import { cancelArtistApplication, getCurrentUser } from "../api/auth";
import { FaMusic, FaImage, FaCameraRetro, FaBrain, FaCheckCircle, FaSearch, FaTimes } from "react-icons/fa";

export default function Upload() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("music");
  const [genres, setGenres] = useState([]);

  const isArtist = Boolean(user && (user.roles?.includes("ARTIST") || user.role === "ARTIST"));
  const isArtistPending = Boolean(user?.isArtistPending || user?.artistVerification?.status === "pending");
  const artistStatus = user?.artistVerification?.status;
  const isArtistRejected = artistStatus === "rejected";
  const isArtistApproved = artistStatus === "approved";
  const rejectionReason = user?.artistVerification?.rejectionReason;
  
  // Song upload state
  const [song, setSong] = useState({
    title: "",
    description: "",
    lyrics: "",
    file: null,
    coverImage: null,
    genreIds: [],
  });
  
  // Post upload state
  const [post, setPost] = useState({
    content: "",
    image: null,
    isPrivate: false,
  });

  // Song search state for posts
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [songSearchResults, setSongSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchingSongs, setSearchingSongs] = useState(false);
  
  // Story upload state
  const [story, setStory] = useState({
    content: "",
    image: null,
    duration: 24, // hours
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [uploadedSongId, setUploadedSongId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [chordAnalysis, setChordAnalysis] = useState(null);
  const [cancellingArtist, setCancellingArtist] = useState(false);
  const [refreshingArtistStatus, setRefreshingArtistStatus] = useState(false);
  const [artistStatusFlash, setArtistStatusFlash] = useState(null);
  const [lastArtistStatus, setLastArtistStatus] = useState(null);

  const handleCancelArtistApplication = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy đăng ký nghệ sĩ không?")) return;
    setCancellingArtist(true);
    try {
      const updated = await cancelArtistApplication();
      updateUser(updated);
      alert("Đã hủy đăng ký nghệ sĩ.");
    } catch (e) {
      alert(e?.message || "Hủy đăng ký thất bại");
    } finally {
      setCancellingArtist(false);
    }
  };

  const refreshArtistStatus = async () => {
    if (!user?.id) return;
    setRefreshingArtistStatus(true);
    try {
      const fresh = await getCurrentUser();
      if (fresh) {
        updateUser(fresh);
      }
    } finally {
      setRefreshingArtistStatus(false);
    }
  };

  // Best-effort refresh to avoid stale localStorage (so pending/cancel shows)
  useEffect(() => {
    if (!user?.id) return;
    refreshArtistStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Poll while pending to surface approve/reject without relog
  useEffect(() => {
    if (!user?.id) return;
    if (artistStatus !== "pending") return;
    const t = setInterval(() => {
      refreshArtistStatus();
    }, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, artistStatus]);

  // One-time flash notice when status transitions
  useEffect(() => {
    if (!user?.id) {
      setLastArtistStatus(null);
      return;
    }

    if (lastArtistStatus === "pending" && artistStatus === "approved") {
      setArtistStatusFlash({ type: "success", message: "Chúc mừng! Đơn đăng ký nghệ sĩ đã được duyệt." });
    } else if (lastArtistStatus === "pending" && artistStatus === "rejected") {
      setArtistStatusFlash({ type: "danger", message: "Đơn đăng ký nghệ sĩ đã bị từ chối." });
    }

    setLastArtistStatus(artistStatus || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistStatus, user?.id]);

  useEffect(() => {
    if (!artistStatusFlash) return;
    const t = setTimeout(() => setArtistStatusFlash(null), 8000);
    return () => clearTimeout(t);
  }, [artistStatusFlash]);

  const handleSongSearch = async (e) => {
    const query = e.target.value;
    setSongSearchQuery(query);
    if (query.length > 2) {
      setSearchingSongs(true);
      try {
        const results = await searchSongs(query);
        // Handle different response formats
        const songs = results.data || results || [];
        setSongSearchResults(Array.isArray(songs) ? songs : []);
      } catch (err) {
        console.error(err);
        setSongSearchResults([]);
      } finally {
        setSearchingSongs(false);
      }
    } else {
      setSongSearchResults([]);
    }
  };

  const selectSong = (song) => {
    setSelectedSong(song);
    setSongSearchQuery("");
    setSongSearchResults([]);
  };

  useEffect(() => {
    getAllGenres()
      .then((data) => setGenres(Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : [])))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    if (user && !isArtist && activeTab === "music") {
      setActiveTab("post");
    }
  }, [user, isArtist, activeTab]);

  const handleSongChange = e => {
    const { name, value, files, options } = e.target;
    if (name === "genreIds") {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setSong(s => ({ ...s, genreIds: selected }));
    } else {
      setSong(s => ({ ...s, [name]: files ? files[0] : value }));
    }
  };

  const handlePostChange = e => {
    const { name, value, files, type, checked } = e.target;
    setPost(p => ({ 
      ...p, 
      [name]: type === "checkbox" ? checked : (files ? files[0] : value)
    }));
  };

  const handleStoryChange = e => {
    const { name, value, files } = e.target;
    setStory(s => ({ ...s, [name]: files ? files[0] : value }));
  };

  const handleSongSubmit = async e => {
    e.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    
    console.log("User data:", user);
    
    setLoading(true);
    setSuccess("");
    
    try {
      const formData = new FormData();
      formData.append("title", song.title);
      formData.append("artistId", user.id || user.email || user.username);
      if (song.description) formData.append("description", song.description);

      // Send genre names (song-service stores genres as strings)
      const selectedGenreNames = (song.genreIds || [])
        .map((id) => genres.find((g) => g.id === id)?.name)
        .filter(Boolean);
      selectedGenreNames.forEach((name) => formData.append("genres", name));

      if (song.lyrics && song.lyrics.trim()) formData.append("lyrics", song.lyrics.trim());
      if (song.file) formData.append("audioFile", song.file);
      if (song.coverImage) formData.append("coverFile", song.coverImage);
      
      // Gọi API một lần duy nhất
      const result = await uploadSong(formData, user.token);

      const createdSong = result?.data ?? result;
      const createdSongId = createdSong?.id ?? createdSong?._id ?? null;
      // Keep the freshly created song object in state so posts can attach it for nicer display
      if (createdSong) setSelectedSong(createdSong);
      // Ensure lyrics get persisted even if the upload endpoint ignores it.
      if (createdSongId && song.lyrics && song.lyrics.trim()) {
        try {
          await updateSongLyrics(createdSongId, song.lyrics.trim());
        } catch (err) {
          console.error("Update lyrics failed:", err);
        }
      }
      
      setSuccess("Upload bài hát thành công!");
      setUploadedSongId(createdSongId ?? result?.id);
      // Reset form
      setSong({ title: "", description: "", lyrics: "", file: null, coverImage: null, genreIds: [] });
      // Redirect to home after successful upload
      navigate('/');
      
    } catch (error) {
      console.error("Upload error:", error);
      setSuccess("Upload bài hát thất bại: " + error.message);
    } finally {
      // Luôn tắt loading dù thành công hay thất bại
      setLoading(false);
    }
  };

  const handleAnalyzeSong = async () => {
    if (!uploadedSongId) return;
    
    setAnalyzing(true);
    try {
      const response = await analyzeSong(uploadedSongId);

      if (response?.success) {
        const analysisResponse = await getAIAnalysis(uploadedSongId);
        setAiAnalysis(analysisResponse?.data);

        // Trigger chord analysis best-effort, then fetch result
        try {
          await analyzeChords(uploadedSongId);
          const chordsResponse = await getChordAnalysis(uploadedSongId);
          setChordAnalysis(chordsResponse?.data);
        } catch (err) {
          console.log("Chord analysis not available:", err);
        }

        setSuccess("Phân tích AI hoàn tất!");
      } else {
        setSuccess("Phân tích AI thất bại: " + (response?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
      setSuccess("Phân tích AI thất bại: " + error.message);
    }
    setAnalyzing(false);
  };

  const handlePostSubmit = async e => {
    e.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    setLoading(true);
    setSuccess("");
    try {
      await createPost(post.content, post.image, selectedSong?.id || selectedSong?._id);
      setSuccess("Đăng bài thành công!");
      setPost({ content: "", image: null, isPrivate: false });
      setSelectedSong(null);
        // Redirect to home after creating post
        navigate('/');
    } catch (error) {
      console.error("Post upload error:", error);
      setSuccess("Đăng bài thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };
 

  const handleStorySubmit = async e => {
    e.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    setLoading(true);
    setSuccess("");
    try {
      await createStory({
        content: story.content,
        image: story.image,
        type: "image",
        isPrivate: false
      });
      setSuccess("Đăng story thành công!");
      setStory({ content: "", image: null, duration: 24 });
        // Redirect to home after story upload
        navigate('/');
    } catch (error) {
      console.error("Story upload error:", error);
      setSuccess("Đăng story thất bại: " + error.message);
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <h3 className="fw-bold mb-4">
          <FaCameraRetro className="me-2" />
          Upload Content
        </h3>

        {artistStatusFlash ? (
          <div className={`alert alert-${artistStatusFlash.type} d-flex align-items-center justify-content-between`}>
            <div className="fw-bold">{artistStatusFlash.message}</div>
            <button type="button" className="btn btn-sm btn-light" onClick={() => setArtistStatusFlash(null)}>
              Đóng
            </button>
          </div>
        ) : null}

        {user && !isArtist && (
          <div className={`alert ${isArtistPending ? "alert-warning" : isArtistRejected ? "alert-danger" : isArtistApproved ? "alert-success" : "alert-info"} d-flex align-items-center justify-content-between`}>
            <div>
              <div className="fw-bold">
                {isArtistPending
                  ? "Đang chờ duyệt"
                  : isArtistRejected
                    ? "Đơn nghệ sĩ bị từ chối"
                    : isArtistApproved
                      ? "Đơn nghệ sĩ đã được duyệt"
                      : "Chỉ Nghệ sĩ mới có thể Upload Music"}
              </div>
              <div className="small">
                {isArtistPending
                  ? "Hồ sơ đăng ký nghệ sĩ của bạn đang được xét duyệt. Bạn có thể hủy đăng ký nếu muốn."
                  : isArtistRejected
                    ? "Bạn có thể xem lý do từ chối bên dưới và đăng ký lại sau khi cập nhật hồ sơ."
                    : isArtistApproved
                      ? "Nếu bạn chưa thấy quyền nghệ sĩ, hãy bấm Làm mới trạng thái hoặc đăng xuất/đăng nhập lại."
                      : "Bạn có thể đăng ký làm nghệ sĩ để upload bài hát."}

                {isArtistRejected && rejectionReason ? (
                  <div className="mt-2">
                    <div className="fw-bold">Lý do từ chối (nếu có)</div>
                    <textarea
                      className="form-control mt-1"
                      rows={2}
                      value={rejectionReason}
                      readOnly
                    />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {(isArtistPending || isArtistApproved || isArtistRejected) ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={refreshArtistStatus}
                  disabled={refreshingArtistStatus}
                  title="Cập nhật trạng thái từ server"
                >
                  {refreshingArtistStatus ? "Đang làm mới..." : "Làm mới"}
                </button>
              ) : null}

              {isArtistPending ? (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleCancelArtistApplication}
                  disabled={cancellingArtist}
                >
                  {cancellingArtist ? "Đang hủy..." : "Hủy đăng ký"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/apply-artist")}
                >
                  Đăng ký Nghệ sĩ
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-transparent border-0">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'music' ? 'active' : ''} ${!isArtist ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!isArtist) return;
                    setActiveTab('music');
                  }}
                  disabled={!isArtist}
                >
                  <FaMusic className="me-2" />
                  Upload Music
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'post' ? 'active' : ''}`}
                  onClick={() => setActiveTab('post')}
                >
                  <FaImage className="me-2" />
                  Create Post
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'story' ? 'active' : ''}`}
                  onClick={() => setActiveTab('story')}
                >
                  <FaCameraRetro className="me-2" />
                  Create Story
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body p-4">
            {/* Music Upload Tab */}
            {activeTab === 'music' && (
              <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                  <form onSubmit={handleSongSubmit} encType="multipart/form-data">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Tên bài hát</label>
                      <input 
                        className="form-control" 
                        name="title" 
                        value={song.title} 
                        onChange={handleSongChange} 
                        required 
                        placeholder="Nhập tên bài hát..."
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Mô tả</label>
                      <textarea 
                        className="form-control" 
                        name="description" 
                        value={song.description} 
                        onChange={handleSongChange}
                        rows="3"
                        placeholder="Mô tả về bài hát..."
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Lyrics</label>
                      <textarea
                        className="form-control"
                        name="lyrics"
                        value={song.lyrics}
                        onChange={handleSongChange}
                        rows="6"
                        placeholder="Nhập lời bài hát..."
                      />
                      <div className="form-text">Có thể để trống. Nếu có, hệ thống sẽ tự tạo lời đồng bộ (synced lyrics).</div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Thể loại</label>
                      <select
                        className="form-select"
                        name="genreIds"
                        multiple
                        value={song.genreIds}
                        onChange={handleSongChange}
                        required
                        style={{ minHeight: 120 }}
                      >
                        {genres.map(g => (
                          <option value={g.id} key={g.id}>{g.name}</option>
                        ))}
                      </select>
                      <div className="form-text">Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều thể loại</div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">File nhạc</label>
                      <input 
                        className="form-control" 
                        type="file" 
                        name="file" 
                        accept="audio/*" 
                        onChange={handleSongChange} 
                        required 
                      />
                      <div className="form-text">Hỗ trợ: MP3, WAV, M4A (tối đa 50MB)</div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Ảnh bìa</label>
                      <input 
                        className="form-control" 
                        type="file" 
                        name="coverImage" 
                        accept="image/*" 
                        onChange={handleSongChange} 
                      />
                      <div className="form-text">Khuyến nghị: 500x500px, JPG/PNG (tối đa 5MB)</div>
                    </div>
                    
                    {success && (
                      <div className={`alert ${success.includes("thành công") ? "alert-success" : "alert-danger"} mb-3`}>
                        <FaCheckCircle className="me-2" />
                        {success}
                      </div>
                    )}
                    
                    <button 
                      className="btn btn-primary btn-lg w-100" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <FaMusic className="me-2" />
                          Upload Music
                        </>
                      )}
                    </button>
                    
                    {/* AI Analysis Button */}
                    {uploadedSongId && (
                      <button 
                        className="btn btn-outline-primary btn-lg w-100 mt-3" 
                        type="button"
                        onClick={handleAnalyzeSong}
                        disabled={analyzing}
                      >
                        {analyzing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang phân tích...
                          </>
                        ) : (
                          <>
                            <FaBrain className="me-2" />
                            Phân tích bằng AI
                          </>
                        )}
                      </button>
                    )}
                  </form>
                  
                  {/* AI Analysis Results */}
                  {aiAnalysis && (
                    <div className="mt-4">
                      <SongAIAnalysis analysis={aiAnalysis} chordAnalysis={chordAnalysis} />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Post Upload Tab */}
            {activeTab === 'post' && (
              <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                  <form onSubmit={handlePostSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nội dung bài đăng</label>
                      <textarea 
                        className="form-control" 
                        name="content" 
                        value={post.content} 
                        onChange={handlePostChange}
                        rows="4"
                        required
                        placeholder="Bạn đang nghĩ gì?"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Hình ảnh (tùy chọn)</label>
                      <input 
                        className="form-control" 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        onChange={handlePostChange}
                      />
                      <div className="form-text">JPG, PNG, GIF (tối đa 10MB)</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Đính kèm bài hát (tùy chọn)</label>
                      {selectedSong ? (
                        <div className="d-flex align-items-center p-2 border rounded bg-light">
                          <div className="me-3">
                            <FaMusic className="text-primary" size={24} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{selectedSong.title}</div>
                            <div className="text-muted small">{selectedSong.artist?.name || "Unknown Artist"}</div>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-link text-danger p-0"
                            onClick={() => setSelectedSong(null)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="position-relative">
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <FaSearch className="text-muted" />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tìm kiếm bài hát..."
                              value={songSearchQuery}
                              onChange={handleSongSearch}
                            />
                          </div>
                          
                          {/* Search Results Dropdown */}
                          {(searchingSongs || songSearchResults.length > 0) && (
                            <div className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                              {searchingSongs && (
                                <div className="p-2 text-center text-muted">
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Đang tìm kiếm...
                                </div>
                              )}
                              
                              {!searchingSongs && songSearchResults.map(song => (
                                <div 
                                  key={song.id}
                                  className="p-2 border-bottom cursor-pointer hover-bg-light"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => selectSong(song)}
                                >
                                  <div className="fw-bold">{song.title}</div>
                                  <div className="text-muted small">{song.artist?.name || "Unknown Artist"}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="isPrivate"
                          checked={post.isPrivate}
                          onChange={handlePostChange}
                          id="postPrivate"
                        />
                        <label className="form-check-label" htmlFor="postPrivate">
                          Bài đăng riêng tư (chỉ followers có thể xem)
                        </label>
                      </div>
                    </div>
                    
                    {success && (
                      <div className={`alert ${success.includes("thành công") ? "alert-success" : "alert-danger"} mb-3`}>
                        {success}
                      </div>
                    )}
                    
                    <button 
                      className="btn btn-primary btn-lg w-100" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang đăng...
                        </>
                      ) : (
                        <>
                          <FaImage className="me-2" />
                          Đăng bài
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Story Upload Tab */}
            {activeTab === 'story' && (
              <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                  <form onSubmit={handleStorySubmit} encType="multipart/form-data">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nội dung story</label>
                      <textarea 
                        className="form-control" 
                        name="content" 
                        value={story.content} 
                        onChange={handleStoryChange}
                        rows="3"
                        placeholder="Chia sẻ khoảnh khắc của bạn..."
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Hình ảnh/Video</label>
                      <input 
                        className="form-control" 
                        type="file" 
                        name="image" 
                        accept="image/*,video/*" 
                        onChange={handleStoryChange}
                        required
                      />
                      <div className="form-text">JPG, PNG, GIF, MP4 (tối đa 20MB)</div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Thời gian hiển thị</label>
                      <select 
                        className="form-select" 
                        name="duration" 
                        value={story.duration} 
                        onChange={handleStoryChange}
                      >
                        <option value={1}>1 giờ</option>
                        <option value={6}>6 giờ</option>
                        <option value={12}>12 giờ</option>
                        <option value={24}>24 giờ</option>
                      </select>
                    </div>
                    
                    {success && (
                      <div className={`alert ${success.includes("thành công") ? "alert-success" : "alert-danger"} mb-3`}>
                        {success}
                      </div>
                    )}
                    
                    <button 
                      className="btn btn-primary btn-lg w-100" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang đăng...
                        </>
                      ) : (
                        <>
                          <FaCameraRetro className="me-2" />
                          Đăng Story
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <LoginRequireModal show={showModal && !user} onClose={() => setShowModal(false)} />
    </MainLayout>
  );
}