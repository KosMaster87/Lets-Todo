# Let's Todo

> **pnpm-Monorepo** für _Let's Todo_ - eine Full-Stack Todo-App mit Vanilla JavaScript
> Frontend und Node.js/Express Backend.

> **Hinweis zum Branch:** Der GitHub-Default-Branch ist `dev` (aktive Entwicklung, volle
> JSDoc, Debug-Logs) - ein einfacher `git clone` landet also dort. Die stabile,
> produktionsgleiche Version steht immer auf **`main`**:
>
> ```bash
> git clone --branch main https://github.com/KosMaster87/Lets-Todo.git
> ```

---

## Live

| Umgebung           | URL                                                                        |
| ------------------ | -------------------------------------------------------------------------- |
| **Production App** | [lets-todo.dev2ksoftware.com](https://lets-todo.dev2ksoftware.com)         |
| **Production API** | [lets-todo-api.dev2ksoftware.com](https://lets-todo-api.dev2ksoftware.com) |

---

## Struktur

```text
lets-todo/
├── frontend/ # Frontend (Vanilla JS SPA)
├── backend/ # Backend (Node.js / Express)
├── pnpm-workspace.yaml # pnpm-Workspace-Definition
├── package.json # Root-Orchestrierung (dev:backend, dev:frontend, format)
└── .prettierrc / .editorconfig # Geteilte Formatierung für beide Packages
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
[GitHub](https://github.com/KosMaster87/Lets-Todo) · [konstantin@dev2ksoftware.com](mailto:konstantin@dev2ksoftware.com)
