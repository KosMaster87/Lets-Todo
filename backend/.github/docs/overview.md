```ascii
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ LETS-TODO API - DEVELOPER BRANCH ARCHITECTURE │
 │ Development & Experimental Features │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ GLOBAL IMPORTS & DEPS │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ express → Web Framework (app, Router) │
 │ cors → Cross-Origin Resource Sharing │
 │ cookieParser → Cookie management for auth │
 │ mysql2/promise → Database Connection Pools │
 │ dotenv → Environment Configuration │
 │ nodemon → Auto-restart on file changes (dev) │
 │ debugLog() → Enhanced logging for development │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ SERVER.JS (Developer Entry Point) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ const app = express() │
 │ │ │
 │ ├── cookieParser() │
 │ ├── express.json() │
 │ ├── cors({ origins, credentials }) │
 │ ├── debugLog() → Enhanced development logging │
 │ │ │
 │ ├── /api → authRouter (registration, login, password reset)│
 │ ├── assignPoolMiddleware → User database assignment │
 │ ├── enhancedPoolMiddleware→ Pool caching & optimization │
 │ ├── /api/todos → todosRouter (CRUD operations) │
 │ └── /api/user → userRouter (profile, preferences) │
 │ │
 │ Development Features: │
 │ ├── � Hot reload with nodemon │
 │ ├── Enhanced error logging │
 │ ├── Experimental endpoint testing │
 │ └── Database query debugging │
 │ │
 │ app.listen(ENV.HTTP_PORT, ENV.HTTP_HOST) │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ CONFIG/ENVIRONMENT.JS (Dev Config) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ ENVIRONMENT → "development" | "staging" | "production" │
 │ ENV → Dynamic config object with dev overrides │
 │ │ │
 │ Development Settings: │
 │ ├── HTTP_HOST → "0.0.0.0" (accessible from network) │
 │ ├── HTTP_PORT → 3000 (configurable via ENV) │
 │ ├── DB_HOST → "localhost" (or Docker container) │
 │ ├── DB_USER → "lets_todo_user" │
 │ ├── DB_PASSWORD → from .env file (secure storage) │
 │ ├── CORS_ORIGINS → ["http://localhost:3001", "http://localhost:5173"] │
 │ └── COOKIE_DOMAIN → "localhost" (dev) | domain (prod) │
 │ │
 │ Development Tools: │
 │ ├── debugLog() → Enhanced conditional logging │
 │ ├── DB_DEBUG → Query logging toggle │
 │ ├── LOG_LEVEL → "debug" | "info" | "warn" | "error" │
 │ └── HOT_RELOAD → Nodemon auto-restart │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ DB.JS (Advanced Pool Management) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ userPool → mysql2.createPool() for main/auth DB │
 │ userPools → Map<userId, Pool> for isolated user DBs │
 │ │ │
 │ Development Features: │
 │ ├── Dynamic pool creation per user/guest session │
 │ ├── Pool health monitoring & statistics │
 │ ├── Automatic pool cleanup for inactive users │
 │ ├── Connection debugging & logging │
 │ ├── Pool warming strategies │
 │ └── Error recovery & reconnection logic │
 │ │
 │ Experimental Features: │
 │ ├── Connection pooling optimization │
 │ ├── Performance metrics collection │
 │ └── Database-per-session security testing │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ MIDDLEWARE/POOLMIDDLEWARE.JS │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ assignPoolMiddleware() → Sets req.pool for authenticated users │
 │ enhancedPoolMiddleware() → Caches and optimizes pool assignment │
 │ │ │
 │ ├── getUserDbName() → Helper: Get user's database name │
 │ ├── getOrCreateUserPool() → Helper: Pool caching logic │
 │ └── clearInvalidUserCookie() → Helper: Cookie cleanup │
 │ │
 │ Checks req.cookies.userId → Authenticates requests │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ ROUTING/AUTHROUTER.JS │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ const router = Router() │
 │ │ │
 │ ├── POST /register → User registration │
 │ ├── POST /login → User authentication │
 │ ├── POST /logout → Session termination │
 │ ├── POST /forgot-password → Password reset email │
 │ ├── POST /reset-password → Password reset execution │
 │ └── GET /validate-token → Token validation │
 │ │
 │ Helper Functions imported from routing/helpers/ │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ ROUTING/TODOSROUTER.JS │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ const router = Router() │
 │ │ │
 │ ├── executeQuery() → Helper: DB query with error handling │
 │ └── buildPatchQuery() → Helper: Dynamic PATCH SQL builder │
 │ │
 │ Routes: │
 │ ├── GET / → All todos │
 │ ├── GET /trash → Trashed todos │
 │ ├── GET /:id → Single todo │
 │ ├── POST / → Create todo │
 │ ├── PATCH /:id → Update todo (partial) │
 │ ├── POST /:id/trash → Move to trash │
 │ ├── POST /:id/restore → Restore from trash │
 │ └── DELETE /:id → Permanent delete │
 │ │
 │ Uses req.pool from middleware │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ ROUTING/HELPERS/ (Utilities) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ emailHelpers.js → Email validation & services │
 │ authHelpers.js → Password hashing, token generation │
 │ cookieHelpers.js → Cookie management utilities │
 │ dbHelpers.js → Database operation helpers │
 │ responseHelpers.js → Standardized API responses │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ SERVICES/EMAILSERVICE.JS │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ nodemailer transporter → SMTP configuration │
 │ │ │
 │ ├── setupGmailTransporter() → Gmail SMTP setup │
 │ ├── setupOutlookTransporter() → Outlook SMTP setup │
 │ ├── setupCustomSmtpTransporter() → Custom SMTP setup │
 │ └── sendPasswordResetEmail() → Password reset email sender │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ ENHANCED REQUEST FLOW (Dev Mode) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ 1⃣ Client Request → Express App (server.js) + Request ID logging │
 │ │ │
 │ 2⃣ cookieParser → Parse & validate cookies + debug logging │
 │ │ │
 │ 3⃣ Route Matching → /api/* routes with enhanced error handling │
 │ │ │ │
 │ │ ├── /api/auth/* → authRouter │
 │ │ ├── /api/todos/* → middleware → todosRouter │
 │ │ ├── /api/user/* → userRouter │
 │ │ └── /api/debug/* → development endpoints │
 │ │ │
 │ 4⃣ Enhanced Middleware → Pool assignment with monitoring │
 │ │ │ │
 │ │ ├── Debug: Log request details │
 │ │ ├── Validate req.cookies.userId │
 │ │ ├── Query user database name │
 │ │ ├── Get/Create user-specific pool │
 │ │ ├── Log pool statistics │
 │ │ └── Set req.pool + metadata │
 │ │ │
 │ 5⃣ Router Operations → Enhanced CRUD with debugging │
 │ │ │ │
 │ │ ├── Log SQL queries (if DB_DEBUG=true) │
 │ │ ├── executeQuery() with timing metrics │
 │ │ ├── Enhanced error handling & logging │
 │ │ └── Performance monitoring │
 │ │ │
 │ 6⃣ Enhanced Response ← JSON + debug headers + timing info │
 │ │
 │ Development Additions: │
 │ ├── Request/Response timing │
 │ ├── Memory usage monitoring │
 │ ├── SQL query logging & analysis │
 │ ├── Enhanced error stack traces │
 │ └── Performance metrics collection │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ GLOBAL VARIABLES (Developer Mode) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ ENVIRONMENT → Current environment ("development" for this branch) │
 │ ENV → Enhanced config object with dev-specific settings │
 │ app → Express application with debugging middleware │
 │ userPool → Main database connection pool with monitoring │
 │ userPools → Map of user-specific pools with cleanup logic │
 │ authRouter → Authentication routes with enhanced logging │
 │ todosRouter → Todos CRUD with query debugging │
 │ � userRouter → User profile & preferences management │
 │ │
 │ Development-Only Variables: │
 │ ├── requestMetrics → Request timing & performance data │
 │ ├── queryLogger → SQL query logging & analysis │
 │ ├── errorTracker → Enhanced error tracking & reporting │
 │ ├── poolMonitor → Connection pool health monitoring │
 │ └── reloadWatcher → File change monitoring for hot reload │
 │ │
 │ Feature Flags (Experimental): │
 │ ├── ENABLE_QUERY_CACHE → SQL result caching │
 │ ├── ENABLE_RATE_LIMITING → Advanced rate limiting │
 │ ├── ENABLE_METRICS_API → Performance metrics endpoint │
 │ └── ENABLE_DEBUG_ROUTES → Development debugging endpoints │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ DEVELOPMENT TOOLKIT │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ Development Scripts (package.json): │
 │ ├── pnpm run dev → Start with nodemon (auto-reload) │
 │ ├── pnpm run debug → Start with --inspect flag │
 │ ├── pnpm run test → Run test suite (if available) │
 │ ├── pnpm run db:setup → Initialize development database │
 │ └── pnpm run db:reset → Reset & seed development data │
 │ │
 │ Debugging Features: │
 │ ├── /api/debug/pools → View active connection pools │
 │ ├── /api/debug/metrics → Performance & timing metrics │
 │ ├── /api/debug/queries → Recent SQL queries log │
 │ ├── /api/debug/errors → Error log & stack traces │
 │ └── /api/debug/health → System health check │
 │ │
 │ Monitoring & Logging: │
 │ ├── Enhanced console.log with timestamps │
 │ ├── Request/response timing │
 │ ├── Automatic error reporting │
 │ ├── Database query performance tracking │
 │ └── Real-time pool status monitoring │
 │ │
 │ Experimental Features Testing: │
 │ ├── A/B testing framework setup │
 │ ├── Feature flag management │
 │ ├── Performance benchmarking tools │
 │ └── Database optimization testing │
 └─────────────────────────────────────────────────────────────────────────────────┘
```
