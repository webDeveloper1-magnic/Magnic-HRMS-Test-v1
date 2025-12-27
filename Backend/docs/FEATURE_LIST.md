# HRMS Feature List

## Module Overview
1. Authentication
2. Employees
3. Attendance
4. Leave Management
5. Permissions (Short Leave)
6. Expenses
7. Schedules
8. Roles & Access Control

---

## 1. Authentication Module

### Features
- User registration
- User login with email/password
- JWT token generation
- Token refresh
- Password reset
- Logout

### Access Control
- **Public**: Register, Login, Password Reset
- **All Authenticated**: Logout, Profile View

### API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

---

## 2. Employees Module

### Features
- Create employee profile
- View employee list (with pagination, search, filter)
- View single employee details
- Update employee information
- Soft delete employee
- Employee onboarding/offboarding

### Access Control
- **Admin**: Full CRUD access
- **Employee**: View own profile, update limited fields (contact, emergency contact)

### API Endpoints
- `POST /api/employees` - Create employee (Admin)
- `GET /api/employees` - List employees with pagination (Admin)
- `GET /api/employees/:id` - Get employee details (Admin/Self)
- `PUT /api/employees/:id` - Update employee (Admin/Self limited)
- `DELETE /api/employees/:id` - Soft delete employee (Admin)
- `GET /api/employees/me` - Get current user profile (Employee)

---

## 3. Attendance Module

### Features
- Clock-in (with location/IP tracking)
- Clock-out
- View daily attendance
- View monthly attendance report
- Attendance history
- Late arrival tracking
- Early departure tracking

### Business Rules
- One clock-in per day
- Clock-out required before next clock-in
- Auto-calculate working hours
- Grace period for late arrivals

### Access Control
- **Admin**: View all attendance, generate reports
- **Employee**: Clock-in/out, view own attendance

### API Endpoints
- `POST /api/attendance/clock-in` - Clock in (Employee)
- `POST /api/attendance/clock-out` - Clock out (Employee)
- `GET /api/attendance/today` - Today's attendance (Employee)
- `GET /api/attendance/history` - Attendance history (Employee/Admin)
- `GET /api/attendance/monthly/:employeeId` - Monthly report (Admin)
- `GET /api/attendance/reports` - Generate reports (Admin)

---

## 4. Leave Management Module

### Features
- Apply for leave
- View leave balance
- View leave history
- Cancel leave request
- Approve/reject leave (Admin)
- Leave types (Annual, Sick, Casual, Unpaid)
- Leave balance calculation
- Leave accrual system

### Business Rules
- Check available leave balance before approval
- No overlapping leave requests
- Auto-deduct balance on approval
- Restore balance on cancellation
- Half-day leave support

### Access Control
- **Admin**: Approve/reject all leaves, view all leave requests
- **Employee**: Apply for leave, view own leaves, cancel pending leaves

### API Endpoints
- `POST /api/leaves` - Apply for leave (Employee)
- `GET /api/leaves` - List all leaves (Admin)
- `GET /api/leaves/my-leaves` - Employee's own leaves (Employee)
- `GET /api/leaves/:id` - Get leave details (Employee/Admin)
- `PUT /api/leaves/:id/approve` - Approve leave (Admin)
- `PUT /api/leaves/:id/reject` - Reject leave (Admin)
- `DELETE /api/leaves/:id` - Cancel leave (Employee)
- `GET /api/leaves/balance` - Get leave balance (Employee)

---

## 5. Permissions Module (Short-time Leave)

### Features
- Request permission for short absence
- Specify time range (e.g., 2-4 PM)
- Approve/reject permission (Admin)
- View permission history
- Auto-approval for permissions under threshold

### Business Rules
- Maximum 4 hours per permission
- Affects attendance calculation
- Requires approval from direct supervisor

### Access Control
- **Admin**: Approve/reject, view all permissions
- **Employee**: Request permission, view own permissions

### API Endpoints
- `POST /api/permissions` - Request permission (Employee)
- `GET /api/permissions` - List all permissions (Admin)
- `GET /api/permissions/my-permissions` - Own permissions (Employee)
- `PUT /api/permissions/:id/approve` - Approve permission (Admin)
- `PUT /api/permissions/:id/reject` - Reject permission (Admin)

---

## 6. Expenses Module

### Features
- Submit expense claim
- Upload expense proof/receipts
- Categorize expenses (Travel, Food, Accommodation, etc.)
- Approve/reject expenses (Admin)
- Track reimbursement status
- Expense reports

### Business Rules
- Require proof for expenses above threshold
- Multi-level approval workflow
- Track payment status

### Access Control
- **Admin**: Approve/reject, view all expenses, mark as paid
- **Employee**: Submit expense, view own expenses

### API Endpoints
- `POST /api/expenses` - Submit expense (Employee)
- `GET /api/expenses` - List all expenses (Admin)
- `GET /api/expenses/my-expenses` - Own expenses (Employee)
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id/approve` - Approve expense (Admin)
- `PUT /api/expenses/:id/reject` - Reject expense (Admin)
- `PUT /api/expenses/:id/mark-paid` - Mark as paid (Admin)
- `POST /api/expenses/:id/upload` - Upload receipt

---

## 7. Schedules Module

### Features
- Assign shift to employee
- Create work schedules
- Weekly/monthly schedule view
- Holiday management
- Shift types (Morning, Evening, Night, Flexible)
- Shift swap requests

### Business Rules
- One shift per day per employee
- Respect holidays
- Advance notice for schedule changes

### Access Control
- **Admin**: Create/update schedules, manage holidays
- **Employee**: View own schedule, request shift swap

### API Endpoints
- `POST /api/schedules` - Create schedule (Admin)
- `GET /api/schedules` - List schedules (Admin)
- `GET /api/schedules/my-schedule` - Employee's schedule (Employee)
- `PUT /api/schedules/:id` - Update schedule (Admin)
- `DELETE /api/schedules/:id` - Delete schedule (Admin)
- `POST /api/schedules/holidays` - Create holiday (Admin)
- `GET /api/schedules/holidays` - List holidays (All)

---

## 8. Roles & Access Control Module

### Features
- Define roles (Admin, Manager, Employee, HR)
- Assign permissions to roles
- Role-based access control (RBAC)
- User role assignment

### Roles
- **Super Admin**: Full system access
- **Admin**: Manage employees, attendance, leaves, expenses
- **Manager**: Approve leaves/expenses for team members
- **HR**: Manage employee data, onboarding
- **Employee**: Self-service features only

### Access Control
- **Admin**: Full access to role management
- **Employee**: View own role

### API Endpoints
- `GET /api/roles` - List all roles (Admin)
- `POST /api/roles` - Create role (Admin)
- `PUT /api/roles/:id` - Update role (Admin)
- `DELETE /api/roles/:id` - Delete role (Admin)

---

## Approval Workflows

### Leave Approval Workflow
1. Employee submits leave request
2. Request goes to direct manager/admin
3. Manager approves/rejects with comments
4. Employee receives notification
5. Leave balance updated on approval

### Expense Approval Workflow
1. Employee submits expense with proof
2. Request goes to manager
3. Manager approves/rejects
4. Approved expenses go to finance
5. Finance marks as paid
6. Employee receives notification

### Permission Approval Workflow
1. Employee requests short-time permission
2. Auto-approved if < 2 hours, else requires approval
3. Manager approves/rejects
4. Attendance system adjusts hours

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
