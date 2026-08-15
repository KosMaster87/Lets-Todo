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

echo "Creating step-by-step deployment package..."
echo "Project root: $PROJECT_ROOT"
echo "Deploy dir: $DEPLOY_DIR"

# Clean and create deploy directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# ============================================================================
# 1. Copy application files
# ============================================================================
echo "Copying application files..."

# Copy main application files
cp "$PROJECT_ROOT"/{server.js,db.js,package.json,package-lock.json} "$DEPLOY_DIR/"

# Copy directories
cp -r "$PROJECT_ROOT"/{config,middleware,routing,scripts,services} "$DEPLOY_DIR/"

# Remove example environment files from deployment package
echo "Removing example environment files from deployment package..."
find "$DEPLOY_DIR/config/env" -name "*.example" -type f -delete 2>/dev/null || true

# Copy Nginx configurations
cp -r "$PROJECT_ROOT/nginx" "$DEPLOY_DIR/"

# Copy ecosystem config
cp "$PROJECT_ROOT/ecosystem.config.cjs" "$DEPLOY_DIR/"

# ============================================================================
# 2. Copy template files from deployment-templates directory
# ============================================================================
echo "Copying modular template files from deployment-templates..."

# Create templates directory in deployment package
mkdir -p "$DEPLOY_DIR/templates"

# Template source directory
TEMPLATE_SRC="$SCRIPT_DIR/deployment-templates"

# Check if deployment-templates directory exists
if [ ! -d "$TEMPLATE_SRC" ]; then
    echo "Error: deployment-templates directory not found at $TEMPLATE_SRC"
    exit 1
fi

# Copy all template files to deployment package
echo "Copying template files:"
for template_file in "$TEMPLATE_SRC"/*; do
    if [ -f "$template_file" ]; then
        template_name=$(basename "$template_file")

        # Handle different file extensions properly
        if [[ "$template_name" == *.sh ]]; then
            # Already has .sh extension, keep it as-is
            target_name="$template_name"
        else
            # No .sh extension, add it
            target_name="${template_name}.sh"
        fi

        echo " $template_name -> ${target_name}"
        cp "$template_file" "$DEPLOY_DIR/templates/${target_name}"
        chmod +x "$DEPLOY_DIR/templates/${target_name}"
    fi
done

echo "All template files copied and made executable"

# ============================================================================
# 3. Create main deployment script with template integration
# ============================================================================
echo "Creating main deployment script with template integration..."

cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# ============================================================================
# MAIN DEPLOYMENT SCRIPT
# Usage: ./deploy.sh [prod|feat|stage|all]
# Uses modular templates for clean, maintainable deployment
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_NAME=$(basename "$SCRIPT_DIR")
TMP_DIR="/tmp/$PACKAGE_NAME"
BASE_PROJECT_DIR="/opt/dev2k-space/home/projects"

# Domain configuration
PROD_DOMAIN="lets-todo-api.dev2k.org"
FEAT_DOMAIN="lets-todo-api-feat.dev2k.org"
STAGE_DOMAIN="lets-todo-api-stage.dev2k.org"
ADMIN_EMAIL="konstantin@dev2ksoftware.com"

# Port configuration
PROD_PORT=3002
FEAT_PORT=3003
STAGE_PORT=3004

# Database configuration
DB_ROOT_PASSWORD="your_root_password"
DB_USER="dev2k"
DB_PASSWORD="your_db_password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

function log_success() {
    echo -e "${GREEN}$1${NC}"
}

function log_warning() {
    echo -e "${YELLOW} $1${NC}"
}

function log_error() {
    echo -e "${RED}$1${NC}"
}

function log_step() {
    echo -e "${CYAN}$1${NC}"
}

# Helper function to get configuration for environment
get_env_config() {
    local env=$1
    case "$env" in
        "prod")
            echo "$PROD_DOMAIN $PROD_PORT"
            ;;
        "feat")
            echo "$FEAT_DOMAIN $FEAT_PORT"
            ;;
        "stage")
            echo "$STAGE_DOMAIN $STAGE_PORT"
            ;;
    esac
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
    echo " prod - Production ($PROD_DOMAIN, Port $PROD_PORT)"
    echo " feat - Feature ($FEAT_DOMAIN, Port $FEAT_PORT)"
    echo " stage - Staging ($STAGE_DOMAIN, Port $STAGE_PORT)"
    echo " all - Deploy all three environments"
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
log_step "STARTING MODULAR DEPLOYMENT FOR: $ENVIRONMENT"
echo "Script directory: $SCRIPT_DIR"
echo "Templates directory: $SCRIPT_DIR/templates"
echo "Target base: $BASE_PROJECT_DIR"
echo ""

# ============================================================================
# Load all template functions
# ============================================================================
log_info "Loading deployment templates..."

# Check if templates directory exists
if [ ! -d "$SCRIPT_DIR/templates" ]; then
    log_error "Templates directory not found!"
    exit 1
fi

# Source all template files (skip interactive templates like create-user.sh)
for template_file in "$SCRIPT_DIR/templates"/*.sh; do
    if [ -f "$template_file" ]; then
        template_name=$(basename "$template_file" .sh)

        # Skip interactive templates that shouldn't auto-run
        case "$template_name" in
            "create-user"|"firewall-cloud"|"firewall-selfhosted"|"transfer-keys")
                log_info "Skipping interactive template: $template_name (run manually if needed)"
                continue
                ;;
        esac

        log_info "Loading template: $template_name"
        source "$template_file"
    fi
done

log_success "All templates loaded successfully"
echo ""

# ============================================================================
# Deploy single environment
# ============================================================================
deploy_single_environment() {
    local env=$1
    local env_config=($(get_env_config "$env"))
    local domain="${env_config[0]}"
    local port="${env_config[1]}"
    local target_dir="$BASE_PROJECT_DIR/lets-todo-$env"

    log_step "DEPLOYING $env ENVIRONMENT"
    echo "Domain: $domain"
    echo "Port: $port"
    echo "Target: $target_dir"
    echo ""

    # Step 1: Nginx HTTP Setup
    if type setup_nginx_http >/dev/null 2>&1; then
        log_step "STEP 1: Nginx HTTP Setup"
        setup_nginx_http "$env" "$domain"
    else
        log_warning "setup_nginx_http function not found in templates"
    fi

    # Step 2: SSL Certificates
    if type setup_ssl_cert >/dev/null 2>&1; then
        log_step "STEP 2: SSL Certificates"
        setup_ssl_cert "$env" "$domain" "$ADMIN_EMAIL"
    else
        log_warning "setup_ssl_cert function not found in templates"
    fi

    # Step 3: Project Files Copy
    if type copy_project_files >/dev/null 2>&1; then
        log_step "STEP 3: Project Files Copy"
        copy_project_files "$env" "$SCRIPT_DIR" "$target_dir"
    else
        log_warning "copy_project_files function not found in templates"
    fi

    # Step 4: Node.js Dependencies
    if type install_nodejs_dependencies >/dev/null 2>&1; then
        log_step "STEP 4: Node.js Dependencies"
        install_nodejs_dependencies "$env" "$target_dir"
    else
        log_warning "install_nodejs_dependencies function not found in templates"
    fi

    # Step 5: Database Setup
    if type setup_database >/dev/null 2>&1; then
        log_step "STEP 5: Database Setup"
        setup_database "$env" "$domain" "$port" "$target_dir"
    else
        log_warning "setup_database function not found in templates"
    fi

    # Step 6: PM2 Setup
    if type setup_pm2_process >/dev/null 2>&1; then
        log_step "STEP 6: PM2 Process Setup"
        setup_pm2_process "$env" "$target_dir" "$port"
    else
        log_warning "setup_pm2_process function not found in templates"
    fi

    # Step 7: Email Service Setup
    if type setup_email_service >/dev/null 2>&1; then
        log_step "STEP 7: Email Service Setup"
        setup_email_service "$env" "$domain" "$port" "$target_dir"
    else
        log_warning "setup_email_service function not found in templates"
    fi

    log_success "$env environment deployment completed!"
    echo ""
}

# ============================================================================
# Execute deployment based on environment
# ============================================================================

case "$ENVIRONMENT" in
    "all")
        log_step "DEPLOYING ALL ENVIRONMENTS"
        deploy_single_environment "prod"
        deploy_single_environment "feat"
        deploy_single_environment "stage"

        # Setup PM2 startup only once for all environments
        if type setup_pm2_startup >/dev/null 2>&1; then
            log_step "SETTING UP PM2 STARTUP"
            setup_pm2_startup
        fi
        ;;
    *)
        deploy_single_environment "$ENVIRONMENT"
        ;;
esac

# Step 8: Maintenance setup (run once)
if type setup_maintenance >/dev/null 2>&1; then
    log_step "STEP 8: Maintenance Setup"
    setup_maintenance "$BASE_PROJECT_DIR"
else
    log_warning "setup_maintenance function not found in templates"
fi

log_success "MODULAR DEPLOYMENT COMPLETED FOR: $ENVIRONMENT"
echo ""
echo "Summary:"
echo "All deployment steps executed using modular templates"
echo "Templates loaded: $(ls -1 "$SCRIPT_DIR/templates" | grep -E '\.(sh)$' | wc -l) files"
echo "Environment(s) deployed: $ENVIRONMENT"
echo ""
echo "Optional Manual Steps (run if needed):"
echo " ./templates/create-user.sh # Create system users"
echo " ./templates/firewall-cloud.sh # Configure cloud firewall"
echo " ./templates/firewall-selfhosted.sh # Configure self-hosted firewall"
echo " ./templates/transfer-keys.sh # Transfer SSH keys"

EOF

chmod +x "$DEPLOY_DIR/deploy.sh"

# Make all template files executable
for template_file in "$DEPLOY_DIR/templates"/*.sh; do
    if [ -f "$template_file" ]; then
        chmod +x "$template_file"
    fi
done

# ============================================================================
# 4. Create deployment package
# ============================================================================
echo "Creating deployment package..."

cd "$SCRIPT_DIR"
tar -czf "$PACKAGE_NAME" -C step-by-step-package .

echo "Modular step-by-step deployment package created: $SCRIPT_DIR/$PACKAGE_NAME"
echo ""
echo "FULLY MODULAR STRUCTURE READY!"
echo ""
echo "Template files included:"
ls -la "$DEPLOY_DIR/templates/" | grep -E "\.sh$" | awk '{print " " $NF}'
echo ""
echo "All deployment steps implemented:"
echo "1. Nginx HTTP-Setup (nginx-setup.sh)"
echo "2. SSL Certificates (ssl-setup.sh)"
echo "3. Project Files Copy (project-files-copy.sh)"
echo "4. Node.js Dependencies (nodejs-dependencies.sh)"
echo "5. Database Setup (database-setup.sh)"
echo "6. PM2 Process Setup (pm2-setup.sh)"
echo "7. Email Service Setup (email-service-setup.sh)"
echo "8. Maintenance Setup (maintenance-setup.sh)"
echo ""
echo "Package contents:"
tar -tzf "$PACKAGE_NAME" | head -20
if [ $(tar -tzf "$PACKAGE_NAME" | wc -l) -gt 20 ]; then
    echo "..."
fi
echo "Total files: $(tar -tzf "$PACKAGE_NAME" | wc -l)"
echo ""
echo "Ready for deployment!"
echo " Extract: tar -xzf $PACKAGE_NAME"
echo " Deploy: cd extracted-dir && sudo ./deploy.sh [prod|feat|stage|all]"
