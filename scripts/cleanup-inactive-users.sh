#!/usr/bin/env bash
#
# 🗓️ cleanup-inactive-users.sh
# Löscht User-Datenbanken von Benutzern, die X Tage nicht aktiv waren
# 🚀 Für regelmäßige Cronjob-Ausführung (monatlich)
# ⚠️  Löscht nur INAKTIVE User, nicht alle!

# —————— Konfiguration ——————
# Option 1: Environment Variable (empfohlen für CI/CD)
if [[ -n "$MYSQL_ROOT_PASSWORD" ]]; then
  MYSQL="mysql -u root -p'${MYSQL_ROOT_PASSWORD}'"
# Option 2: MySQL Config File ~/.my.cnf (empfohlen für Server)
elif [[ -f ~/.my.cnf ]]; then
  MYSQL="mysql"  # Credentials aus ~/.my.cnf
else
  echo "❌ Error: Keine MySQL-Credentials gefunden!"
  echo "💡 Option 1: MYSQL_ROOT_PASSWORD='your_password' ./cleanup-inactive-users.sh"
  echo "💡 Option 2: Erstelle ~/.my.cnf mit [client] user=root, password=xxx"
  exit 1
fi

# —————— Inaktivitäts-Konfiguration ——————
DAYS_INACTIVE=${DAYS_INACTIVE:-30}  # Standard: 30 Tage inaktiv
DRY_RUN=${DRY_RUN:-false}           # Standard: Echte Löschung

echo "🧹 INACTIVE USER CLEANUP"
echo "======================="
echo "🗓️  Lösche User inaktiv seit: $DAYS_INACTIVE Tagen"
echo "🔍 Dry Run Mode: $DRY_RUN"
echo ""

# —————— Inaktive User finden ——————
echo "🔍 Suche nach inaktiven Usern..."

# Unix timestamp für X Tage ago
CUTOFF_TIMESTAMP=$(($(date +%s) - (DAYS_INACTIVE * 24 * 60 * 60)))
CUTOFF_TIMESTAMP_MS=$((CUTOFF_TIMESTAMP * 1000))

echo "📅 Cutoff Timestamp: $CUTOFF_TIMESTAMP_MS ($(date -d @$CUTOFF_TIMESTAMP))"

# Finde User die seit X Tagen nicht aktiv waren
# Nutze last_login (falls vorhanden), sonst fallback auf created
INACTIVE_USERS=$(${MYSQL} -Nse "
  SELECT id, email, db_name,
         COALESCE(last_login, created) as last_activity
  FROM todos_users.users
  WHERE COALESCE(last_login, created) < $CUTOFF_TIMESTAMP_MS
  ORDER BY COALESCE(last_login, created) ASC;
" 2>/dev/null)

if [[ -z "$INACTIVE_USERS" ]]; then
  echo "✅ Keine inaktiven User gefunden."
  echo "🎯 Alle User waren in den letzten $DAYS_INACTIVE Tagen aktiv."
  exit 0
fi

echo "🎯 Gefundene inaktive User:"
echo "$INACTIVE_USERS" | while read -r user_id email db_name last_activity_ts; do
  last_activity_date=$(date -d @$((last_activity_ts / 1000)) 2>/dev/null || echo "Invalid Date")
  printf "   • ID %s: %s → %s (letzte Aktivität: %s)\n" "$user_id" "$email" "$db_name" "$last_activity_date"
done

total_inactive=$(echo "$INACTIVE_USERS" | wc -l)
echo ""
echo "📊 Insgesamt $total_inactive inaktive User gefunden."

if [[ "$DRY_RUN" == "true" ]]; then
  echo "🚫 DRY RUN MODE - Keine echte Löschung!"
  echo "💡 Zum echten Löschen: DRY_RUN=false ./cleanup-inactive-users.sh"
  exit 0
fi

echo ""
read -p "❓ Möchten Sie diese $total_inactive User wirklich löschen? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "❌ Abgebrochen."
  exit 0
fi

# —————— Löschlogik ——————
deleted_count=0
failed_count=0

echo ""
echo "🗑️  Starte Löschung..."

echo "$INACTIVE_USERS" | while read -r user_id email db_name last_activity_ts; do
  echo "   Lösche User $user_id ($email) mit DB: $db_name"

  # 1. User-Datenbank löschen
  if ${MYSQL} -e "DROP DATABASE IF EXISTS \`$db_name\`;" 2>/dev/null; then
    echo "     ✅ Datenbank $db_name gelöscht"
  else
    echo "     ❌ Fehler beim Löschen der Datenbank $db_name"
    ((failed_count++))
    continue
  fi

  # 2. User aus todos_users.users löschen
  if ${MYSQL} -e "DELETE FROM todos_users.users WHERE id = $user_id;" 2>/dev/null; then
    echo "     ✅ User $user_id aus User-Tabelle gelöscht"
  else
    echo "     ❌ Fehler beim Löschen des Users $user_id"
    ((failed_count++))
    continue
  fi

  # 3. Password-Reset-Tokens löschen (falls vorhanden)
  ${MYSQL} -e "DELETE FROM todos_users.password_reset_tokens WHERE user_id = $user_id;" 2>/dev/null

  ((deleted_count++))
  echo "     ✅ User $email komplett gelöscht"
done

echo ""
echo "✅ Cleanup abgeschlossen!"
echo "📊 Gelöscht: $deleted_count User"
echo "❌ Fehler: $failed_count User"
echo "🗓️  Nächster Cleanup in $DAYS_INACTIVE Tagen empfohlen."
