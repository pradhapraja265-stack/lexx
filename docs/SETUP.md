# LexiFix - Setup Guide

This guide will help you set up and run the LexiFix AI text refinement application locally and prepare it for deployment.

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or cloud)
- **OpenAI API** key with GPT-4 access
- **Firebase project** with Authentication enabled

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd lexx
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment

#### Frontend (frontend/.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend (backend/.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lexifix
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/api/health

## Detailed Setup

### Firebase Configuration

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Optionally enable "Google" sign-in

3. **Get Firebase Config**
   - Project Settings → General → Your apps
   - Click Web app to get configuration
   - Copy the values to frontend/.env

### MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com

# Start MongoDB
mongod

# Create database (optional, created automatically)
mongosh
use lexifix
```

#### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to backend/.env

### OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create account and add payment method
3. Generate API key
4. Add to backend/.env

### Running the Application

#### Development Mode
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

#### Docker (Recommended)
```bash
# Create .env file in root with required variables
echo "OPENAI_API_KEY=your_key_here" > .env
echo "FIREBASE_API_KEY=your_key_here" >> .env

# Start all services
docker-compose up
```

#### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start production servers
npm start
```

## Project Structure

```
lexx/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript definitions
│   │   └── config/          # Configuration files
│   ├── public/
│   ├── package.json
│   └── vercel.json          # Vercel deployment config
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── models/          # MongoDB models
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript definitions
│   │   └── server.ts        # Server entry point
│   ├── package.json
│   └── render.yaml          # Render deployment config
├── docs/                     # Documentation
├── scripts/                  # Setup and utility scripts
├── docker-compose.yml        # Docker configuration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with Firebase token
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

### Chat Sessions
- `GET /api/chat/sessions` - Get user's chat sessions
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions/:id` - Get specific session
- `DELETE /api/chat/sessions/:id` - Delete session

### Text Refinement
- `POST /api/refine` - Refine text with AI
- `GET /api/refine/tones` - Get supported tones
- `GET /api/refine/health` - Check AI service status

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/preferences` - Update preferences
- `GET /api/user/statistics` - Get usage statistics

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in backend/.env
   - Check network/firewall settings

2. **OpenAI API Error**
   - Verify API key is valid
   - Check if GPT-4 is enabled for your account
   - Check API usage limits

3. **Firebase Authentication Error**
   - Verify Firebase configuration
   - Check if Authentication is enabled
   - Verify API keys are correct

4. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -ti:3001
   # Kill process
   kill -9 $(lsof -ti:3001)
   ```

5. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Environment Variables

Missing environment variables are the most common issue. Ensure all required variables are set:

**Frontend:**
- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

**Backend:**
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `FRONTEND_URL`

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development
2. **API Testing**: Use Postman or curl to test API endpoints
3. **Database**: Use MongoDB Compass to visualize database
4. **Logs**: Check console logs for debugging
5. **Network**: Use browser dev tools to inspect API calls

## Performance Optimization

1. **Frontend**: Images are lazy loaded, code is split by routes
2. **Backend**: Database indexes, rate limiting, caching
3. **Database**: Proper indexes, connection pooling
4. **API**: Response compression, request validation

## Security Considerations

1. **Authentication**: JWT tokens, Firebase integration
2. **API Security**: Rate limiting, input validation
3. **CORS**: Properly configured for frontend domain
4. **Environment**: Sensitive data in environment variables
5. **Database**: MongoDB authentication, network security

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## Support

For issues and questions:
- Check this documentation
- Review error logs
- Check API health endpoint
- Create GitHub issue if needed