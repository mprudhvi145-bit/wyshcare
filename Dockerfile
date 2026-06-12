# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root package files (includes workspace lockfile)
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy workspace package.json files
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all workspace dependencies
RUN npm ci --workspaces --omit=optional

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Generate Prisma client first
RUN npm run prisma:generate --workspace=backend

# Build shared first, then backend
RUN npm run build --workspace=shared && npm run build --workspace=backend

# ---- Production Stage ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini curl

# Copy built artifacts and node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/package.json ./

EXPOSE 30013
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:30013/api/v1/health/live || exit 1

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/backend/src/main.js"]