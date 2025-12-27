# HRMS Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MySQL** (v8 or higher)
- **npm** or **yarn**
- **Expo CLI** (for mobile app): `npm install -g expo-cli`

## Part 1: Setup and Run Backend API

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd hrms-backend

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hrms_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Step 3: Create Database

Open MySQL and create the database:

```sql
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Database Schema

```bash
# Import the schema (from MySQL command line or MySQL Workbench)
mysql -u root -p hrms_db < database/schema.sql
```

**OR** use the Sequelize sync (will auto-create tables):

```bash
node -e "require('./models').sequelize.sync({force: true}).then(() => console.log('Database synced')).catch(err => console.error(err))"
```

### Step 5: Seed the Database (Optional but Recommended)

```bash
# This creates test users and sample data
node scripts/seed.js
```

**Test Accounts Created:**
- **Admin**: admin@hrms.com / Admin@123
- **Manager**: manager@hrms.com / Manager@123
- **Employee**: employee@hrms.com / Employee@123

### Step 6: Start the Backend Server

```bash
npm start
```

You should see:
```
Server running on port 3000
Database connected successfully
```

### Step 7: Test the API

Open your browser or Postman and test:
- **Health Check**: http://localhost:3000/api/health
- **API Documentation**: Check `docs/API_DOCUMENTATION.md`

**Test Login with Postman or cURL:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"Admin@123"}'
```

You should get a response with `accessToken` and `refreshToken`.

---

## Part 2: Setup and Run React Native Mobile App

### Step 1: Navigate to Mobile Directory

```bash
cd mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure API URL

Edit `mobile/constants/api.ts`:

```typescript
// For testing on physical device, use your computer's local IP
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
export const API_BASE_URL = 'http://192.168.1.100:3000/api'; // Change to your IP

// For Android Emulator
// export const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For iOS Simulator
// export const API_BASE_URL = 'http://localhost:3000/api';
```

### Step 4: Start the Mobile App

```bash
# Start Expo development server
npx expo start
```

You'll see a QR code and options:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan QR code with Expo Go app (on physical device)

### Step 5: Install Expo Go (For Physical Devices)

**Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)  
**iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Step 6: Test the Mobile App

1. **Login Screen**: Use one of the seeded accounts
   - Email: `employee@hrms.com`
   - Password: `Employee@123`

2. **Navigate Through Features**:
   - **Home Tab**: View attendance summary and quick actions
   - **Attendance Tab**: Clock in/out, view history
   - **Leaves Tab**: Apply for leave, view balance
   - **Profile Tab**: View user info, logout

3. **Test Admin Features** (Login as admin@hrms.com):
   - **Admin Tab**: Approve/reject leaves and expenses

---

## Quick Testing Workflow

### 1. Test Backend API with Postman

Import the Postman collection:
1. Open Postman
2. Click **Import** → Select `postman/HRMS_API.postman_collection.json`
3. All API endpoints are pre-configured
4. Start with **Auth → Login** to get tokens

### 2. Test Mobile App Flow

**Employee Flow:**
1. Login as employee
2. Clock in from Home or Attendance tab
3. Apply for leave
4. Submit an expense
5. Clock out

**Admin Flow:**
1. Login as admin
2. Navigate to Admin tab
3. Approve/reject pending leaves
4. Approve/reject pending expenses
5. View all employees

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```
Error: Access denied for user 'root'@'localhost'
```
- Check your MySQL password in `.env`
- Ensure MySQL is running: `sudo service mysql start` (Linux) or check Services (Windows)

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::3000
```
- Change PORT in `.env` to a different port (e.g., 3001)
- Or kill the process: `lsof -ti:3000 | xargs kill` (Mac/Linux)

### Mobile App Issues

**Can't Connect to API:**
- Make sure backend is running (`npm start` in root directory)
- Check API_BASE_URL in `mobile/constants/api.ts`
- For physical devices, use your computer's local IP address
- Ensure your phone and computer are on the same WiFi network

**Expo Go App Not Loading:**
- Clear Expo cache: `npx expo start -c`
- Restart the Metro bundler

**Module Not Found:**
```
Error: Unable to resolve module
```
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

---

## Development Tips

### Watch Backend Logs
```bash
# The backend shows all API requests
npm start
```

### Watch Mobile Logs
```bash
# In the Expo terminal, press 'd' to open developer menu
# Enable 'Remote JS Debugging' to see console.logs in browser
```

### Hot Reload
- Backend: Install nodemon for auto-restart
  ```bash
  npm install -g nodemon
  nodemon server.js
  ```
- Mobile: Expo automatically hot-reloads on file changes

### Test Different User Roles
- Login as different users to test role-based permissions
- Admin: Full access to all features
- Manager: Can approve team leaves/expenses
- Employee: Can view own data and submit requests

---

## Next Steps

1. **Customize**: Modify the app to match your company branding
2. **Deploy Backend**: Follow `docs/DEPLOYMENT_GUIDE.md`
3. **Build Mobile App**: Run `expo build:android` or `expo build:ios`
4. **Add Features**: Extend with payroll, performance reviews, etc.

## Support

For issues or questions:
1. Check the logs in backend console
2. Check React Native debugger console
3. Review API documentation in `docs/API_DOCUMENTATION.md`
4. Check database with: `mysql -u root -p hrms_db`
