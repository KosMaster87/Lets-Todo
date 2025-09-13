# 🚀 Complete Deployment Guide

Comprehensive deployment guide for the Let's Todo API across multiple environments with automated deployment, SSL setup, and monitoring.

## 📋 Quick Reference

| Environment     | Domain                          | Port | Purpose                       |
| --------------- | ------------------------------- | ---- | ----------------------------- |
| **Production**  | `lets-todo-api.dev2k.org`       | 3002 | Live production system        |
| **Feature**     | `lets-todo-api-feat.dev2k.org`  | 3003 | Feature development & testing |
| **Staging**     | `lets-todo-api-stage.dev2k.org` | 3004 | Pre-production testing        |
| **Development** | `127.0.0.1:3000`                | 3000 | Local development             |

## ⚡ Quick Deployment Steps

**Complete First-Time Setup:**

```bash
# 1. Create deployment package (local)
./deploy/create-deployment-package-clean.sh

# 2. Upload to server
scp lets-todo-deployment_*.tar.gz root@YOUR_SERVER_IP:/tmp/

# 3. On server as ROOT
cd /tmp && tar -xzf lets-todo-deployment_*.tar.gz
# List and enter the extracted directory
ls -la | grep lets-todo-deployment
cd $(ls -d lets-todo-deployment_[0-9]* | head -1)  # Robust directory selection
./deploy-root.sh        # Nginx setup
./setup-ssl.sh          # SSL certificates + Database setup (automated)

# 4. Switch to dev2k user (aber bleibe im deployment ordner!)
su - dev2k
# Navigate to the ALREADY EXTRACTED deployment directory (don't extract again!)
cd /tmp/$(ls -d lets-todo-deployment_[0-9]* | head -1)  # Go to directory extracted by root
./deploy-app.sh     # PM2 setup (database already configured by root)

# 5. Back to root for PM2 startup
exit
~/pm2-startup.sh    # PM2 auto-start setup
```

**Updates Only:**

````bash
# For application updates only (as dev2k)
# Don't extract - go to already extracted directory!
cd /tmp/$(ls -d lets-todo-deployment_[0-9]* | head -1)  # Robust directory selection
./deploy-app.sh
```## 🎯

````

**🎉 Done!** Your API is live at `https://lets-todo-api.dev2k.org`

---

## 🚀 Detailed Deployment Process

### Multi-User Server Architecture

This deployment uses a **two-user security model** for better isolation and security:

- **ROOT user**: System administration (Nginx, SSL, firewall, user management)
- **dev2k user**: Application deployment (PM2, Node.js processes, app files)

#### User Directory Structure

```

/opt/dev2k-space/
├── home/ # User home directory (.bashrc, .pm2, .nvm, etc.)
├── data/ # Application data (uploads, databases)
└── logs/ # Application logs

/opt/dev2admin-space/ # Optional: For admin user
├── home/ # Admin home directory
├── data/ # Shared data access
└── logs/ # Shared log access

```

#### Security Benefits

1. **Process Isolation**: App processes run as non-root user
2. **File System Isolation**: Separate home directories per user
3. **Principle of Least Privilege**: Each user has minimal required permissions
4. **Audit Trail**: Clear separation of system vs application changes

#### User Setup Scripts

Ready-to-use scripts are available for server setup:

```bash
# Create users with proper isolation
./scripts/create-user.sh       # Interactive user creation with directory structure

# Transfer SSH keys for passwordless login
./scripts/transfer-keys.sh     # Automated SSH key transfer and testing

# Firewall configuration
./scripts/firewall-cloud.sh    # For cloud servers (IONOS, AWS, etc.)
./scripts/firewall-selfhosted.sh # For self-hosted servers
```

**🎯 Complete Server Setup Workflow:**

1. Run `./scripts/create-user.sh` on server (as root)
2. Run `./scripts/transfer-keys.sh` from local machine
3. Test SSH: `ssh username@server-ip`
4. Run `./scripts/firewall-cloud.sh` (as root)
5. Deploy application: `./deploy-app.sh` (as user)### Step-by-Step User Separation

The deployment process is designed with proper user separation for security:

- **ROOT user**: System configuration (Nginx, SSL certificates)
- **dev2k user**: Application deployment (PM2, Node.js app)

### 1. Create & Upload Deployment Package

```bash
# Local machine
./deploy/create-deployment-package-clean.sh
scp lets-todo-deployment_*.tar.gz root@YOUR_SERVER_IP:/tmp/
```

### 2. Extract Package (as root)

```bash
# On server as root
ssh root@YOUR_SERVER_IP
cd /tmp
tar -xzf lets-todo-deployment_*.tar.gz
# ⚠️  WICHTIG: Package erstellt automatisch einen Ordner!
# Beispiel: lets-todo-deployment_20250913_145217/
ls -la | grep lets-todo-deployment_
cd $(ls -d lets-todo-deployment_[0-9]* | head -1)  # Robust directory selection
```

### 3. Root Deployment - Nginx & Database Setup

```bash
# As root - Complete system setup
./deploy-root.sh    # HTTP-only Nginx configuration for certbot
./setup-ssl.sh      # SSL certificates + Database setup (automated)
```

**What this step does:**

- **deploy-root.sh**: Creates HTTP-only Nginx configurations for all domains
- **deploy-root.sh**: Sets up webroot directory for certbot challenges
- **deploy-root.sh**: Enables sites and reloads Nginx
- **setup-ssl.sh**: Requests SSL certificates for all domains via certbot
- **setup-ssl.sh**: Updates Nginx configurations with full HTTPS support
- **setup-ssl.sh**: Enables HTTPS redirects and security headers
- **setup-ssl.sh**: Configures proxy settings for each environment (ports 3002, 3003, 3004)
- **setup-ssl.sh**: Installs Node.js dependencies (npm install)
- **setup-ssl.sh**: Creates databases and tables for all environments as root user

### 4. Application Deployment

```bash
# Switch to dev2k user (aber bleibe im deployment ordner!)
su - dev2k
cd /tmp/$(ls -d lets-todo-deployment_[0-9]* | head -1)  # ⚠️ WICHTIG: Muss vom entpackten Ordner aus laufen!
./deploy-app.sh
```

**What deploy-app.sh does:**

- **Database Already Setup**: Database was configured by root user in step 3
- Copies application files to `~/projects/lets-todo-api`
- Excludes system files (nginx configs, root scripts)
- Installs Node.js dependencies
- Starts PM2 processes for all environments (prod:3002, feat:3003, stage:3004)
- **PM2 Startup Script**: Erstellt automatisch `~/pm2-startup.sh` für root
- Shows PM2 startup instructions

### 5. PM2 Startup (as root)

```bash
# Exit back to root
exit
# Execute the PM2 startup script that was created
~/pm2-startup.sh
```

---

## 🛠️ Development Setup

### Prerequisites

```bash
# Install MariaDB/MySQL
sudo dnf install mariadb mariadb-server  # Fedora
sudo apt install mariadb-server          # Ubuntu
brew install mariadb                     # macOS

# Start MariaDB service
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### Multi-Environment Database Setup

The `setup-dev-db.js` script supports all environments and creates necessary databases and tables:

```bash
# Development Database Setup
npm run dev:db

# Feature Environment Setup
NODE_ENV=feature npm run dev:db

# Staging Environment Setup
NODE_ENV=staging npm run dev:db

# Production Environment Setup
NODE_ENV=production npm run dev:db
```

**What it does for each environment:**

- **Development**: Creates `todos_users_dev` + test user with sample todos
- **Feature**: Creates `todos_users` + test user for feature testing
- **Staging**: Creates `todos_users` + test user for pre-production testing
- **Production**: Creates `todos_users` only (no test user for security)

**Test Users Created (non-production only):**

| Environment | Test Email           | Test Database          | Sample Data       |
| ----------- | -------------------- | ---------------------- | ----------------- |
| Development | `test@dev.local`     | `todos_user_1_dev`     | ✅ 3 sample todos |
| Feature     | `test@feature.local` | `todos_user_1_feature` | ❌ Empty          |
| Staging     | `test@staging.local` | `todos_user_1_staging` | ❌ Empty          |
| Production  | ❌ None              | ❌ None                | ❌ None           |

**Database Structure Created:**

```sql
-- Central users database
CREATE DATABASE todos_users_dev;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  db_name VARCHAR(255) NOT NULL,
  created BIGINT
);

-- Per-user databases (created dynamically)
CREATE DATABASE todos_user_123;
CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed TINYINT(1) DEFAULT 0,
  created BIGINT,
  updated BIGINT
);
```

### Development Workflow

```bash
# Multi-environment database setup
npm run dev:db              # Development setup (default)
NODE_ENV=feature npm run dev:db    # Feature environment
NODE_ENV=staging npm run dev:db    # Staging environment

# Start development server
npm run dev                 # Development server with auto-reload (port 3000)
```

---

## 📦 Automated Deployment Package

The `create-deployment-package.sh` script creates a complete deployment package with all necessary files and configurations.

### What's Included

```bash
./deploy/create-deployment-package.sh
```

**Package Contents:**

- ✅ Application code (server.js, db.js, routing/, etc.)
- ✅ Environment configurations (`config/env/.env.*`)
- ✅ PM2 configuration (`ecosystem.config.cjs`)
- ✅ Nginx configurations (production.conf, feature.conf, staging.conf)
- ✅ Automated deployment scripts (`deploy.sh`, `setup-ssl.sh`)
- ✅ Database setup script

**Generated Scripts:**

- **`deploy-root.sh`**: Root deployment (Nginx HTTP-only setup)
- **`deploy-app.sh`**: Application deployment (PM2 & app files for dev2k user)
- **`setup-ssl.sh`**: SSL certificate automation + HTTPS configuration

### Package Customization

Before creating the package, ensure:

```bash
# 1. Configure environment files
config/env/.env.production     # Production database credentials
config/env/.env.feature        # Feature environment settings
config/env/.env.staging        # Staging environment settings

# 2. Update PM2 configuration
ecosystem.config.cjs           # Process management settings

# 3. Configure domains in Nginx
nginx/production.conf          # Production domain settings
nginx/feature.conf            # Feature domain settings
nginx/staging.conf            # Staging domain settings
```

---

## 🌍 Multi-Environment Setup

### Environment Configuration Files

**Production (`config/env/.env.production`):**

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=production_user
DB_PASSWORD=secure_production_password
DB_NAME=todos_main
DB_USERS=todos_users
PORT=3002
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
```

**Feature (`config/env/.env.feature`):**

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=feature_user
DB_PASSWORD=feature_password
DB_NAME=todos_main
DB_USERS=todos_users
PORT=3003
NODE_ENV=feature
DEBUG=true
LOG_LEVEL=debug
```

**Staging (`config/env/.env.staging`):**

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=staging_user
DB_PASSWORD=staging_password
DB_NAME=todos_main
DB_USERS=todos_users
PORT=3004
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=warn
```

### PM2 Process Management

**Start All Environments:**

```bash
pm2 start ecosystem.config.cjs

# Individual environments
pm2 start ecosystem.config.cjs --only lets-todo-api-prod
pm2 start ecosystem.config.cjs --only lets-todo-api-feat
pm2 start ecosystem.config.cjs --only lets-todo-api-stage
```

**Monitor & Control:**

```bash
# View all processes
pm2 list
pm2 status

# View logs
pm2 logs lets-todo-api-prod
pm2 logs lets-todo-api-feat --lines 50

# Real-time monitoring
pm2 monit

# Process control
pm2 restart lets-todo-api-prod
pm2 reload lets-todo-api-feat    # Zero-downtime restart
pm2 stop lets-todo-api-stage
```

### Environment-Specific Features

| Feature            | Development | Feature | Staging | Production |
| ------------------ | ----------- | ------- | ------- | ---------- |
| **File Watching**  | ❌          | ✅      | ❌      | ❌         |
| **Debug Logging**  | ✅          | ✅      | ❌      | ❌         |
| **Memory Restart** | ❌          | ✅ 1GB  | ✅ 1GB  | ✅ 1GB     |
| **Log Files**      | Console     | ✅      | ✅      | ✅         |
| **Auto Restart**   | ❌          | ✅      | ✅      | ✅         |

---

## 🔒 SSL & Security Setup

### Automated SSL Setup

The deployment package includes `setup-ssl.sh` for automated SSL certificate management:

```bash
./setup-ssl.sh
```

**What it does:**

1. Creates webroot directory for Let's Encrypt challenges
2. Requests SSL certificates for all domains:
   - `lets-todo-api.dev2k.org`
   - `lets-todo-api-feat.dev2k.org`
   - `lets-todo-api-stage.dev2k.org`
3. Configures automatic renewal
4. Reloads Nginx configuration

### Manual SSL Setup

```bash
# Create webroot for challenges
sudo mkdir -p /var/www/certbot/.well-known/acme-challenge/
sudo chown -R www-data:www-data /var/www/certbot

# Request certificates
sudo certbot certonly --webroot -w /var/www/certbot \
  -d lets-todo-api.dev2k.org \
  --agree-tos --no-eff-email \
  -m your.email@domain.com

sudo certbot certonly --webroot -w /var/www/certbot \
  -d lets-todo-api-feat.dev2k.org \
  --agree-tos --no-eff-email \
  -m your.email@domain.com

sudo certbot certonly --webroot -w /var/www/certbot \
  -d lets-todo-api-stage.dev2k.org \
  --agree-tos --no-eff-email \
  -m your.email@domain.com
```

### SSL Certificate Management

```bash
# Check certificate status
sudo certbot certificates

# Test automatic renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/lets-todo-api.dev2k.org/cert.pem -noout -dates
```

---

## 🔥 Firewall Configuration

### Important Security Notice

Proper firewall configuration is **critical** for server security. The setup differs between cloud providers and self-hosted servers.

### Cloud Servers (IONOS, AWS, DigitalOcean, etc.)

```bash
#!/bin/bash
# firewall-cloud.sh - For cloud providers with web consoles

# Reset UFW
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH Access Rules
sudo ufw allow from YOUR_SERVER_IP to any port 22 proto tcp comment "Cloud Console Fallback"
sudo ufw allow from YOUR_HOME_IPV4 to any port 22 proto tcp comment "Home IPv4 SSH"
sudo ufw allow from YOUR_HOME_IPV6_SUBNET to any port 22 proto tcp comment "Home IPv6 SSH"

# Web traffic
sudo ufw allow 80,443/tcp comment "HTTP/HTTPS"

# Block all high ports (application ports) - only accessible via Nginx proxy
sudo ufw deny 3000:65535/tcp comment "Block direct app access"
sudo ufw allow from 127.0.0.1 to any port 3000:65535 comment "Allow localhost"

# Enable firewall
sudo ufw --force enable
sudo ufw status numbered
```

**Why include server IP for cloud providers?**

- Web consoles (IONOS, AWS Console) often use server's own IP for emergency access
- **Without this rule → You'll be locked out of web console!**
- This is standard practice for cloud hosting

### Self-Hosted Servers

```bash
#!/bin/bash
# firewall-selfhosted.sh - For your own hardware

# Reset UFW
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH Access Rules (NO server IP needed)
sudo ufw allow from YOUR_HOME_IPV4 to any port 22 proto tcp comment "Home IPv4 SSH"
sudo ufw allow from YOUR_HOME_IPV6_SUBNET to any port 22 proto tcp comment "Home IPv6 SSH"

# Optional: Allow from local network
# sudo ufw allow from 192.168.1.0/24 to any port 22 proto tcp comment "Local Network"

# Web traffic
sudo ufw allow 80,443/tcp comment "HTTP/HTTPS"

# Block all high ports (application ports) - only accessible via Nginx proxy
sudo ufw deny 3000:65535/tcp comment "Block direct app access"
sudo ufw allow from 127.0.0.1 to any port 3000:65535 comment "Allow localhost"# Enable firewall
sudo ufw --force enable
sudo ufw status numbered
```

### Find Your IP Addresses

```bash
# Your public IPv4
curl -4 ifconfig.me

# Your public IPv6
curl -6 ifconfig.me

# Your server's public IP (run on server)
curl -4 ifconfig.me

# Local network range (common)
ip route | grep 192.168
```

### Firewall Scripts

Ready-to-use scripts are available in the `scripts/` directory:

```bash
# For cloud servers (IONOS, AWS, DigitalOcean, etc.)
./scripts/firewall-cloud.sh

# For self-hosted servers
./scripts/firewall-selfhosted.sh
```

**⚠️ Important:** Edit the scripts first to set your actual IP addresses!

```bash
# Test SSH access
ssh -v user@your-server-ip

# Test web access
curl -I http://your-domain.com
curl -I https://your-domain.com

# Test blocked ports (should fail)
curl -I http://your-server-ip:3002

# Check UFW logs
sudo tail -f /var/log/ufw.log
```

### Security Best Practices

1. **Always have multiple SSH access routes** (IPv4 + IPv6 + console)
2. **Test firewall rules before disconnecting**
3. **Use key-based SSH authentication** (disable password auth)
4. **Regularly update UFW rules** when your IP changes
5. **Monitor UFW logs** for suspicious activity

**⚠️ Warning:**

- **Cloud servers:** Include server IP for console access
- **Self-hosted:** Only include your home IPs
- **Test thoroughly** before applying in production!

### Nginx Security Configuration

The deployment includes security headers and configurations:

```nginx
# Security headers (included in all configs)
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'";

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;

# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

---

## 🐛 Deployment Troubleshooting

### Common Issues & Solutions

#### **Database Connection Failed**

```bash
# Check MariaDB status
sudo systemctl status mariadb

# Start MariaDB if stopped
sudo systemctl start mariadb

# Test database connection
mysql -u root -p -e "SELECT 1;"

# Check database user permissions
mysql -u root -p -e "SHOW GRANTS FOR 'your_user'@'localhost';"

# ⚠️ IMPORTANT: Run database setup from project root (where node_modules exists)
# WRONG: cd scripts/ && node setup-dev-db.js  ❌ (ERR_MODULE_NOT_FOUND)
# CORRECT: node scripts/setup-dev-db.js       ✅ (from project root)
```

#### **PM2 Process Won't Start**

```bash
# Check PM2 logs
pm2 logs lets-todo-api-prod --lines 50

# Check environment variables
pm2 env lets-todo-api-prod

# Restart with fresh logs
pm2 delete lets-todo-api-prod
pm2 start ecosystem.config.cjs --only lets-todo-api-prod
```

#### **Nginx Configuration Errors**

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx error log
sudo tail -f /var/log/nginx/error.log

# Reload Nginx configuration
sudo systemctl reload nginx
```

#### **SSL Certificate Issues**

```bash
# Check certificate status
sudo certbot certificates

# Check webroot directory permissions
ls -la /var/www/certbot/
sudo chown -R www-data:www-data /var/www/certbot

# Test SSL certificate
curl -I https://lets-todo-api.dev2k.org

# Check certificate details
openssl s_client -connect lets-todo-api.dev2k.org:443 -servername lets-todo-api.dev2k.org
```

### Environment-Specific Debugging

#### **Development Environment**

```bash
# Check which environment is detected
npm run dev  # Shows environment detection in logs

# Force specific environment
NODE_ENV=development npm start

# Reset development database
npm run dev:db

# Check development database
mysql todos_users_dev -e "SELECT * FROM users;"
```

#### **Production Environment**

```bash
# Check production logs
pm2 logs lets-todo-api-prod --lines 100

# Monitor production metrics
pm2 monit

# Check production environment variables
pm2 env lets-todo-api-prod

# Production database check
mysql -u production_user -p todos_users -e "SELECT COUNT(*) FROM users;"
```

---

## 📊 Monitoring & Logs

### PM2 Monitoring

```bash
# Real-time monitoring dashboard
pm2 monit

# Process list with status
pm2 list

# Memory and CPU usage
pm2 show lets-todo-api-prod

# Process metrics
pm2 describe lets-todo-api-prod
```

### Log Management

**Log Files Location:**

```bash
./logs/
├── prod-combined.log    # Production all output
├── prod-out.log         # Production stdout
├── prod-error.log       # Production stderr
├── feat-combined.log    # Feature all output
├── feat-out.log         # Feature stdout
├── feat-error.log       # Feature stderr
├── stage-combined.log   # Staging all output
├── stage-out.log        # Staging stdout
└── stage-error.log      # Staging stderr
```

**Log Monitoring Commands:**

```bash
# Follow production logs
tail -f logs/prod-combined.log

# Search for errors
grep -n "ERROR" logs/prod-error.log

# View last 100 lines of all logs
tail -n 100 logs/*.log

# Monitor PM2 logs in real-time
pm2 logs --timestamp
```

### System Monitoring

```bash
# Check system resources
htop
free -h
df -h

# Check network connections
netstat -tlnp | grep :300[2-4]

# Check MariaDB performance
mysql -e "SHOW PROCESSLIST;"
mysql -e "SHOW STATUS LIKE 'Connections';"

# Monitor SSL certificate expiry
sudo certbot certificates | grep "Expiry Date"
```

### Performance Monitoring

```javascript
// Application-level monitoring (built-in)
// Memory usage is logged every 30 seconds in development
// Database pool statistics in debug logs
// Request timing in verbose log mode
```

---

## 🔄 Maintenance & Updates

### Deployment Updates

```bash
# 1. Create new deployment package
./deploy/create-deployment-package.sh

# 2. Upload to server
scp lets-todo-deployment_*.tar.gz root@217.154.113.51:/tmp/

# 3. For application updates only (as dev2k)
sudo su - dev2k
cd /tmp && tar -xzf lets-todo-deployment_*.tar.gz
./deploy-app.sh    # Updates app and restarts PM2

# 4. For system updates (as root)
./deploy-root.sh   # Updates Nginx configs
./setup-ssl.sh     # Updates SSL if needed
```

### Database Maintenance

```bash
# Backup user database
mysqldump -u root -p todos_users > backup_users_$(date +%Y%m%d).sql

# Clean up old guest databases (manual)
mysql -e "DROP DATABASE todos_guest_old_uuid_here;"

# Database optimization
mysql -u root -p -e "OPTIMIZE TABLE todos_users.users;"
```

### SSL Certificate Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal if needed
sudo certbot renew --force-renewal

# Automatic renewal is setup via cron
# Check: sudo crontab -l | grep certbot
```

---

## 📚 Additional Resources

### Configuration Templates

- **Environment Files**: `config/env/.env.*.example`
- **PM2 Configuration**: `ecosystem.config.cjs.example`
- **Nginx Configurations**: `nginx/*.conf.example`
- **Deployment Scripts**: `deploy/create-deployment-package.sh.example`

### Related Documentation

- **[README.md](./README.md)** - Quick start and user guide
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed development workflows
- **[copilot-instructions.md](./copilot-instructions.md)** - Architecture and coding standards

### External Documentation

- **[PM2 Documentation](https://pm2.keymetrics.io/docs/)**
- **[Nginx Documentation](https://nginx.org/en/docs/)**
- **[Let's Encrypt Documentation](https://letsencrypt.org/docs/)**
- **[MariaDB Documentation](https://mariadb.org/documentation/)**

---

**🎉 Happy Deploying!**

_This deployment guide covers production-ready deployment of the Let's Todo API with multiple environments, SSL security, and comprehensive monitoring._
