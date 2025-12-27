export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === "development"
    ? "http://192.168.1.127:5000/api" // local dev
    : "https://api.yourdomain.com/api", // production
  TIMEOUT: 30000,
}

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",

  // Employee
  EMPLOYEES: "/employees",
  MY_PROFILE: "/employees/me",

  // Attendance
  CLOCK_IN: "/attendance/clock-in",
  CLOCK_OUT: "/attendance/clock-out",
  TODAY_ATTENDANCE: "/attendance/today",
  ATTENDANCE_HISTORY: "/attendance/history",
  ALL_ATTENDANCE: "/attendance/all",
  MONTHLY_REPORT: "/attendance/monthly-report",

  // Leaves
  LEAVES: "/leaves",
  MY_LEAVES: "/leaves/my-leaves",
  LEAVE_BALANCE: "/leaves/balance",
  APPROVE_LEAVE: (id: number) => `/leaves/${id}/approve`,
  REJECT_LEAVE: (id: number) => `/leaves/${id}/reject`,

  // Permissions
  PERMISSIONS: "/permissions",
  MY_PERMISSIONS: "/permissions/my-permissions",
  APPROVE_PERMISSION: (id: number) => `/permissions/${id}/approve`,
  REJECT_PERMISSION: (id: number) => `/permissions/${id}/reject`,

  // Expenses
  EXPENSES: "/expenses",
  MY_EXPENSES: "/expenses/my-expenses",
  APPROVE_EXPENSE: (id: number) => `/expenses/${id}/approve`,
  REJECT_EXPENSE: (id: number) => `/expenses/${id}/reject`,

  // Schedules
  MY_SCHEDULE: "/schedules/my-schedule",
  HOLIDAYS: "/schedules/holidays",
}
