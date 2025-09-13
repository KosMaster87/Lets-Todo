#!/bin/bash

# ============================================================================
# Deployment Package Creator for lets-todo Multi-Environment Setup
# ============================================================================

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$SCRIPT_DIR/package"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="lets-todo-deployment_$TIMESTAMP.tar.gz"

echo "🚀 Creating deployment package..."
echo "Project root: $PROJECT_ROOT"
echo "Deploy dir: $DEPLOY_DIR"

# Clean and create deployment directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# ============================================================================
# 1. Copy application files
# ============================================================================
echo "📦 Copying application files..."

# Core application files
cp "$PROJECT_ROOT/server.js" "$DEPLOY_DIR/"
cp "$PROJECT_ROOT/package.json" "$DEPLOY_DIR/"
cp "$PROJECT_ROOT/package-lock.json" "$DEPLOY_DIR/" 2>/dev/null || echo "No package-lock.json found"

# Application directories (excluding config - will be handled separately)
cp -r "$PROJECT_ROOT/middleware" "$DEPLOY_DIR/"
cp -r "$PROJECT_ROOT/routing" "$DEPLOY_DIR/"
cp -r "$PROJECT_ROOT/scripts" "$DEPLOY_DIR/"

# Copy config directory structure (excluding env files for now)
mkdir -p "$DEPLOY_DIR/config"
cp "$PROJECT_ROOT/config/environment.js" "$DEPLOY_DIR/config/" 2>/dev/null || echo "No environment.js found"

# Database file
cp "$PROJECT_ROOT/db.js" "$DEPLOY_DIR/"

# ============================================================================
# 2. Copy deployment configurations
# ============================================================================
echo "🔧 Copying deployment configurations..."

# Environment files (now in config/env/) - only real env files, not examples
mkdir -p "$DEPLOY_DIR/config/env"
cp "$PROJECT_ROOT/config/env/.env.production" "$DEPLOY_DIR/config/env/"
cp "$PROJECT_ROOT/config/env/.env.feature" "$DEPLOY_DIR/config/env/"
cp "$PROJECT_ROOT/config/env/.env.staging" "$DEPLOY_DIR/config/env/"
# Also copy main .env if it exists (for fallback)
cp "$PROJECT_ROOT/config/env/.env" "$DEPLOY_DIR/config/env/" 2>/dev/null || echo "No main .env file found"

# PM2 configuration
cp "$PROJECT_ROOT/ecosystem.config.cjs" "$DEPLOY_DIR/"

# Nginx configurations
mkdir -p "$DEPLOY_DIR/nginx"
cp -r "$PROJECT_ROOT/nginx/"* "$DEPLOY_DIR/nginx/"

# Documentation
cp "$PROJECT_ROOT/DEPLOYMENT.md" "$DEPLOY_DIR/"
cp "$PROJECT_ROOT/README.md" "$DEPLOY_DIR/" 2>/dev/null || echo "No README.md found"

# ============================================================================
# 3. Create deployment scripts
# ============================================================================
echo "📝 Creating deployment scripts..."

# Create ROOT deployment script (to be run as root)
cat > "$DEPLOY_DIR/deploy-root.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# ROOT Deployment Script - Nginx & SSL Setup (run as root)
# ============================================================================

set -e

NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo "🚀 Starting ROOT deployment (Nginx & SSL)..."

# ============================================================================
# 1. Setup Nginx HTTP-only configurations (for certbot)
# ============================================================================
echo "🌐 Setting up HTTP-only Nginx configurations for certbot..."

# Create webroot directory for certbot
sudo mkdir -p /var/www/certbot/.well-known/acme-challenge/
sudo chown -R www-data:www-data /var/www/certbot

# Add global rate limiting configuration
sudo tee /etc/nginx/conf.d/rate-limiting.conf > /dev/null << 'RATE_LIMIT'
# Global Rate Limiting Configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
RATE_LIMIT

# Copy HTTP-only nginx configs for certificate request
cat > "$NGINX_SITES/lets-todo-api.dev2k.org.conf" << 'NGINX_HTTP'
server {
    listen 80;
    listen [::]:80;
    server_name lets-todo-api.dev2k.org www.lets-todo-api.dev2k.org;

    # ACME Challenge for certbot
    location /.well-known/acme-challenge/ {
        alias /var/www/certbot/.well-known/acme-challenge/;
        try_files $uri =404;
    }

    # Temporary: serve all other requests (will change to HTTPS redirect after SSL)
    location / {
        return 200 "SSL setup in progress...";
        add_header Content-Type text/plain;
    }
}
NGINX_HTTP

# Copy similar configs for feature and staging
cat > "$NGINX_SITES/lets-todo-api-feat.dev2k.org.conf" << 'NGINX_HTTP_FEAT'
server {
    listen 80;
    listen [::]:80;
    server_name lets-todo-api-feat.dev2k.org;

    location /.well-known/acme-challenge/ {
        alias /var/www/certbot/.well-known/acme-challenge/;
        try_files $uri =404;
    }

    location / {
        return 200 "SSL setup in progress...";
        add_header Content-Type text/plain;
    }
}
NGINX_HTTP_FEAT

cat > "$NGINX_SITES/lets-todo-api-stage.dev2k.org.conf" << 'NGINX_HTTP_STAGE'
server {
    listen 80;
    listen [::]:80;
    server_name lets-todo-api-stage.dev2k.org;

    location /.well-known/acme-challenge/ {
        alias /var/www/certbot/.well-known/acme-challenge/;
        try_files $uri =404;
    }

    location / {
        return 200 "SSL setup in progress...";
        add_header Content-Type text/plain;
    }
}
NGINX_HTTP_STAGE

# Enable sites
sudo ln -sf "$NGINX_SITES/lets-todo-api.dev2k.org.conf" "$NGINX_ENABLED/"
sudo ln -sf "$NGINX_SITES/lets-todo-api-feat.dev2k.org.conf" "$NGINX_ENABLED/"
sudo ln -sf "$NGINX_SITES/lets-todo-api-stage.dev2k.org.conf" "$NGINX_ENABLED/"

# Test nginx configuration
sudo nginx -t
sudo systemctl reload nginx

echo "✅ HTTP-only Nginx setup completed!"
echo ""
echo "🔒 Next step: Run SSL setup"
echo "./setup-ssl.sh"
echo ""
echo "🗄️ Database setup will be handled after SSL setup"

EOF

# Create simplified ALL-IN-ONE deployment script (run as root only)
cat > "$DEPLOY_DIR/deploy-all.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# SIMPLIFIED DEPLOYMENT - Everything as ROOT user
# Deploys to: /opt/dev2k-space/home/projects/
# ============================================================================

set -e

PROJECT_BASE="/opt/dev2k-space/home/projects"
DEPLOYMENT_DIR=$(pwd)

echo "🚀 Starting SIMPLIFIED deployment (everything as root)..."
echo "📍 Current directory: $DEPLOYMENT_DIR"  
echo "🎯 Target base directory: $PROJECT_BASE"

# ============================================================================
# 1. Setup Nginx (HTTP-only first)
# ============================================================================
echo "🌐 Setting up HTTP-only Nginx configurations for certbot..."

NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Create webroot directory for certbot
sudo mkdir -p /var/www/certbot/.well-known/acme-challenge/
sudo chown -R www-data:www-data /var/www/certbot

# Add global rate limiting configuration
sudo tee /etc/nginx/conf.d/rate-limiting.conf > /dev/null << 'RATE_LIMIT'
# Global Rate Limiting Configuration  
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
RATE_LIMIT

# Copy application files (excluding nginx configs)
echo "📂 Copying application files..."
rsync -av --exclude='nginx/' --exclude='deploy-root.sh' --exclude='setup-ssl.sh' . "$PROJECT_PATH/"
cd "$PROJECT_PATH"

# Create logs directory
mkdir -p logs

# ============================================================================
# 2. Install dependencies
# ============================================================================
echo "📦 Installing Node.js dependencies..."
npm ci --omit=dev

# ============================================================================
# 2.5. Database already set up by root user
# ============================================================================
echo "🗄️ Database schema already configured by root user - skipping..."

# ============================================================================
# 3. Setup PM2 applications
# ============================================================================
echo "⚙️  Setting up PM2 applications..."

# Stop existing PM2 processes (if any)
pm2 delete lets-todo-api-prod 2>/dev/null || true
pm2 delete lets-todo-api-feat 2>/dev/null || true
pm2 delete lets-todo-api-stage 2>/dev/null || true

# Start PM2 applications
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 startup (will show command to run as root)
echo "📋 PM2 startup command (run as root):"
PM2_STARTUP_CMD=$(pm2 startup systemd -u dev2k --hp /opt/dev2k-space/home 2>/dev/null | grep "sudo env")
echo "$PM2_STARTUP_CMD"

# Create PM2 startup script for root to execute
cat > ~/pm2-startup.sh << 'PM2_SCRIPT'
#!/bin/bash
echo "🔧 Setting up PM2 startup for dev2k user..."
sudo env PATH=$PATH:/opt/dev2k-space/home/.nvm/versions/node/v24.3.0/bin /opt/dev2k-space/home/.nvm/versions/node/v24.3.0/lib/node_modules/pm2/bin/pm2 startup systemd -u dev2k --hp /opt/dev2k-space/home
echo "✅ PM2 startup configured!"
PM2_SCRIPT
chmod +x ~/pm2-startup.sh

echo "✅ APP deployment completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Switch back to root: exit"
echo "2. Run PM2 startup: ~/pm2-startup.sh"
echo ""
echo "📊 Status commands:"
echo "pm2 status"
echo "pm2 logs"
echo "pm2 monit"

EOF

# Make deployment scripts executable
chmod +x "$DEPLOY_DIR/deploy-root.sh"
chmod +x "$DEPLOY_DIR/deploy-app.sh"

# Create SSL setup script with full HTTPS configurations
cat > "$DEPLOY_DIR/setup-ssl.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# SSL Certificate Setup Script (run as root after deploy-root.sh)
# ============================================================================

set -e

NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo "🔒 Setting up SSL certificates for all environments..."

# Setup webroot directory
sudo mkdir -p /var/www/certbot/.well-known/acme-challenge/
sudo chown -R www-data:www-data /var/www/certbot

# Get certificates for all domains
domains=(
    "lets-todo-api.dev2k.org"
    "lets-todo-api-feat.dev2k.org"
    "lets-todo-api-stage.dev2k.org"
)

for domain in "${domains[@]}"; do
    echo "📜 Requesting certificate for $domain..."
    sudo certbot certonly \
        --webroot -w /var/www/certbot \
        -d "$domain" \
        --agree-tos --no-eff-email \
        -m konstantin.aksenov@dev2k.org \
        --keep-until-expiring --non-interactive
done

echo "✅ All SSL certificates have been obtained!"

# ============================================================================
# Update Nginx configurations with full HTTPS support
# ============================================================================
echo "🔧 Updating Nginx configurations with HTTPS..."

# Production (Port 3002)
cat > "$NGINX_SITES/lets-todo-api.dev2k.org.conf" << 'NGINX_PROD'
# HTTP Server - ACME Challenge + HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name lets-todo-api.dev2k.org www.lets-todo-api.dev2k.org;

    # ACME Challenge for certbot
    location /.well-known/acme-challenge/ {
        alias /var/www/certbot/.well-known/acme-challenge/;
        try_files $uri =404;
    }

    # All other requests redirect to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server - Production API
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name lets-todo-api.dev2k.org;

    # SSL Configuration
    ssl_certificate     /etc/letsencrypt/live/lets-todo-api.dev2k.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lets-todo-api.dev2k.org/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header Referrer-Policy "no-referrer-when-downgrade";

    # Logging
    access_log  /var/log/nginx/lets-todo-api.log;
    error_log   /var/log/nginx/lets-todo-api.error.log warn;

    # API Proxy to Production (Port 3002)
    location ^~ /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass         http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Real-IP          $remote_addr;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
        proxy_set_header   Upgrade            $http_upgrade;
        proxy_set_header   Connection         "upgrade";

        # Cookie Settings
        proxy_cookie_domain ~^\.lets-todo-api\.dev2k\.org$ .dev2k.org;
        proxy_cookie_path ~*^/.* /;
        proxy_pass_header Set-Cookie;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # All other paths return 404
    location / {
        return 404;
    }
}
NGINX_PROD

# Feature Environment (Port 3003)
cat > "$NGINX_SITES/lets-todo-api-feat.dev2k.org.conf" << 'NGINX_FEAT'
server {
    listen 80;
    listen [::]:80;
    server_name lets-todo-api-feat.dev2k.org;

    location /.well-known/acme-challenge/ {
        alias /var/www/certbot/.well-known/acme-challenge/;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name lets-todo-api-feat.dev2k.org;

    ssl_certificate     /etc/letsencrypt/live/lets-todo-api-feat.dev2k.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lets-todo-api-feat.dev2k.org/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    access_log  /var/log/nginx/lets-todo-api-feat.log;
    error_log   /var/log/nginx/lets-todo-api-feat.error.log warn;

    location ^~ /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass         http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Real-IP          $remote_addr;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
        proxy_set_header   Upgrade            $http_upgrade;
        proxy_set_header   Connection         "upgrade";

        proxy_cookie_domain ~^\.lets-todo-api-feat\.dev2k\.org$ .dev2k.org;
        proxy_cookie_path ~*^/.* /;
        proxy_pass_header Set-Cookie;
        
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location / {
        return 404;
    }
}
NGINX_FEAT

# Staging Environment (Port 3004)  
cat > "$NGINX_SITES/lets-todo-api-stage.dev2k.org.conf" << 'NGINX_STAGE'
server {
    listen 80;
    listen [::]:80;
    server_name lets-todo-api-stage.dev2k.org;

    location /.well-known/acme-challenge/ {
        alias /var/www/certbot/.well-known/acme-challenge/;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name lets-todo-api-stage.dev2k.org;

    ssl_certificate     /etc/letsencrypt/live/lets-todo-api-stage.dev2k.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lets-todo-api-stage.dev2k.org/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    access_log  /var/log/nginx/lets-todo-api-stage.log;
    error_log   /var/log/nginx/lets-todo-api-stage.error.log warn;

    location ^~ /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass         http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Real-IP          $remote_addr;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
        proxy_set_header   Upgrade            $http_upgrade;
        proxy_set_header   Connection         "upgrade";

        proxy_cookie_domain ~^\.lets-todo-api-stage\.dev2k\.org$ .dev2k.org;
        proxy_cookie_path ~*^/.* /;
        proxy_pass_header Set-Cookie;
        
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location / {
        return 404;
    }
}
NGINX_STAGE

echo "🔄 Reloading Nginx with HTTPS configurations..."
sudo nginx -t
sudo systemctl reload nginx

echo "🎉 SSL setup completed!"
echo ""
echo "🌐 Your APIs are now available at:"
echo "  - Production: https://lets-todo-api.dev2k.org"
echo "  - Feature: https://lets-todo-api-feat.dev2k.org" 
echo "  - Staging: https://lets-todo-api-stage.dev2k.org"
echo ""

# ============================================================================
# Database Setup (as root)
# ============================================================================
echo "🗄️ Setting up database schema (as root)..."
echo "📦 Installing Node.js dependencies first..."
npm install --omit=dev

echo "🔧 Creating databases for all environments..."
node scripts/setup-dev-db.js
if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
else
    echo "❌ Database setup failed - check your MariaDB configuration"
    echo "💡 Make sure MariaDB is running: sudo systemctl start mariadb"
    echo "💡 Check root access: mysql -u root -p"
fi

echo ""
echo "🎯 Next step: Switch to dev2k user and run ./deploy-app.sh"

EOF

chmod +x "$DEPLOY_DIR/setup-ssl.sh"

# ============================================================================
# 4. Create package
# ============================================================================
echo "📦 Creating deployment package..."

cd "$SCRIPT_DIR"
# Create package with directory structure (will create a folder when extracted)
PACKAGE_DIR_NAME="lets-todo-deployment_$TIMESTAMP"
tar -czf "$PACKAGE_NAME" --transform "s,^\.,${PACKAGE_DIR_NAME}," -C package .

echo "✅ Deployment package created: $SCRIPT_DIR/$PACKAGE_NAME"
echo ""
echo "🚀 Korrekte Deployment-Reihenfolge:"
echo "1. Als ROOT: scp $PACKAGE_NAME root@217.154.113.51:/tmp/"
echo "2. Als ROOT auf Server: cd /tmp && tar -xzf $PACKAGE_NAME"
echo "   → Erstellt Ordner: /tmp/lets-todo-deployment_$TIMESTAMP/"
echo "3. Als ROOT: cd lets-todo-deployment_$TIMESTAMP"
echo "4. Als ROOT: ./deploy-root.sh    # Nginx HTTP-only Setup"
echo "5. Als ROOT: ./setup-ssl.sh      # SSL Zertifikate + HTTPS Setup"
echo "6. Als ROOT: su - dev2k          # Switch to dev2k user"
echo "7. Als DEV2K: cd /tmp/lets-todo-deployment_$TIMESTAMP"
echo "8. Als DEV2K: ./deploy-app.sh    # PM2 & Anwendung"
echo ""
echo "📊 Package contents:"
tar -tzf "$PACKAGE_NAME" | head -20
echo "..."
echo "Total files: $(tar -tzf "$PACKAGE_NAME" | wc -l)"