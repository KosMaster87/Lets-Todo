FROM node:24.18.0-slim

WORKDIR /app

# Full workspace manifest (both packages) so the lockfile resolves correctly,
# even though only backend's dependencies get installed below.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN corepack enable && \
    pnpm install --frozen-lockfile --filter backend

COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"]
