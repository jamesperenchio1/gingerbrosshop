FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock* package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS builder
COPY package.json yarn.lock* package-lock.json* ./
RUN npm ci
COPY . .
RUN npx medusa build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/server
COPY --from=builder /app/.medusa/server /app/server
COPY --from=deps /app/node_modules /app/server/node_modules
# Increase admin dashboard file upload limit from 1MB to 20MB
COPY patch-dashboard.sh /tmp/patch-dashboard.sh
RUN sh /tmp/patch-dashboard.sh && rm /tmp/patch-dashboard.sh
EXPOSE 9000
CMD ["npx", "medusa", "start"]
