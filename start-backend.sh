#!/bin/bash

# Parkinson's Proteomics AI - Startup Script
# This script starts both FastAPI and Django servers

echo "🧠 Starting Parkinson's Proteomics AI Backend..."
echo "================================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Run Django migrations
echo "Running Django migrations..."
python manage.py migrate --run-syncdb

# Start FastAPI in background
echo -e "${GREEN}Starting FastAPI on port 8000...${NC}"
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload &
FASTAPI_PID=$!

# Wait a moment
sleep 2

# Start Django in background
echo -e "${BLUE}Starting Django on port 8001...${NC}"
python manage.py runserver 0.0.0.0:8001 &
DJANGO_PID=$!

echo ""
echo "================================================"
echo -e "${GREEN}✓ FastAPI running at: http://localhost:8000${NC}"
echo -e "  API Docs: http://localhost:8000/docs"
echo -e "${BLUE}✓ Django running at: http://localhost:8001${NC}"
echo -e "  Admin: http://localhost:8001/admin"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $FASTAPI_PID 2>/dev/null
    kill $DJANGO_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for both processes
wait
