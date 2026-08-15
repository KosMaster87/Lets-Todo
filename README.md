# Let's Todo

> **pnpm monorepo** for _Let's Todo_ - a full-stack todo app with a Vanilla JavaScript
> frontend and a Node.js/Express backend.

> **Branch note:** The GitHub default branch is `dev` (active development, full JSDoc,
> debug logs) - a plain `git clone` lands there. The stable, production-equivalent version
> always lives on **`main`**:
>
> ```bash
> git clone --branch main https://github.com/KosMaster87/Lets-Todo.git
> ```

---

## Live

| Environment        | URL                                                                        |
| ------------------ | -------------------------------------------------------------------------- |
| **Production App** | [lets-todo.dev2ksoftware.com](https://lets-todo.dev2ksoftware.com)         |
| **Production API** | [lets-todo-api.dev2ksoftware.com](https://lets-todo-api.dev2ksoftware.com) |

---

## Structure

```text
lets-todo/
├── frontend/ # Frontend (Vanilla JS SPA)
├── backend/ # Backend (Node.js / Express)
├── pnpm-workspace.yaml # pnpm workspace definition
├── package.json # Root orchestration (dev:backend, dev:frontend, format)
└── .prettierrc / .editorconfig # Shared formatting for both packages
```

A single `pnpm install` at this root installs both packages via one shared
`pnpm-lock.yaml`.

```bash
pnpm install
```

---

## Frontend

Vanilla JavaScript SPA with no build step.

**[Frontend README](./frontend/README.md)**

- Vanilla JavaScript ES6+ modules · SPA routing · reactive state management
- Cookie-based authentication · guest sessions
- PWA-capable · dark/light theme · responsive design
- JSON import/export · clean code: max. 14 lines per function

### Quickstart

```bash
pnpm run dev:frontend
# → http://127.0.0.1:5500
```

---

## Backend

Node.js / Express REST API.

**[Backend README](./backend/README.md)**

- Database-per-session architecture (MySQL/MariaDB)
- Environments: development · staging · production

### Quickstart

```bash
cp backend/config/env/.env.development.example backend/config/env/.env.development
pnpm --filter backend run dev:db
pnpm run dev:backend
# → http://127.0.0.1:3000
```

---

## Formatting

```bash
pnpm run format # Prettier across both packages
pnpm run format:check # check only, no writing
```

---

## Developer

**Konstantin Aksenov**
[GitHub](https://github.com/KosMaster87/Lets-Todo) · [konstantin@dev2ksoftware.com](mailto:konstantin@dev2ksoftware.com)
