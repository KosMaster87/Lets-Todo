#!/bin/bash

# ============================================================================
# UFW Firewall Setup for Cloud Servers (IONOS, AWS, DigitalOcean, etc.)
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔥 Setting up UFW firewall for CLOUD server...${NC}"

# Configuration variables - CHANGE THESE!
SERVER_IP="YOUR_SERVER_IP"          # Your cloud server's public IP
HOME_IPV4="YOUR_HOME_IPV4"          # Your home/office IPv4
HOME_IPV6_SUBNET="YOUR_HOME_IPV6/64" # Your home/office IPv6 subnet

# Check if variables are still default
if [[ "$SERVER_IP" == "YOUR_SERVER_IP" ]] || [[ "$HOME_IPV4" == "YOUR_HOME_IPV4" ]]; then
    echo -e "${RED}❌ Please edit this script and set your real IP addresses!${NC}"
    echo ""
    echo "Find your IPs with:"
    echo "  curl -4 ifconfig.me  # Your home IPv4"
    echo "  curl -6 ifconfig.me  # Your home IPv6"
    echo "  # Server IP: Run 'curl -4 ifconfig.me' on your server"
    exit 1
fi

echo -e "${YELLOW}⚠️  Resetting UFW and configuring new rules...${NC}"

# Reset UFW completely
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH Access Rules
echo -e "${GREEN}🔑 Setting up SSH access rules...${NC}"
sudo ufw allow from "$SERVER_IP" to any port 22 proto tcp comment "Cloud Console Fallback SSH"
sudo ufw allow from "$HOME_IPV4" to any port 22 proto tcp comment "Home IPv4 SSH"
sudo ufw allow from "$HOME_IPV6_SUBNET" to any port 22 proto tcp comment "Home IPv6 SSH"

# Web traffic
echo -e "${GREEN}🌐 Allowing HTTP/HTTPS traffic...${NC}"
sudo ufw allow 80,443/tcp comment "HTTP/HTTPS"

# Block all application ports (3000+) - only accessible via Nginx proxy
echo -e "${GREEN}🚫 Blocking direct application port access...${NC}"
sudo ufw deny 3000:65535/tcp comment "Block direct app access"
sudo ufw allow from 127.0.0.1 to any port 3000:65535 comment "Allow localhost"

# Enable firewall
echo -e "${GREEN}✅ Enabling UFW firewall...${NC}"
sudo ufw --force enable
sudo ufw reload

# Show final status
echo -e "\n${GREEN}📋 Final UFW rules:${NC}\n"
sudo ufw status numbered

echo -e "\n${GREEN}🎉 Cloud firewall setup completed!${NC}"
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Test SSH access before disconnecting!"
echo "- Applications are only accessible via Nginx (ports 80/443)"
echo "- Direct port access (3000+) is blocked from internet"