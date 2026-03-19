@echo off
REM Stop backend server on port 8080

echo Finding process on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080.*LISTENING"') do (
    echo Killing process %%a
    taskkill /PID %%a /F
    echo Server stopped!
)

if errorlevel 1 (
    echo No process found on port 8080
    echo Server is not running
)

pause

