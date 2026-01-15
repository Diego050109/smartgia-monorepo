FROM node:20-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN pnpm config set node-linker hoisted

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/attendance-service/package.json services/attendance-service/package.json

RUN pnpm -w install --filter ./services/attendance-service... --prod=false

COPY services/attendance-service services/attendance-service

WORKDIR /app/services/attendance-service
RUN if [ -f prisma/schema.prisma ]; then pnpm prisma generate; fi
RUN if pnpm -s run | grep -q "build"; then pnpm run build; fi

EXPOSE 4005
CMD ["pnpm","run","start:prod"]
