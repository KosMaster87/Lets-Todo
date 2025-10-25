# Developer Branch Copilot Instructions - Let's Todo API

## Development Environment Context

This is the **main development branch** for the Let's Todo API backend. This branch serves as:

- Primary development environment for API features
- Integration point for backend improvements
- Testing ground for database optimizations
- Reference implementation for Node.js/Express patterns

## 📂 Project Structure

```
lets-todo-api/
├── server.js                     # Express app setup + environment detection
├── db.js                         # Pool management (core, user, guest pools)
├── ecosystem.config.cjs          # PM2 multi-environment configuration
├── config/
│   ├── environment.js            # Environment detection + configuration
│   └── env/                      # Environment files (.env.development, etc.)
├── deploy/                       # Deployment scripts + Nginx configs
├── routing/                      # API routers (auth, session, todos)
├── middleware/                   # poolMiddleware.js for session-db assignment
├── services/                     # emailService.js for password reset emails
└── scripts/                      # Database setup, migration, and cleanup scripts
    ├── setup-multi-env-db.js     # Multi-environment database setup
    ├── add-last-login-column.js  # Database migration script
    ├── cleanup-server-db.sh      # Complete database cleanup (server)
    ├── cleanup-inactive-users.sh # Smart cleanup for inactive users
    └── dev-clean-local-db.js     # Local development cleanup
```

## 💻 Development Coding Standards

### JavaScript Function Guidelines

- Each function may be a maximum of 14 lines long.
- Each function should have only one single, clearly defined task.
- Split complex functions into smaller helper functions.
- Do not use nested functions.
- When exceeding the line limit: split function into multiple specialized functions.
- Prefer arrow functions, except for constructors or event handlers that need `this`.

### ES6 Module Pattern

```javascript
// Always use ES6 imports/exports
import { ENV, debugLog } from "./config/environment.js";
import { corePool } from "./db.js";
export { router as authRouter };
```

## 🔧 Development-Specific Guidelines

### Database Development

- **Connection Pooling**: Use appropriate pool (core, user, guest) via middleware
- **Environment Separation**: Development/staging/production database isolation
- **Migration Scripts**: Use scripts/ folder for database changes
- **Debug Logging**: Comprehensive SQL query logging in development

### API Development

- **Route Organization**: Separate routers in routing/ folder
- **Middleware Chain**: Session → Pool → Route logic
- **Error Handling**: Detailed error responses for development
- **Request Logging**: Full request/response cycle logging

### Security in Development

- **Environment Variables**: Use .env files for sensitive config
- **SQL Injection**: Always use parameterized queries
- **Authentication**: Cookie-based sessions with secure settings
- **Input Validation**: Validate all inputs at router level

## 🏗️ Architecture Patterns

### Multi-Environment Database Design

```javascript
// Environment-specific database pools
const pools = {
  development: createPool(devConfig),
  staging: createPool(stageConfig),
  production: createPool(prodConfig),
};

// Pool middleware assigns correct pool based on session
app.use(poolMiddleware);
```

### Router Structure Pattern

```javascript
// routing/todosRouter.js
import { Router } from "express";

const router = Router();

// Helper function within router file
const executeQuery = async (pool, res, sql, params, successCallback) => {
  try {
    const [result] = await pool.query(sql, params);
    return successCallback(result);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

// CRUD routes using helper functions
router.get('/', async (req, res) => {
  const sql = 'SELECT * FROM todos WHERE user_id = ?';
  await executeQuery(req.pool, res, sql, [req.session.userId],
    (result) => res.json(result)
  );
});

export { router };
````

````

### Database Helper Pattern

```javascript
### Database Helper Pattern
```javascript
// routing/helpers/authHelpers.js - Single responsibility functions
export const validateRegisterInput = (email, password) => {
  if (!email || !password) {
    return { isValid: false, error: "Email and password are required" };
  }
  return { isValid: true };
};

export const findUserByEmail = async (pool, email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await pool.execute(query, [email]);
  return rows[0] || null;
};

export const createUser = async (pool, userData) => {
  const query = 'INSERT INTO users (email, password_hash) VALUES (?, ?)';
  const [result] = await pool.execute(query, [userData.email, userData.hash]);
  return result.insertId;
};
````

````

## 🛠️ Development Workflow

### Environment Setup

1. **Database Initialization**

   ```bash
   npm run setup-db    # Creates multi-environment databases
   npm run migrate     # Runs migration scripts
````

2. **Development Server**
   ```bash
   npm run dev         # Nodemon with environment detection
   npm run debug       # Node inspector debugging
   ```

### Testing Strategy

- **Manual API Testing**: Postman/Insomnia collections
- **Database Testing**: Separate test database per environment
- **Error Testing**: Comprehensive error scenario testing
- **Performance Testing**: Query optimization and load testing

### Debugging Tools

- **SQL Query Logging**: All queries logged in development
- **Request/Response Logging**: Full HTTP cycle visibility
- **Pool Status Monitoring**: Connection pool health checks
- **Environment Verification**: Clear environment detection logging

## 📊 Database Management

### Pool Strategy

```javascript
// db.js - Multi-pool architecture
export const pools = {
  core: createPool(coreConfig), // System operations
  user: createPool(userConfig), // User data
  guest: createPool(guestConfig), // Guest sessions
};

// Pool selection via middleware
export const getPoolForRequest = (req) => {
  return req.session?.userId ? pools.user : pools.guest;
};
```

### Migration Pattern

```javascript
// scripts/add-feature-table.js
export const migrateUp = async (pool) => {
  await pool.execute(createTableQuery);
  console.log("✅ Feature table created");
};

export const migrateDown = async (pool) => {
  await pool.execute(dropTableQuery);
  console.log("🗑️ Feature table dropped");
};
```

## 🔐 Security Development

### Authentication Flow

```javascript
// Session-based auth with environment-aware cookies
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    secure: ENV.isProduction,
    domain: ENV.cookieDomain,
    httpOnly: true,
  })
);
```

### Input Sanitization

```javascript
// Always validate and sanitize inputs
export const validateTodoInput = (data) => {
  return {
    title: sanitizeString(data.title, 200),
    content: sanitizeString(data.content, 5000),
    dueDate: validateDate(data.dueDate),
  };
};
```

## 📝 JSDoc Standards

```javascript
/**
 * Creates a new todo item in the database
 * @async
 * @param {Object} pool - Database connection pool
 * @param {Object} todoData - Todo data object
 * @param {string} todoData.title - Todo title (max 200 chars)
 * @param {string} todoData.content - Todo content (max 5000 chars)
 * @param {number} userId - User ID from session
 * @returns {Promise<Object>} Created todo with generated ID
 * @throws {Error} When database operation fails
 */
export const createTodo = async (pool, todoData, userId) => {
  // Implementation within 14 lines
};
```

## 🚀 Performance Guidelines

### Query Optimization

- Use prepared statements for repeated queries
- Implement proper indexing strategies
- Monitor slow query logs in development
- Use connection pooling effectively

### Memory Management

- Close database connections properly
- Monitor pool connection counts
- Implement request timeout handling
- Use streaming for large result sets

## 🧪 Experimental Features

Development branch allows:

- **New Authentication Methods**: OAuth, JWT experiments
- **Database Alternatives**: Testing different storage solutions
- **Caching Strategies**: Redis integration experiments
- **API Versioning**: Testing v2 API implementations
- **WebSocket Integration**: Real-time feature experiments
