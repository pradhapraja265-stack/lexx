#!/bin/bash

# LexiFix Simple Startup Script
echo "🚀 Starting LexiFix Simple Version..."

# Check if OpenAI API key is set
if [ ! -f "backend/.env.simple" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env.simple
fi

if ! grep -q "OPENAI_API_KEY=your_openai_api_key_here" backend/.env.simple; then
    echo "✅ OpenAI API key found in backend/.env.simple"
else
    echo "⚠️  Please edit backend/.env.simple and add your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_actual_openai_key_here"
    echo "   Then run this script again."
    exit 1
fi

# Create frontend environment file
if [ ! -f "frontend/.env.simple" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/.env.example frontend/.env.simple
fi

echo "🎨 Starting enhanced frontend with beautiful styles..."
echo "🤖 Starting simple backend with AI integration..."

# Start backend in background
cd backend
cp .env.simple .env
npm run dev:simple &
BACKEND_PID=$!
echo "📡 Backend starting (PID: $BACKEND_PID)..."

# Wait a moment for backend to start
sleep 3

# Start frontend
cd ../frontend
cp .env.simple .env
echo "🌐 Starting frontend..."
npm run dev

# Clean up on exit
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM