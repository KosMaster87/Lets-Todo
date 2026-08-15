#!/bin/bash

# Cron Job Setup for Inactive User Cleanup
#
# Installation:
# 1. chmod +x scripts/setup-user-cleanup-cron.sh
# 2. ./scripts/setup-user-cleanup-cron.sh
#
# Or manually add to crontab -e:
# 0 3 1 * * cd /path/to/lets-todo-api && DRY_RUN=false DAYS_INACTIVE=90 ./scripts/cleanup-inactive-users.sh >> /var/log/user-cleanup.log 2>&1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up Inactive User Cleanup Cron Job..."
echo "📁 Project Directory: $PROJECT_DIR"
echo ""

# Get user configuration
echo "⚙️  Configuration:"
echo ""

# Default values
DEFAULT_DAYS=90
DEFAULT_SCHEDULE="0 3 1 * *"  # Monthly on 1st at 03:00

echo "📅 How many days of inactivity before deletion? (Default: $DEFAULT_DAYS)"
read -r DAYS_INPUT
DAYS_INACTIVE=${DAYS_INPUT:-$DEFAULT_DAYS}

echo ""
echo "⏰ Choose cron schedule:"
echo "   1) Monthly (1st of month, 03:00 AM) - Recommended"
echo "   2) Weekly (Sundays, 03:00 AM)"
echo "   3) Custom (manual input)"
echo ""
read -p "Choice (1-3): " SCHEDULE_CHOICE

case $SCHEDULE_CHOICE in
    1)
        CRON_SCHEDULE="0 3 1 * *"
        DESCRIPTION="Monthly on 1st at 03:00 AM"
        ;;
    2)
        CRON_SCHEDULE="0 3 * * 0"
        DESCRIPTION="Weekly on Sundays at 03:00 AM"
        ;;
    3)
        echo "Please enter cron schedule (Format: Min Hour Day Month Weekday):"
        echo "Examples:"
        echo "  0 3 1 * *     = Monthly on 1st at 03:00"
        echo "  0 2 * * 0     = Weekly on Sundays at 02:00"
        echo "  30 4 15 * *   = Monthly on 15th at 04:30"
        read -r CRON_SCHEDULE
        DESCRIPTION="Custom: $CRON_SCHEDULE"
        ;;
    *)
        CRON_SCHEDULE="0 3 1 * *"
        DESCRIPTION="Monthly on 1st at 03:00 AM (Default)"
        ;;
esac

echo ""
echo "🔍 Enable Dry-Run test? (y/N)"
echo "   (Recommended for first setup - runs simulation only)"
read -r DRY_RUN_INPUT
if [[ "$DRY_RUN_INPUT" =~ ^[yY]$ ]]; then
    DRY_RUN_VALUE="true"
    DRY_RUN_DESC=" (DRY-RUN Mode)"
else
    DRY_RUN_VALUE="false"
    DRY_RUN_DESC=""
fi

# Build cron entry
CRON_ENTRY="$CRON_SCHEDULE cd $PROJECT_DIR && DRY_RUN=$DRY_RUN_VALUE DAYS_INACTIVE=$DAYS_INACTIVE ./scripts/cleanup-inactive-users.sh >> /var/log/user-cleanup.log 2>&1"

echo ""
echo "📋 Configuration Summary:"
echo "   • Inactivity period: $DAYS_INACTIVE days"
echo "   • Schedule: $DESCRIPTION$DRY_RUN_DESC"
echo "   • Logfile: /var/log/user-cleanup.log"
echo ""
echo "🔧 Cron entry:"
echo "   $CRON_ENTRY"
echo ""

# Get confirmation
read -p "❓ Create cron job with this configuration? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[yY]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

# Check if already exists
if crontab -l 2>/dev/null | grep -q "cleanup-inactive-users.sh"; then
    echo "⚠️  User-Cleanup Cron Job already exists:"
    crontab -l | grep "cleanup-inactive-users.sh"
    echo ""
    echo "Do you want to replace it? (y/N)"
    read -r REPLACE_RESPONSE
    if [[ ! "$REPLACE_RESPONSE" =~ ^[yY]$ ]]; then
        echo "❌ Cancelled"
        exit 0
    fi

    # Remove old entry
    crontab -l | grep -v "cleanup-inactive-users.sh" | crontab -
    echo "🗑️  Old cron job removed"
fi

# Add new entry
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo ""
echo "✅ User-Cleanup Cron Job successfully added!"
echo ""
echo "📊 Details:"
echo "   • Schedule: $DESCRIPTION"
echo "   • Inactivity limit: $DAYS_INACTIVE days"
echo "   • Dry-Run: $DRY_RUN_VALUE"
echo "   • Logfile: /var/log/user-cleanup.log"
echo ""

if [[ "$DRY_RUN_VALUE" == "true" ]]; then
    echo "🧪 IMPORTANT: Dry-Run mode is enabled!"
    echo "   The job will only simulate, but not delete."
    echo "   After the first test you can edit the cron job:"
    echo "   crontab -e"
    echo "   Change DRY_RUN=true to DRY_RUN=false"
fi

echo ""
echo "🔍 Manual tests:"
echo "   # Dry-Run test (recommended first)"
echo "   DRY_RUN=true DAYS_INACTIVE=$DAYS_INACTIVE ./scripts/cleanup-inactive-users.sh"
echo ""
echo "   # Real execution (after test)"
echo "   DRY_RUN=false DAYS_INACTIVE=$DAYS_INACTIVE ./scripts/cleanup-inactive-users.sh"
echo ""
echo "📋 Current cron jobs:"
crontab -l

echo ""
echo "💡 Tips:"
echo "   • Monitor logs: tail -f /var/log/user-cleanup.log"
echo "   • Test manually first with DRY_RUN=true"
echo "   • Backup recommended before first real run"
echo "   • Edit cron jobs: crontab -e"
