#!/bin/bash

# ============================================================================
# MODULAR Deployment Package Creator
# Creates separate deployment scripts for each environment
# ============================================================================

set -e

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$SCRIPT_DIR/modular-package"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="lets-todo-modular-deployment_$TIMESTAMP.tar.gz"

echo "🚀 Creating MODULAR deployment package..."
echo "Project root: $PROJECT_ROOT"
echo "Deploy dir: $DEPLOY_DIR"

# Clean and create deploy directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# ============================================================================
# 1. Copy application files
# ============================================================================
echo "📦 Copying application files..."

# Copy main application files
cp "$PROJECT_ROOT"/{server.js,db.js,package.json,package-lock.json} "$DEPLOY_DIR/"

# Copy directories
cp -r "$PROJECT_ROOT"/{config,middleware,routing,scripts} "$DEPLOY_DIR/"

# Copy Nginx configurations  
cp -r "$PROJECT_ROOT/nginx" "$DEPLOY_DIR/"

# Copy ecosystem config
cp "$PROJECT_ROOT/ecosystem.config.cjs" "$DEPLOY_DIR/"

# ============================================================================
# 2. Create shared functions script
# ============================================================================
echo "📝 Creating shared functions..."

cat > "$DEPLOY_DIR/shared-functions.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# Shared Functions for all deployment scripts
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

function log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

function log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

function log_error() {
    echo -e "${RED}❌ $1${NC}"
}

function check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root!"
        log_info "Usage: sudo ./deploy-[environment].sh"
        exit 1
    fi
}

function setup_nginx_config() {
    local env=$1
    local domain=$2
    local port=$3
    local config_file=$4
    
    log_info "Setting up Nginx for $env environment..."
    
    NGINX_SITES="/etc/nginx/sites-available"
    NGINX_ENABLED="/etc/nginx/sites-enabled"
    
    # Copy nginx config
    cp "nginx/$config_file" "$NGINX_SITES/$domain.conf"
    
    # Enable site
    ln -sf "$NGINX_SITES/$domain.conf" "$NGINX_ENABLED/"
    
    log_success "Nginx configuration for $env completed"
}

function setup_ssl_cert() {
    local domain=$1
    
    log_info "Setting up SSL certificate for $domain..."
    
    # Create webroot if not exists
    mkdir -p /var/www/certbot/.well-known/acme-challenge/
    chown -R www-data:www-data /var/www/certbot
    
    # Check if certificate already exists
    if certbot certificates 2>/dev/null | grep -q "$domain"; then
        log_success "Certificate for $domain already exists"
    else
        log_info "Requesting new certificate for $domain..."
        certbot certonly \
            --webroot -w /var/www/certbot \
            -d "$domain" \
            --agree-tos --no-eff-email \
            -m konstantin.aksenov@dev2k.org \
            --non-interactive
        
        if [ $? -eq 0 ]; then
            log_success "Certificate for $domain obtained successfully"
        else
            log_error "Failed to obtain certificate for $domain"
            return 1
        fi
    fi
}

function setup_project_directory() {
    local project_path=$1
    local env=$2
    
    log_info "Setting up project directory: $project_path"
    
    # Create project directory
    mkdir -p "$project_path"
    
    # Copy application files (exclude deployment files)
    log_info "Copying application files..."
    rsync -av \
        --exclude='nginx/' \
        --exclude='deploy-*.sh' \
        --exclude='shared-functions.sh' \
        --exclude='*.tar.gz' \
        . "$project_path/"
    
    # Create logs directory
    mkdir -p "$project_path/logs"
    
    # Set proper ownership
    chown -R dev2k:dev2k "$project_path"
    
    log_success "Project directory setup completed"
}

function install_dependencies() {
    local project_path=$1
    local env=$2
    
    log_info "Installing Node.js dependencies for $env..."
    
    cd "$project_path"
    
    # Install as dev2k user with proper NVM environment
    sudo -u dev2k bash -c "
        source /opt/dev2k-space/home/.nvm/nvm.sh && \
        npm ci --omit=dev
    "
    
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        return 1
    fi
}

function setup_database() {
    local env=$1
    
    log_info "Setting up database for $env environment..."
    
    # Install dependencies in deployment directory first
    sudo -u dev2k bash -c "
        source /opt/dev2k-space/home/.nvm/nvm.sh && \
        npm ci --omit=dev
    "
    
    # Run database setup
    NODE_ENV=$env node scripts/setup-dev-db.js
    
    if [ $? -eq 0 ]; then
        log_success "Database setup for $env completed"
    else
        log_error "Database setup for $env failed"
        return 1
    fi
}

function start_pm2_process() {
    local project_path=$1
    local process_name=$2
    local env=$3
    
    log_info "Starting PM2 process: $process_name"
    
    cd "$project_path"
    
    # Stop existing process if running
    sudo -u dev2k bash -c "
        source /opt/dev2k-space/home/.nvm/nvm.sh && \
        pm2 delete $process_name 2>/dev/null || true
    "
    
    # Start new process
    sudo -u dev2k bash -c "
        source /opt/dev2k-space/home/.nvm/nvm.sh && \
        pm2 start ecosystem.config.cjs --only $process_name
    "
    
    if [ $? -eq 0 ]; then
        log_success "PM2 process $process_name started successfully"
    else
        log_error "Failed to start PM2 process $process_name"
        return 1
    fi
}

function reload_nginx() {
    log_info "Reloading Nginx configuration..."
    
    # Test configuration first
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx reloaded successfully"
    else
        log_error "Nginx configuration test failed"
        return 1
    fi
}
EOF

chmod +x "$DEPLOY_DIR/shared-functions.sh"

# ============================================================================
# 3. Create Production Deployment Script
# ============================================================================
echo "📝 Creating production deployment script..."

cat > "$DEPLOY_DIR/deploy-prod.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# PRODUCTION Deployment Script
# Environment: production
# Domain: lets-todo-api.dev2k.org  
# Port: 3002
# Path: /opt/dev2k-space/home/projects/lets-todo-api/
# ============================================================================

set -e

# Load shared functions
source ./shared-functions.sh

# Configuration
ENV="production"
DOMAIN="lets-todo-api.dev2k.org"
PORT="3002"
PROJECT_PATH="/opt/dev2k-space/home/projects/lets-todo-api"
PROCESS_NAME="lets-todo-api-prod"
NGINX_CONFIG="production.conf"

echo "🚀 Starting PRODUCTION deployment..."
echo "📍 Domain: $DOMAIN"
echo "🎯 Port: $PORT"
echo "📁 Path: $PROJECT_PATH"

# Check if running as root
check_root

# Step 1: Setup project directory
setup_project_directory "$PROJECT_PATH" "$ENV"

# Step 2: Install Node.js dependencies
install_dependencies "$PROJECT_PATH" "$ENV"

# Step 3: Setup database
setup_database "$ENV"

# Step 4: Setup Nginx configuration
setup_nginx_config "$ENV" "$DOMAIN" "$PORT" "$NGINX_CONFIG"

# Step 5: Setup SSL certificate
setup_ssl_cert "$DOMAIN"

# Step 6: Reload Nginx
reload_nginx

# Step 7: Start PM2 process
start_pm2_process "$PROJECT_PATH" "$PROCESS_NAME" "$ENV"

# Step 8: Save PM2 configuration
sudo -u dev2k bash -c "
    source /opt/dev2k-space/home/.nvm/nvm.sh && \
    pm2 save
"

echo ""
log_success "🎉 PRODUCTION deployment completed!"
echo ""
echo "🌐 Your API is available at: https://$DOMAIN"
echo "📊 Check status: sudo -u dev2k pm2 list"
echo "📋 View logs: sudo -u dev2k pm2 logs $PROCESS_NAME"
echo "📈 Monitor: sudo -u dev2k pm2 monit"

EOF

chmod +x "$DEPLOY_DIR/deploy-prod.sh"

# ============================================================================
# 4. Create Feature Deployment Script  
# ============================================================================
echo "📝 Creating feature deployment script..."

cat > "$DEPLOY_DIR/deploy-feat.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# FEATURE Deployment Script
# Environment: feature
# Domain: lets-todo-api-feat.dev2k.org
# Port: 3003
# Path: /opt/dev2k-space/home/projects/lets-todo-api-feat/
# ============================================================================

set -e

# Load shared functions
source ./shared-functions.sh

# Configuration
ENV="feature"
DOMAIN="lets-todo-api-feat.dev2k.org"
PORT="3003"
PROJECT_PATH="/opt/dev2k-space/home/projects/lets-todo-api-feat"
PROCESS_NAME="lets-todo-api-feat"
NGINX_CONFIG="feature.conf"

echo "🚀 Starting FEATURE deployment..."
echo "📍 Domain: $DOMAIN"
echo "🎯 Port: $PORT"
echo "📁 Path: $PROJECT_PATH"

# Check if running as root
check_root

# Step 1: Setup project directory
setup_project_directory "$PROJECT_PATH" "$ENV"

# Step 2: Install Node.js dependencies
install_dependencies "$PROJECT_PATH" "$ENV"

# Step 3: Setup database
setup_database "$ENV"

# Step 4: Setup Nginx configuration
setup_nginx_config "$ENV" "$DOMAIN" "$PORT" "$NGINX_CONFIG"

# Step 5: Setup SSL certificate
setup_ssl_cert "$DOMAIN"

# Step 6: Reload Nginx
reload_nginx

# Step 7: Start PM2 process
start_pm2_process "$PROJECT_PATH" "$PROCESS_NAME" "$ENV"

# Step 8: Save PM2 configuration
sudo -u dev2k bash -c "
    source /opt/dev2k-space/home/.nvm/nvm.sh && \
    pm2 save
"

echo ""
log_success "🎉 FEATURE deployment completed!"
echo ""
echo "🌐 Your API is available at: https://$DOMAIN"
echo "📊 Check status: sudo -u dev2k pm2 list"
echo "📋 View logs: sudo -u dev2k pm2 logs $PROCESS_NAME"
echo "📈 Monitor: sudo -u dev2k pm2 monit"

EOF

chmod +x "$DEPLOY_DIR/deploy-feat.sh"

# ============================================================================
# 5. Create Staging Deployment Script
# ============================================================================
echo "📝 Creating staging deployment script..."

cat > "$DEPLOY_DIR/deploy-stage.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# STAGING Deployment Script
# Environment: staging
# Domain: lets-todo-api-stage.dev2k.org
# Port: 3004  
# Path: /opt/dev2k-space/home/projects/lets-todo-api-stage/
# ============================================================================

set -e

# Load shared functions
source ./shared-functions.sh

# Configuration
ENV="staging"
DOMAIN="lets-todo-api-stage.dev2k.org"
PORT="3004"
PROJECT_PATH="/opt/dev2k-space/home/projects/lets-todo-api-stage"
PROCESS_NAME="lets-todo-api-stage"
NGINX_CONFIG="staging.conf"

echo "🚀 Starting STAGING deployment..."
echo "📍 Domain: $DOMAIN"
echo "🎯 Port: $PORT"
echo "📁 Path: $PROJECT_PATH"

# Check if running as root
check_root

# Step 1: Setup project directory
setup_project_directory "$PROJECT_PATH" "$ENV"

# Step 2: Install Node.js dependencies
install_dependencies "$PROJECT_PATH" "$ENV"

# Step 3: Setup database
setup_database "$ENV"

# Step 4: Setup Nginx configuration
setup_nginx_config "$ENV" "$DOMAIN" "$PORT" "$NGINX_CONFIG"

# Step 5: Setup SSL certificate
setup_ssl_cert "$DOMAIN"

# Step 6: Reload Nginx
reload_nginx

# Step 7: Start PM2 process
start_pm2_process "$PROJECT_PATH" "$PROCESS_NAME" "$ENV"

# Step 8: Save PM2 configuration
sudo -u dev2k bash -c "
    source /opt/dev2k-space/home/.nvm/nvm.sh && \
    pm2 save
"

echo ""
log_success "🎉 STAGING deployment completed!"
echo ""
echo "🌐 Your API is available at: https://$DOMAIN"
echo "📊 Check status: sudo -u dev2k pm2 list"  
echo "📋 View logs: sudo -u dev2k pm2 logs $PROCESS_NAME"
echo "📈 Monitor: sudo -u dev2k pm2 monit"

EOF

chmod +x "$DEPLOY_DIR/deploy-stage.sh"

# ============================================================================
# 6. Create ALL deployment script (optional)
# ============================================================================
echo "📝 Creating deploy-all script..."

cat > "$DEPLOY_DIR/deploy-all.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# DEPLOY ALL Environments Script
# Runs all three deployments in sequence
# ============================================================================

set -e

echo "🚀 Starting deployment of ALL environments..."
echo ""

# Deploy Production
echo "🔥 Deploying PRODUCTION..."
./deploy-prod.sh
echo ""

# Deploy Feature
echo "🚧 Deploying FEATURE..."
./deploy-feat.sh  
echo ""

# Deploy Staging
echo "🎭 Deploying STAGING..."
./deploy-stage.sh
echo ""

echo "🎉 ALL environments deployed successfully!"
echo ""
echo "🌐 Your APIs are available at:"
echo "  - Production: https://lets-todo-api.dev2k.org"
echo "  - Feature: https://lets-todo-api-feat.dev2k.org" 
echo "  - Staging: https://lets-todo-api-stage.dev2k.org"
echo ""
echo "📊 Check all processes: sudo -u dev2k pm2 list"

EOF

chmod +x "$DEPLOY_DIR/deploy-all.sh"

# ============================================================================
# 7. Create README for deployment
# ============================================================================
echo "📝 Creating deployment README..."

cat > "$DEPLOY_DIR/README.md" << 'EOF'
# 🚀 Modular Deployment Package

Separate deployment scripts for each environment with proper project structure.

## 📦 Package Contents

- `deploy-prod.sh` - Production deployment (Port 3002)
- `deploy-feat.sh` - Feature deployment (Port 3003)
- `deploy-stage.sh` - Staging deployment (Port 3004)
- `deploy-all.sh` - Deploy all environments
- `shared-functions.sh` - Shared utility functions

## 🎯 Deployment Instructions

### Deploy Individual Environment

```bash
# Production only
sudo ./deploy-prod.sh

# Feature only  
sudo ./deploy-feat.sh

# Staging only
sudo ./deploy-stage.sh
```

### Deploy All Environments

```bash
sudo ./deploy-all.sh
```

## 📁 Project Structure Created

```
/opt/dev2k-space/home/projects/
├── lets-todo-api/          # Production (Port 3002)
├── lets-todo-api-feat/     # Feature (Port 3003)
└── lets-todo-api-stage/    # Staging (Port 3004)
```

## 🔧 Each Script Handles

1. ✅ Project directory setup with proper ownership
2. ✅ Node.js dependencies installation (via dev2k user + NVM)
3. ✅ Database setup for specific environment  
4. ✅ Nginx configuration and SSL certificates
5. ✅ PM2 process management (processes run as dev2k)

## 📊 Monitoring Commands

```bash
# Check all PM2 processes
sudo -u dev2k pm2 list

# View specific logs
sudo -u dev2k pm2 logs lets-todo-api-prod
sudo -u dev2k pm2 logs lets-todo-api-feat
sudo -u dev2k pm2 logs lets-todo-api-stage

# Real-time monitoring
sudo -u dev2k pm2 monit
```

## 🎉 Success!

Your APIs will be available at:
- Production: https://lets-todo-api.dev2k.org
- Feature: https://lets-todo-api-feat.dev2k.org
- Staging: https://lets-todo-api-stage.dev2k.org
EOF

# ============================================================================
# 8. Create deployment package
# ============================================================================
echo "📦 Creating deployment package..."

cd "$SCRIPT_DIR"
tar -czf "$PACKAGE_NAME" -C modular-package .

echo "✅ Modular deployment package created: $SCRIPT_DIR/$PACKAGE_NAME"
echo ""
echo "🚀 MODULAR Deployment Instructions:"
echo "1. Upload: scp $PACKAGE_NAME root@217.154.113.51:/tmp/"
echo "2. On server: cd /tmp && tar -xzf $PACKAGE_NAME"
echo "3. Deploy production: sudo ./deploy-prod.sh"
echo "   OR deploy feature: sudo ./deploy-feat.sh" 
echo "   OR deploy staging: sudo ./deploy-stage.sh"
echo "   OR deploy all: sudo ./deploy-all.sh"
echo ""
echo "📊 Package contents:"
tar -tzf "$PACKAGE_NAME"
echo ""
echo "Total files: $(tar -tzf "$PACKAGE_NAME" | wc -l)"