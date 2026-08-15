```bash
SCRIPTS STRUCTURE
════════════════════

LOCAL DEVELOPMENT (127.0.0.1):
├── dev-clean-local-db.js - Deletes only local DBs
└── setup-multi-env-db.js - NODE_ENV=development

SERVER (feat/stage/prod):
├── cleanup-server-db.sh - Deletes server DBs (installed in /usr/local/bin/)
└── setup-multi-env-db.js - NODE_ENV=feat|staging|production
```

```bash
# The Bash template handles system-level setup (User, Permissions), while the Node.js script handles application-level database creation.
# Deployment Process:
create-step-deployment.sh
  └── database-setup (Bash Template)
      └── setup-multi-env-db.js (Node.js Logic)
```
