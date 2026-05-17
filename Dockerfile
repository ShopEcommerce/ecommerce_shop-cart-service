FROM node:20-alpine AS builder

WORKDIR /app

COPY shared/teleshop-common-1.0.0.tgz ./shared/
COPY shared/teleshop-common-1.0.3.tgz ./shared/
COPY cart-service/package*.json ./cart-service/

WORKDIR /app/cart-service
RUN npm ci

COPY cart-service/ ./
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/cart-service
ENV NODE_ENV=production

COPY --from=builder /app/cart-service /app/cart-service

EXPOSE 3004
CMD ["node", "dist/index.js"]
