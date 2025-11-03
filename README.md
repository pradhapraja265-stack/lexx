# LexiFix - AI-Powered Text Refinement

LexiFix is a full-stack AI-powered text refinement web application that helps users refine, rephrase, and enhance their text in various tones using AI-based natural language processing.

## Features

- **Chat-style Interface**: Interactive UI similar to ChatGPT
- **Multiple Tones**: Refine text in Formal, Casual, Friendly, and Professional tones
- **AI-Powered**: Uses OpenAI GPT-4 for intelligent text refinement
- **Chat History**: Persistent chat sessions with timestamps
- **Theme Switching**: Light and dark mode support
- **Copy Functionality**: Easy copying of refined text
- **Authentication**: Firebase-based user authentication
- **Responsive Design**: Works seamlessly on desktop and mobile

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Firebase Authentication
- React Router
- Axios (API client)

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB (with Mongoose)
- OpenAI API
- JWT Authentication
- Firebase Admin SDK

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Authentication: Firebase

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Firebase project
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lexx
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**

   **Backend (.env):**
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb+srv://...
   OPENAI_API_KEY=your_openai_key
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend (.env):**
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development servers**

   Backend (from backend directory):
   ```bash
   npm run dev
   ```

   Frontend (from frontend directory):
   ```bash
   npm run dev
   ```

## Project Structure

```
lexx/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic services
│   │   ├── models/          # MongoDB models
│   │   └── server.js        # Server entry point
│   └── package.json
└── docs/                     # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/register` - Register new user

### Chat
- `GET /api/chat/sessions` - Get user's chat sessions
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions/:id` - Get specific chat session
- `DELETE /api/chat/sessions/:id` - Delete chat session

### Text Refinement
- `POST /api/refine` - Refine text using AI

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/preferences` - Update user preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI for the GPT-4 API
- Firebase for authentication services
- MongoDB for database hosting
- Vercel and Render for deployment platforms