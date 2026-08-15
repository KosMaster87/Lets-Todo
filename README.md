# Let's Todo

> **pnpm-Monorepo** für _Let's Todo_ - eine Full-Stack Todo-App mit Vanilla JavaScript
> Frontend und Node.js/Express Backend.

---

## Live

| Umgebung           | URL                                                        |
| ------------------ | ---------------------------------------------------------- |
| **Production App** | [lets-todo.dev2k.org](https://lets-todo.dev2k.org)         |
| **Production API** | [lets-todo-api.dev2k.org](https://lets-todo-api.dev2k.org) |

---

## Struktur

```text
lets-todo/
├── frontend/ # Frontend (Vanilla JS SPA)
├── backend/ # Backend (Node.js / Express)
├── pnpm-workspace.yaml # pnpm-Workspace-Definition
├── package.json # Root-Orchestrierung (dev:backend, dev:frontend, format)
├── .prettierrc / .editorconfig # Geteilte Formatierung für beide Packages
└── lets-todo-bewerbung-profil.md # Projektprofil für Bewerbungen
```

Ein `pnpm install` an dieser Wurzel installiert beide Packages über ein gemeinsames
`pnpm-lock.yaml`.

```bash
pnpm install
```

---

## Frontend

Vanilla JavaScript SPA ohne Build-Schritt.

**[Frontend README](./frontend/README.md)**

- Vanilla JavaScript ES6+ Module · SPA-Routing · Reaktives State Management
- Cookie-basierte Authentifizierung · Gast-Sessions
- PWA-fähig · Dark/Light Theme · Responsive Design
- JSON Import/Export · Clean Code: max. 14 Zeilen pro Funktion

### Schnellstart

```bash
pnpm run dev:frontend
# → http://127.0.0.1:5500
```

---

## Backend

Node.js / Express REST API.

**[Backend README](./backend/README.md)**

- Database-per-Session Architektur (MySQL/MariaDB)
- Umgebungen: Development · Staging · Production

### Schnellstart

```bash
cp backend/config/env/.env.development.example backend/config/env/.env.development
pnpm --filter backend run dev:db
pnpm run dev:backend
# → http://127.0.0.1:3000
```

---

## Formatierung

```bash
pnpm run format # Prettier über beide Packages
pnpm run format:check # nur prüfen, nicht schreiben
```

---

## Entwickler

**Konstantin Aksenov**
[GitHub](https://github.com/KosMaster87/lets-todo) · [Konstantin.Aksenov@dev2k.org](mailto:Konstantin.Aksenov@dev2k.org)
