# Let's Todo API - Complete Setup & Deployment Guide

**Comprehensive guide covering local development setup, debugging tools, and production
deployment** for the Let's Todo API with multi-environment support.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Database Development](#database-development)
- [Debugging & Troubleshooting](#debugging--troubleshooting)
- [Production Deployment](#production-deployment)

---

# Local Development Setup

## Initial Development Setup

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
git clone https://github.com/KosMaster87/Lets-Todo.git
cd lets-todo

# Install dependencies (workspace root, covers backend + frontend)
pnpm install

# Copy environment file from example
cp backend/config/env/.env.development.example backend/config/env/.env.development

# Setup development database
cd backend
NODE_ENV=development node scripts/setup-multi-env-db.js

# Start development server
pnpm run dev
```

---

# Database Development

## Multi-Environment Database Management

The `scripts/setup-multi-env-db.js` script supports all environments:

```bash
# Development environment (default)
NODE_ENV=development node scripts/setup-multi-env-db.js
# Creates: todos_users_dev, test@dev.local, sample todos

# Staging environment
NODE_ENV=staging node scripts/setup-multi-env-db.js
# Creates: todos_users, test@staging.local, empty todos

# Production environment (no test data)
NODE_ENV=production node scripts/setup-multi-env-db.js
# Creates: todos_users only, no test user
```

## Development Database Management

```bash
# Reset development database (clean start)
pnpm run dev:db

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

# Debugging & Troubleshooting

## Environment Detection Debugging

```bash
# Check which environment is detected
pnpm run dev # Shows environment detection in startup logs

# Force specific environment
NODE_ENV=production pnpm start
NODE_ENV=staging pnpm start

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

In Docker Compose, the equivalent checks target the `lets-todo-mariadb` container instead
of a host service:

```bash
docker compose logs mariadb
docker compose exec mariadb mysql -u root -p -e "SELECT 1;"
docker inspect lets-todo-mariadb --format='{{.State.Health.Status}}'
```

## Development Workflows

### Full Development Cycle

```bash
# 1. Start fresh
pnpm run dev:db # Reset database
pnpm run dev # Start server with auto-reload

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
curl -b guest_cookies.txt http://127.0.0.1:3000/api/todos # Should be empty
```

### Frontend Integration Testing

```bash
# Start backend
pnpm run dev

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

**Issue**: `pnpm run dev:db` fails

```bash
# Check environment file exists
ls -la config/env/.env.development

# Run with debugging
DEBUG=* node scripts/setup-multi-env-db.js

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

# Production Deployment

## Environment Overview

| Environment     | Domain                                    | Port | Purpose                |
| --------------- | ----------------------------------------- | ---- | ---------------------- |
| **Development** | `127.0.0.1:3000`                          | 3000 | Local development      |
| **Staging**     | `staging-lets-todo-api.dev2ksoftware.com` | 3004 | Pre-production testing |
| **Production**  | `lets-todo-api.dev2ksoftware.com`         | 3002 | Live production system |

## Architecture

The backend runs as a Docker container per environment, defined in `docker-compose.yml`
at the `lets-todo/` workspace root (the build context spans the whole monorepo, since the
image needs the shared `pnpm-lock.yaml`). A dedicated `lets-todo-mariadb` container serves
both environments, each with isolated databases/users. NPMplus terminates TLS and
reverse-proxies from `*.dev2ksoftware.com` to the container's published port; the
Cloudflare Tunnel routes public traffic to NPMplus. See the migration plan for the full
Unraid infrastructure setup (NPMplus proxy hosts, Cloudflare Tunnel routes, SSH
forced-command deploy keys).

## Manual Deployment (Unraid host)

```bash
cd lets-todo
cp .env.example .env   # fill in MARIADB_ROOT_PASSWORD, once

# Staging
docker compose up -d --build mariadb backend-staging

# Production
docker compose up -d --build backend-production

# Logs / health
docker compose logs -f backend-production
docker inspect lets-todo-mariadb --format='{{.State.Health.Status}}'
```

## Automated Deployment (CI)

GitHub Actions pushes to `staging`/`main` trigger a deploy job that `rsync`s the source
into a directory on the Unraid host and then runs a tightly scoped SSH forced command
(`docker compose up -d --build <service>` only - no arbitrary shell access) via an
`cloudflared`-tunneled SSH connection, since the GitHub-hosted runner has no direct LAN
route to the Unraid host. See the migration plan's Phase 5 for the workflow and secrets
setup.

## Database Setup (once per environment)

```bash
docker compose exec backend-staging node scripts/setup-multi-env-db.js
docker compose exec backend-production node scripts/setup-multi-env-db.js
```

---

_Looking for the old PM2 + Nginx + tarball deployment system? Check git history before the
Docker migration._
