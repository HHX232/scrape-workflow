# --- Stage 1: Dependencies ---
FROM node:20-bookworm-slim AS deps
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# --- Stage 2: Builder ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем Next.js
RUN npm run build

# --- Stage 3: Runner ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Копируем standalone сборку
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Копируем Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Копируем package.json и создаем скрипт
COPY --from=builder /app/package.json ./package.json

# Создаем скрипт запуска
RUN echo '#!/bin/sh\n\
echo "=== Running Prisma migrations ==="\n\
npx prisma migrate deploy\n\
echo "=== Starting Next.js ==="\n\
node server.js' > /app/start.sh && chmod +x /app/start.sh

# Создаем пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["/app/start.sh"]