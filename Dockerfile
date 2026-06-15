FROM node:20-alpine

# Install OpenSSL, which is required by Prisma on Alpine Linux
RUN apk add --no-cache openssl


WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
