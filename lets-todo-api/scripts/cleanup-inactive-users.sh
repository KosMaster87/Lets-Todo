#!/usr/bin/env bash

#
# 🗓️ cleanup-inactive-users.sh
# Löscht User-Datenbanken von Benutzern, die X Tage nicht aktiv waren
# 🚀 Für regelmäßige Cronjob-Ausführung (monatlich)
# ⚠️  Löscht nur INAKTIVE User, nicht alle!

# ------ Konfiguration ------
# Option 1: Environment Variable (empfohlen für CI/CD)
if [[ -n "$MYSQL_ROOT_PASSWORD" ]]; then
  MYSQL="mysql -u root -p'${MYSQL_ROOT_PASSWORD}'"
# Option 2: MySQL Config File ~/.my.cnf (empfohlen für Server)
elif [[ -f ~/.my.cnf ]]; then
  MYSQL="mysql"  # Credentials aus ~/.my.cnf
else
  echo "❌ Error: No MySQL credentials found!"
  echo "💡 Option 1: MYSQL_ROOT_PASSWORD='your_password' ./cleanup-inactive-users.sh"
  echo "💡 Option 2: Create ~/.my.cnf with [client] user=root, password=xxx"
  exit 1
fi

# ------ Inactivity Configuration ------
DAYS_INACTIVE=${DAYS_INACTIVE:-30}  # Default: 30 days inactive
DRY_RUN=${DRY_RUN:-false}           # Default: Real deletion

echo "🧹 INACTIVE USER CLEANUP"
echo "======================="
echo "🗓️  Delete users inactive for: $DAYS_INACTIVE days"
echo "🔍 Dry Run Mode: $DRY_RUN"
echo ""

# ------ Find Inactive Users ------
echo "🔍 Searching for inactive users..."

# Unix timestamp for X days ago
CUTOFF_TIMESTAMP=$(($(date +%s) - (DAYS_INACTIVE * 24 * 60 * 60)))
CUTOFF_TIMESTAMP_MS=$((CUTOFF_TIMESTAMP * 1000))

echo "📅 Cutoff Timestamp: $CUTOFF_TIMESTAMP_MS ($(date -d @$CUTOFF_TIMESTAMP))"

# Find users who haven't been active for X days
# Use last_login (if available), otherwise fallback to created
INACTIVE_USERS=$(${MYSQL} -Nse "
  SELECT id, email, db_name,
         COALESCE(last_login, created) as last_activity
  FROM todos_users.users
  WHERE COALESCE(last_login, created) < $CUTOFF_TIMESTAMP_MS
  ORDER BY COALESCE(last_login, created) ASC;
" 2>/dev/null)

if [[ -z "$INACTIVE_USERS" ]]; then
  echo "✅ No inactive users found."
  echo "🎯 All users were active in the last $DAYS_INACTIVE days."
  exit 0
fi

echo "🎯 Found inactive users:"
echo "$INACTIVE_USERS" | while read -r user_id email db_name last_activity_ts; do
  last_activity_date=$(date -d @$((last_activity_ts / 1000)) 2>/dev/null || echo "Invalid Date")
  printf "   • ID %s: %s → %s (last activity: %s)\n" "$user_id" "$email" "$db_name" "$last_activity_date"
done

total_inactive=$(echo "$INACTIVE_USERS" | wc -l)
echo ""
echo "📊 Total $total_inactive inactive users found."

if [[ "$DRY_RUN" == "true" ]]; then
  echo "🚫 DRY RUN MODE - No real deletion!"
  echo "💡 For real deletion: DRY_RUN=false ./cleanup-inactive-users.sh"
  exit 0
fi

echo ""
read -p "❓ Do you really want to delete these $total_inactive users? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "❌ Cancelled."
  exit 0
fi

# ------ Deletion Logic ------
deleted_count=0
failed_count=0

echo ""
echo "🗑️  Starting deletion..."

echo "$INACTIVE_USERS" | while read -r user_id email db_name last_activity_ts; do
  echo "   Deleting user $user_id ($email) with DB: $db_name"

  # 1. Delete user database
  if ${MYSQL} -e "DROP DATABASE IF EXISTS \`$db_name\`;" 2>/dev/null; then
    echo "     ✅ Database $db_name deleted"
  else
    echo "     ❌ Error deleting database $db_name"
    ((failed_count++))
    continue
  fi

  # 2. Delete user from todos_users.users
  if ${MYSQL} -e "DELETE FROM todos_users.users WHERE id = $user_id;" 2>/dev/null; then
    echo "     ✅ User $user_id deleted from user table"
  else
    echo "     ❌ Error deleting user $user_id"
    ((failed_count++))
    continue
  fi

  # 3. Delete password reset tokens (if any)
  ${MYSQL} -e "DELETE FROM todos_users.password_reset_tokens WHERE user_id = $user_id;" 2>/dev/null

  ((deleted_count++))
  echo "     ✅ User $email completely deleted"
done

echo ""
echo "✅ Cleanup completed!"
echo "📊 Deleted: $deleted_count users"
echo "❌ Errors: $failed_count users"
echo "🗓️  Next cleanup recommended in $DAYS_INACTIVE days."
