# Email-Based Authentication System

This system provides email-based authentication without passwords using OTP (One-Time Password).

## Features

- User registration with name and email
- Email-based login using OTP
- JWT token authentication
- Email verification tracking
- Protected routes with middleware

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASS=your_db_password
DB_PORT=5432

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_from_gmail

# Server Configuration
PORT=3000
```

### 3. Database Setup

Run the migration to create the users table:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP(0),
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP(0) DEFAULT NOW(),
    updated_at TIMESTAMP(0) DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on email_verified_at for verification status queries
CREATE INDEX IF NOT EXISTS idx_users_email_verified_at ON users(email_verified_at);
```

### 4. Gmail App Password Setup

For Gmail, you need to create an App Password:

1. Go to your Google Account settings
2. Enable 2-Step Verification if not already enabled
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Use this password in your EMAIL_PASS environment variable

## API Endpoints

### Registration
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Request Login OTP
```
POST /auth/login/request-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Verify OTP and Login
```
POST /auth/login/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Get User Profile
```
GET /auth/profile
Authorization: Bearer <jwt_token>
```

## Usage Flow

1. **Registration**: User registers with name and email
2. **Login Request**: User requests OTP by providing email
3. **OTP Email**: System sends 6-digit OTP to user's email
4. **OTP Verification**: User enters OTP to complete login
5. **JWT Token**: System returns JWT token for authenticated requests

## Security Features

- OTP expires after 5 minutes
- JWT tokens expire after 24 hours
- Email verification tracking
- Automatic cleanup of expired OTPs
- Database validation of user existence

## Protected Routes

To protect routes, use the authentication middleware:

```javascript
const { authenticateToken } = require('./middleware/auth');

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});
```

## Error Handling

The system provides detailed error messages for:
- Missing required fields
- Invalid email format
- User not found
- Invalid OTP
- Expired OTP
- Invalid JWT tokens
- Email sending failures 