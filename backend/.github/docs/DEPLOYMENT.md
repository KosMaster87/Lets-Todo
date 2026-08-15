# Let's Todo API - Complete Setup & Deployment Guide

**Comprehensive guide covering local development setup, debugging tools, and production deployment** for the Let's Todo API with multi-environment support and SSL automation.

## � Table of Contents

- [🏠 Local Development Setup](#-local-development-setup)
- [🔧 Development Environment](#-development-environment)
- [🗄️ Database Development](#️-database-development)
- [🔍 Debugging & Troubleshooting](#-debugging--troubleshooting)
- [�🚀 Production Deployment](#-production-deployment)
- [🎛️ Environment Configuration](#️-environment-configuration)

---

# 🏠 Local Development Setup

## 🔧 Initial Development Setup

### MariaDB Installation (Fedora)

```bash
# Install MariaDB server
sudo dnf install mariadb mariadb-server

# Start and enable service
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure installation (optional for development)
sudo mysql_secure_installation
# - Set root password (or leave empty for dev)
# - Remove anonymous users: Y
# - Disallow root login remotely: Y
# - Remove test database: Y
# - Reload privilege tables: Y

# Test connection
sudo mysql
mysql -u root -p
# Or without password: mysql -u root
```

### MariaDB Installation (Other Systems)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mariadb-server mariadb-client

# macOS (Homebrew)
brew install mariadb
brew services start mariadb

# Windows
# Download MariaDB installer from mariadb.org
```

### Project Setup

```bash
# Clone repository (monorepo)
git clone https://github.com/KosMaster87/lets-todo.git
cd lets-todo/backend

# Install dependencies (from lets-todo/ root)
pnpm install

# Copy environment files from examples
cp config/env/.env.development.example config/env/.env.development
cp ecosystem.config.cjs.example ecosystem.config.cjs

# Setup development database (multi-environment support)
npm run dev:db                    # Development setup (default)
NODE_ENV=feature npm run dev:db   # Feature environment setup
NODE_ENV=staging npm run dev:db   # Staging environment setup

# Start development server
npm run dev
```

---

# 🗄️ Database Development

## Multi-Environment Database Management

The `setup-dev-db.js` script supports all environments:

```bash
# Development environment (default)
npm run dev:db
# Creates: todos_users_dev, test@dev.local, sample todos

# Feature environment
NODE_ENV=feature npm run dev:db
# Creates: todos_users, test@feature.local, empty todos

# Staging environment
NODE_ENV=staging npm run dev:db
# Creates: todos_users, test@staging.local, empty todos

# Production environment (no test data)
NODE_ENV=production npm run dev:db
# Creates: todos_users only, no test user
```

## Development Database Management

```bash
# Reset development database (clean start)
npm run dev:db

# Manual database operations
mysql -u root -p

# Show all databases (including user/guest DBs)
mysql -e "SHOW DATABASES LIKE 'todos_%';"

# Count user databases
mysql -e "SELECT COUNT(*) AS user_dbs FROM information_schema.SCHEMATA WHERE SCHEMA_NAME LIKE 'todos_user_%';"

# Count guest databases
mysql -e "SELECT COUNT(*) AS guest_dbs FROM information_schema.SCHEMATA WHERE SCHEMA_NAME LIKE 'todos_guest_%';"
```

## User Database Inspection

```bash
# View all registered users
mysql todos_users_dev -e "SELECT id, email, db_name, FROM_UNIXTIME(created/1000) as created_at FROM users;"

# Check specific user's todos
mysql todos_user_123 -e "SELECT id, title, completed, FROM_UNIXTIME(created/1000) as created_at FROM todos;"

# Find user by email and check their database
USER_DB=$(mysql todos_users_dev -sN -e "SELECT db_name FROM users WHERE email='user@example.com';")
mysql $USER_DB -e "SELECT * FROM todos;"
```

---

# 🔍 Debugging & Troubleshooting

## Environment Detection Debugging

```bash
# Check which environment is detected
npm run dev  # Shows environment detection in startup logs

# Force specific environment
NODE_ENV=production npm start
NODE_ENV=feature npm start
NODE_ENV=staging npm start

# Debug environment variables
node -e "
const dotenv = require('dotenv');
dotenv.config({ path: 'config/env/.env.development' });
console.log('Environment variables:', process.env);
"
```

## Database Connection Debugging

```bash
# Check MariaDB status
sudo systemctl status mariadb

# Check MariaDB process and ports
sudo netstat -tlnp | grep :3306
ps aux | grep mariadb

# View MariaDB error log
sudo tail -f /var/log/mariadb/mariadb.log

# Test database connection with specific user
mysql -h 127.0.0.1 -u root -p -e "SELECT 1;"
```

## Development Workflows

### Full Development Cycle

```bash
# 1. Start fresh
npm run dev:db          # Reset database
npm run dev             # Start server with auto-reload

# 2. Test user registration flow
curl -c cookies.txt -X POST http://127.0.0.1:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"dev123"}'

# 3. Test user session
curl -b cookies.txt http://127.0.0.1:3000/api/session/validate

# 4. Create some todos
curl -b cookies.txt -X POST http://127.0.0.1:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Development Todo","description":"Testing API"}'

# 5. Test guest session
curl -c guest_cookies.txt -X POST http://127.0.0.1:3000/api/session/guest

# 6. Verify session isolation
curl -b guest_cookies.txt http://127.0.0.1:3000/api/todos  # Should be empty
```

### Frontend Integration Testing

```bash
# Start backend
npm run dev

# Start frontend (in separate terminal)
cd ../frontend
# Use VS Code Live Server on 127.0.0.1:5500

# Test cross-origin requests with browser dev tools
# Check Network tab for CORS headers
# Verify cookies are set and sent correctly
```

## Common Development Issues

### MariaDB Issues

**Issue**: MariaDB won't start

```bash
# Check status and logs
sudo systemctl status mariadb
sudo journalctl -u mariadb -f

# Common fixes
sudo systemctl stop mariadb
sudo systemctl start mariadb
```

**Issue**: Connection refused

```bash
# Check if MariaDB is listening
sudo netstat -tlnp | grep :3306

# Restart service
sudo systemctl restart mariadb
```

**Issue**: Access denied for user 'root'

```bash
# Reset root password
sudo mysql_secure_installation

# Or login without password and set one
sudo mysql -u root
# ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
# FLUSH PRIVILEGES;
```

### Node.js Issues

**Issue**: npm run dev:db fails

```bash
# Check environment file exists
ls -la config/env/.env.development

# Run with debugging
DEBUG=* npm run dev:db

# Check database connection manually
mysql -u root -p -e "SELECT 1;"
```

**Issue**: Cookies not working with frontend

```bash
# Check CORS configuration
curl -I http://127.0.0.1:3000/api/session/validate

# Verify frontend is on correct port
# Frontend should be on 127.0.0.1:5500
# Backend should be on 127.0.0.1:3000
```

---

# 🚀 Production Deployment

## Environment Overview

| Environment     | Domain                          | Port | Purpose                       |
| --------------- | ------------------------------- | ---- | ----------------------------- |
| **Development** | `127.0.0.1:3000`                | 3000 | Local development             |
| **Feature**     | `lets-todo-api-feat.dev2k.org`  | 3003 | Feature development & testing |
| **Staging**     | `lets-todo-api-stage.dev2k.org` | 3004 | Pre-production testing        |
| **Production**  | `lets-todo-api.dev2k.org`       | 3002 | Live production system        |

## ⚡ Quick Deployment

**3 Simple Steps:**

```bash
# 1. Create deployment package (local)
./deploy/create-step-deployment.sh
cd ./deploy

# 2. Upload to server
scp lets-todo-step-deployment_*.tar.gz root@YOUR_SERVER_IP:/tmp/

# 3. Deploy (on server)
ssh root@YOUR_SERVER_IP
cd /tmp

# Create directory and extract package
mkdir -p step-by-step-package
tar -xzf lets-todo-step-deployment_*.tar.gz -C step-by-step-package/
cd step-by-step-package/

# Deploy specific environment or all
sudo ./deploy.sh prod    # → https://lets-todo-api.dev2k.org
sudo ./deploy.sh feat    # → https://lets-todo-api-feat.dev2k.org
sudo ./deploy.sh stage   # → https://lets-todo-api-stage.dev2k.org
sudo ./deploy.sh all     # → All environments

# Later cleanup (optional)
cd .. && rm -rf step-by-step-package/
```

**🎉 Done!** Your API is live with SSL certificates!

---

## 🏗️ Modular System

### Template Architecture

```
deployment-templates/            (Source Templates)
├── nginx-setup                 # HTTP-only Nginx for SSL certificates
├── ssl-setup                   # SSL certificates + HTTPS configs
├── project-files-copy          # Application files deployment
├── nodejs-dependencies         # npm install + verification
├── database-setup              # MySQL databases + schema
├── pm2-setup                   # Process management
├── create-user.sh              # System user creation
├── firewall-cloud.sh           # Firewall setup for cloud
├── firewall-selfhosted.sh      # Firewall setup for self-hosted
└── transfer-keys.sh            # SSH key transfer utility

step-by-step-package/            (Generated Package)
├── deploy.sh                   # Main deployment script
├── [application files]         # Your app code
├── scripts/                    # Node.js scripts (setup-dev-db.js)
└── templates/                  # Generated from templates above
    ├── nginx-setup.sh
    ├── ssl-setup.sh
    ├── project-files-copy.sh
    ├── nodejs-dependencies.sh
    ├── database-setup.sh
    ├── pm2-setup.sh
    ├── create-user.sh
    ├── firewall-cloud.sh
    ├── firewall-selfhosted.sh
    └── transfer-keys.sh
```

### What Each Step Does

**Fully Automated Steps:**

1. **Nginx HTTP Setup** - Creates HTTP configs for SSL certificate requests
2. **SSL Certificates** - Requests Let's Encrypt certificates and enables HTTPS
3. **Project Files** - Copies your app files with correct permissions (includes `scripts/` directory)
4. **Dependencies** - Installs npm packages and verifies critical modules
5. **Database Setup** - 🆕 **Fully automated** using existing `setup-dev-db.js` script with environment detection
6. **PM2 Processes** - Starts and configures process management with `.cjs` config files

**🔧 Smart Automation Features:**

- **Environment Detection**: Automatically maps `feat` → `feature`, `stage` → `staging` for correct `.env` file loading
- **Interactive Template Skipping**: Templates like `create-user.sh`, `firewall-*.sh` are automatically skipped during deployment
- **Database Auto-Creation**: Uses your existing Node.js script for consistent database setup across environments

**Optional Manual Steps (Skipped Automatically):**

- **create-user.sh** - System user creation (first-time setup only)
- **firewall-cloud.sh** - Cloud firewall configuration
- **firewall-selfhosted.sh** - Self-hosted firewall configuration
- **transfer-keys.sh** - SSH key transfer utility

> **💡 Note**: Interactive templates are automatically detected and skipped during deployment. They're shown as "run manually if needed" at the end of deployment.

---

## 🎛️ Configuration

### Before Deployment

Update these values in the generated `deploy.sh`:

```bash
# Domain configuration
PROD_DOMAIN="lets-todo-api.dev2k.org"
FEAT_DOMAIN="lets-todo-api-feat.dev2k.org"
STAGE_DOMAIN="lets-todo-api-stage.dev2k.org"
ADMIN_EMAIL="your.email@domain.com"

# Database configuration
DB_ROOT_PASSWORD="your_root_password"
DB_USER="dev2k"
DB_PASSWORD="your_db_password"
```

---

## 🔧 Template Development

### Adding New Deployment Steps

1. **Create template:** [`deploy/deployment-templates/my-new-step`](../../deploy/deployment-templates/)
2. **Add function:** `setup_my_feature() { ... }`
3. **Regenerate package:** `./deploy/create-step-deployment.sh`
4. **Deploy:** Template automatically included!

The main script auto-detects and executes any new templates you add.

---

## 🔒 Security Features

- **Multi-domain SSL** (www support for production)
- **Environment isolation** (separate databases and processes)
- **Security headers** (HSTS, XSS protection, etc.)
- **Rate limiting** (API protection)
- **File permissions** (dev2k user isolation)

---

**🎉 Simple, Modular, Secure!**

_Need the old complex deployment system? Check git history for the previous version._
