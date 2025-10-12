#!/bin/bash

# Cron Job Setup für Inactive User Cleanup
#
# Installation:
# 1. chmod +x scripts/setup-user-cleanup-cron.sh
# 2. ./scripts/setup-user-cleanup-cron.sh
#
# Oder manuell in crontab -e einfügen:
# 0 3 1 * * cd /path/to/lets-todo-api && DRY_RUN=false DAYS_INACTIVE=90 ./scripts/cleanup-inactive-users.sh >> /var/log/user-cleanup.log 2>&1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up Inactive User Cleanup Cron Job..."
echo "📁 Project Directory: $PROJECT_DIR"
echo ""

# Benutzer-Konfiguration abfragen
echo "⚙️  Konfiguration:"
echo ""

# Standard-Werte
DEFAULT_DAYS=90
DEFAULT_SCHEDULE="0 3 1 * *"  # Monatlich am 1. um 03:00 Uhr

echo "📅 Wie viele Tage Inaktivität bis zur Löschung? (Standard: $DEFAULT_DAYS)"
read -r DAYS_INPUT
DAYS_INACTIVE=${DAYS_INPUT:-$DEFAULT_DAYS}

echo ""
echo "⏰ Cron-Zeitplan wählen:"
echo "   1) Monatlich (1. des Monats, 03:00 Uhr) - Empfohlen"
echo "   2) Wöchentlich (Sonntags, 03:00 Uhr)"
echo "   3) Custom (eigene Eingabe)"
echo ""
read -p "Auswahl (1-3): " SCHEDULE_CHOICE

case $SCHEDULE_CHOICE in
    1)
        CRON_SCHEDULE="0 3 1 * *"
        DESCRIPTION="Monatlich am 1. um 03:00 Uhr"
        ;;
    2)
        CRON_SCHEDULE="0 3 * * 0"
        DESCRIPTION="Wöchentlich sonntags um 03:00 Uhr"
        ;;
    3)
        echo "Bitte Cron-Zeitplan eingeben (Format: Min Std Tag Mon Wochentag):"
        echo "Beispiele:"
        echo "  0 3 1 * *     = Monatlich am 1. um 03:00"
        echo "  0 2 * * 0     = Wöchentlich sonntags um 02:00"
        echo "  30 4 15 * *   = Monatlich am 15. um 04:30"
        read -r CRON_SCHEDULE
        DESCRIPTION="Custom: $CRON_SCHEDULE"
        ;;
    *)
        CRON_SCHEDULE="0 3 1 * *"
        DESCRIPTION="Monatlich am 1. um 03:00 Uhr (Standard)"
        ;;
esac

echo ""
echo "🔍 Dry-Run Test aktivieren? (j/N)"
echo "   (Empfohlen beim ersten Setup - führt nur Simulation aus)"
read -r DRY_RUN_INPUT
if [[ "$DRY_RUN_INPUT" =~ ^[jJ]$ ]]; then
    DRY_RUN_VALUE="true"
    DRY_RUN_DESC=" (DRY-RUN Modus)"
else
    DRY_RUN_VALUE="false"
    DRY_RUN_DESC=""
fi

# Cron-Eintrag zusammenbauen
CRON_ENTRY="$CRON_SCHEDULE cd $PROJECT_DIR && DRY_RUN=$DRY_RUN_VALUE DAYS_INACTIVE=$DAYS_INACTIVE ./scripts/cleanup-inactive-users.sh >> /var/log/user-cleanup.log 2>&1"

echo ""
echo "📋 Konfiguration Zusammenfassung:"
echo "   • Inaktivitäts-Zeitraum: $DAYS_INACTIVE Tage"
echo "   • Zeitplan: $DESCRIPTION$DRY_RUN_DESC"
echo "   • Logfile: /var/log/user-cleanup.log"
echo ""
echo "🔧 Cron-Eintrag:"
echo "   $CRON_ENTRY"
echo ""

# Bestätigung einholen
read -p "❓ Cron Job mit dieser Konfiguration erstellen? (j/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[jJ]$ ]]; then
    echo "❌ Abgebrochen"
    exit 0
fi

# Prüfen ob bereits vorhanden
if crontab -l 2>/dev/null | grep -q "cleanup-inactive-users.sh"; then
    echo "⚠️  User-Cleanup Cron Job bereits vorhanden:"
    crontab -l | grep "cleanup-inactive-users.sh"
    echo ""
    echo "Möchten Sie ihn ersetzen? (j/N)"
    read -r REPLACE_RESPONSE
    if [[ ! "$REPLACE_RESPONSE" =~ ^[jJ]$ ]]; then
        echo "❌ Abgebrochen"
        exit 0
    fi

    # Alten Eintrag entfernen
    crontab -l | grep -v "cleanup-inactive-users.sh" | crontab -
    echo "🗑️  Alter Cron Job entfernt"
fi

# Neuen Eintrag hinzufügen
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo ""
echo "✅ User-Cleanup Cron Job erfolgreich hinzugefügt!"
echo ""
echo "📊 Details:"
echo "   • Zeitplan: $DESCRIPTION"
echo "   • Inaktivitäts-Grenze: $DAYS_INACTIVE Tage"
echo "   • Dry-Run: $DRY_RUN_VALUE"
echo "   • Logfile: /var/log/user-cleanup.log"
echo ""

if [[ "$DRY_RUN_VALUE" == "true" ]]; then
    echo "🧪 WICHTIG: Dry-Run Modus ist aktiviert!"
    echo "   Der Job wird nur simulieren, aber nicht löschen."
    echo "   Nach dem ersten Test können Sie den Cron Job bearbeiten:"
    echo "   crontab -e"
    echo "   Ändern Sie DRY_RUN=true zu DRY_RUN=false"
fi

echo ""
echo "🔍 Manuelle Tests:"
echo "   # Dry-Run Test (empfohlen zuerst)"
echo "   DRY_RUN=true DAYS_INACTIVE=$DAYS_INACTIVE ./scripts/cleanup-inactive-users.sh"
echo ""
echo "   # Echte Ausführung (nach Test)"
echo "   DRY_RUN=false DAYS_INACTIVE=$DAYS_INACTIVE ./scripts/cleanup-inactive-users.sh"
echo ""
echo "📋 Aktuelle Cron Jobs:"
crontab -l

echo ""
echo "💡 Tipps:"
echo "   • Überwachen Sie die Logs: tail -f /var/log/user-cleanup.log"
echo "   • Testen Sie zuerst manuell mit DRY_RUN=true"
echo "   • Backup vor dem ersten echten Lauf empfohlen"
echo "   • Cron Jobs bearbeiten: crontab -e"
