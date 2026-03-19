# Image Upload 401 Error - Troubleshooting Guide

## Fixed Issues

I've fixed the following issues:

1. ✅ **Content-Type Header**: Removed manual Content-Type setting for FormData (browser needs to set it with boundary)
2. ✅ **CORS Headers**: Added X-Requested-With to allowed headers
3. ✅ **Token Validation**: Added explicit token check before upload
4. ✅ **Error Handling**: Better error messages for 401 and Cloudinary issues
5. ✅ **File Size Validation**: Added 10MB limit check

## How to Fix 401 Error

### Step 1: Verify You're Logged In

1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Check if `token` exists and is not expired
4. If no token, login again at `/auth/login`

### Step 2: Check Token in Network Tab

1. Open DevTools → Network tab
2. Try uploading an image
3. Click on the failed request
4. Check **Request Headers**:
   - Should see: `Authorization: Bearer YOUR_TOKEN_HERE`
   - If missing, the token wasn't sent

### Step 3: Verify Backend is Running

```bash
cd GSL_NextGo/Backend
go run main.go
```

Check console for:
- "Server starting on port 8080"
- No database connection errors

### Step 4: Check CORS Configuration

In `Backend/.env`, ensure:
```env
FRONTEND_URL=http://localhost:3000
```

### Step 5: Test Authentication

Try this in browser console:
```javascript
// Check if token exists
localStorage.getItem('token')

// Test API call
fetch('http://localhost:8080/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(console.log)
```

### Step 6: Verify Cloudinary Setup (Optional)

If you get Cloudinary errors, add to `Backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note**: If Cloudinary is not configured, image upload will fail with a clear error message.

## Quick Test

1. **Login as Admin:**
   ```
   POST http://localhost:8080/api/auth/login
   Body: {"email": "admin@example.com", "password": "your_password"}
   ```

2. **Copy the token from response**

3. **Test Image Upload:**
   ```bash
   curl -X POST http://localhost:8080/api/admin/blogs/upload-image \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "image=@/path/to/image.jpg"
   ```

## Common Solutions

### Solution 1: Token Expired
- **Fix**: Login again to get a new token
- **Check**: Token expires after 24 hours (default)

### Solution 2: Wrong Endpoint
- **Admin**: `/api/admin/blogs/upload-image`
- **User**: `/api/user/blogs/upload-image`
- **Check**: Component automatically detects based on URL path

### Solution 3: CORS Blocking
- **Fix**: Restart backend after changing `.env`
- **Check**: Backend console should show CORS config

### Solution 4: FormData Not Sending
- **Fix**: Already fixed - Content-Type is now auto-set
- **Check**: Network tab should show `multipart/form-data` with boundary

## Debug Mode

The component now logs to console:
- Upload endpoint being used
- Whether token exists
- Full error responses

Check browser console for detailed error messages.

## Still Not Working?

1. Check browser console for errors
2. Check backend console for errors
3. Verify database is running
4. Verify backend is running on port 8080
5. Try logging out and logging back in
6. Clear browser cache and localStorage
7. Restart both frontend and backend







