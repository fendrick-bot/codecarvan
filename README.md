# Exam Prep App

A full-stack exam preparation application with React Native/Expo (TypeScript) frontend and Node.js/Express backend with PostgreSQL database.

## Project Structure

```
Examprep/
├── frontend/              # React Native/Expo app (TypeScript)
│   ├── screens/           # App screens (.tsx)
│   ├── contexts/          # React contexts (AuthContext)
│   ├── App.tsx            # Main app component
│   ├── tsconfig.json      # TypeScript configuration
│   └── package.json
└── backend/               # Node.js/Express API
    ├── server.js          # Express server
    ├── db.js              # PostgreSQL database setup
    ├── routes/            # API route modules
    │   ├── authRoutes.js      # Authentication routes
    │   ├── questionRoutes.js # Question routes
    │   ├── quizRoutes.js     # Quiz routes
    │   ├── categoryRoutes.js # Category routes
    │   └── healthRoutes.js   # Health check routes
    ├── middleware/        # Authentication middleware
    ├── .env.example       # Environment variables template
    └── package.json
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)

## Setup Instructions

### Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE examprep;
```

2. Note your PostgreSQL credentials (host, port, username, password)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=examprep
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

5. Start the server:
```bash
npm start
```

The backend will:
- Connect to PostgreSQL
- Automatically create tables (users, questions, quiz_results)
- Insert sample questions
- Run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Use the Expo Go app on your phone to scan the QR code, or press:
   - `a` for Android emulator
   - `i` for iOS simulator
   - `w` for web browser

## Features

### Authentication
- User registration with email, password, and name
- User login with JWT token authentication
- Protected routes requiring authentication
- Persistent login session using AsyncStorage

### Quiz Features
- Browse questions by category
- Take quizzes with multiple choice questions
- View detailed results with correct/incorrect answers
- Track your score and percentage
- Save quiz results to database

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Body: `{ email, password, name }`
  - Returns: `{ token, user }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`
- `GET /api/auth/me` - Get current user (protected)
  - Headers: `Authorization: Bearer <token>`

### Questions
- `GET /api/questions` - Get all questions (optional: `?category=CategoryName`)
- `GET /api/questions/:id` - Get a specific question
- `GET /api/categories` - Get all available categories

### Quiz
- `POST /api/quiz/submit` - Submit quiz answers and get results (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ answers: [{ questionId, selectedAnswer }] }`
  - Returns: `{ score, total, percentage, results }`

### Health
- `GET /api/health` - Health check endpoint

## Technology Stack

### Frontend
- React Native 0.76.5
- Expo 54.0.23
- TypeScript 5.3.3
- React Navigation 6.x
- AsyncStorage for token persistence

### Backend
- Node.js with Express
- PostgreSQL database
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

## Notes

- Make sure PostgreSQL is running before starting the backend
- Make sure the backend is running before starting the frontend
- For Android/iOS devices, update the `API_BASE_URL` in the frontend context files to use your computer's IP address instead of `localhost`
- Example: `http://192.168.1.100:3000/api` (replace with your actual IP)
- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt with 10 salt rounds


