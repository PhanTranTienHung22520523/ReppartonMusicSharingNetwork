import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "vi" : "en"));
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.discover": "Discover",
    "nav.search": "Search",
    "nav.playlist": "Playlist",
    "nav.messages": "Messages",
    "nav.notifications": "Notifications",
    "nav.profile": "Profile",
    "nav.upload": "Upload",
    "nav.settings": "Settings",
    "nav.genres": "Genres",
    "nav.analytics": "Analytics",
    "nav.history": "History",
    
    // Auth
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.signOut": "Sign Out",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.username": "Username",
    "auth.fullName": "Full Name",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.update": "Update",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.viewAll": "View All",
    "common.showMore": "Show More",
    "common.showLess": "Show Less",
    "common.unreadNotifications": "unread",
    "common.allCaughtUp": "You're all caught up!",
    
    // Settings
    "settings.title": "Settings",
    "settings.account": "Account",
    "settings.displayName": "Display Name",
    "settings.bio": "Bio",
    "settings.website": "Website",
    "settings.saveChanges": "Save Changes",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.themeLight": "Light",
    "settings.themeDark": "Dark",
    "settings.themePurple": "Purple Dream",
    "settings.themeOcean": "Ocean Blue",
    "settings.themeForest": "Forest Green",
    "settings.themeSunset": "Sunset",
    "settings.themeRose": "Rose Pink",
    "settings.themeMidnight": "Midnight",
    "settings.themeCyber": "Cyberpunk",
    "settings.themeAuto": "Auto",
    "settings.notifications": "Notifications",
    "settings.emailNotifications": "Email Notifications",
    "settings.pushNotifications": "Push Notifications",
    "settings.commentNotifications": "Comment Notifications",
    "settings.followerNotifications": "New Follower Notifications",
    "settings.likes": "Likes",
    "settings.comments": "Comments",
    "settings.followers": "Followers",
    "settings.likesDesc": "Get notified when someone likes your tracks",
    "settings.commentsDesc": "Get notified about new comments on your posts",
    "settings.followersDesc": "Get notified when someone follows you",
    "settings.newMusic": "New Music from Artists",
    "settings.newMusicDesc": "Get notified when artists you follow release new tracks",
    "settings.emailDesc": "Receive notifications via email",
    "settings.pushDesc": "Receive push notifications on your device",
    "settings.privacy": "Privacy & Security",
    "settings.publicProfile": "Public Profile",
    "settings.publicProfileDesc": "Make your profile visible to everyone",
    "settings.showActivity": "Show Activity",
    "settings.showActivityDesc": "Let others see your listening activity",
    "settings.publicPlaylists": "Public Playlists",
    "settings.publicPlaylistsDesc": "Make your playlists visible to others",
    "settings.whoCanMessage": "Who can message you",
    "settings.everyone": "Everyone",
    "settings.friendsOnly": "Friends only",
    "settings.noOne": "No one",
    "settings.audioPlayback": "Audio & Playback",
    "settings.audioQuality": "Audio Quality",
    "settings.high": "High",
    "settings.medium": "Medium",
    "settings.low": "Low",
    "settings.autoplay": "Autoplay",
    "settings.autoplayDesc": "Automatically play the next track",
    "settings.crossfade": "Crossfade",
    "settings.crossfadeDesc": "Smooth transition between tracks",
    "settings.volume": "Volume",
    "settings.crossfadeDuration": "Crossfade Duration",
    "settings.crossfadeDurationDesc": "Duration of fade in/out when crossfade is enabled",
    "settings.interface": "Interface",
    "settings.showWaveform": "Show Waveform",
    "settings.showWaveformDesc": "Display audio waveform in player",
    "settings.showLyrics": "Show Lyrics",
    "settings.showLyricsDesc": "Display lyrics when available",
    "settings.animations": "Animations",
    "settings.animationsDesc": "Enable smooth animations and transitions",
    "settings.dataStorage": "Data & Storage",
    "settings.downloadData": "Download Your Data",
    "settings.downloadDataDesc": "Get a copy of all your SoundSpace data",
    "settings.request": "Request",
    "settings.deleteAccount": "Delete Account",
    "settings.deleteAccountDesc": "Permanently delete your account and all data",
    
    // Music
    "music.play": "Play",
    "music.pause": "Pause",
    "music.next": "Next",
    "music.previous": "Previous",
    "music.shuffle": "Shuffle",
    "music.repeat": "Repeat",
    "music.volume": "Volume",
    "music.addToPlaylist": "Add to Playlist",
    "music.share": "Share",
    "music.like": "Like",
    "music.unlike": "Unlike",
    "music.download": "Download",
    
    // Social
    "social.follow": "Follow",
    "social.unfollow": "Unfollow",
    "social.following": "Following",
    "social.followers": "Followers",
    "social.posts": "Posts",
    "social.comment": "Comment",
    "social.reply": "Reply",
    "social.delete": "Delete",
    "social.report": "Report",
    
    // Time
    "time.now": "Just now",
    "time.minutesAgo": "minutes ago",
    "time.hoursAgo": "hours ago",
    "time.daysAgo": "days ago",
    "time.weeksAgo": "weeks ago",
    "time.monthsAgo": "months ago",
    "time.yearsAgo": "years ago",
    
    // Genres
    "genres.title": "Music Genres",
    "genres.trending": "Trending Now",
    "genres.all": "All Genres",
    "genres.songs": "songs",
    
    // Analytics
    "analytics.title": "Analytics Dashboard",
    "analytics.totalPlays": "Total Plays",
    "analytics.totalListeners": "Total Listeners",
    "analytics.topSongs": "Top Songs",
    "analytics.recentSearches": "Recent Searches",
    "analytics.listenHistory": "Listen History",
    
    // History
    "history.title": "History",
    "history.listen": "Listen History",
    "history.search": "Search History",
    "history.clear": "Clear History",
    "history.noListenHistory": "No listen history yet",
    "history.noSearchHistory": "No search history yet",
    
    // Home & Feed
    "home.title": "Home",
    "home.whatsOnYourMind": "What's on your mind?",
    "home.share": "Share",
    "home.trendingSongs": "Trending Songs",
    "home.forYou": "For You",
    "home.stories": "Stories",
    
    // Discover
    "discover.title": "Discover",
    "discover.recent": "Recently Played",
    "discover.newest": "Newest Releases",
    "discover.mostViewed": "Most Popular",
    "discover.viewAll": "View All",
    
    // Upload
    "upload.title": "Upload",
    "upload.song": "Upload Song",
    "upload.post": "Create Post",
    "upload.selectFile": "Select File",
    "upload.songTitle": "Song Title",
    "upload.description": "Description",
    "upload.genre": "Genre",
    "upload.coverImage": "Cover Image",
    "upload.audioFile": "Audio File",
    "upload.uploading": "Uploading...",
    "upload.success": "Upload successful!",
    "upload.error": "Upload failed",
    
    // Profile
    "profile.posts": "Posts",
    "profile.followers": "Followers",
    "profile.following": "Following",
    "profile.editProfile": "Edit Profile",
    "profile.songs": "Songs",
    "profile.playlists": "Playlists",
    "profile.about": "About",
    
    // Playlist
    "playlist.myPlaylists": "My Playlists",
    "playlist.create": "Create Playlist",
    "playlist.addSong": "Add Song",
    "playlist.removeSong": "Remove Song",
    "playlist.name": "Playlist Name",
    "playlist.public": "Public",
    "playlist.private": "Private",
    
    // Messages
    "messages.title": "Messages",
    "messages.newMessage": "New Message",
    "messages.typeMessage": "Type a message...",
    "messages.send": "Send",
    "messages.noMessages": "No messages yet",
    
    // Listen Page
    "listen.noSong": "No song selected",
    "listen.chooseSong": "Choose a song to start listening",
    "listen.about": "About this track",
    "listen.plays": "plays",
    "listen.addToPlaylist": "Add to Playlist",
  },
  vi: {
    // Navigation
    "nav.home": "Trang chủ",
    "nav.discover": "Khám phá",
    "nav.search": "Tìm kiếm",
    "nav.playlist": "Playlist",
    "nav.messages": "Tin nhắn",
    "nav.notifications": "Thông báo",
    "nav.profile": "Hồ sơ",
    "nav.upload": "Tải lên",
    "nav.settings": "Cài đặt",
    "nav.genres": "Thể loại",
    "nav.analytics": "Phân tích",
    "nav.history": "Lịch sử",
    
    // Auth
    "auth.signIn": "Đăng nhập",
    "auth.signUp": "Đăng ký",
    "auth.signOut": "Đăng xuất",
    "auth.login": "Đăng nhập",
    "auth.register": "Đăng ký",
    "auth.email": "Email",
    "auth.password": "Mật khẩu",
    "auth.confirmPassword": "Xác nhận mật khẩu",
    "auth.username": "Tên người dùng",
    "auth.fullName": "Họ và tên",
    
    // Common
    "common.loading": "Đang tải...",
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.delete": "Xóa",
    "common.edit": "Chỉnh sửa",
    "common.create": "Tạo",
    "common.update": "Cập nhật",
    "common.search": "Tìm kiếm",
    "common.filter": "Lọc",
    "common.sort": "Sắp xếp",
    "common.viewAll": "Xem tất cả",
    "common.showMore": "Xem thêm",
    "common.showLess": "Thu gọn",
    "common.unreadNotifications": "chưa đọc",
    "common.allCaughtUp": "Bạn đã xem hết!",
    
    // Settings
    "settings.title": "Cài đặt",
    "settings.account": "Tài khoản",
    "settings.displayName": "Tên hiển thị",
    "settings.bio": "Giới thiệu",
    "settings.website": "Website",
    "settings.saveChanges": "Lưu thay đổi",
    "settings.theme": "Giao diện",
    "settings.language": "Ngôn ngữ",
    "settings.themeLight": "Sáng",
    "settings.themeDark": "Tối",
    "settings.themePurple": "Tím mộng mơ",
    "settings.themeOcean": "Xanh đại dương",
    "settings.themeForest": "Xanh rừng",
    "settings.themeSunset": "Hoàng hôn",
    "settings.themeRose": "Hồng phấn",
    "settings.themeMidnight": "Nửa đêm",
    "settings.themeCyber": "Cyberpunk",
    "settings.themeAuto": "Tự động",
    "settings.notifications": "Thông báo",
    "settings.emailNotifications": "Thông báo Email",
    "settings.pushNotifications": "Thông báo đẩy",
    "settings.commentNotifications": "Thông báo bình luận",
    "settings.followerNotifications": "Thông báo người theo dõi mới",
    "settings.likes": "Lượt thích",
    "settings.comments": "Bình luận",
    "settings.followers": "Người theo dõi",
    "settings.likesDesc": "Nhận thông báo khi có người thích bài hát của bạn",
    "settings.commentsDesc": "Nhận thông báo về bình luận mới trên bài đăng của bạn",
    "settings.followersDesc": "Nhận thông báo khi có người theo dõi bạn",
    "settings.newMusic": "Nhạc mới từ nghệ sĩ",
    "settings.newMusicDesc": "Nhận thông báo khi nghệ sĩ bạn theo dõi phát hành bài hát mới",
    "settings.emailDesc": "Nhận thông báo qua email",
    "settings.pushDesc": "Nhận thông báo đẩy trên thiết bị của bạn",
    "settings.privacy": "Quyền riêng tư & Bảo mật",
    "settings.publicProfile": "Hồ sơ công khai",
    "settings.publicProfileDesc": "Cho phép mọi người xem hồ sơ của bạn",
    "settings.showActivity": "Hiển thị hoạt động",
    "settings.showActivityDesc": "Cho phép người khác xem hoạt động nghe nhạc của bạn",
    "settings.publicPlaylists": "Playlist công khai",
    "settings.publicPlaylistsDesc": "Cho phép người khác xem playlist của bạn",
    "settings.whoCanMessage": "Ai có thể nhắn tin cho bạn",
    "settings.everyone": "Mọi người",
    "settings.friendsOnly": "Chỉ bạn bè",
    "settings.noOne": "Không ai",
    "settings.audioPlayback": "Âm thanh & Phát nhạc",
    "settings.audioQuality": "Chất lượng âm thanh",
    "settings.high": "Cao",
    "settings.medium": "Trung bình",
    "settings.low": "Thấp",
    "settings.autoplay": "Tự động phát",
    "settings.autoplayDesc": "Tự động phát bài tiếp theo",
    "settings.crossfade": "Chuyển tiếp mượt",
    "settings.crossfadeDesc": "Chuyển tiếp mượt mà giữa các bài hát",
    "settings.volume": "Âm lượng",
    "settings.crossfadeDuration": "Thời gian chuyển tiếp",
    "settings.crossfadeDurationDesc": "Thời gian fade in/out khi bật chuyển tiếp mượt",
    "settings.interface": "Giao diện",
    "settings.showWaveform": "Hiển thị dạng sóng",
    "settings.showWaveformDesc": "Hiển thị dạng sóng âm thanh trong trình phát",
    "settings.showLyrics": "Hiển thị lời bài hát",
    "settings.showLyricsDesc": "Hiển thị lời bài hát khi có sẵn",
    "settings.animations": "Hiệu ứng động",
    "settings.animationsDesc": "Bật hiệu ứng động và chuyển tiếp mượt mà",
    "settings.dataStorage": "Dữ liệu & Lưu trữ",
    "settings.downloadData": "Tải xuống dữ liệu của bạn",
    "settings.downloadDataDesc": "Nhận bản sao tất cả dữ liệu SoundSpace của bạn",
    "settings.request": "Yêu cầu",
    "settings.deleteAccount": "Xóa tài khoản",
    "settings.deleteAccountDesc": "Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn",
    
    // Music
    "music.play": "Phát",
    "music.pause": "Tạm dừng",
    "music.next": "Tiếp theo",
    "music.previous": "Trước đó",
    "music.shuffle": "Ngẫu nhiên",
    "music.repeat": "Lặp lại",
    "music.volume": "Âm lượng",
    "music.addToPlaylist": "Thêm vào Playlist",
    "music.share": "Chia sẻ",
    "music.like": "Thích",
    "music.unlike": "Bỏ thích",
    "music.download": "Tải xuống",
    
    // Social
    "social.follow": "Theo dõi",
    "social.unfollow": "Bỏ theo dõi",
    "social.following": "Đang theo dõi",
    "social.followers": "Người theo dõi",
    "social.posts": "Bài viết",
    "social.comment": "Bình luận",
    "social.reply": "Trả lời",
    "social.delete": "Xóa",
    "social.report": "Báo cáo",
    
    // Time
    "time.now": "Vừa xong",
    "time.minutesAgo": "phút trước",
    "time.hoursAgo": "giờ trước",
    "time.daysAgo": "ngày trước",
    "time.weeksAgo": "tuần trước",
    "time.monthsAgo": "tháng trước",
    "time.yearsAgo": "năm trước",
    
    // Genres
    "genres.title": "Thể loại nhạc",
    "genres.trending": "Thịnh hành",
    "genres.all": "Tất cả thể loại",
    "genres.songs": "bài hát",
    
    // Analytics
    "analytics.title": "Bảng phân tích",
    "analytics.totalPlays": "Tổng lượt phát",
    "analytics.totalListeners": "Tổng người nghe",
    "analytics.topSongs": "Bài hát hàng đầu",
    "analytics.recentSearches": "Tìm kiếm gần đây",
    "analytics.listenHistory": "Lịch sử nghe",
    
    // History
    "history.title": "Lịch sử",
    "history.listen": "Lịch sử nghe",
    "history.search": "Lịch sử tìm kiếm",
    "history.clear": "Xóa lịch sử",
    "history.noListenHistory": "Chưa có lịch sử nghe",
    "history.noSearchHistory": "Chưa có lịch sử tìm kiếm",
    
    // Home & Feed
    "home.title": "Trang chủ",
    "home.whatsOnYourMind": "Bạn đang nghĩ gì?",
    "home.share": "Chia sẻ",
    "home.trendingSongs": "Bài hát thịnh hành",
    "home.forYou": "Dành cho bạn",
    "home.stories": "Tin",
    
    // Discover
    "discover.title": "Khám phá",
    "discover.recent": "Nghe gần đây",
    "discover.newest": "Mới phát hành",
    "discover.mostViewed": "Phổ biến nhất",
    "discover.viewAll": "Xem tất cả",
    
    // Upload
    "upload.title": "Tải lên",
    "upload.song": "Tải lên bài hát",
    "upload.post": "Tạo bài viết",
    "upload.selectFile": "Chọn tệp",
    "upload.songTitle": "Tên bài hát",
    "upload.description": "Mô tả",
    "upload.genre": "Thể loại",
    "upload.coverImage": "Ảnh bìa",
    "upload.audioFile": "Tệp âm thanh",
    "upload.uploading": "Đang tải lên...",
    "upload.success": "Tải lên thành công!",
    "upload.error": "Tải lên thất bại",
    
    // Profile
    "profile.posts": "Bài viết",
    "profile.followers": "Người theo dõi",
    "profile.following": "Đang theo dõi",
    "profile.editProfile": "Chỉnh sửa hồ sơ",
    "profile.songs": "Bài hát",
    "profile.playlists": "Playlist",
    "profile.about": "Giới thiệu",
    
    // Playlist
    "playlist.myPlaylists": "Playlist của tôi",
    "playlist.create": "Tạo Playlist",
    "playlist.addSong": "Thêm bài hát",
    "playlist.removeSong": "Xóa bài hát",
    "playlist.name": "Tên Playlist",
    "playlist.public": "Công khai",
    "playlist.private": "Riêng tư",
    
    // Messages
    "messages.title": "Tin nhắn",
    "messages.newMessage": "Tin nhắn mới",
    "messages.typeMessage": "Nhập tin nhắn...",
    "messages.send": "Gửi",
    "messages.noMessages": "Chưa có tin nhắn",
    
    // Listen Page
    "listen.noSong": "Chưa chọn bài hát nào",
    "listen.chooseSong": "Chọn một bài hát để bắt đầu nghe",
    "listen.about": "Về bài hát này",
    "listen.plays": "lượt nghe",
    "listen.addToPlaylist": "Thêm vào Playlist",
  },
};
