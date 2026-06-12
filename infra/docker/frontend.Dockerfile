FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package.json
COPY frontend/package.json frontend/package.json
COPY shared/package.json shared/package.json
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm --workspace shared run build
RUN npm --workspace frontend run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/node_modules ./node_modules
CMD ["node_modules/.bin/next", "start", "frontend", "-p", "3000"]
