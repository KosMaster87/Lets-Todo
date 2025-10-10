```bash
📁 SCRIPTS-STRUKTUR
═══════════════════

🏠 LOKALE DEVELOPMENT (127.0.0.1):
├── dev-clean-local-db.js                 - Löscht nur lokale DBs
└── setup-multi-env-db.js                 - NODE_ENV=development

🌐 SERVER (feat/stage/prod):
├── cleanup-server-db.sh                  - Löscht Server-DBs (installiert in /usr/local/bin/)
└── setup-multi-env-db.js                 - NODE_ENV=feat|staging|production
```

```bash
# Das Bash-Template sorgt für System-Level Setup (User, Permissions), während das Node.js Script die Application-Level Datenbank-Erstellung übernimmt.
# Deployment Prozess:
create-step-deployment.sh
  └── database-setup (Bash Template)
      └── setup-multi-env-db.js (Node.js Logic)
```

