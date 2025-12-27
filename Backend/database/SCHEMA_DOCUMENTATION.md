# HRMS Database Schema Documentation

## Overview
This database schema is designed for a production-ready HRMS system supporting medium-sized companies. It follows MySQL 8+ best practices with proper normalization, foreign keys, indexes, soft deletes, and timestamps.

## Key Features
- **Normalization**: 3NF compliance to minimize data redundancy
- **Soft Deletes**: All tables have `deleted_at` for audit trail
- **Timestamps**: `created_at` and `updated_at` for all records
- **Foreign Keys**: Enforced referential integrity
- **Indexes**: Optimized for common queries
- **Sequelize Compatible**: Designed for Sequelize ORM

---

## Table Relationships

### Core Entity Relationships

```
roles (1) ──< (M) users (1) ──< (1) employees
                    │
                    └──< (M) leaves
                    └──< (M) permissions
                    └──< (M) expenses
                    └──< (M) attendance
                    └──< (M) schedules
                    └──< (M) refresh_tokens

employees (1) ──< (M) employees (self-referencing for manager)
          (1) ──< (M) leave_balances
          
leave_types (1) ──< (M) leaves
            (1) ──< (M) leave_balances

expense_categories (1) ──< (M) expenses

shift_types (1) ──< (M) schedules
```

---

## Table Details

### 1. roles
**Purpose**: Define user roles and permissions

**Key Columns**:
- `name`: Unique role name (Super Admin, Admin, Manager, HR, Employee)
- `permissions`: JSON field storing role permissions
- Supports RBAC (Role-Based Access Control)

**Relationships**:
- One-to-Many with `users`

---

### 2. users
**Purpose**: Authentication and user credentials

**Key Columns**:
- `email`: Unique login identifier
- `password`: Bcrypt hashed password
- `role_id`: Links to roles table
- `is_active`: Enable/disable user access
- `password_reset_token`: For password recovery

**Relationships**:
- Many-to-One with `roles`
- One-to-One with `employees`
- One-to-Many with `refresh_tokens`

**Security Features**:
- Password hashing required
- Token-based authentication
- Account activation control

---

### 3. employees
**Purpose**: Complete employee information

**Key Columns**:
- `employee_code`: Unique employee identifier
- `user_id`: Links to users table
- `manager_id`: Self-referencing for organizational hierarchy
- `employment_type`: Full-time, Part-time, Contract, Intern
- `status`: Active, Inactive, Terminated

**Relationships**:
- One-to-One with `users`
- Self-referencing for manager hierarchy
- One-to-Many with `attendance`, `leaves`, `permissions`, `expenses`, `schedules`

**Business Logic**:
- Soft deletes for audit trail
- Manager hierarchy for approval workflows
- Employment status tracking

---

### 4. attendance
**Purpose**: Daily attendance tracking

**Key Columns**:
- `date`: Attendance date
- `clock_in` / `clock_out`: Timestamps
- `working_hours`: Auto-calculated
- `status`: Present, Absent, Half-day, Late, On-leave
- `clock_in_ip` / `clock_out_ip`: IP tracking for security

**Relationships**:
- Many-to-One with `employees`

**Business Rules**:
- Unique constraint: One record per employee per day
- Working hours calculated on clock-out
- Location and IP tracking for fraud prevention

**Indexes**:
- Composite index on (employee_id, date) for fast lookups
- Date index for reporting

---

### 5. leave_types
**Purpose**: Define available leave types

**Key Columns**:
- `name`: Leave type name
- `days_per_year`: Annual allocation
- `is_paid`: Paid or unpaid leave
- `requires_approval`: Auto-approval flag

**Relationships**:
- One-to-Many with `leaves` and `leave_balances`

**Seed Data**:
- Annual Leave, Sick Leave, Casual Leave, Unpaid Leave, Maternity, Paternity

---

### 6. leave_balances
**Purpose**: Track employee leave balances per year

**Key Columns**:
- `employee_id` + `leave_type_id` + `year`: Unique composite
- `total_days`: Annual allocation
- `used_days`: Consumed leave
- `remaining_days`: Available balance

**Relationships**:
- Many-to-One with `employees` and `leave_types`

**Business Logic**:
- Updated on leave approval
- Restored on leave cancellation
- Year-based tracking for annual reset

---

### 7. leaves
**Purpose**: Leave requests and approvals

**Key Columns**:
- `start_date` / `end_date`: Leave period
- `days`: Calculated leave duration (supports half-days)
- `status`: Pending, Approved, Rejected, Cancelled
- `approved_by`: Admin who approved/rejected

**Relationships**:
- Many-to-One with `employees` and `leave_types`

**Business Rules**:
- Check leave balance before approval
- Prevent overlapping leaves (handled in application)
- Approval workflow tracking

---

### 8. permissions (Short-time Leave)
**Purpose**: Short-duration time-off requests

**Key Columns**:
- `date`: Permission date
- `start_time` / `end_time`: Time range
- `duration_hours`: Calculated duration (max 4 hours)
- `status`: Pending, Approved, Rejected

**Relationships**:
- Many-to-One with `employees`

**Business Rules**:
- Maximum 4 hours per permission
- Affects attendance calculation
- Can be auto-approved based on threshold

---

### 9. expense_categories
**Purpose**: Categorize expense types

**Key Columns**:
- `name`: Category name
- `max_amount`: Optional spending limit
- `requires_proof`: Receipt requirement flag

**Relationships**:
- One-to-Many with `expenses`

---

### 10. expenses
**Purpose**: Expense claims and reimbursements

**Key Columns**:
- `amount`: Expense amount
- `receipt_url`: Uploaded proof
- `status`: Pending, Approved, Rejected, Paid
- `approved_by`: Approver user ID
- `paid_at`: Payment timestamp

**Relationships**:
- Many-to-One with `employees` and `expense_categories`

**Business Rules**:
- Multi-stage approval workflow
- Payment tracking
- Receipt management

---

### 11. shift_types
**Purpose**: Define work shift patterns

**Key Columns**:
- `start_time` / `end_time`: Shift timings
- `working_hours`: Expected work hours
- `grace_period_minutes`: Late arrival tolerance

**Relationships**:
- One-to-Many with `schedules`

---

### 12. schedules
**Purpose**: Assign shifts to employees

**Key Columns**:
- `employee_id` + `date`: Unique composite
- `shift_type_id`: Assigned shift
- `is_holiday`: Holiday flag

**Relationships**:
- Many-to-One with `employees` and `shift_types`

**Business Rules**:
- One shift per employee per day
- Holiday management
- Flexible scheduling support

---

### 13. holidays
**Purpose**: Company-wide holidays

**Key Columns**:
- `date`: Holiday date
- `type`: Public, Optional, Regional
- `name`: Holiday name

**Business Rules**:
- Used for leave calculations
- Schedule planning
- Attendance exceptions

---

### 14. refresh_tokens
**Purpose**: JWT refresh token storage

**Key Columns**:
- `token`: Unique refresh token
- `expires_at`: Token expiration
- `user_id`: Token owner

**Relationships**:
- Many-to-One with `users`

**Security**:
- Token rotation on use
- Automatic cleanup of expired tokens

---

## Indexing Strategy

### Primary Indexes
- Auto-increment PRIMARY KEY on all tables

### Foreign Key Indexes
- All foreign keys automatically indexed

### Composite Indexes
- `attendance`: (employee_id, date)
- `leave_balances`: (employee_id, leave_type_id, year)
- `schedules`: (employee_id, date)

### Search Indexes
- Email, employee_code for quick lookups
- Status fields for filtering
- Date ranges for reporting

---

## Soft Delete Implementation

All tables include `deleted_at` column:
- NULL = Active record
- TIMESTAMP = Soft deleted

**Benefits**:
- Audit trail preservation
- Data recovery capability
- Regulatory compliance

**Query Pattern**:
```sql
-- Active records only
SELECT * FROM employees WHERE deleted_at IS NULL;

-- Include deleted
SELECT * FROM employees;
```

---

## Performance Optimizations

1. **Proper Indexing**: All foreign keys and frequently queried columns
2. **InnoDB Engine**: ACID compliance and foreign key support
3. **UTF8MB4**: Full Unicode support including emojis
4. **Timestamp Defaults**: Automatic tracking
5. **Normalized Structure**: Minimized data redundancy

---

## Sequelize Compatibility

This schema is optimized for Sequelize ORM:
- Standard naming conventions
- Timestamps (createdAt, updatedAt, deletedAt)
- Foreign key naming: `tablename_id`
- Enum support for status fields
- JSON columns for flexible data

---

## Migration Strategy

**For existing systems**:
1. Create new database
2. Run schema.sql
3. Migrate data with transformation
4. Verify referential integrity
5. Switch application connection

**For new deployments**:
1. Execute schema.sql
2. Seed data included in script
3. Create admin user
4. Configure application

---

## Backup Recommendations

- **Daily**: Full database backup
- **Hourly**: Transaction log backup
- **Retention**: 30 days minimum
- **Test**: Monthly restore verification
