# Route Debugging Guide

## Issue: 404 Errors on Blog Routes

If you're getting 404 errors on `/api/admin/blogs/*` routes, follow these steps:

### Step 1: Restart Backend Server

**CRITICAL**: The server MUST be restarted after adding new routes!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd GSL_NextGo/Backend
go run main.go
```

### Step 2: Verify Routes are Registered

Check the server startup logs. You should see:
```
Server starting on port 8080
```

### Step 3: Test Routes

```bash
# Test health endpoint (should work)
curl http://localhost:8080/api/health

# Test blog health (should work)
curl http://localhost:8080/api/blogs/health

# Test admin blogs (needs auth token)
curl http://localhost:8080/api/admin/blogs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Check Route Ordering

Routes are now ordered correctly:
- More specific routes (`/blogs/stats`, `/blogs/upload-image`) come first
- Less specific routes (`/blogs/:id`, `/blogs`) come last

This prevents route conflicts.

### Step 5: Verify Handlers Exist

All handlers should be in `Backend/handlers/blog.go`:
- ✅ GetBlogs
- ✅ GetBlogStats  
- ✅ GetBlogSettings
- ✅ CreateBlog
- ✅ UpdateBlog
- ✅ DeleteBlog
- ✅ UploadBlogImage

### Step 6: Check Compilation

```bash
cd GSL_NextGo/Backend
go build
```

If there are compilation errors, fix them first.

### Common Issues

1. **Server not restarted** → Restart backend
2. **Compilation errors** → Fix errors, then restart
3. **Route conflicts** → Fixed by reordering routes
4. **Missing handlers** → Verify handlers exist and are exported

## Quick Fix

1. Stop backend server (Ctrl+C)
2. Restart: `cd Backend && go run main.go`
3. Test: `curl http://localhost:8080/api/blogs/health`

If health check works but admin routes don't, check authentication token.







