#!/bin/bash

# LexiFix Setup Script
echo "🚀 Setting up LexiFix AI Text Refinement App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Go back to root directory
cd ..

# Copy environment files if they don't exist
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please update frontend/.env with your Firebase configuration"
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your API keys and configuration"
fi

# Create MongoDB init script directory if it doesn't exist
mkdir -p scripts

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update frontend/.env with your Firebase configuration"
echo "2. Update backend/.env with your OpenAI API key and other secrets"
echo "3. Start MongoDB (either locally or with Docker)"
echo "4. Run 'npm run dev' in both frontend/ and backend/ directories"
echo "5. Or use Docker: docker-compose up"
echo ""
echo "📖 For detailed setup instructions, see README.md"
echo ""
echo "🔗 Useful commands:"
echo "  Frontend dev:   cd frontend && npm run dev"
echo "  Backend dev:    cd backend && npm run dev"
echo "  Docker:         docker-compose up"
echo "  Build:          npm run build (in both directories)"
echo ""