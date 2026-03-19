@echo off
echo Testing backend server and upload endpoint...
echo.

echo 1. Testing health endpoint:
curl -X GET http://localhost:8080/api/health
echo.
echo.

echo 2. Testing blog health endpoint:
curl -X GET http://localhost:8080/api/blogs/health
echo.
echo.

echo 3. Checking if server is running on port 8080:
netstat -an | findstr :8080
echo.

echo Done. If you see "status": "ok" above, the server is running correctly.
pause