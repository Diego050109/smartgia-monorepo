FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/progress-service services/progress-service

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --filter progress-service...

EXPOSE 4007

CMD ["pnpm","--filter","progress-service","run","start:dev"]
