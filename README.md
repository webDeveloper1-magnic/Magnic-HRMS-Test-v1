# HRMS Mobile App

React Native mobile application for the HRMS system built with Expo and TanStack Query.

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: TanStack Query + Zustand
- **API Client**: Axios
- **Storage**: Expo SecureStore
- **Language**: TypeScript

## Features

### Employee Features
- Login/Logout
- Dashboard with quick stats
- Clock in/out attendance
- View attendance history
- Apply for leave
- View leave balance
- Submit expense claims
- View schedule and holidays

### Admin Features
- All employee features
- Approve/reject leave requests
- Approve/reject expense claims
- View all attendance records
- Employee management

## Installation

```bash
cd mobile
npm install
```

## Configuration

Update the API base URL in `constants/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "http://your-api-url/api",
  TIMEOUT: 30000,
}
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Project Structure

```
mobile/
├── app/
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/           # Main app tabs
│   └── _layout.tsx       # Root layout
├── components/           # Reusable components
├── context/             # React contexts
├── hooks/               # Custom hooks with TanStack Query
├── lib/                 # API client and utilities
├── constants/           # Constants and config
└── types/               # TypeScript types
```

## Authentication Flow

1. User enters credentials on login screen
2. Credentials sent to backend API
3. Access token and refresh token received
4. Tokens stored securely in SecureStore
5. Access token added to all API requests
6. Auto-refresh on token expiration

## API Integration

All API calls use TanStack Query hooks located in `hooks/`:
- `useAuth.ts` - Authentication
- `useAttendance.ts` - Attendance management
- `useLeaves.ts` - Leave management  
- `useExpenses.ts` - Expense management

## Testing

Test with these credentials:
- Employee: `employee@hrms.com` / `Employee@123`
- Admin: `admin@hrms.com` / `Admin@123`
