# ---------- Étape 1 : dépendances + build ----------
FROM node:20-slim AS builder
WORKDIR /app

# OpenSSL requis par Prisma sur les images Debian slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Étape 2 : image de production ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Applique les migrations puis démarre l'API — nécessite DATABASE_URL au runtime
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
