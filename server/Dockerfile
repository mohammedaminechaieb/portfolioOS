FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]