# HRMS - Complete Human Resource Management System

A comprehensive Human Resource Management System (HRMS) with Node.js/Express backend API and React Native mobile app.

## Project Overview

This is a full-stack HRMS solution featuring:
- **Backend**: RESTful API built with Node.js, Express, Sequelize ORM, and MySQL
- **Mobile App**: Cross-platform React Native app using Expo for iOS and Android
- **Authentication**: JWT-based authentication with role-based access control
- **Real-time Data**: TanStack Query for efficient data fetching and caching

## Features

### Core Modules
1. **Authentication & Authorization**: JWT-based auth with role-based access control
2. **Employee Management**: Complete employee lifecycle management
3. **Attendance Tracking**: Clock in/out with location tracking and working hours calculation
4. **Leave Management**: Apply, approve, and track leaves with balance management
5. **Permissions**: Short-time leave requests with auto-approval
6. **Expense Management**: Submit and approve expense claims with receipt upload
7. **Schedule Management**: Shift assignments, holidays, and roster management
8. **Role Management**: Hierarchical role-based permissions system

### Key Features
- 5 role types: Super Admin, Admin, Manager, HR, Employee
- Soft delete support for complete audit trail
- Pagination, filtering, and advanced search
- Comprehensive validation on both backend and frontend
- Transaction support for data integrity
- Secure password hashing with bcrypt
- JWT token refresh mechanism
- Mobile-first responsive design
- Offline-first architecture with TanStack Query

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8+
- **ORM**: Sequelize v6
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

### Mobile App
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **State Management**: TanStack Query (React Query)
- **Storage**: Expo SecureStore
- **Language**: TypeScript
- **UI**: React Native Paper (optional)

## Project Structure

```
hrms/
├── backend/                    # Node.js/Express API
│   ├── config/                # Database configuration
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Custom middleware
│   ├── models/                # Sequelize models (14 models)
│   ├── routes/                # API routes
│   ├── utils/                 # Helper utilities
│   ├── scripts/               # Database scripts
│   ├── database/              # SQL schema and documentation
│   ├── docs/                  # API documentation
│   ├── postman/               # Postman collection for testing
│   └── server.js              # Entry point
│
├── mobile/                     # React Native App
│   ├── app/                   # Expo Router pages
│   │   ├── (auth)/           # Authentication screens
│   │   └── (tabs)/           # Main app tabs
│   ├── components/            # Reusable components
│   ├── constants/             # App constants
│   ├── context/               # React Context (Auth)
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # API client
│   └── types/                 # TypeScript types
│
└── docs/                       # Project documentation
    ├── QUICK_START.md         # Setup instructions
    ├── API_DOCUMENTATION.md   # Complete API docs
    ├── DEPLOYMENT_GUIDE.md    # Deployment instructions
    └── SCHEMA_DOCUMENTATION.md # Database schema
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL 8+
- Expo CLI: `npm install -g expo-cli`
- (Optional) Android Studio or Xcode for emulators

### Backend Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see below)
cp .env.example .env

# 3. Create database
mysql -u root -p
CREATE DATABASE hrms_db;
exit;

# 4. Run database schema
mysql -u root -p hrms_db < database/schema.sql

# 5. Seed database with test data
node scripts/seed.js

# 6. Start server
npm start
```

**.env Configuration:**
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=hrms_db
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Mobile App Setup

```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Install dependencies
npm install

# 3. Update API URL in mobile/constants/api.ts
# Use your computer's local IP for physical devices
# Example: export const API_BASE_URL = 'http://192.168.1.100:3000/api'

# 4. Start Expo
npx expo start

# 5. Options:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app on your phone
```

### Test Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | Admin@123 |
| Manager | manager@hrms.com | Manager@123 |
| Employee | employee@hrms.com | Employee@123 |

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Main Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

**Employees:**
- `GET /employees` - List all employees (Admin)
- `GET /employees/me` - Get own profile
- `POST /employees` - Create employee (Admin)
- `PUT /employees/:id` - Update employee (Admin)
- `DELETE /employees/:id` - Delete employee (Admin)

**Attendance:**
- `POST /attendance/clock-in` - Clock in
- `POST /attendance/clock-out` - Clock out
- `GET /attendance/today` - Today's attendance
- `GET /attendance/history` - Attendance history
- `GET /attendance/monthly-report` - Monthly report (Admin)

**Leaves:**
- `POST /leaves` - Apply for leave
- `GET /leaves/my-leaves` - My leaves
- `GET /leaves/balance` - Leave balance
- `PUT /leaves/:id/approve` - Approve leave (Admin)
- `PUT /leaves/:id/reject` - Reject leave (Admin)

**Expenses:**
- `POST /expenses` - Submit expense
- `GET /expenses/my-expenses` - My expenses
- `PUT /expenses/:id/approve` - Approve expense (Admin)
- `POST /expenses/:id/upload` - Upload receipt

**Complete API documentation**: See `docs/API_DOCUMENTATION.md`

## Testing

### Using Postman

1. Import `postman/HRMS_API.postman_collection.json`
2. Start with **Auth → Login** to get access token
3. Token is automatically saved to collection variables
4. Test all endpoints with pre-configured requests

### Manual Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"Admin@123"}'
```

## Mobile App Features

### Employee Features
- **Dashboard**: View attendance summary and quick actions
- **Attendance**: Clock in/out with location, view history
- **Leave Management**: Apply for leave, check balance, view status
- **Expense Claims**: Submit expenses with receipt upload
- **Profile**: View and update personal information

### Admin Features
- **All Employee Features** +
- **Leave Approvals**: Approve/reject leave requests
- **Expense Approvals**: Approve/reject expense claims
- **Employee Management**: View all employees and their data
- **Reports**: Access attendance and leave reports

## Deployment

### Backend Deployment

**Option 1: VPS (Ubuntu)**
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm mysql-server

# Clone and setup
git clone <repository>
cd hrms
npm install
# Configure .env for production
# Setup MySQL database
# Start with PM2
npm install -g pm2
pm2 start server.js --name hrms-api
```

**Option 2: Docker**
```bash
docker build -t hrms-backend .
docker run -p 3000:3000 hrms-backend
```

**Option 3: Cloud Platforms**
- Deploy to Heroku, Railway, Render, or DigitalOcean
- See `docs/DEPLOYMENT_GUIDE.md` for detailed instructions

### Mobile App Deployment

```bash
cd mobile

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Or use Expo Application Services (EAS)
npm install -g eas-cli
eas build
```

## Database Schema

The system uses 14 interconnected tables:
- `roles` - User roles and permissions
- `users` - User accounts
- `employees` - Employee profiles
- `attendance` - Daily attendance records
- `leave_types` - Leave categories
- `leave_balances` - Employee leave balances
- `leaves` - Leave applications
- `permissions` - Short leave requests
- `expense_categories` - Expense types
- `expenses` - Expense claims
- `schedules` - Work schedules
- `holidays` - Public holidays
- `password_reset_tokens` - Password reset
- `refresh_tokens` - JWT refresh tokens

**Complete schema**: See `database/SCHEMA_DOCUMENTATION.md`

## Security Features

- Bcrypt password hashing (10 rounds)
- JWT access tokens (24h expiry)
- JWT refresh tokens (7d expiry)
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention via Sequelize ORM
- XSS protection
- CORS configuration
- Secure token storage (SecureStore on mobile)

## Troubleshooting

### Backend Issues

**Can't connect to database:**
- Check MySQL is running: `sudo service mysql status`
- Verify credentials in `.env`
- Ensure database exists

**Port already in use:**
- Change PORT in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### Mobile App Issues

**Can't connect to API:**
- Ensure backend is running
- Check `API_BASE_URL` in `mobile/constants/api.ts`
- Use your computer's local IP (not localhost) for physical devices
- Ensure phone and computer on same WiFi

**Module not found:**
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start -c
```

## Development Roadmap

- [ ] Payroll management module
- [ ] Performance review system
- [ ] Document management
- [ ] Training and certification tracking
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## License

This project is licensed under the ISC License.

## Support

For detailed setup instructions, see `docs/QUICK_START.md`

For API documentation, see `docs/API_DOCUMENTATION.md`

For deployment guides, see `docs/DEPLOYMENT_GUIDE.md`

For issues and questions, please open a GitHub issue.
