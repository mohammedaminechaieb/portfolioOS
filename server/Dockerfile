FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]