#!/bin/bash

# ============================================================================
# Multi-User Server Setup Script
# Creates isolated users with proper directory structure for deployment
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function for error handling
error_exit() {
  echo -e "${RED}❌ Error: $1${NC}" >&2
  exit 1
}

# Check for root privileges
if [ "$(id -u)" != "0" ]; then
  error_exit "This script must be run as root!"
fi

# Input validation
validate_input() {
  if [[ -z "$USERNAME" ]]; then
    error_exit "Username cannot be empty"
  fi
  
  if [[ ! "$USERNAME" =~ ^[a-z_][a-z0-9_-]{3,15}$ ]]; then
    error_exit "Invalid username (only lowercase letters, numbers, hyphens, 4-16 characters)"
  fi
}

# Interactive user configuration
echo -e "${BLUE}🔧 Multi-User Server Setup${NC}"
echo -e "${YELLOW}This script creates users with proper isolation for deployment${NC}"
echo ""

read -p "Username (recommended: dev2k): " USERNAME
validate_input

read -p "Is this an admin user? (y/n): " IS_ADMIN

# Group configuration
if [ "$IS_ADMIN" = "y" ]; then
  USER_GROUPS="sudo"
  echo -e "${YELLOW}ℹ️  User will be added to sudo group${NC}"
else
  read -p "Additional groups (comma-separated, empty for none): " USER_GROUPS
fi

# Directory structure setup
BASE_DIR="/opt/${USERNAME}-space"
echo -e "\n${BLUE}📁 Directory Setup${NC}"

if [ -d "$BASE_DIR" ]; then
  echo -e "${YELLOW}⚠️  Directory $BASE_DIR already exists${NC}"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    exit 0
  fi
fi

mkdir -p "${BASE_DIR}"/{home,data,logs} || error_exit "Could not create directory structure"
echo -e "${GREEN}✓ Created directory structure: ${BASE_DIR}/{home,data,logs}${NC}"

# User creation
echo -e "\n${BLUE}👤 User Creation${NC}"
if ! id "$USERNAME" &>/dev/null; then
  useradd -m -d "${BASE_DIR}/home" -s /bin/bash "$USERNAME" || error_exit "Could not create user"
  
  # Temporary password
  TEMP_PASS=$(openssl rand -base64 20 | tr -dc 'a-zA-Z0-9' | head -c 16)
  if ! echo "$USERNAME:$TEMP_PASS" | chpasswd >/dev/null 2>&1; then
    error_exit "Could not set password"
  fi
  
  # Force password change on first login
  passwd --expire "$USERNAME" >/dev/null || error_exit "Could not set password expiry"
  echo -e "${YELLOW}⚠️  Temporary password: $TEMP_PASS${NC}"
  echo -e "${YELLOW}   Password must be changed on first login!${NC}"
else
  echo -e "${YELLOW}⚠️  User $USERNAME already exists - skipping creation${NC}"
fi

# Add to groups
if [ -n "$USER_GROUPS" ]; then
  if ! usermod -aG "$USER_GROUPS" "$USERNAME"; then
    echo -e "${YELLOW}⚠️  Could not add to groups: $USER_GROUPS${NC}"
  else
    echo -e "${GREEN}✓ Added to groups: $USER_GROUPS${NC}"
  fi
fi

# SSH configuration
echo -e "\n${BLUE}🔑 SSH Configuration${NC}"
sudo -u "$USERNAME" mkdir -p "${BASE_DIR}/home/.ssh" || error_exit "Could not create .ssh directory"
sudo -u "$USERNAME" touch "${BASE_DIR}/home/.ssh/authorized_keys" || error_exit "Could not create authorized_keys"
sudo -u "$USERNAME" chmod 700 "${BASE_DIR}/home/.ssh" || error_exit "Could not set .ssh permissions"
sudo -u "$USERNAME" chmod 600 "${BASE_DIR}/home/.ssh/authorized_keys" || error_exit "Could not set authorized_keys permissions"
echo -e "${GREEN}✓ SSH configuration completed${NC}"

# Copy skeleton files (for proper shell environment)
echo -e "\n${BLUE}📋 Shell Environment Setup${NC}"
sudo cp -r /etc/skel/. "${BASE_DIR}/home/" 2>/dev/null || echo -e "${YELLOW}⚠️  No skeleton files found${NC}"
sudo chown -R "$USERNAME:$USERNAME" "${BASE_DIR}/home" || error_exit "Could not set home directory ownership"
echo -e "${GREEN}✓ Shell environment configured${NC}"

# Set directory permissions (Principle of Least Privilege)
echo -e "\n${BLUE}🔒 Permission Configuration${NC}"

# Home: Only user has access (700)
chown "$USERNAME:$USERNAME" "${BASE_DIR}/home" || error_exit "Could not set home ownership"
chmod 700 "${BASE_DIR}/home" || error_exit "Could not set home permissions"
echo -e "${GREEN}✓ Home directory: Strict isolation (700) - ${USERNAME} only${NC}"

# Data & Logs: Group access for shared operations (775)
chown root:"$USERNAME" "${BASE_DIR}"/{data,logs} || error_exit "Could not set data/logs ownership"
chmod 775 "${BASE_DIR}"/{data,logs} || error_exit "Could not set data/logs permissions"
echo -e "${GREEN}✓ Shared directories: Group access (775) - root:${USERNAME}${NC}"

# Summary
echo -e "\n${BLUE}📊 Setup Summary${NC}"
echo -e "${GREEN}✅ User $USERNAME successfully configured!${NC}"
echo ""
echo -e "${YELLOW}Directory Structure:${NC}"
ls -ld "$BASE_DIR"/* | awk '{print "  " $1 " " $3 ":" $4 " " $9}'

echo -e "\n${YELLOW}Navigation after login:${NC}"
echo "  cd ~                          # Home directory"
echo "  cd /opt/${USERNAME}-space     # Main directory"  
echo "  cd /opt/${USERNAME}-space/data # Data directory"
echo "  cd /opt/${USERNAME}-space/logs # Log directory"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Transfer SSH keys: ./scripts/transfer-keys.sh"
echo "2. Test SSH login: ssh ${USERNAME}@your-server-ip"  
echo "3. Change password on first login"
echo "4. Run deployment: ./deploy-app.sh"

echo -e "\n${GREEN}🎉 Multi-user setup completed!${NC}"