# Let's Todo - Projektprofil für Bewerbungen

## Kurzbeschreibung

**Let's Todo** ist eine vollständige Full-Stack-Webanwendung zur Aufgabenverwaltung, die ich eigenständig konzipiert und entwickelt habe. Das Projekt umfasst ein Node.js/Express-Backend (REST-API) und ein Vanilla-JavaScript-Frontend - ohne Frontend-Framework - mit mehrsprachiger Deployment-Strategie und professioneller DevOps-Pipeline.

---

## Technologie-Stack

### Backend (`backend/`)

| Technologie     | Einsatz                                       |
| --------------- | --------------------------------------------- |
| Node.js (ESM)   | Laufzeitumgebung                              |
| Express.js v5   | REST-API-Framework                            |
| MySQL / MariaDB | Datenbank (dynamische DB-Erstellung pro User) |
| mysql2/promise  | Asynchrones Connection-Pool-Management        |
| bcrypt          | Passwort-Hashing                              |
| nodemailer      | E-Mail-Service (Passwort-Reset)               |
| dotenv          | Multi-Environment-Konfiguration               |
| PM2             | Prozessmanagement auf dem Server              |
| Nginx           | Reverse Proxy, SSL-Termination, Rate Limiting |
| Let's Encrypt   | Automatische SSL-Zertifikate                  |
| JSDoc           | API-Dokumentation                             |

### Frontend (`frontend/`)

| Technologie              | Einsatz                             |
| ------------------------ | ----------------------------------- |
| Vanilla JavaScript ES6+  | SPA ohne Framework, kein Build-Step |
| CSS3 / Custom Properties | Theme-System (Light / Dark / Comic) |
| Express.js               | Lokaler Dev-Server mit LiveReload   |
| Nodemon + Livereload     | Hot-Reload-Entwicklungsumgebung     |
| JSDoc                    | Frontend-Dokumentation              |
| PWA (Manifest)           | Progressive Web App-Grundlage       |

---

## Architektur-Highlights

### Database-per-Session-Architektur

Jeder Nutzer erhält bei der Registrierung eine **eigene MySQL-Datenbank** (`todos_user_{id}`). Das bedeutet vollständige Datenisolation zwischen Nutzern auf Datenbankebene - nicht nur durch WHERE-Klauseln. Gast-Sessions nutzen temporäre Datenbanken, die automatisch bereinigt werden.

```
todos_users          → zentrale Nutzerverwaltung (db_name-Spalte)
todos_user_123       → dedizierte DB für User 123
todos_guest_uuid1    → temporäre Gast-Datenbank (auto-cleanup)
```

### Dynamisches Connection-Pool-Management

Das Backend verwaltet Connection-Pools dynamisch pro Nutzer-Session. Middleware (`poolMiddleware.js`) weist jedem Request den korrekten Pool zu - mit automatischem Wiederaufbau nach Server-Neustart. Drei Pool-Typen: Core-Pool (DDL), User-Pool (Nutzerregistry), Session-Pools (pro Nutzer).

### Multi-Environment-Konfigurationssystem

Vier Umgebungen mit automatischer Erkennung über `NODE_ENV`:

| Umgebung    | Port | Domain                        | Zweck              |
| ----------- | ---- | ----------------------------- | ------------------ |
| development | 3000 | 127.0.0.1                     | Lokale Entwicklung |
| feature     | 3003 | lets-todo-api-feat.dev2k.org  | Feature-Tests      |
| staging     | 3004 | lets-todo-api-stage.dev2k.org | Pre-Production     |
| production  | 3002 | lets-todo-api.dev2k.org       | Live-System        |

### Reaktives State-Management ohne Framework

Das Frontend nutzt ein selbst entwickeltes, reaktives State-System (`main-state.js`): Ein zentraler `appState`, alle Änderungen über Setter-Funktionen, die `notifyListeners()` auslösen - vergleichbar mit Redux/Zustand, aber ohne Dependency. Zwei Session-Modi: `guest` (LocalStorage) und `user` (API-Sync).

### Automatisierte Staging-Pipeline

`npm run staging:prepare` führt vollautomatisch aus:

1. Feature-Branch auschecken
2. JSDoc-Kommentare entfernen (~5.000+ Zeilen)
3. Debug-Logs und Dev-Scripts löschen
4. Sauberen Code in `staging`-Branch mergen und pushen

---

## Implementierte Features

### Nutzer & Auth

- Registrierung mit automatischer Datenbank-Erstellung pro Nutzer
- Cookie-basierte Session-Authentifizierung (httpOnly, Secure)
- Passwort ändern (mit Verifikation des alten Passworts)
- Passwort-Reset via E-Mail-Link mit Ablauf-Token
- Gast-Modus: vollständige App-Nutzung ohne Konto

### Todo-Verwaltung

- CRUD (erstellen, lesen, bearbeiten, löschen)
- Papierkorb-System mit Wiederherstellung
- Kategorien, Prioritäten, Sortierung
- JSON-Import und -Export mit Validierung
- Sharing-Funktion (Link-basiert)

### Frontend / UX

- SPA-Navigation ohne Seitenneuladen
- Theme-System: Light, Dark, Comic (CSS Custom Properties)
- Toast-Notifications, Loading-Spinner, Accessibility (WCAG)
- Responsive Design, PWA-Manifest
- LiveReload-Entwicklungsserver

### DevOps & Deployment

- PM2-Prozessmanagement mit environment-spezifischen Configs
- Nginx Reverse Proxy mit Rate Limiting (10 req/sec)
- Let's Encrypt SSL via Certbot
- UFW-Firewall-Scripts (Cloud + Self-hosted)
- Automatisiertes Deployment-Package-Script

---

## Architekturprinzipien & Coding-Standards

- **14-Zeilen-Limit pro Funktion** - Single Responsibility konsequent umgesetzt
- **Parameterized Queries** - kein SQL-String-Interpolation, kein Injection-Risiko
- **Fail-Fast Pattern** - App startet nur bei funktionierender DB-Verbindung (PM2 startet neu)
- **Modularität** - Routing, Helpers, Services, State, Utils sauber getrennt
- **ES6 Module (ESM)** - vollständig, kein CommonJS im App-Code
- **JSDoc-Dokumentation** - alle Funktionen dokumentiert, auto-generierte Docs

---

## Live-Umgebungen

| Umgebung       | URL                                            |
| -------------- | ---------------------------------------------- |
| Production App | https://lets-todo.dev2k.org                    |
| Feature App    | https://lets-todo-app-feat.dev2k.org           |
| Production API | https://lets-todo-api.dev2k.org                |
| API Docs       | https://lets-todo-app-feat.dev2k.org/docs-api/ |
| Frontend Docs  | https://lets-todo-app-feat.dev2k.org/docs-app/ |

---

## Was das Projekt zeigt

- Eigenständige Konzeption und Umsetzung eines Full-Stack-Projekts von Grund auf
- Verständnis für Datenbankarchitektur über einfache CRUD-Muster hinaus
- Sicherheitsbewusstsein: Passwort-Hashing, httpOnly-Cookies, SQL-Injection-Prävention, CORS
- DevOps-Kompetenz: CI-ähnlicher Staging-Workflow, PM2, Nginx, SSL, Firewall
- Selbst entwickeltes reaktives State-Management ohne Framework-Abhängigkeit
- Professionelle Code-Organisation auch in größeren Vanilla-JS-Projekten

---

## Repository-Struktur (Branch-Strategie)

| Branch                 | Inhalt                                                 |
| ---------------------- | ------------------------------------------------------ |
| `feature/main-feature` | Entwicklungs-Branch mit vollem JSDoc und Debug-Logging |
| `staging`              | Auto-generiert: bereinigter, produktionsbereiter Code  |
| `main`                 | Stable Release für Deployment                          |
