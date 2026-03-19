# Blog API Testing Guide

## Quick Test - Create a Blog via API

### Method 1: Using cURL

```bash
# First, login to get your token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'

# Copy the token from response, then create a blog:
curl -X POST http://localhost:8080/api/admin/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Welcome to Our Dating Platform",
    "slug": "welcome-to-our-dating-platform",
    "excerpt": "Discover how our innovative matching system helps you find meaningful connections.",
    "content": "Finding love in the digital age has never been easier! Our platform uses advanced algorithms to match you with compatible partners.\n\n## Why Choose Us?\n\nOur dating platform stands out with smart matching, verified profiles, and a privacy-first approach.",
    "image": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80",
    "status": "published"
  }'
```

### Method 2: Using the Go Script

```bash
cd GSL_NextGo/Backend

# First login and get your token, then:
export AUTH_TOKEN="your_token_here"
go run cmd/create_sample_blog/main.go
```

### Method 3: Using Postman/Insomnia

1. **Login Endpoint:**
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "your_password"
     }
     ```
   - Copy the `token` from response

2. **Create Blog Endpoint:**
   - Method: POST
   - URL: `http://localhost:8080/api/admin/blogs`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_TOKEN_HERE`
   - Body (JSON):
     ```json
     {
       "title": "Welcome to Our Dating Platform",
       "slug": "welcome-to-our-dating-platform",
       "excerpt": "Discover how our innovative matching system helps you find meaningful connections.",
       "content": "Finding love in the digital age has never been easier! Our platform uses advanced algorithms to match you with compatible partners based on your interests, values, and lifestyle.\n\n## Why Choose Us?\n\nOur dating platform stands out from the rest with smart matching, verified profiles, and a privacy-first approach.",
       "image": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80",
       "status": "published"
     }
     ```

## Common Issues

### 1. Authentication Error
- Make sure you're logged in as admin
- Check that the token is valid and not expired
- Verify the Authorization header format: `Bearer YOUR_TOKEN`

### 2. Database Error
- Ensure PostgreSQL is running
- Check database connection in `.env` file
- Verify tables are created (run migrations)

### 3. CORS Error
- Check that `FRONTEND_URL` is set correctly in backend `.env`
- Verify CORS settings in `main.go`

### 4. Validation Error
- Ensure `title` and `content` are provided
- Check that `status` is either "draft" or "published"
- Verify slug is unique

## Testing Public Endpoints

```bash
# Get all published blogs
curl http://localhost:8080/api/blogs

# Get featured blog
curl http://localhost:8080/api/blogs/featured

# Get blog by slug
curl http://localhost:8080/api/blogs/slug/welcome-to-our-dating-platform
```







