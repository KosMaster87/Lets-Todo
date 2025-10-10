# Backend Copilot Instructions - Let's Todo API

## 📂 Project Structure

```
lets-todo-api/
├── server.js               # Express app setup + environment detection
├── db.js                   # Pool management (core, user, guest pools)
├── ecosystem.config.cjs    # PM2 multi-environment configuration
├── config/
│   ├── environment.js      # Environment detection + configuration
│   └── env/                # Environment files (.env.development, etc.)
├── deploy/                 # Deployment scripts + Nginx configs
├── routing/                # API routers (auth, session, todos)
├── middleware/             # poolMiddleware.js for session-db assignment
├── services/               # emailService.js for password reset emails
└── scripts/                # Database setup, migration, and cleanup scripts
    ├── setup-multi-env-db.js     # Multi-environment database setup
    ├── add-last-login-column.js  # Database migration script
    ├── cleanup-server-db.sh      # Complete database cleanup (server)
    ├── cleanup-inactive-users.sh # Smart cleanup for inactive users
    └── dev-clean-local-db.js     # Local development cleanup
```

## 💻 Coding Standards

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

