markdown# Zorvyn — Finance Dashboard API

A backend REST API for a finance dashboard system built with 
Express.js and MongoDB. Supports role-based access control, 
financial record management, and aggregated analytics.

---

## Quick Start
```bash
# 1. Clone and install
git clone https://github.com/iamsurajthakur/Zorvyn.git
cd Zorvyn
npm install

# 2. Setup environment
cp .env.example .env

# 3. Seed database
npm run seed

# 4. Start server
npm run dev
```

Server runs at `http://localhost:8000`

---

## Test Credentials (after seed)

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@zorvyn.com | Admin123 |
| ANALYST | analyst@zorvyn.com | Analyst123 |
| VIEWER | viewer@zorvyn.com | Viewer123 |

---

## Environment Variables
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/zorvyn
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
```

---

## Backend Design

The application follows a layered MVC architecture with a 
dedicated service layer:
Request → Route → Middleware → Controller → Service → Model → DB

Each layer has one clear responsibility:
- **Routes** — define endpoints and attach middleware
- **Controllers** — handle request/response only
- **Services** — all business logic and DB operations
- **Models** — schema definition and DB hooks
- **Middlewares** — auth, RBAC, validation, error handling
src/
├── config/          # DB connection, env, rbac mapping
├── constants/       # permissions, categories
├── controllers/     # thin request/response handlers
├── middlewares/     # authenticate, authorize, validate, errorHandler
├── models/          # Mongoose schemas
├── routes/          # Express routers
├── services/        # all business logic
├── utils/           # ApiError, ApiResponse, asyncHandler
└── validators/      # Zod schemas

---

## Logical Thinking

### Access Control
Built a permission-based RBAC system — routes never contain 
hardcoded role names. Roles map to permissions in one config 
file. Adding a new role requires changing only that file.
VIEWER   → dashboard:read
ANALYST  → records:read, dashboard:read
ADMIN    → records:, dashboard:read, users:

### Business Rules Enforced
- Registration always assigns VIEWER — client cannot choose role
- Admin cannot change their own role or deactivate themselves
- Inactive users are blocked at authenticate middleware before 
  reaching any controller
- Category must match record type — INCOME records cannot have 
  expense categories (enforced via Zod cross-field validation)
- Soft deleted records excluded from all queries via Mongoose 
  pre-find hook automatically

### Dashboard Analytics
Dashboard uses MongoDB aggregation pipelines — not JavaScript 
loops over fetched data. All calculations happen inside the 
database in a single round trip per endpoint.

---

## Functionality

### Endpoints

**Auth** — `/api/v1/auth`
POST   /register    Public
POST   /login       Public
POST   /logout      Bearer token
GET    /me          Bearer token

**Users** — `/api/v1/users` (ADMIN only)
GET    /                Get all users (paginated + filtered)
GET    /:id             Get user by id
POST   /                Create user with any role
PATCH  /:id/role        Update user role
PATCH  /:id/status      Activate or deactivate user
DELETE /:id             Soft delete user

**Records** — `/api/v1/records`
GET    /                Get all records — ANALYST, ADMIN
GET    /:id             Get by id      — ANALYST, ADMIN
POST   /                Create         — ADMIN only
PATCH  /:id             Update         — ADMIN only
DELETE /:id             Soft delete    — ADMIN only

**Dashboard** — `/api/v1/dashboard`
GET    /summary         Income, expenses, net balance, savings rate
GET    /categories      Category breakdown with % share
GET    /trends          Monthly or weekly trends
GET    /recent          Recent activity

All dashboard endpoints — VIEWER, ANALYST, ADMIN

### GET /records — Filtering Support
?type=INCOME|EXPENSE
?category=salary|rent|food...
?from=ISO8601&to=ISO8601
?sortBy=date|amount|category|createdAt
?sortOrder=asc|desc
?search=keyword
?page=1&limit=10

---

## Code Quality

Consistent patterns used throughout:

**Every controller follows the same structure:**
```js
export const create = asyncHandler(async (req, res) => {
  const result = await service.create(req.validatedData.body, req.user._id)
  return res.status(201).json(new ApiResponse(201, result, 'Created'))
})
```

**Every protected route follows the same chain:**
```js
router.post('/', authenticate, authorize(PERMISSIONS.RECORDS_CREATE), 
  validate(createRecordSchema), recordController.create)
```

**Every response follows the same shape:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true,
  "meta": {}
}
```

---

## Database and Data Modeling

### Tech
MongoDB + Mongoose. Document database chosen because financial 
records map naturally to JSON and categories vary per record type.

### User Schema
name, email, passwordHash (select:false), role, isActive,
refreshToken (select:false), lastLogin, createdBy, isDeleted, timestamps

### FinancialRecord Schema
amount (integer/paise), type, category, date, description,
createdBy, updatedBy, isDeleted, timestamps

### Key Decisions

**Amounts stored in paise (integers):**
Monetary amounts are multiplied by 100 before storage and 
divided by 100 on output via a Mongoose toJSON transform. 
This avoids floating point precision errors — a common issue 
in financial systems.

**Indexes:**
```js
// Single field — for filtering
email, role, isActive, isDeleted, type, category, date, createdBy

// Compound — for common dashboard query patterns
{ date: -1, type: 1 }      // date range + type filter
{ category: 1, type: 1 }   // category breakdown queries
```

**Soft delete via pre-find hook:**
```js
schema.pre(/^find/, function() {
  this.where({ isDeleted: false })
})
```
Deleted documents are automatically excluded from every query 
without changing any service code.

**Audit trail:**
Every record tracks `createdBy` and `updatedBy` referencing 
the user who created or last modified it.

---

## Validation and Reliability

### Input Validation
All requests validated by Zod schemas before reaching 
controllers. Body, query params, and route params are all 
validated in a single middleware pass.

Validation includes:
- Email format with automatic lowercase transform
- Password strength (min 8 chars, uppercase, number)
- MongoDB ObjectId format on all id params
- Enum validation on type, role, category fields
- Pagination limit capped at 100
- Cross-field validation — category must match type
- Date range validation — from must be before to
- Empty update protection — PATCH must include at least one field

### Error Handling
All errors flow through a global error handler. Unknown errors 
(Mongoose errors, crashes) are normalized into ApiError shape 
before reaching the client — no raw Node.js errors ever exposed.
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Validation failed",
  "success": false,
  "errors": {
    "category": ["Category does not match record type"]
  }
}
```

Stack traces logged in development only, never sent to client.

### Protection Against Invalid Operations
- Invalid ObjectId caught at validation layer before DB query
- Admin self-modification blocked at service layer
- Inactive users blocked at authenticate middleware
- Duplicate email returns 409 before attempting DB insert
- JWT errors handled by specific error name for precise 401

---

## Assumptions and Tradeoffs

**Assumptions:**
1. Only ADMINs can create financial records. ANALYSTs are 
   read-only on records.
2. VIEWER role can only access dashboard summaries — not raw 
   records. This differs slightly from the suggested definition 
   but makes more logical sense: a viewer should see aggregated 
   insights, not individual transactions.
3. Public registration always assigns VIEWER. Role elevation 
   requires an admin action.
4. All monetary amounts are treated as rupees on input/output. 
   Paise conversion is handled transparently in the service layer.

**Tradeoffs:**
- MongoDB chosen over relational DB for flexibility with 
  financial categories. Tradeoff is weaker relational integrity, 
  mitigated by Mongoose schema validation and application-level 
  checks.
- Soft delete adds query complexity (isDeleted filter on every 
  query) but preserves audit trail which is important for 
  financial data.
- Aggregation pipelines are more complex to write than JS loops 
  but scale to large datasets without performance degradation.

---

## Additional Thoughtfulness

- **Savings rate** calculated in dashboard summary — shows what 
  percentage of income is saved each period
- **Category percentages** in breakdown — each category shows 
  its share of total spending
- **Net per period** in trends — each month shows whether it 
  was profitable
- **Weekly and monthly** grouping in trends via single pipeline
- **Applied filters** returned in meta — frontend knows exactly 
  what filters produced the result
- **Postman collection** included — all endpoints pre-configured 
  with unchecked optional params for easy testing
- **Seed script** creates 3 users and 20 records across 4 months 
  so dashboard analytics show meaningful data immediately