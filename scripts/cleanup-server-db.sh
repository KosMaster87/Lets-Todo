#!/usr/bin/env bash
#
# 🌐 cleanup-server-db.sh
# Löscht ALLE Server-Datenbanken für Todos (Guest + User), behält nur zentrale User-DB
# 🚀 Für SERVER-Environments: feat/staging/production
# ⚠️  WARNUNG: Löscht alle User-Daten unwiderruflich!

# —————— Konfiguration ——————
# Option 1: Environment Variable (empfohlen für CI/CD)
if [[ -n "$MYSQL_ROOT_PASSWORD" ]]; then
  MYSQL="mysql -u root -p'${MYSQL_ROOT_PASSWORD}'"
# Option 2: MySQL Config File ~/.my.cnf (empfohlen für Server)
elif [[ -f ~/.my.cnf ]]; then
  MYSQL="mysql"  # Credentials aus ~/.my.cnf
else
  echo "❌ Error: Keine MySQL-Credentials gefunden!"
  echo "💡 Option 1: MYSQL_ROOT_PASSWORD='your_password' ./cleanup-server-db.sh"
  echo "💡 Option 2: Erstelle ~/.my.cnf mit [client] user=root, password=xxx"
  exit 1
fi

# —————— Datenbankmuster ——————
PATTERNS=("todos_guest_" "todos_user_")
EXCLUDE_DBS=("todos_users" "todos_main")

echo "🧹 TODOS DATABASE CLEANUP"
echo "=========================="

# —————— Löschlogik ——————
total_deleted=0

for pattern in "${PATTERNS[@]}"; do
  echo "🔍 Suche nach Datenbanken mit Muster: ${pattern}% ..."
  DBS=$(${MYSQL} -Nse "SHOW DATABASES LIKE '${pattern}%';" 2>/dev/null)

  if [[ -z "$DBS" ]]; then
    echo "   Keine Datenbanken gefunden."
    continue
  fi

  # Filtere die auszuschließenden Datenbanken
  TO_DELETE=""
  for db in $DBS; do
    exclude=false
    for exclude_db in "${EXCLUDE_DBS[@]}"; do
      if [[ "$db" == "$exclude_db" ]]; then
        exclude=true
        break
      fi
    done

    if [[ "$exclude" == false ]]; then
      TO_DELETE="$TO_DELETE $db"
    fi
  done

  if [[ -z "$TO_DELETE" ]]; then
    echo "   Keine zu löschenden Datenbanken gefunden (nach Filterung)."
    continue
  fi

  echo "🗑️  Folgende Datenbanken werden gelöscht:"
  echo "$TO_DELETE" | tr ' ' '\n' | sed 's/^/     • /'
  echo

  for db in $TO_DELETE; do
    echo "   Dropping $db ..."
    ${MYSQL} -e "DROP DATABASE IF EXISTS \`${db}\`;" 2>/dev/null
    ((total_deleted++))
  done
done

echo ""
echo "✅ Fertig. Es wurden $total_deleted Datenbanken gelöscht."
echo "🏛️  Die zentralen Datenbanken bleiben erhalten:"
for exclude_db in "${EXCLUDE_DBS[@]}"; do
  echo "     • $exclude_db"
done

# —————— User-Daten bereinigen ——————
echo ""
echo "🧹 Leere zentrale User-Tabelle..."
${MYSQL} -e "DELETE FROM todos_users.users;" 2>/dev/null
${MYSQL} -e "DELETE FROM todos_users.password_reset_tokens;" 2>/dev/null
echo "✅ User-Daten geleert"

echo ""
echo "🎯 Server-Datenbank-Cleanup abgeschlossen!"
echo "🚀 Führe jetzt aus: NODE_ENV=feat node scripts/setup-multi-env-db.js"
