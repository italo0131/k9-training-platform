# Etapa 1: build
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Etapa 2: produção
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
CMD ["npm", "run", "start"]
