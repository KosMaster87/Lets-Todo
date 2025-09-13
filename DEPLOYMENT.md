# 🚀 Modular Deployment Guide

**Simple, modular deployment system** for the Let's Todo API with environment-specific deployment and SSL automation.

## 📋 Quick Reference

| Environment     | Domain                          | Port | Purpose                       |
| --------------- | ------------------------------- | ---- | ----------------------------- |
| **Production**  | `lets-todo-api.dev2k.org`       | 3002 | Live production system        |
| **Feature**     | `lets-todo-api-feat.dev2k.org`  | 3003 | Feature development & testing |
| **Staging**     | `lets-todo-api-stage.dev2k.org` | 3004 | Pre-production testing        |
| **Development** | `127.0.0.1:3000`                | 3000 | Local development             |

## ⚡ Quick Deployment

**3 Simple Steps:**

```bash
# 1. Create deployment package (local)
./deploy/create-step-deployment.sh

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

# Später cleanup (optional)
cd .. && rm -rf step-by-step-package/
```

**🎉 Done!** Your API is live with SSL certificates!

---

## 🏗️ Modular System

### Template Architecture

```
deployment-templates/          (Source Templates)
├── nginx-setup               # HTTP-only Nginx for SSL certificates
├── ssl-setup                 # SSL certificates + HTTPS configs
├── project-files-copy        # Application files deployment
├── nodejs-dependencies       # npm install + verification
├── database-setup            # MySQL databases + schema
└── pm2-setup                 # Process management

step-by-step-package/         (Generated Package)
├── deploy.sh                 # Main deployment script
├── [application files]       # Your app code
└── templates/               # Generated from templates above
    ├── nginx-setup.sh
    ├── ssl-setup.sh
    ├── project-files-copy.sh
    ├── nodejs-dependencies.sh
    ├── database-setup.sh
    └── pm2-setup.sh
```

### What Each Step Does

1. **Nginx HTTP Setup** - Creates HTTP configs for SSL certificate requests
2. **SSL Certificates** - Requests Let's Encrypt certificates and enables HTTPS
3. **Project Files** - Copies your app files with correct permissions
4. **Dependencies** - Installs npm packages and verifies critical modules
5. **Database Setup** - Creates MySQL databases and tables for each environment
6. **PM2 Processes** - Starts and configures process management

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

1. **Create template:** [`deploy/deployment-templates/my-new-step`](deploy/deployment-templates/)
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
