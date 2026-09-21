# Authentication System

## Architecture

React frontend
↓
Express API
↓
Mongoose
↓
MongoDB

This project keeps the existing JWT-based architecture and adds the missing authentication features on top of it. The frontend stores the token in localStorage for compatibility with the current app, while the backend validates each request using a Bearer token.

## Features

- Registration
- Login
- Logout
- Forgot password
- Reset password
- Protected routes
- Persistent authentication
- Password hashing
- Validation and error handling

## Authentication Flow

1. User opens `/register` and fills in their name, email, and password.
2. Frontend sends a POST request to `/api/auth/register`.
3. Backend validates the fields and checks whether the email is already in use.
4. The password is hashed before being saved to MongoDB.
5. The user logs in from `/login`.
6. Backend checks the email and password using bcrypt.
7. If valid, the server creates a JWT and returns it to the frontend.
8. The frontend stores the token in localStorage and restores it on page refresh.
9. Protected routes verify the token using the backend middleware before allowing access.

## Forgot Password Flow

User enters email
→ backend generates secure token
→ token is hashed before storing in MongoDB
→ reset link is generated
→ reset details are logged in development mode only
→ user opens reset link
→ backend validates token and expiration
→ password is hashed
→ password updated
→ token invalidated

## Security

- Passwords are hashed with bcrypt before saving.
- Reset tokens are hashed before storing in MongoDB.
- Reset tokens expire after 30 minutes.
- Forgot-password responses are generic so the app does not reveal whether an email exists.
- JWT secrets and email configuration must be stored in environment variables.
- The backend avoids logging raw passwords or reset tokens.

## API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/auth/register | Register | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/logout | Logout | Yes |
| GET | /api/auth/me | Current user | Yes |
| POST | /api/auth/forgot-password | Request reset | No |
| POST | /api/auth/reset-password/:token | Reset password | No |

The legacy root paths `/register`, `/login`, and `/me` remain supported for compatibility with the existing frontend.

## Testing Evidence

Screenshots placeholders:
- Registration
- Login
- Logged-in dashboard
- Logout
- Forgot password
- Reset password
- MongoDB user document
- API testing

## Manual Testing Checklist

1. Register a new user.
2. Try to register the same email again and confirm duplicate handling.
3. Login with the correct password.
4. Login with an incorrect password.
5. Refresh the application and confirm the user remains authenticated.
6. Access a protected page while logged in.
7. Logout and verify the token is cleared.
8. Attempt protected access again after logout.
9. Request a forgot-password email.
10. Use the reset link to set a new password.
11. Try an expired or invalid token.
12. Login with the new password and confirm the old password no longer works.

## Notes

This project uses the existing JWT and localStorage design already present in the app, so the authentication system is beginner-friendly and simple to explain in a viva while still meeting the required college practical expectations.
