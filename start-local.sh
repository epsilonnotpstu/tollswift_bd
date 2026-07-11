#!/bin/bash
# TollBD Local Development Startup Script

echo "🚀 TollBD Local Dev Setup"
echo "========================="

# Kill any processes already using these ports
echo "▶ Freeing ports 3001 and 5173..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# 1. Start or restart PostgreSQL Docker container
if docker ps -a --format '{{.Names}}' | grep -q "tollbd-postgres"; then
  if ! docker ps --format '{{.Names}}' | grep -q "tollbd-postgres"; then
    echo "▶ Starting existing PostgreSQL container..."
    docker start tollbd-postgres
  else
    echo "✅ PostgreSQL already running"
  fi
else
  echo "▶ Creating new PostgreSQL container..."
  docker run -d \
    --name tollbd-postgres \
    -e POSTGRES_USER=tollbd \
    -e POSTGRES_PASSWORD=tollbd123 \
    -e POSTGRES_DB=tollbd \
    -p 5432:5432 \
    postgres:15-alpine
  sleep 3
fi

# 2. Run migrations
echo "▶ Running database migrations..."
cd /home/afrin/Documents/TollBD/api && npx prisma migrate deploy --skip-generate 2>/dev/null
echo "✅ Migrations done"

# 3. Start API in background
echo "▶ Starting API server (port 3001)..."
cd /home/afrin/Documents/TollBD/api && npm run dev &
API_PID=$!
sleep 2

# 4. Start Web in background
echo "▶ Starting Web app (port 5173)..."
cd /home/afrin/Documents/TollBD/apps/web && npm run dev &
WEB_PID=$!
sleep 2

# 5. ADB reverse tunnel for mobile (if phone connected)
export PATH="$PATH:/home/afrin/Android/Sdk/platform-tools"
if adb devices 2>/dev/null | grep -q "device$"; then
  echo "▶ Phone detected — setting ADB reverse tunnel..."
  adb reverse tcp:5173 tcp:5173 2>/dev/null
  adb reverse tcp:3001 tcp:3001 2>/dev/null
  echo "✅ ADB tunnel ready (phone's localhost → laptop)"
else
  echo "ℹ  No phone connected (skip ADB tunnel)"
fi

echo ""
echo "=============================="
echo "✅ TollBD is running!"
echo ""
echo "  Web App:    http://localhost:5173"
echo "  API:        http://localhost:3001"
echo "  API Health: http://localhost:3001/health"
echo ""
echo "  Admin Login: admin@tollbd.com.bd / Admin@1234"
echo ""
echo "  Mobile: Open TollBD app on phone (USB connected)"
echo "  Press Ctrl+C to stop all services"
echo "=============================="

# Wait for both processes
wait $API_PID $WEB_PID
