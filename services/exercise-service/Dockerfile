FROM node:20-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN pnpm config set node-linker hoisted

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/exercise-service/package.json services/exercise-service/package.json

RUN pnpm -w install --filter ./services/exercise-service... --prod=false

COPY services/exercise-service services/exercise-service

WORKDIR /app/services/exercise-service
RUN if [ -f prisma/schema.prisma ]; then pnpm prisma generate; fi
RUN if pnpm -s run | grep -q "build"; then pnpm run build; fi

EXPOSE 4004
CMD ["pnpm","run","start:prod"]
