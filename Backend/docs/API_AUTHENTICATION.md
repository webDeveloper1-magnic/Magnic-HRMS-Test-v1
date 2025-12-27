# Authentication API Documentation

## Overview
The HRMS authentication system uses JWT (JSON Web Tokens) for secure authentication and authorization. It includes role-based access control (RBAC) for different user types.

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication Flow

### 1. Register
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "role_name": "Employee",
  "employee_data": {
    "employee_code": "EMP001",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_joining": "2024-01-01",
    "department": "Engineering",
    "designation": "Software Engineer",
    "phone": "+1234567890"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@company.com",
      "role": "Employee"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login
Authenticate user and receive tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@company.com",
      "role": "Employee",
      "employee": {
        "id": 1,
        "employee_code": "EMP001",
        "first_name": "John",
        "last_name": "Doe",
        "department": "Engineering",
        "designation": "Software Engineer"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Refresh Token
Get new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 4. Logout
Invalidate refresh token.

**Endpoint:** `POST /api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 5. Get Profile
Get current user profile (requires authentication).

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@company.com",
      "is_active": true,
      "last_login": "2024-01-15T10:30:00.000Z",
      "role": {
        "id": 5,
        "name": "Employee",
        "permissions": ["profile.view", "attendance.self", "leaves.apply"]
      },
      "employee": {
        "id": 1,
        "employee_code": "EMP001",
        "first_name": "John",
        "last_name": "Doe",
        "department": "Engineering",
        "designation": "Software Engineer"
      }
    }
  }
}
```

### 6. Forgot Password
Request password reset token.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@company.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset token generated",
  "data": {
    "resetToken": "abc123def456..."
  }
}
```

### 7. Reset Password
Reset password using token.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## Authentication Middleware

### Usage in Protected Routes
```javascript
const { authenticate, authorize, isAdmin } = require('./middleware/auth')

// Require authentication only
router.get('/protected', authenticate, controller)

// Require specific roles
router.post('/admin-only', authenticate, authorize('Admin', 'Super Admin'), controller)

// Require admin privileges
router.delete('/delete', authenticate, isAdmin, controller)
```

## Role-Based Access Control

### Available Roles
- **Super Admin**: Full system access
- **Admin**: Administrative access
- **Manager**: Team management access
- **HR**: HR management access
- **Employee**: Employee self-service

### Permission Checking
The middleware automatically checks:
1. Token validity
2. User active status
3. Role permissions
4. Resource ownership (for employee-specific resources)

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token" // or "Token expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

## Security Best Practices

1. **Token Storage**: Store tokens securely on the client side
   - Use httpOnly cookies or secure storage
   - Never store tokens in localStorage for sensitive apps

2. **Token Expiry**:
   - Access Token: 1 hour (configurable)
   - Refresh Token: 7 days (configurable)

3. **Password Requirements**:
   - Minimum 8 characters
   - Hashed using bcrypt with salt rounds = 10

4. **HTTPS**: Always use HTTPS in production

5. **Rate Limiting**: Implement rate limiting for auth endpoints (recommended)

6. **Token Rotation**: Refresh tokens are single-use in production
