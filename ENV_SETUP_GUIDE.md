# Environment Variables Setup Guide

This guide explains how to set up environment variables for both the frontend and backend applications.

## Frontend (React/Vite) - `/frontend/.env`

The frontend uses Vite, which automatically loads `.env` files. All environment variables for Vite must be prefixed with `VITE_`.

### Configuration

Copy the `.env` file and update the values:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Development Environment Settings
VITE_APP_TITLE=Repparton Music App
VITE_APP_VERSION=1.0.0

# Optional: Add other environment-specific settings
# VITE_API_TIMEOUT=30000
# VITE_ENABLE_LOGGING=true
```

### Usage

In your JavaScript/React code, access these variables using:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;
```

### Notes:
- Vite automatically loads `.env` files
- All variables must start with `VITE_`
- Variables are embedded at build time
- Never put sensitive secrets in frontend `.env` (they're visible to users)

## Backend (Spring Boot) - `/Repparton/.env`

The backend uses Spring Boot with custom configuration to load environment variables.

### Configuration

Update the `.env` file with your actual credentials:

```bash
# MongoDB Configuration (replace with your actual credentials)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?options

# JWT Configuration  
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRATION=86400000

# Cloudinary Configuration (replace with your actual credentials)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
SERVER_PORT=8080
SERVER_CONTEXT_PATH=/api

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload Configuration
UPLOAD_MAX_FILE_SIZE=100MB
UPLOAD_MAX_REQUEST_SIZE=100MB

# Security Configuration
BCRYPT_STRENGTH=12

# Development/Production Environment
SPRING_PROFILES_ACTIVE=development
```

### Loading Environment Variables

For Spring Boot to automatically load `.env` files, you'll need to install the `spring-dotenv` dependency:

#### Option 1: Add to `pom.xml`
```xml
<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
    <version>4.0.0</version>
</dependency>
```

#### Option 2: Manual loading (Alternative)
If you prefer not to use a library, you can load the `.env` file manually by creating a configuration class:

```java
@Component
public class DotEnvConfig {
    
    @PostConstruct
    public void loadEnvFile() {
        try {
            Path envPath = Paths.get(".env");
            if (Files.exists(envPath)) {
                Files.lines(envPath)
                    .filter(line -> line.contains("=") && !line.startsWith("#"))
                    .forEach(line -> {
                        String[] parts = line.split("=", 2);
                        if (parts.length == 2) {
                            System.setProperty(parts[0].trim(), parts[1].trim());
                        }
                    });
            }
        } catch (IOException e) {
            // Handle exception
        }
    }
}
```

### Usage in Spring Boot

The `application.properties` file references environment variables like this:
```properties
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/default_db}
app.jwtSecret=${JWT_SECRET:default_secret}
```

## Security Best Practices

1. **Never commit `.env` files to version control**
   - Add `.env` to your `.gitignore` file
   ```gitignore
   # Environment variables
   .env
   .env.local
   .env.production
   ```

2. **Use different `.env` files for different environments**
   - `.env.development`
   - `.env.staging`
   - `.env.production`

3. **Keep secrets secure**
   - Use strong, randomly generated secrets
   - Rotate secrets regularly
   - Use different secrets for different environments

4. **Validate environment variables**
   - Provide sensible defaults where possible
   - Validate required variables at startup

## Installation Commands

### Frontend
```bash
cd frontend
npm install
# Vite automatically handles .env files
```

### Backend
```bash
cd Repparton
# Add to pom.xml if using spring-dotenv
mvn clean install
```

## Environment Variable Reference

### Frontend Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` | Yes |
| `VITE_APP_TITLE` | Application title | `Repparton Music App` | No |
| `VITE_APP_VERSION` | Application version | `1.0.0` | No |

### Backend Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | Local MongoDB | Yes |
| `JWT_SECRET` | JWT signing secret | Default (insecure) | Yes |
| `JWT_EXPIRATION` | JWT expiration time (ms) | 86400000 (24h) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | Yes* |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | Yes* |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | Yes* |
| `SERVER_PORT` | Server port | 8080 | No |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | localhost:3000,localhost:5173 | No |

*Required if using file upload features

## Troubleshooting

1. **Environment variables not loading**: Make sure the `.env` file is in the correct directory (project root)
2. **Frontend variables undefined**: Ensure variables start with `VITE_`
3. **Backend variables not found**: Check that spring-dotenv is properly configured or manual loading is implemented
4. **Security warnings**: Never put sensitive data in frontend `.env` files
