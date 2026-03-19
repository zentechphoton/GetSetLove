@echo off
REM Add Go to PATH for this session
set PATH=%PATH%;C:\Program Files\Go\bin

REM Navigate to backend directory
cd /d "%~dp0"

REM Check if .env exists
if not exist .env (
    echo Warning: .env file not found!
    echo Please create .env file with your database credentials.
    pause
    exit /b 1
)

REM Install/update dependencies
echo Installing dependencies...
go mod tidy

REM Start the server
echo Starting backend server...
go run main.go

pause

