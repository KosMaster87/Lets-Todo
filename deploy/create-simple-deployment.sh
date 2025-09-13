#!/bin/bash

# ============================================================================
# SIMPLIFIED Deployment Package Creator
# Creates a single deployment script that does everything as root
# ============================================================================

set -e

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$SCRIPT_DIR/simple-package"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="lets-todo-simple-deployment_$TIMESTAMP.tar.gz"

echo "🚀 Creating SIMPLIFIED deployment package..."
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
# 2. Create the ALL-IN-ONE deployment script
# ============================================================================
echo "📝 Creating simplified deployment script..."

cat > "$DEPLOY_DIR/deploy-everything.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# SIMPLIFIED ALL-IN-ONE DEPLOYMENT SCRIPT (run as root)
# Handles: Nginx, SSL, Database, Multi-Environment Setup, PM2
# ============================================================================

set -e

PROJECT_BASE="/opt/dev2k-space/home/projects"
DEPLOYMENT_DIR=$(pwd)

echo "🚀 Starting SIMPLIFIED ALL-IN-ONE deployment..."
echo "📍 Deployment directory: $DEPLOYMENT_DIR"
echo "🎯 Target base: $PROJECT_BASE"

# ============================================================================
# STEP 1: Setup project directories
# ============================================================================
echo "📁 Setting up multi-environment project directories..."

mkdir -p "$PROJECT_BASE"/{lets-todo-api,lets-todo-api-feat,lets-todo-api-stage}

# Copy application files to all environments
echo "📂 Copying files to production environment..."
rsync -av --exclude='nginx/' --exclude='deploy-*.sh' . "$PROJECT_BASE/lets-todo-api/"

echo "📂 Copying files to feature environment..."  
rsync -av --exclude='nginx/' --exclude='deploy-*.sh' . "$PROJECT_BASE/lets-todo-api-feat/"

echo "📂 Copying files to staging environment..."
rsync -av --exclude='nginx/' --exclude='deploy-*.sh' . "$PROJECT_BASE/lets-todo-api-stage/"

# Set proper ownership
chown -R dev2k:dev2k "$PROJECT_BASE"

# Create logs directories
mkdir -p "$PROJECT_BASE"/{lets-todo-api,lets-todo-api-feat,lets-todo-api-stage}/logs
chown -R dev2k:dev2k "$PROJECT_BASE"/*/logs

# ============================================================================
# STEP 2: Install Node.js dependencies in all environments  
# ============================================================================
echo "📦 Installing Node.js dependencies..."

cd "$PROJECT_BASE/lets-todo-api"
sudo -u dev2k npm ci --omit=dev

cd "$PROJECT_BASE/lets-todo-api-feat"  
sudo -u dev2k npm ci --omit=dev

cd "$PROJECT_BASE/lets-todo-api-stage"
sudo -u dev2k npm ci --omit=dev

cd "$DEPLOYMENT_DIR"

# ============================================================================  
# STEP 3: Database setup
# ============================================================================
echo "🗄️ Setting up database schema for all environments..."

# Install dependencies in deployment dir for database script
npm ci --omit=dev

# Run database setup for all environments
echo "🔧 Creating production database..."
NODE_ENV=production node scripts/setup-dev-db.js

echo "🔧 Creating feature database..."  
NODE_ENV=feature node scripts/setup-dev-db.js

echo "🔧 Creating staging database..."
NODE_ENV=staging node scripts/setup-dev-db.js

echo "✅ Database setup completed for all environments!"

# ============================================================================
# STEP 4: Nginx Configuration
# ============================================================================  
echo "🌐 Setting up Nginx configurations..."

NGINX_SITES="/etc/nginx/sites-available"  
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Create webroot for certbot
mkdir -p /var/www/certbot/.well-known/acme-challenge/
chown -R www-data:www-data /var/www/certbot

# Copy nginx configurations
cp nginx/production.conf "$NGINX_SITES/lets-todo-api.dev2k.org.conf"
cp nginx/feature.conf "$NGINX_SITES/lets-todo-api-feat.dev2k.org.conf"  
cp nginx/staging.conf "$NGINX_SITES/lets-todo-api-stage.dev2k.org.conf"

# Enable sites
ln -sf "$NGINX_SITES/lets-todo-api.dev2k.org.conf" "$NGINX_ENABLED/"
ln -sf "$NGINX_SITES/lets-todo-api-feat.dev2k.org.conf" "$NGINX_ENABLED/"
ln -sf "$NGINX_SITES/lets-todo-api-stage.dev2k.org.conf" "$NGINX_ENABLED/"

# Test and reload nginx
nginx -t
systemctl reload nginx

echo "✅ Nginx setup completed!"

# ============================================================================
# STEP 5: SSL Certificates (if not exists)
# ============================================================================
echo "🔒 Setting up SSL certificates..."

domains=("lets-todo-api.dev2k.org" "lets-todo-api-feat.dev2k.org" "lets-todo-api-stage.dev2k.org")

for domain in "${domains[@]}"; do
    echo "📜 Checking certificate for $domain..."
    if ! certbot certificates | grep -q "$domain"; then
        echo "🆕 Requesting new certificate for $domain..."
        certbot certonly \
            --webroot -w /var/www/certbot \
            -d "$domain" \
            --agree-tos --no-eff-email \
            -m konstantin.aksenov@dev2k.org \
            --non-interactive
    else
        echo "✅ Certificate for $domain already exists"
    fi
done

echo "✅ SSL certificates setup completed!"

# ============================================================================
# STEP 6: PM2 Setup
# ============================================================================
echo "⚙️ Setting up PM2 for all environments..."

# Stop any existing processes
sudo -u dev2k pm2 delete all 2>/dev/null || true

# Start production (port 3002)
cd "$PROJECT_BASE/lets-todo-api"
sudo -u dev2k pm2 start ecosystem.config.cjs --only lets-todo-api-prod

# Start feature (port 3003)  
cd "$PROJECT_BASE/lets-todo-api-feat"
sudo -u dev2k pm2 start ecosystem.config.cjs --only lets-todo-api-feat

# Start staging (port 3004)
cd "$PROJECT_BASE/lets-todo-api-stage"  
sudo -u dev2k pm2 start ecosystem.config.cjs --only lets-todo-api-stage

# Save PM2 configuration
sudo -u dev2k pm2 save

# Setup PM2 startup (as root but processes run as dev2k)
sudo -u dev2k pm2 startup systemd -u dev2k --hp /opt/dev2k-space/home

echo "✅ PM2 setup completed!"

# ============================================================================
# FINAL STATUS
# ============================================================================
echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo ""
echo "🌐 Your APIs are now available at:"
echo "  - Production:  https://lets-todo-api.dev2k.org       (Port 3002)"
echo "  - Feature:     https://lets-todo-api-feat.dev2k.org  (Port 3003)" 
echo "  - Staging:     https://lets-todo-api-stage.dev2k.org (Port 3004)"
echo ""
echo "📊 PM2 Status:"
sudo -u dev2k pm2 list
echo ""
echo "🎯 Next steps:"
echo "  - Test all environments: curl -I https://lets-todo-api.dev2k.org"
echo "  - Monitor logs: sudo -u dev2k pm2 logs"
echo "  - Monitor processes: sudo -u dev2k pm2 monit"

EOF

chmod +x "$DEPLOY_DIR/deploy-everything.sh"

# ============================================================================
# 3. Create deployment package
# ============================================================================
echo "📦 Creating deployment package..."

cd "$SCRIPT_DIR"
tar -czf "$PACKAGE_NAME" -C simple-package .

echo "✅ Simplified deployment package created: $SCRIPT_DIR/$PACKAGE_NAME"
echo ""
echo "🚀 SIMPLIFIED Deployment Instructions:"
echo "1. Upload: scp $PACKAGE_NAME root@217.154.113.51:/tmp/"  
echo "2. On server: cd /tmp && tar -xzf $PACKAGE_NAME"
echo "3. Run: ./deploy-everything.sh"
echo ""
echo "📊 Package contents:"
tar -tzf "$PACKAGE_NAME" | head -15
echo "..."
echo "Total files: $(tar -tzf "$PACKAGE_NAME" | wc -l)"