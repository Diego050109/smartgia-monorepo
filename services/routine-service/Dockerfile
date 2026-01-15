FROM node:20-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN pnpm config set node-linker hoisted

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/routine-service/package.json services/routine-service/package.json

RUN pnpm -w install --filter ./services/routine-service... --prod=false

COPY services/routine-service services/routine-service

WORKDIR /app/services/routine-service
RUN if [ -f prisma/schema.prisma ]; then pnpm prisma generate; fi
RUN if pnpm -s run | grep -q "build"; then pnpm run build; fi

EXPOSE 4003
CMD ["pnpm","run","start:prod"]
