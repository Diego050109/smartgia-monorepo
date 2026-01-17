FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/notification-service services/notification-service

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --filter notification-service...

EXPOSE 4008
CMD ["pnpm","--filter","notification-service","run","start:dev"]
