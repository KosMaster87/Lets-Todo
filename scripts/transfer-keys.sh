#!/bin/bash

# ============================================================================
# SSH Key Transfer Script
# Transfers SSH public keys to server users for passwordless authentication
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

# Input validation
validate_input() {
  if [[ -z "$SERVER_IP" || -z "$USERNAME" || -z "$KEY_PATH" ]]; then
    error_exit "All inputs are required (server IP, username, key path)"
  fi

  # Auto-add .pub extension if not present
  if [[ ! "$KEY_PATH" =~ \.pub$ ]]; then
    KEY_PATH="${KEY_PATH}.pub"
  fi

  # Expand ~ to home directory
  KEY_PATH="${KEY_PATH/#\~/$HOME}"

  if [[ ! -f "$KEY_PATH" ]]; then
    error_exit "Public key file not found: $KEY_PATH"
  fi
}

# Find SSH keys automatically
find_keys() {
  echo -e "${BLUE}🔍 Available SSH keys:${NC}"
  local key_count=0
  local key_files=()
  
  for key in ~/.ssh/*.pub; do
    if [ -f "$key" ]; then
      key_count=$((key_count + 1))
      key_files+=("$key")
      echo "  $key_count) $(basename "$key")"
    fi
  done
  
  if [ $key_count -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No SSH keys found in ~/.ssh/${NC}"
    return 1
  fi
  
  echo -e "  0) Specify custom path"
  echo ""
  
  while true; do
    read -p "Select key (0-$key_count): " selection
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 0 ] && [ "$selection" -le "$key_count" ]; then
      if [ "$selection" -eq 0 ]; then
        return 1
      else
        KEY_PATH="${key_files[$((selection-1))]}"
        return 0
      fi
    else
      echo -e "${RED}Invalid selection. Please choose 0-$key_count${NC}"
    fi
  done
}

# Main script
echo -e "${BLUE}🔑 SSH Key Transfer Utility${NC}"
echo -e "${YELLOW}Transfer your SSH public key for passwordless authentication${NC}"
echo ""

# Get server details
read -p "Server IP address: " SERVER_IP
read -p "Username on server: " USERNAME

# Key selection
if find_keys; then
  echo -e "${GREEN}✓ Selected key: $(basename "$KEY_PATH")${NC}"
else
  read -p "Path to public key file: " KEY_PATH
fi

# Validate all inputs
validate_input

# Transfer options
echo -e "\n${YELLOW}Transfer Options:${NC}"
echo "1) Replace existing keys (remove all current keys)"
echo "2) Add key (keep existing keys)"
read -p "Choose option (1/2): " OPTION

case "$OPTION" in
  1)
    echo -e "${YELLOW}🗑️  Replacing existing keys...${NC}"
    PRIVATE_KEY="${KEY_PATH%.pub}"
    
    # Clear existing keys and set up fresh
    if ssh -i "$PRIVATE_KEY" -o ConnectTimeout=10 "$USERNAME@$SERVER_IP" \
       "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '' > ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"; then
      echo -e "${GREEN}✓ Cleared existing keys${NC}"
    else
      error_exit "Could not clear existing keys - check connectivity and permissions"
    fi
    ;;
  2)
    echo -e "${YELLOW}➕ Adding key to existing keys...${NC}"
    ;;
  *)
    error_exit "Invalid option. Please choose 1 or 2"
    ;;
esac

# Transfer the key
echo -e "${YELLOW}🔑 Transferring SSH key...${NC}"
if ssh-copy-id -f -i "$KEY_PATH" "$USERNAME@$SERVER_IP"; then
  echo -e "${GREEN}✓ Key transferred successfully${NC}"
else
  error_exit "Key transfer failed - check server connectivity and username"
fi

# Connection test
echo -e "\n${GREEN}🧪 Testing connection...${NC}"
PRIVATE_KEY="${KEY_PATH%.pub}"

if ssh -i "$PRIVATE_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$USERNAME@$SERVER_IP" exit 2>/dev/null; then
  echo -e "${GREEN}  ✅ Passwordless SSH login successful!${NC}"
  echo -e "${GREEN}  🎯 Connection command: ssh -i $PRIVATE_KEY $USERNAME@$SERVER_IP${NC}"
else
  error_exit "Connection test failed - key may not be properly configured"
fi

# Summary
echo -e "\n${BLUE}📋 Summary${NC}"
echo -e "${GREEN}✅ SSH key successfully transferred!${NC}"
echo ""
echo -e "${YELLOW}Connection details:${NC}"
echo "  Server: $SERVER_IP"
echo "  User: $USERNAME"  
echo "  Key: $(basename "$KEY_PATH")"
echo ""
echo -e "${YELLOW}Quick connect:${NC}"
echo "  ssh $USERNAME@$SERVER_IP"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test passwordless login"
echo "2. Run deployment scripts"
echo "3. Consider disabling password authentication for enhanced security"

echo -e "\n${GREEN}🎉 SSH key transfer completed!${NC}"