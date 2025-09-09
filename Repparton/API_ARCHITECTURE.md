# 📊 **REPPARTON API ARCHITECTURE**
## Organized API Structure for Facebook + SoundCloud Platform

---

## 🏗️ **API Organization Overview**

Your platform has **15 controllers** managing different aspects of the social music platform. Here's the organized structure:

```
📱 REPPARTON API v1.0
├── 🔐 Authentication & User Management
│   ├── /api/auth/                    # Authentication endpoints
│   ├── /api/users/                   # User management
│   └── /api/profiles/                # User profiles
│
├── 🎵 Music & Content
│   ├── /api/songs/                   # Music streaming
│   ├── /api/playlists/               # Playlist management
│   ├── /api/genres/                  # Music genres
│   └── /api/listen-history/          # Listening analytics
│
├── 📱 Social Features
│   ├── /api/posts/                   # Social posts
│   ├── /api/stories/                 # Stories (24h content)
│   ├── /api/comments/                # Comments system
│   └── /api/shares/                  # Content sharing
│
├── 💝 Engagement & Interactions
│   ├── /api/likes/                   # Like system
│   ├── /api/follows/                 # Follow system
│   └── /api/story-interactions/      # Story likes/views
│
├── 💬 Communication
│   ├── /api/messages/                # Direct messaging
│   └── /api/notifications/           # Notification system
│
└── 🔍 Discovery & Analytics
    ├── /api/search/                  # Search functionality
    └── /api/search-history/          # Search analytics
```

---

## 🎯 **Organized API Endpoints by Category**

### **🔐 1. Authentication & User Management**
```http
# Authentication
POST   /api/auth/register              # User registration
POST   /api/auth/login                 # User login
POST   /api/auth/logout                # User logout
POST   /api/auth/refresh               # Refresh JWT token
POST   /api/auth/forgot-password       # Password reset

# User Management  
GET    /api/users                      # Get all users (admin)
GET    /api/users/{id}                 # Get user by ID
PUT    /api/users/{id}                 # Update user
DELETE /api/users/{id}                 # Delete user (admin)
GET    /api/users/search               # Search users

# User Profiles
GET    /api/users/{id}/profile         # Get user profile
PUT    /api/users/{id}/profile         # Update profile
POST   /api/users/{id}/apply-artist    # Apply to be artist
POST   /api/users/{id}/approve-artist  # Approve artist (admin)
```

### **🎵 2. Music & Content Management**
```http
# Songs
GET    /api/songs                      # Get all public songs
POST   /api/songs                      # Upload new song
GET    /api/songs/{id}                 # Get song details
PUT    /api/songs/{id}                 # Update song
DELETE /api/songs/{id}                 # Delete song
POST   /api/songs/{id}/play            # Record song play
GET    /api/songs/trending             # Get trending songs
GET    /api/songs/recommendations      # Get recommended songs
GET    /api/songs/search               # Search songs
GET    /api/songs/artist/{artistId}    # Get songs by artist
GET    /api/songs/genre/{genreId}      # Get songs by genre

# Playlists
GET    /api/playlists                  # Get user playlists
POST   /api/playlists                  # Create playlist
GET    /api/playlists/{id}             # Get playlist details
PUT    /api/playlists/{id}             # Update playlist
DELETE /api/playlists/{id}             # Delete playlist
POST   /api/playlists/{id}/songs       # Add song to playlist
DELETE /api/playlists/{id}/songs/{songId} # Remove song from playlist

# Genres
GET    /api/genres                     # Get all genres
POST   /api/genres                     # Create genre (admin)
PUT    /api/genres/{id}                # Update genre (admin)
DELETE /api/genres/{id}                # Delete genre (admin)

# Listen History
GET    /api/listen-history             # Get user's listening history
POST   /api/listen-history             # Record listening session
DELETE /api/listen-history/{id}        # Remove from history
GET    /api/listen-history/stats       # Get listening analytics
```

### **📱 3. Social Features**
```http
# Posts
GET    /api/posts                      # Get all posts
POST   /api/posts                      # Create new post
GET    /api/posts/{id}                 # Get post details
PUT    /api/posts/{id}                 # Update post
DELETE /api/posts/{id}                 # Delete post
GET    /api/posts/feed                 # Get personalized feed
GET    /api/posts/trending             # Get trending posts
GET    /api/posts/user/{userId}        # Get posts by user

# Stories (24-hour content)
GET    /api/stories                    # Get active stories
POST   /api/stories                    # Create story
GET    /api/stories/{id}               # Get story details
DELETE /api/stories/{id}               # Delete story
GET    /api/stories/user/{userId}      # Get user's stories

# Comments
GET    /api/posts/{postId}/comments    # Get post comments
POST   /api/posts/{postId}/comments    # Add comment
PUT    /api/comments/{id}              # Update comment
DELETE /api/comments/{id}              # Delete comment
GET    /api/songs/{songId}/comments    # Get song comments
POST   /api/songs/{songId}/comments    # Add song comment

# Shares
POST   /api/shares/post/{postId}       # Share post
POST   /api/shares/song/{songId}       # Share song
GET    /api/shares/user/{userId}       # Get user's shares
DELETE /api/shares/{id}                # Remove share
```

### **💝 4. Engagement & Interactions**
```http
# Likes
POST   /api/likes/song/{songId}        # Like/unlike song
POST   /api/likes/post/{postId}        # Like/unlike post
POST   /api/likes/comment/{commentId}  # Like/unlike comment
GET    /api/likes/song/{songId}/check  # Check song like status
GET    /api/likes/post/{postId}/check  # Check post like status

# Follows
POST   /api/follows/{userId}           # Follow/unfollow user
GET    /api/follows/{userId}/check     # Check follow status
GET    /api/follows/{userId}/followers # Get user's followers
GET    /api/follows/{userId}/following # Get who user follows

# Story Interactions
POST   /api/story-interactions/{storyId}/view   # View story
POST   /api/story-interactions/{storyId}/like   # Like story
GET    /api/story-interactions/{storyId}/views  # Get story views
GET    /api/story-interactions/{storyId}/likes  # Get story likes
```

### **💬 5. Communication**
```http
# Direct Messages
GET    /api/messages/conversations     # Get user's conversations
POST   /api/messages/conversations     # Start new conversation
GET    /api/messages/conversations/{id} # Get conversation messages
POST   /api/messages/conversations/{id} # Send message
DELETE /api/messages/{messageId}       # Delete message
PUT    /api/messages/{messageId}/read  # Mark message as read

# Notifications
GET    /api/notifications              # Get user notifications
GET    /api/notifications/unread       # Get unread notifications
PUT    /api/notifications/{id}/read    # Mark notification as read
PUT    /api/notifications/mark-all-read # Mark all as read
DELETE /api/notifications/{id}         # Delete notification
```

### **🔍 6. Discovery & Analytics**
```http
# Search
GET    /api/search/all                 # Global search
GET    /api/search/users               # Search users
GET    /api/search/songs               # Search songs
GET    /api/search/posts               # Search posts
GET    /api/search/playlists           # Search playlists

# Search History
GET    /api/search-history             # Get search history
POST   /api/search-history             # Record search
DELETE /api/search-history/{id}        # Remove search item
DELETE /api/search-history/clear       # Clear all history
```

---

## 📋 **HTTP Status Codes & Response Format**

### **Standard Response Format**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "timestamp": "2025-06-28T12:00:00Z",
  "path": "/api/endpoint"
}
```

### **Error Response Format**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {...},
  "timestamp": "2025-06-28T12:00:00Z",
  "path": "/api/endpoint"
}
```

### **HTTP Status Codes**
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **422** - Validation Error
- **500** - Internal Server Error

---

## 🔐 **Authentication & Authorization**

### **JWT Token Structure**
```
Authorization: Bearer <JWT_TOKEN>
```

### **Role-Based Access**
- **User** - Basic platform access
- **Artist** - Can upload music
- **Admin** - Full platform management
- **Moderator** - Content moderation

### **Protected Endpoints**
- All `/api/*` endpoints require authentication except:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/songs` (public songs)
  - `GET /api/genres`

---

## 📊 **API Rate Limiting**
- **General Endpoints**: 100 requests/minute
- **Upload Endpoints**: 10 requests/minute
- **Search Endpoints**: 50 requests/minute
- **Admin Endpoints**: 200 requests/minute

---

## 🎯 **API Versioning Strategy**
```
/api/v1/...     # Current version
/api/v2/...     # Future version
```

---

## 📈 **Performance Guidelines**
- **Response Time**: < 200ms for GET requests
- **File Upload**: < 5 seconds for audio files
- **Search**: < 100ms for basic queries
- **Pagination**: Default 20 items, max 100

---

## 🔍 **Query Parameters Standards**

### **Pagination**
```
?page=0&size=20&sort=createdAt,desc
```

### **Filtering**
```
?genre=rock&status=approved&isPrivate=false
```

### **Search**
```
?query=search+term&type=all&limit=10
```

---

This organized structure provides a clear, scalable API architecture that follows REST principles and supports your Facebook + SoundCloud platform's growth.
