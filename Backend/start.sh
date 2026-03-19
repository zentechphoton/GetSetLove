#!/bin/bash

# Add Go to PATH for this session
export PATH="/c/Program Files/Go/bin:$PATH"

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found!"
    echo "Please create .env file with your database credentials."
    exit 1
fi

# Install/update dependencies
echo "Installing dependencies..."
go mod tidy

# Start the server
echo "Starting backend server..."
go run main.go

