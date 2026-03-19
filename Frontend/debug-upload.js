// Debug script to test image upload
// Run this in browser console on your blog creation page

async function debugImageUpload() {
  console.log('=== DEBUG IMAGE UPLOAD ===');
  
  // Check if token exists
  const token = localStorage.getItem('token');
  console.log('1. Token exists:', !!token);
  console.log('2. Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
  
  // Check current path
  const isAdmin = window.location.pathname.startsWith('/admin');
  const endpoint = isAdmin ? '/admin/blogs/upload-image' : '/user/blogs/upload-image';
  console.log('3. Current path:', window.location.pathname);
  console.log('4. Is admin:', isAdmin);
  console.log('5. Upload endpoint:', endpoint);
  
  // Check API base URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  console.log('6. API URL:', apiUrl);
  console.log('7. Full upload URL:', apiUrl + endpoint);
  
  // Test backend connectivity
  try {
    const healthResponse = await fetch(apiUrl + '/health');
    const healthData = await healthResponse.json();
    console.log('8. Backend health:', healthData);
  } catch (error) {
    console.error('8. Backend health check failed:', error);
    return;
  }
  
  // Test auth endpoint
  if (token) {
    try {
      const authResponse = await fetch(apiUrl + '/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const authData = await authResponse.json();
      console.log('9. Auth check:', authResponse.status, authData);
    } catch (error) {
      console.error('9. Auth check failed:', error);
    }
  }
  
  console.log('=== END DEBUG ===');
  console.log('Next: Try uploading an image and check browser Network tab');
}

// Run the debug function
debugImageUpload();