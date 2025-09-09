import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import { useEffect, useState } from "react";
import LoginRequireModal from "../components/LoginRequireModal";
import { FaMusic, FaImage, FaCameraRetro } from "react-icons/fa";

// API lấy genre
async function getAllGenres() {
  const res = await fetch("http://localhost:8080/api/genres");
  if (!res.ok) throw new Error("Lỗi lấy genre");
  return res.json();
}
// API upload bài hát
async function uploadSong(formData, token) {
  const res = await fetch("http://localhost:8080/api/songs/upload", {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Lỗi upload bài hát");
  return res.json();
}

// API upload post
async function uploadPost(postData, token) {
  const formData = new FormData();
  formData.append("content", postData.content);
  if (postData.image) formData.append("mediaFile", postData.image);
  
  const res = await fetch("http://localhost:8080/api/posts", {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Lỗi upload post");
  return res.json();
}

// API upload story
async function uploadStory(storyData, token) {
  const formData = new FormData();
  formData.append("type", "image");
  if (storyData.content) formData.append("textContent", storyData.content);
  if (storyData.image) formData.append("contentFile", storyData.image);
  formData.append("isPrivate", false);
  
  const res = await fetch("http://localhost:8080/api/stories/create-auth", {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Lỗi upload story");
  return res.json();
}

export default function Upload() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("music");
  const [genres, setGenres] = useState([]);
  
  // Song upload state
  const [song, setSong] = useState({
    title: "",
    description: "",
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
  
  // Story upload state
  const [story, setStory] = useState({
    content: "",
    image: null,
    duration: 24, // hours
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getAllGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

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
    
    console.log("User data:", user); // Debug log
    console.log("User role:", user.role); // Debug log
    
    setLoading(true);
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("title", song.title);
      formData.append("artistId", user.id || user.email || user.username); // Backend expects artistId
      if (song.file) formData.append("audioFile", song.file); // Backend expects "audioFile" 
      if (song.coverImage) formData.append("coverFile", song.coverImage);
      // Convert array to comma-separated string
      formData.append("genreIds", (song.genreIds || []).join(","));
      formData.append("isPrivate", "false");

      console.log("Sending formData with token:", user.token); // Debug log

      await uploadSong(formData, user.token);
      setSuccess("Upload bài hát thành công!");
      setSong({ title: "", description: "", file: null, coverImage: null, genreIds: [] });
    } catch (error) {
      console.error("Upload error:", error); // Debug log
      setSuccess("Upload bài hát thất bại: " + error.message);
    }
    setLoading(false);
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
      await uploadPost(post, user.token);
      setSuccess("Đăng bài thành công!");
      setPost({ content: "", image: null, isPrivate: false });
    } catch {
      setSuccess("Đăng bài thất bại!");
    }
    setLoading(false);
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
      await uploadStory(story, user.token);
      setSuccess("Đăng story thành công!");
      setStory({ content: "", image: null, duration: 24 });
    } catch {
      setSuccess("Đăng story thất bại!");
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
        
        {/* Tabs */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-transparent border-0">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'music' ? 'active' : ''}`}
                  onClick={() => setActiveTab('music')}
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
                  </form>
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