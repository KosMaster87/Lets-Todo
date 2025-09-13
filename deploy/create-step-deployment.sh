#!/bin/bash

# ============================================================================
# Step-by-Step Deployment Script Creator
# Creates deploy.sh with environment selection: prod|feat|stage|all
# ============================================================================

set -e

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$SCRIPT_DIR/step-by-step-package"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="lets-todo-step-deployment_$TIMESTAMP.tar.gz"

echo "🚀 Creating step-by-step deployment package..."
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
# 2. Create main deployment script
# ============================================================================
echo "📝 Creating main deployment script..."

cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# MAIN DEPLOYMENT SCRIPT
# Usage: ./deploy.sh [prod|feat|stage|all]
# Extracts to /tmp, then deploys to /opt/dev2k-space/home/projects/
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_NAME=$(basename "$SCRIPT_DIR")
TMP_DIR="/tmp/$PACKAGE_NAME"
BASE_PROJECT_DIR="/opt/dev2k-space/home/projects"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

function log_step() {
    echo -e "${CYAN}🚀 $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root!"
    log_info "Usage: sudo ./deploy.sh [prod|feat|stage|all]"
    exit 1
fi

# Parse environment argument
ENVIRONMENT="$1"

if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment not specified!"
    echo ""
    echo "Usage: sudo ./deploy.sh [ENVIRONMENT]"
    echo ""
    echo "Available environments:"
    echo "  prod   - Production (lets-todo-api.dev2k.org, Port 3002)"
    echo "  feat   - Feature (lets-todo-api-feat.dev2k.org, Port 3003)"
    echo "  stage  - Staging (lets-todo-api-stage.dev2k.org, Port 3004)"
    echo "  all    - Deploy all three environments"
    exit 1
fi

# Validate environment
case "$ENVIRONMENT" in
    "prod"|"feat"|"stage"|"all")
        log_success "Environment: $ENVIRONMENT"
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        log_info "Valid options: prod, feat, stage, all"
        exit 1
        ;;
esac

echo ""
log_step "STARTING DEPLOYMENT FOR: $ENVIRONMENT"
echo "📍 Script directory: $SCRIPT_DIR"
echo "📁 Temp directory: $TMP_DIR" 
echo "🎯 Target base: $BASE_PROJECT_DIR"
echo ""

EOF

chmod +x "$DEPLOY_DIR/deploy.sh"

# ============================================================================
# 3. Create deployment package
# ============================================================================
echo "📦 Creating deployment package..."

cd "$SCRIPT_DIR"
tar -czf "$PACKAGE_NAME" -C step-by-step-package .

echo "✅ Step-by-step deployment package created: $SCRIPT_DIR/$PACKAGE_NAME"
echo ""
echo "🚀 Basic structure ready!"
echo ""
echo "Next steps to add:"
echo "1. ⏳ Nginx HTTP-Setup"
echo "2. ⏳ SSL Certificates" 
echo "3. ⏳ Project Files Copy"
echo "4. ⏳ Node.js Dependencies"
echo "5. ⏳ Database Setup"
echo "6. ⏳ PM2 Setup"
echo ""
echo "📊 Package contents:"
tar -tzf "$PACKAGE_NAME"