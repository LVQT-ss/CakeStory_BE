# CakeStory Backend API

A Node.js backend application for a cake/bakery platform with Firebase Authentication integration.

## Features

- **Dual Authentication System**: Firebase Auth + PostgreSQL database
- **User Management**: Registration and login with JWT tokens
- **Baker Profiles**: Support for baker-specific business information
- **API Documentation**: Swagger/OpenAPI documentation
- **Database**: PostgreSQL with Sequelize ORM
- **File Storage**: Avatar images stored as URL strings

## Tech Stack

- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- Firebase Auth + Firestore
- JWT Authentication
- Swagger Documentation
- bcryptjs for password hashing

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with the following variables:

   ```env
   # Database Configuration
   DB_HOST=your_postgres_host
   DB_PORT=5432
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_NAME=your_database_name

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id

   # Server Port
   PORT=3000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user

  - Body: `{ username, email, password, full_name, avatar }`
  - Creates user in both Firebase Auth and PostgreSQL
  - Returns JWT token and user data

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Authenticates with Firebase Auth
  - Returns JWT token and user data

## API Documentation

Access Swagger documentation at: `http://localhost:3000/docs`

## Database Schema

### Users Table

- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `full_name` - User's full name
- `avatar` - Avatar image URL (string)
- `firebase_uid` - Firebase Auth UID
- `is_admin` - Admin flag
- `is_baker` - Baker flag

### Baker Profiles Table

- `user_id` - Foreign key to users
- `business_name` - Baker's business name
- `business_address` - Business address
- `phone_number` - Contact number
- `specialty` - Baker's specialty
- `bio` - Business description
- `is_verified` - Verification status

## Integration Notes

### Firebase Auth Integration

- Users are created in both Firebase Auth and PostgreSQL
- Firebase UID is stored in PostgreSQL for reference
- Authentication is handled by Firebase, user data by PostgreSQL
- Firestore documents are created for chat functionality

### Avatar Handling

- Avatars are stored as URL strings, not uploaded to Firebase Storage
- Frontend should handle image uploads and provide URL to backend

### Error Handling

- Firebase Auth errors are properly handled and mapped to appropriate HTTP responses
- Duplicate email/username errors from both systems are handled
