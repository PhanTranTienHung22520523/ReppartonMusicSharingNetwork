# Repparton Music Platform - Usage Guide

## Quick Start

### 1. Start the Backend (Spring Boot)
```powershell
cd Repparton
mvnw.cmd spring-boot:run
```
The backend will start on `http://localhost:8080`

### 2. Start the Frontend (Vite React)
```powershell
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`

## Sample User Accounts

The application comes pre-loaded with sample users for testing. You can log in with any of these credentials:

### Admin Account
- **Email:** `admin@repparton.com`
- **Password:** `admin123`
- **Role:** Administrator

### Artist Accounts
- **Taylor Swift**
  - Email: `taylor@repparton.com`
  - Password: `password123`
  - Role: Artist

- **Ed Sheeran**
  - Email: `ed@repparton.com`
  - Password: `password123`
  - Role: Artist

- **Billie Eilish**
  - Email: `billie@repparton.com`
  - Password: `password123`
  - Role: Artist

- **The Weeknd**
  - Email: `weeknd@repparton.com`
  - Password: `password123`
  - Role: Artist

### Regular User Accounts
- **Sarah (Music Lover)**
  - Email: `sarah@example.com`
  - Password: `password123`
  - Role: Regular User

- **Alex (DJ/Producer)**
  - Email: `alex@example.com`
  - Password: `password123`
  - Role: Regular User (Artist Pending)

- **Mike (Indie Rock)**
  - Email: `mike@example.com`
  - Password: `password123`
  - Role: Regular User

## Testing User Flows

### 1. Guest User (Not Logged In)
- Visit `http://localhost:5173`
- Browse the **Home** page to see trending songs and posts
- Navigate to **Discover** to explore music by genre
- Try to like a song or post → should show login modal
- Try to follow a user → should show login modal

### 2. Login Flow
1. Click "Login" in the header or sidebar
2. Use any of the sample accounts above
3. Should redirect to home page with user info in header
4. Sidebar should show user-specific options

### 3. Registration Flow
1. Click "Register" from login page or header
2. Fill out the form with new user details
3. Should automatically log in after successful registration

### 4. Logged-In User Features
- **Home Page:** View personalized feed with posts from followed users
- **Discover:** Browse music by genre, search for new content
- **Profile:** View and edit your profile, see your posts and songs
- **Playlists:** Create and manage playlists
- **Upload:** Upload new songs (artists only)
- **Messages:** Send and receive messages
- **Settings:** Update account preferences

### 5. Social Features Testing
- **Follow/Unfollow:** Click follow buttons on user profiles
- **Like Posts:** Heart icon on posts and songs
- **Comments:** Add comments to posts
- **Sharing:** Share songs and posts
- **Notifications:** Get notified of interactions

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/search?query={query}` - Search users

### Songs
- `GET /api/songs/trending` - Get trending songs (public)
- `GET /api/songs/public` - Get public songs
- `GET /api/songs/user/{userId}` - Get songs by user
- `POST /api/songs/upload` - Upload new song (artists only)
- `DELETE /api/songs/{id}` - Delete song

### Posts
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/public` - Get public posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/{id}` - Delete post

### Social Features
- `POST /api/follow/{userId}` - Follow user
- `DELETE /api/follow/{userId}` - Unfollow user
- `POST /api/likes/post/{postId}` - Like post
- `POST /api/likes/song/{songId}` - Like song
- `GET /api/comments/post/{postId}` - Get post comments
- `POST /api/comments/post/{postId}` - Add comment

### Playlists
- `GET /api/playlists/user/{userId}` - Get user playlists
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/{id}` - Update playlist
- `DELETE /api/playlists/{id}` - Delete playlist

## Common Issues & Solutions

### Backend Issues
- **Port 8080 already in use:** Stop other Java applications or change port in `application.properties`
- **Database connection:** Check H2 console at `http://localhost:8080/h2-console`
- **CORS errors:** Ensure SecurityConfig allows frontend origin

### Frontend Issues
- **Vite port conflict:** Change port in `vite.config.js` or use `--port` flag
- **API connection:** Verify backend URL in API service files
- **Login redirect:** Check AuthContext and routing setup

### Authentication Issues
- **JWT token expired:** Re-login to get new token
- **Unauthorized errors:** Check if user has proper role/permissions
- **Login modal not showing:** Check LoginRequireModal component

## Development Notes

### Frontend Architecture
- **React 18** with Vite
- **React Router** for navigation
- **Context API** for state management (Auth, Music Player)
- **Axios** for API calls
- **React Icons** for UI icons

### Backend Architecture
- **Spring Boot 3.2+**
- **Spring Security** with JWT
- **H2 Database** (in-memory)
- **Spring Data JPA**
- **Cloudinary** for file uploads

### File Structure
```
frontend/src/
├── api/          # API service files
├── components/   # Reusable components
├── contexts/     # React contexts
├── pages/        # Page components
├── assets/       # Static assets
└── App.jsx       # Main app component

Repparton/src/main/java/com/DA2/Repparton/
├── Config/       # Configuration classes
├── Controller/   # REST controllers
├── DTO/          # Data transfer objects
├── Entity/       # JPA entities
├── Repository/   # Data repositories
├── Security/     # Security configuration
└── Service/      # Business logic
```

## Testing Checklist

### Basic Functionality
- [ ] Backend starts without errors
- [ ] Frontend builds and starts
- [ ] Can view home page as guest
- [ ] Can browse discover page
- [ ] Login modal appears for protected actions

### Authentication
- [ ] Can log in with sample accounts
- [ ] Can register new account
- [ ] Can log out
- [ ] JWT token persists across page refreshes
- [ ] Protected routes redirect to login

### User Features
- [ ] Can view and edit profile
- [ ] Can follow/unfollow users
- [ ] Can like posts and songs
- [ ] Can add comments
- [ ] Can create playlists
- [ ] Can upload songs (artists)

### Social Features
- [ ] Feed shows relevant content
- [ ] Notifications work
- [ ] Messages can be sent/received
- [ ] Search finds users and content

## Next Steps

1. **Testing:** Run through all user flows with different account types
2. **Polish:** Add loading states, error boundaries, and animations
3. **Features:** Implement remaining features like notifications, advanced search
4. **Deployment:** Prepare for production deployment
5. **Documentation:** Add API documentation and user guides
