FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package.json
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run prisma:generate
RUN npm --workspace shared run build
RUN npm --workspace backend run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY infra/docker/backend-entrypoint.sh ./backend-entrypoint.sh
RUN chmod +x ./backend-entrypoint.sh
CMD ["./backend-entrypoint.sh"]
