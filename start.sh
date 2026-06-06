#!/bin/bash
# Smart Flower Locker - Startup Script

echo "===================================================="
echo "🌸  SMART FLOWER LOCKER - DOCKER STARTUP SYSTEM  🌸"
echo "===================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

echo "🚀 Building and starting containers..."
docker compose up --build -d

echo ""
echo "===================================================="
echo "✨  SYSTEM STATUS  ✨"
echo "===================================================="
docker compose ps

echo ""
echo "===================================================="
echo "🔗  ACCESS DETAILS  🔗"
echo "===================================================="
echo "🌸 RAI Frontend:       http://localhost:3001"
echo "⚙️  RAI Backend API:    http://localhost:3000"
echo "🧠 ORV Face API:       http://localhost:8000"
echo "🗄️  MongoDB:           localhost:27017"
echo "===================================================="
echo "💡 To view logs, run:       docker compose logs -f"
echo "🛑 To stop the system, run:  docker compose down"
echo "===================================================="
