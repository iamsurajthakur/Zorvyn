# Zorvyn - Finance Backend API

A financial record management backend built with Express.js, MongoDB, and modern security practices. Zorvyn provides a robust, scalable API for managing financial records with role-based access control (RBAC) and comprehensive audit trails.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Authentication & Authorization](#authentication--authorization)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Installation & Setup](#installation--setup)
- [Error Handling](#error-handling)

---

## Project Overview

Zorvyn is a backend API service designed to manage personal and organizational financial records with fine-grained access control. It supports multiple user roles (Viewer, Analyst, Admin), comprehensive financial categorization, and detailed audit trails for compliance.

**Key Purpose**: Provide a secure, scalable backend for financial applications with role-based permissions and audit capabilities.

---

## Tech Stack

| Layer          | Technology     | Version | Purpose                         |
| -------------- | -------------- | ------- | ------------------------------- |
| **Runtime**    | Node.js        | -       | JavaScript runtime              |
| **Framework**  | Express.js     | ^5.2.1  | HTTP server & routing           |
| **Database**   | MongoDB        | -       | NoSQL data storage              |
| **ODM**        | Mongoose       | ^9.3.3  | MongoDB object model            |
| **Auth**       | JSON Web Token | ^9.0.3  | Token-based authentication      |
| **Password**   | bcryptjs       | ^3.0.3  | Password hashing & verification |
| **Validation** | Zod            | ^4.3.6  | Schema validation               |
| **API Docs**   | Swagger UI     | ^5.0.1  | API documentation               |
| **Env**        | dotenv         | ^17.3.1 | Environment config              |
| **Dev**        | Nodemon        | ^3.1.14 | Development auto-reload         |

**Design Rationale**:

- **Express.js**: Minimal footprint, large ecosystem, perfect for business logic layer
- **MongoDB**: Flexible schema for financial categories, horizontal scalability
- **Mongoose**: Schema validation, relationships, lifecycle hooks
- **JWT**: Stateless, scalable authentication without session store
- **Zod**: TypeScript-first but works great in pure JS projects, exceptional error messages

---

## Project Structure

```
zorvyn/
├── src/
│   ├── app.js                        # Express app setup
│   ├── config/
│   │   ├── database.js               # MongoDB connection & lifecycle
│   │   ├── env.js                    # Environment variable parser
│   │   └── rbac.js                   # Role → Permission mappings
│   ├── constants/
│   │   ├── categories.js             # Income/Expense categories
│   │   └── permissions.js            # Permission constants
│   ├── controllers/
│   │   ├── auth.controller.js        # Auth endpoints logic
│   │   ├── dashboard.controller.js   # Dashboard analytics
│   │   ├── record.controller.js      # Financial record CRUD
│   │   └── user.controller.js        # User management
│   ├── middlewares/
│   │   ├── authenticate.middleware.js # JWT verification
│   │   ├── authorize.middleware.js   # Permission checks
│   │   ├── globalErrorHandler.middleware.js  # Error responses
│   │   └── validate.middleware.js    # Zod schema validation
│   ├── models/
│   │   ├── record.model.js           # Financial record schema
│   │   └── user.model.js             # User schema with auth
│   ├── routes/
│   │   ├── auth.route.js             # /api/v1/auth endpoints
│   │   ├── dashboard.route.js        # /api/v1/dashboard
│   │   ├── record.route.js           # /api/v1/record
│   │   └── user.route.js             # /api/v1/users
│   ├── schemas/
│   │   ├── auth.schema.js            # Auth request validation
│   │   ├── common.schema.js          # Shared Zod schemas
│   │   ├── dashboard.schema.js       # Dashboard request validation
│   │   ├── env.schema.js             # Environment validation
│   │   ├── record.schema.js          # Record request validation
│   │   └── user.schema.js            # User request validation
│   ├── services/
│   │   ├── auth.service.js           # Auth business logic
│   │   ├── dashboard.service.js      # Analytics calculations
│   │   ├── record.service.js         # Record CRUD operations
│   │   └── user.service.js           # User management logic
│   └── utils/
│       ├── ApiError.js               # Custom error class
│       ├── ApiResponse.js            # Standard response wrapper
│       └── asyncHandler.js           # Async error wrapper
├── server.js                         # Server entry point
├── seed.js                           # Database seeding
├── package.json
├── .env.example
└── README.md
```

---

## Core Features

### 1. **Authentication System**

- User registration with email validation
- Secure password hashing (bcryptjs with salt rounds)
- JWT access tokens for API requests
- Refresh token mechanism for token rotation
- Account activation status tracking
- Last login timestamp

### 2. **Role-Based Access Control**

- Three roles: VIEWER, ANALYST, ADMIN
- 8 granular permissions:
  - `record:read`, `record:create`, `record:update`, `record:delete`
  - `dashboard:read`
  - `user:read`, `user:create`, `user:update`, `user:delete`
- Dynamic permission checking in middleware
- Role-based endpoint protection

### 3. **Financial Record Management**

- Supports two record types: INCOME and EXPENSE
- 14 predefined categories:
  - Income: salary, freelance, investment, business, rental, other_income
  - Expense: rent, food, utilities, transport, healthcare, education, entertainment, shopping, other_expense
- Soft delete mechanism to preserve historical data while excluding it from active queries
- Audit trail tracking (createdBy, updatedBy, timestamps)
- Optional descriptions (up to 500 chars)

### 4. **Dashboard & Analytics**

- Summary statistics for authenticated users
- Data aggregation endpoints
- Permission-based access to analytics

### 5. **User Management**

- User creation with default VIEWER role
- Role assignment/updates
- Account activation/deactivation
- Soft delete for users
- Admin-only operations

### 6. **Audit & Compliance**

- Track record creator and last modifier
- Soft delete for data recovery
- Timestamp tracking (createdAt, updatedAt)
- Permission-based access logs

---

## Authentication & Authorization

### JWT Flow

```
1. User Login
   ↓
2. Server generates Access Token (15-60 min) + Refresh Token (7-30 days)
   ↓
3. Client stores tokens
   ↓
4. Client sends Access Token in every request: Authorization: Bearer <token>
   ↓
5. Server verifies token via authenticate middleware
   ↓
6. If expired, client uses Refresh Token to get new Access Token
```

### Middleware Chain

Every protected route follows this middleware chain:

```javascript
// 1. JSON body parser
app.use(express.json())

// 2. Authentication middleware (verifies JWT)
router.post('/route', authenticate, ...)

// 3. Authorization middleware (checks permissions)
router.post('/route', authorize('record:create'), ...)

// 4. Validation middleware (validates request schema)
router.post('/route', validate(recordCreateSchema), ...)

// 5. Route handler
async (req, res) => { /* handler */ }

// 6. Async error wrapper catches errors
asyncHandler((req, res) => { /* ... */ })

// 7. Error handler processes all errors
app.use(globalErrorHandler)
```

### Permission Model

```javascript
// RBAC Matrix ensures users can only access appropriate resources:

          | View Records | Create | Edit | Delete | View Dashboard | Manage Users |
----------|--------------|--------|------|--------|----------------|--------------|
VIEWER    |              |        |      |        | ✓              |              |
ANALYST   | ✓            |        |      |        | ✓              |              |
ADMIN     | ✓            | ✓      | ✓    | ✓      | ✓              | ✓            |
```

---


## Database Design

### User Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto ID
  name: String (required),          // User's full name
  email: String (required, unique), // Unique email address
  passwordHash: String,             // Bcryptjs hashed password
  refreshToken: String,             // JWT refresh token
  role: String (VIEWER|ANALYST|ADMIN),  // User role
  isActive: Boolean,                // Account status
  lastLogin: Date,                  // Timestamp of last login
  createdBy: ObjectId ref User,     // Who created this user
  isDeleted: Boolean (soft delete),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

**Indexes**:

- `email` (unique)
- `role` (filter by role)
- `isDeleted` (soft delete queries)
- `isActive` (account status queries)

### FinancialRecord Schema

```javascript
{
  _id: ObjectId,
  amount: Number (required, > 0),       // Transaction amount
  type: String (INCOME|EXPENSE),        // Income or expense
  category: String,                     // Predefined category
  date: Date (required),                // Transaction date
  description: String (max 500),        // Optional description
  createdBy: ObjectId ref User,         // Record creator
  updatedBy: ObjectId ref User,         // Last editor
  isDeleted: Boolean,
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

**Indexes**:

- `createdBy` (query by user)
- `type` (filter by income/expense)
- `category` (filter by category)
- `date` (newest first sorting)
- Compound: `{ date: -1, type: 1 }` (date range queries with type filter)
- Compound: `{ category: 1, type: 1 }` (category breakdowns)

**Query Optimization**:

- Most common query: Records by user in date range with type filter
  - Uses compound index: `{ createdBy: 1, date: -1, type: 1 }`
  - Covers 80% of queries in typical finance app

---

## Architecture & Design Decisions

### 1. **MVC Architecture with Service Layer**

The application follows the **Model-View-Controller** pattern enhanced with a **service layer** for business logic separation:

```
Routes → Controllers → Services → Models → Database
         ↓
      Middlewares (Auth, Validation, Error Handling)
```

**Rationale**:

- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Services can be tested independently without HTTP layer
- **Reusability**: Services can be called from multiple controllers or scheduled jobs
- **Maintainability**: Changes to business logic don't affect route definitions

### 2. **JWT-Based Authentication with Dual Tokens**

Implemented **JWT (JSON Web Tokens)** with access and refresh token pattern:

```javascript
// Access Token: Short-lived token (typically 15min - 1hour)
// Refresh Token: Long-lived token stored in database (sent via secure cookies or localStorage)
```

**Rationale**:

- **Stateless**: No session storage required; scales horizontally
- **Security**: Short-lived access tokens minimize exposure window
- **Flexibility**: Refresh tokens allow token rotation without re-authentication

### 3. **Role-Based Access Control (RBAC)**

Three-tier permission system with granular control:

```javascript
ROLES:
  ├── VIEWER: Read-only access to dashboard
  ├── ANALYST: Records read access + dashboard
  └── ADMIN: Full CRUD + user management
```

**Rationale**:

- **Security**: Implements principle of least privilege
- **Flexibility**: Easy to extend with new permissions
- **Centralized**: `config/rbac.js` is single source of truth for permissions
- **Scalability**: Permission checks are stateless and can be cached

### 4. **Zod for Schema Validation**

All inputs validated using **Zod** schemas before reaching business logic:

```javascript
// Validation Layers:
// 1. Route-level: validate(schema) middleware
// 2. Service-level: Additional business rule validation
// 3. Database-level: Mongoose schema constraints
```

**Rationale**:

- **Type Safety**: Compile-time and runtime schema validation
- **Performance**: Fail fast before expensive operations
- **Consistency**: Single schema definition for docs, validation, and types
- **Error Clarity**: Detailed field-level error messages

### 5. **Soft Delete Pattern**

Records are never truly deleted; marker field `isDeleted` is used:

```javascript
// Database query automatically excludes soft-deleted records:
userSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});
```

**Rationale**:

- **Audit Trail**: Maintains historical data for compliance/investigation
- **Data Recovery**: Accidental deletions can be restored
- **Referential Integrity**: Foreign keys remain valid
- **Compliance**: Meets financial audit requirements

### 6. **Centralized Error Handling**

All errors flow through custom `ApiError` class and global error handler middleware:

```javascript
// Custom ApiError with standard structure:
throw new ApiError(statusCode, message, errors, stack);

// Global handler ensures:
// ✓ Consistent error response format
// ✓ No stack traces leaked in production
// ✓ Proper HTTP status codes
// ✓ Operational vs programming errors are distinguished
```

**Rationale**:

- **Consistency**: Clients always receive predictable error format
- **Security**: Prevents information leakage via error messages
- **Debugging**: Stack traces available under controlled conditions
- **Metrics**: Centralized location to log/monitor errors

### 7. **Async Error Handling with Wrapper**

All route handlers wrapped with `asyncHandler`:

```javascript
// Without wrapper: try-catch needed in every route
// With wrapper: Automatic catch and forward to error handler
const route = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  // Error automatically caught and passed to next(error)
});
```

**Rationale**:

- **DRY Principle**: Eliminates repetitive try-catch blocks
- **Consistency**: All async errors handled uniformly
- **Readability**: Route logic clear without error handling noise

### 8. **Standardized API Response Format**

All successful responses follow consistent structure:

```javascript
{
  statusCode: 200,
  data: { /* actual data */ },
  message: "Operation successful",
  success: true,
  meta: { /* pagination, counts, etc */ }
}
```

**Rationale**:

- **Client Predictability**: Frontend knows exact response structure
- **Extensibility**: Meta field allows pagination, counts, timestamps
- **API Evolution**: Can add fields without breaking clients
- **Consistency**: Matches error response structure

### 9. **Database Connection Pool Management**

MongoDB connection configured with optimal settings:

```javascript
// Pool Config:
maxPoolSize: 10,           // Max connections
serverSelectionTimeoutMS: 5000,  // Fail fast
socketTimeoutMS: 45000,          // Long operations
```

**Rationale**:

- **Performance**: Connection pooling reduces latency
- **Reliability**: Timeouts prevent hanging connections
- **Scalability**: Handles concurrent requests efficiently
- **Monitoring**: Connection events logged for diagnostics

### 10. **Strategic Database Indexing**

Indexes created for common query patterns:

```javascript
// Single-field indexes:
email: { index: true }  // User lookups
role: { index: true }   // Role-based queries

// Compound indexes:
{ date: -1, type: 1 }   // Date range + type queries
{ category: 1, type: 1 } // Category + type queries
```

**Rationale**:

- **Query Performance**: Orders of magnitude faster for large datasets
- **Targeted**: Only indexes on frequently queried fields
- **Sort Optimization**: Supports both filter and sort in same query
- **Trade-off**: Slightly slower writes, much faster reads (acceptable for finance queries)

### 11. **Graceful Shutdown Handling**

Server properly closes connections on termination signals:

```javascript
process.on("SIGINT", async () => {
  await server.close(); // Stop accepting new requests
  await mongoose.connection.close(); // Flush pending operations
  process.exit(0);
});
```

**Rationale**:

- **Data Integrity**: Pending operations complete before shutdown
- **Clean Deployment**: No requests lost during updates
- **Resource Cleanup**: Connections properly closed
- **Production Ready**: Compatible with container orchestration signals

### 12. **Environment Configuration with Validation**

Zod schema validates all env variables at startup:

```javascript
// Fails immediately if missing/invalid vars
const env = envSchema.parse(process.env);
```

**Rationale**:

- **Early Detection**: Configuration errors caught before first request
- **Type Safety**: Environment values properly typed
- **Documentation**: Schema serves as env var specification
- **Security**: Validation prevents injection attacks

---





## Installation & Setup

### Prerequisites

- Node.js 16+
- MongoDB 6.0+ (local or cloud)
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/iamsurajthakur/Zorvyn.git
cd Zorvyn
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your configuration:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zorvyn

# JWT Secrets (generate random strings)
ACCESS_TOKEN_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here

# Optional
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

```bash
# Seed initial data (users, records)
npm run seed

# Manual MongoDB setup (optional):
# Connect to MongoDB CLI and create database:
# use zorvyn
```

### 5. Start Server

**Development** (with auto-reload):

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server runs on `http://localhost:5000` by default.

---

## API Testing

You can import the provided Postman collection to test all endpoints:

- File: `Zorvyn.postman_collection.json`
- Import via Postman → File → Import → Select JSON

## Error Handling

### Error Classification

```javascript
// Operational Errors (expected and handled):
- Validation errors (400)
- Authentication failures (401)
- Authorization failures (403)
- Resource not found (404)
- Duplicate records (409)

// Programming Errors (unexpected):
- Database connection failures (500)
- Unhandled promise rejections (500)
- Stack overflow (500)
```

### Error Propagation Flow

```
Route Handler
   ↓
asyncHandler wraps it
   ↓
Throws error or rejects promise
   ↓
asyncHandler catches and calls next(error)
   ↓
Global Error Handler middleware
   ↓
Formats response
   ↓
Returns JSON to client
```

### Creating Errors

```javascript
// Always throw ApiError, never Error:

throw new ApiError(
  400, // HTTP status code
  "Validation failed", // User-friendly message
  {
    // Field-level errors
    email: ["Invalid format"],
    password: ["Too short"],
  },
);
```

---

## Performance Considerations

### Database Queries

- Compound indexes for common query patterns
- Connection pooling (maxPoolSize: 10)
- Soft delete with automatic filtering via middleware
- Pagination support to limit large resultsets

### Request/Response

- 20KB JSON payload limit to prevent abuse
- Standard compression (add middleware in production)
- Async error handling prevents blocking

### Scaling

- Stateless JWT auth allows horizontal scaling
- MongoDB replica sets support multi-node deployments
- Service layer can be extracted to microservices

---

## Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: Cryptographically signed, expiring tokens
- **RBAC**: Fine-grained permission checks on all protected routes
- **Input Validation**: Zod schema validation before processing
- **Soft Delete**: No permanent data loss, maintains audit trail
- **Error Handling**: No stack traces or sensitive info leaked
- **Account Status**: Can deactivate users, track last login

---


