#!/bin/bash
# Script to test PostgreSQL connection

echo "🔍 Testing PostgreSQL Connection..."
echo ""

# Try to read password from .env
if [ -f .env ]; then
    echo "Reading DATABASE_URL from .env..."
    DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2-)
    if [ ! -z "$DB_URL" ]; then
        echo "DATABASE_URL found in .env"
        echo ""
    fi
fi

echo "Attempting to connect to PostgreSQL..."
echo ""
echo "If this prompts for a password, enter your PostgreSQL password for user 'postgres'"
echo ""

# Try different common passwords
PASSWORDS=("postgres" "admin" "password" "")

for PASSWORD in "${PASSWORDS[@]}"; do
    echo "Trying password: ${PASSWORD:-'(empty)'}..."
    export PGPASSWORD="$PASSWORD"
    psql -h localhost -U postgres -d postgres -c "SELECT version();" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ SUCCESS! Password is: ${PASSWORD:-'(empty)'}"
        echo ""
        echo "Update your .env file with:"
        echo "DATABASE_URL=postgresql://postgres:${PASSWORD:-}@localhost:5432/gsl_db?sslmode=disable"
        exit 0
    fi
done

echo ""
echo "❌ Could not connect with common passwords."
echo ""
echo "Please try manually:"
echo "  psql -h localhost -U postgres"
echo ""
echo "Or update .env with your correct password:"
echo "  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gsl_db?sslmode=disable"

