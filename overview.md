```ascii
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                    🚀 LETS-TODO API ARCHITECTURE OVERVIEW                       │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                🌐 GLOBAL IMPORTS                                │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │  📦 express           → Web Framework (app, Router)                             │
 │  🔒 cors              → Cross-Origin Resource Sharing                           │
 │  🍪 cookieParser      → Cookie-Management für Auth                              │
 │  🗄️  mysql2/promise   → Database Connection Pools                               │
 │  📂 dotenv            → Environment Configuration                               │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                            📡 SERVER.JS (Entry Point)                           │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  🎛️  const app = express()                                                      │
 │  │                                                                              │
 │  ├── 🍪 cookieParser()                                                          │
 │  ├── 📄 express.json()                                                          │
 │  ├── 🌐 cors({ origins, credentials })                                          │
 │  │                                                                              │
 │  ├── 📍 /api          → authRouter                                              │
 │  ├── 🛡️  assignPoolMiddleware                                                   │
 │  ├── ⚡ enhancedPoolMiddleware                                                  │
 │  └── 📍 /api/todos    → todosRouter                                             │
 │                                                                                 │
 │  🚀 app.listen(ENV.HTTP_PORT, ENV.HTTP_HOST)                                    │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                          ⚙️  CONFIG/ENVIRONMENT.JS                              │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  🌍 ENVIRONMENT       → "development" | "feature" | "staging" | "production"    │
 │  📊 ENV               → Dynamic config object                                   │
 │  │                                                                              │
 │  ├── 🏠 HTTP_HOST     → "0.0.0.0"                                               │
 │  ├── 🚪 HTTP_PORT     → 3000                                                    │
 │  ├── 🗄️  DB_HOST      → "localhost"                                             │
 │  ├── 🔗 DB_USER       → "lets_todo_user"                                        │
 │  ├── 🔑 DB_PASSWORD   → from .env file                                          │
 │  ├── 🌐 CORS_ORIGINS  → ["http://localhost:3001"]                               │
 │  └── 🍪 COOKIE_DOMAIN → "localhost"                                             │
 │                                                                                 │
 │  🔧 debugLog()        → Conditional logging function                            │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                            🗄️  DB.JS (Database Pools)                           │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  🏊 userPool          → mysql2.createPool() for main DB                         │
 │  📚 userPools         → Map<userId, Pool> for user-specific DBs                 │
 │  │                                                                              │
 │  └── 🔄 Dynamic pool creation per user/guest                                    │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                        🛡️  MIDDLEWARE/POOLMIDDLEWARE.JS                         │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  🎯 assignPoolMiddleware()      → Sets req.pool for authenticated users         │
 │  ⚡ enhancedPoolMiddleware()    → Caches and optimizes pool assignment          │
 │  │                                                                              │
 │  ├── 🔍 getUserDbName()        → Helper: Get user's database name               │
 │  ├── 🏊 getOrCreateUserPool()  → Helper: Pool caching logic                     │
 │  └── 🧹 clearInvalidUserCookie() → Helper: Cookie cleanup                       │
 │                                                                                 │
 │  🔒 Checks req.cookies.userId → Authenticates requests                          │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                           📍 ROUTING/AUTHROUTER.JS                              │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  🔐 const router = Router()                                                     │
 │  │                                                                              │
 │  ├── POST /register          → User registration                                │
 │  ├── POST /login             → User authentication                              │
 │  ├── POST /logout            → Session termination                              │
 │  ├── POST /forgot-password   → Password reset email                             │
 │  ├── POST /reset-password    → Password reset execution                         │
 │  └── GET  /validate-token    → Token validation                                 │
 │                                                                                 │
 │  🛠️  Helper Functions imported from routing/helpers/                            │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                          📝 ROUTING/TODOSROUTER.JS                              │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  📋 const router = Router()                                                     │
 │  │                                                                              │
 │  ├── 🔧 executeQuery()       → Helper: DB query with error handling             │
 │  └── ⚡ buildPatchQuery()    → Helper: Dynamic PATCH SQL builder                │
 │                                                                                 │
 │  📍 Routes:                                                                     │
 │  ├── GET    /               → All todos                                         │
 │  ├── GET    /trash          → Trashed todos                                     │
 │  ├── GET    /:id            → Single todo                                       │
 │  ├── POST   /               → Create todo                                       │
 │  ├── PATCH  /:id            → Update todo (partial)                             │
 │  ├── POST   /:id/trash      → Move to trash                                     │
 │  ├── POST   /:id/restore    → Restore from trash                                │
 │  └── DELETE /:id            → Permanent delete                                  │
 │                                                                                 │
 │  💾 Uses req.pool from middleware                                               │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                           🛠️  ROUTING/HELPERS/ (Utilities)                      │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  📧 emailHelpers.js     → Email validation & services                           │
 │  🔐 authHelpers.js      → Password hashing, token generation                    │
 │  🍪 cookieHelpers.js    → Cookie management utilities                           │
 │  🗄️  dbHelpers.js       → Database operation helpers                            │
 │  📤 responseHelpers.js  → Standardized API responses                            │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                            📧 SERVICES/EMAILSERVICE.JS                          │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  📮 nodemailer transporter → SMTP configuration                                 │
 │  │                                                                              │
 │  ├── 📨 setupGmailTransporter()    → Gmail SMTP setup                           │
 │  ├── 📨 setupOutlookTransporter()  → Outlook SMTP setup                         │
 │  ├── 📨 setupCustomSmtpTransporter() → Custom SMTP setup                        │
 │  └── 📧 sendPasswordResetEmail()   → Password reset email sender                │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                              🔄 REQUEST FLOW                                    │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  1️⃣  🌐 Client Request   → Express App (server.js)                              │
 │         │                                                                       │
 │  2️⃣  🍪 cookieParser     → Parse cookies from headers                           │
 │         │                                                                       │
 │  3️⃣  📍 Route Matching   → /api/* → authRouter OR /api/todos/* → middleware     │
 │         │                                                                       │
 │  4️⃣  🛡️  Pool Middleware → assignPoolMiddleware → enhancedPoolMiddleware        │
 │         │                  │                                                    │
 │         │                  ├── Check req.cookies.userId                         │
 │         │                  ├── Query user database name                         │
 │         │                  ├── Get/Create user-specific pool                    │
 │         │                  └── Set req.pool                                     │
 │         │                                                                       │
 │  5️⃣  📋 Todos Router     → Use req.pool for database operations                 │
 │         │                  │                                                    │
 │         │                  ├── executeQuery(req.pool, res, sql, params)         │
 │         │                  └── Return JSON response                             │
 │         │                                                                       │
 │  6️⃣  📤 Client Response  ← JSON data with proper HTTP status                    │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                              🔑 GLOBAL VARIABLES                                │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  🌍 ENVIRONMENT    → Current environment string                                 │
 │  ⚙️  ENV           → Configuration object with all settings                     │
 │  🎛️  app           → Express application instance                               │
 │  🏊 userPool       → Main database connection pool                              │
 │  📚 userPools      → Map of user-specific connection pools                      │
 │  🔐 authRouter     → Authentication routes router                               │
 │  📋 todosRouter    → Todos CRUD operations router                               │
 └─────────────────────────────────────────────────────────────────────────────────┘
```
