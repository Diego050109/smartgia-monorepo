FROM node:20-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN pnpm config set node-linker hoisted

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/history-service/package.json services/history-service/package.json

RUN pnpm -w install --filter ./services/history-service... --prod=false

COPY services/history-service services/history-service

WORKDIR /app/services/history-service
RUN if [ -f prisma/schema.prisma ]; then pnpm prisma generate; fi
RUN if pnpm -s run | grep -q "build"; then pnpm run build; fi

EXPOSE 4006
CMD ["pnpm","run","start:prod"]
