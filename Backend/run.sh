#!/bin/bash
# Add Go to PATH for this session
export PATH="/c/Program Files/Go/bin:$PATH"

# Navigate to backend directory
cd "$(dirname "$0")" || exit

echo "âœ… Go version:"
go version

echo ""
echo "í³¦ Checking dependencies..."
go mod tidy

echo ""
echo "íº€ Starting backend server..."
echo "Server will run on http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""

go run main.go
