// Mock data for offline testing

// Mock Users
export const MOCK_USERS = [
  {
    id: "demo-user-001",
    email: "user@demo.com",
    fullName: "Nguyễn Văn A",
    username: "user_demo",
    role: "USER",
    avatar: "https://ui-avatars.com/api/?name=User+Demo&background=667eea&color=fff",
    bio: "Tài khoản demo USER - Người dùng thường",
    verified: false,
    followersCount: 120,
    followingCount: 85
  },
  {
    id: "demo-artist-001",
    email: "artist@demo.com",
    fullName: "Nghệ sĩ Demo",
    username: "artist_demo",
    role: "ARTIST",
    avatar: "https://ui-avatars.com/api/?name=Artist+Demo&background=764ba2&color=fff",
    bio: "Tài khoản demo ARTIST - Nghệ sĩ đã verified",
    verified: true,
    artistVerified: true,
    followersCount: 5420,
    followingCount: 234
  },
  {
    id: "demo-admin-001",
    email: "admin@demo.com",
    fullName: "Quản trị viên",
    username: "admin_demo",
    role: "ADMIN",
    avatar: "https://ui-avatars.com/api/?name=Admin+Demo&background=e74c3c&color=fff",
    bio: "Tài khoản demo ADMIN - Quản trị hệ thống",
    verified: true,
    followersCount: 100,
    followingCount: 50
  },
  {
    id: "artist-002",
    fullName: "Sơn Tùng M-TP",
    username: "sontungmtp",
    role: "ARTIST",
    avatar: "https://ui-avatars.com/api/?name=Son+Tung&background=ff6b6b&color=fff",
    bio: "Ca sĩ, nhạc sĩ",
    verified: true,
    artistVerified: true,
    followersCount: 12500,
    followingCount: 120
  },
  {
    id: "artist-003",
    fullName: "Hoàng Thùy Linh",
    username: "hoangthuylinhofficial",
    role: "ARTIST",
    avatar: "https://ui-avatars.com/api/?name=Hoang+Thuy+Linh&background=48dbfb&color=fff",
    bio: "Singer & Performer",
    verified: true,
    artistVerified: true,
    followersCount: 8900,
    followingCount: 200
  }
];

// Mock Songs
export const MOCK_SONGS = [
  {
    id: "song-001",
    title: "Chúng Ta Của Hiện Tại",
    artistId: "artist-002",
    artistUsername: "sontungmtp",
    artistName: "Sơn Tùng M-TP",
    genre: "Pop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop",
    duration: 245,
    views: 15000,
    likes: 3200,
    createdAt: "2024-12-01T10:00:00Z",
    isPublic: true,
    lyrics: "Chúng ta của hiện tại\nĐang cùng nhau đi tìm...",
    aiData: {
      bpm: 120,
      key: "C Major",
      mood: "Upbeat",
      energy: 0.8
    }
  },
  {
    id: "song-002",
    title: "See Tình",
    artistId: "artist-003",
    artistUsername: "hoangthuylinhofficial",
    artistName: "Hoàng Thùy Linh",
    genre: "Electronic",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
    duration: 200,
    views: 22000,
    likes: 5100,
    createdAt: "2024-11-28T15:30:00Z",
    isPublic: true,
    lyrics: "See tình trong ánh mắt em...",
    aiData: {
      bpm: 128,
      key: "A Minor",
      mood: "Energetic",
      energy: 0.9
    }
  },
  {
    id: "song-003",
    title: "Hơn Cả Yêu",
    artistId: "demo-artist-001",
    artistUsername: "artist_demo",
    artistName: "Nghệ sĩ Demo",
    genre: "Ballad",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop",
    duration: 280,
    views: 8500,
    likes: 1800,
    createdAt: "2024-12-10T08:00:00Z",
    isPublic: true,
    lyrics: "Hơn cả yêu, là cả cuộc đời...",
    aiData: {
      bpm: 85,
      key: "G Major",
      mood: "Romantic",
      energy: 0.5
    }
  },
  {
    id: "song-004",
    title: "Lạc Trôi",
    artistId: "artist-002",
    artistUsername: "sontungmtp",
    artistName: "Sơn Tùng M-TP",
    genre: "Rock",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop",
    duration: 235,
    views: 45000,
    likes: 9200,
    createdAt: "2024-11-15T12:00:00Z",
    isPublic: true,
    aiData: {
      bpm: 95,
      key: "D Minor",
      mood: "Melancholic",
      energy: 0.6
    }
  },
  {
    id: "song-005",
    title: "Để Mị Nói Cho Mà Nghe",
    artistId: "artist-003",
    artistUsername: "hoangthuylinhofficial",
    artistName: "Hoàng Thùy Linh",
    genre: "Jazz",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=800&fit=crop",
    duration: 195,
    views: 18000,
    likes: 4200,
    createdAt: "2024-12-05T14:20:00Z",
    isPublic: true,
    aiData: {
      bpm: 110,
      key: "F Major",
      mood: "Traditional",
      energy: 0.7
    }
  }
];

// Mock Playlists
export const MOCK_PLAYLISTS = [
  {
    id: "playlist-001",
    name: "Top V-Pop Hits 2024",
    description: "Những bài hát V-Pop hot nhất năm 2024",
    userId: "demo-user-001",
    username: "user_demo",
    coverImage: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500",
    isPublic: true,
    songs: ["song-001", "song-002", "song-004"],
    songCount: 3,
    createdAt: "2024-11-20T10:00:00Z"
  },
  {
    id: "playlist-002",
    name: "Chill & Relax",
    description: "Nhạc thư giãn cuối tuần",
    userId: "demo-artist-001",
    username: "artist_demo",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500",
    isPublic: true,
    songs: ["song-003", "song-005"],
    songCount: 2,
    createdAt: "2024-12-01T09:00:00Z"
  },
  {
    id: "playlist-003",
    name: "Workout Mix",
    description: "Năng lượng cho buổi tập luyện",
    userId: "demo-user-001",
    username: "user_demo",
    coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500",
    isPublic: true,
    songs: ["song-002", "song-004"],
    songCount: 2,
    createdAt: "2024-11-25T16:00:00Z"
  }
];

// Mock Posts
export const MOCK_POSTS = [
  {
    id: "post-001",
    userId: "artist-002",
    username: "sontungmtp",
    userFullName: "Sơn Tùng M-TP",
    userAvatar: "https://ui-avatars.com/api/?name=Son+Tung&background=ff6b6b&color=fff",
    content: "Cảm ơn mọi người đã ủng hộ MV mới! ❤️🎵",
    mediaUrl: null,
    likes: 5400,
    comments: 320,
    createdAt: "2024-12-15T10:30:00Z"
  },
  {
    id: "post-002",
    userId: "artist-003",
    username: "hoangthuylinhofficial",
    userFullName: "Hoàng Thùy Linh",
    userAvatar: "https://ui-avatars.com/api/?name=Hoang+Thuy+Linh&background=48dbfb&color=fff",
    content: "Đang chuẩn bị cho concert tháng sau. Ai đi cùng mình không? 🎤✨",
    mediaUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
    likes: 3200,
    comments: 189,
    createdAt: "2024-12-16T14:20:00Z"
  },
  {
    id: "post-003",
    userId: "demo-artist-001",
    username: "artist_demo",
    userFullName: "Nghệ sĩ Demo",
    userAvatar: "https://ui-avatars.com/api/?name=Artist+Demo&background=764ba2&color=fff",
    content: "Vừa release bài mới 'Hơn Cả Yêu'. Mọi người nghe và cho ý kiến nhé! 🎶",
    mediaUrl: null,
    likes: 850,
    comments: 45,
    createdAt: "2024-12-16T20:00:00Z"
  }
];

// Mock Stories
export const MOCK_STORIES = [
  {
    id: "story-001",
    userId: "artist-002",
    username: "sontungmtp",
    userFullName: "Sơn Tùng M-TP",
    userAvatar: "https://ui-avatars.com/api/?name=Son+Tung&background=ff6b6b&color=fff",
    contentUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    type: "IMAGE",
    textContent: "Studio session 🎵",
    views: 12000,
    createdAt: "2024-12-17T08:00:00Z",
    expiresAt: "2024-12-18T08:00:00Z"
  },
  {
    id: "story-002",
    userId: "artist-003",
    username: "hoangthuylinhofficial",
    userFullName: "Hoàng Thùy Linh",
    userAvatar: "https://ui-avatars.com/api/?name=Hoang+Thuy+Linh&background=48dbfb&color=fff",
    contentUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
    type: "IMAGE",
    textContent: "Rehearsal time! 💃",
    views: 8500,
    createdAt: "2024-12-17T10:30:00Z",
    expiresAt: "2024-12-18T10:30:00Z"
  }
];

// Mock Notifications
export const MOCK_NOTIFICATIONS = [
  {
    id: "notif-001",
    userId: "demo-user-001",
    type: "LIKE",
    message: "Sơn Tùng M-TP liked your post",
    fromUserId: "artist-002",
    fromUsername: "sontungmtp",
    fromUserAvatar: "https://ui-avatars.com/api/?name=Son+Tung&background=ff6b6b&color=fff",
    isRead: false,
    createdAt: "2024-12-17T09:00:00Z"
  },
  {
    id: "notif-002",
    userId: "demo-user-001",
    type: "FOLLOW",
    message: "Hoàng Thùy Linh started following you",
    fromUserId: "artist-003",
    fromUsername: "hoangthuylinhofficial",
    fromUserAvatar: "https://ui-avatars.com/api/?name=Hoang+Thuy+Linh&background=48dbfb&color=fff",
    isRead: false,
    createdAt: "2024-12-17T11:15:00Z"
  },
  {
    id: "notif-003",
    userId: "demo-artist-001",
    type: "COMMENT",
    message: "Someone commented on your song 'Hơn Cả Yêu'",
    fromUserId: "demo-user-001",
    fromUsername: "user_demo",
    fromUserAvatar: "https://ui-avatars.com/api/?name=User+Demo&background=667eea&color=fff",
    isRead: true,
    createdAt: "2024-12-16T18:30:00Z"
  }
];

// Helper function to check if user is using demo account
export const isDemoMode = () => {
  const token = localStorage.getItem("token");
  return token && token.startsWith("demo_token_");
};

// Helper function to get current demo user
export const getCurrentDemoUser = () => {
  if (!isDemoMode()) return null;
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to get mock data based on user role
export const getMockDataForUser = (userId) => {
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) return null;

  return {
    user,
    songs: MOCK_SONGS,
    playlists: MOCK_PLAYLISTS.filter(p => p.userId === userId || p.isPublic),
    posts: MOCK_POSTS,
    stories: MOCK_STORIES,
    notifications: MOCK_NOTIFICATIONS.filter(n => n.userId === userId)
  };
};
