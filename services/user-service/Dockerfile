FROM node:20-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN pnpm config set node-linker hoisted

# Copiamos manifests (para cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/user-service/package.json services/user-service/package.json

# Instalamos SOLO lo necesario para este servicio (incluye deps del workspace)
RUN pnpm -w install --filter ./services/user-service... --prod=false

# Copiamos el código del servicio
COPY services/user-service services/user-service

WORKDIR /app/services/user-service

# Prisma si existe (por si este servicio lo usa)
RUN if [ -f prisma/schema.prisma ]; then pnpm prisma generate; fi

# Build (si no tienes build, igual funciona con start:prod si existe dist)
RUN if pnpm -s run | grep -q "build"; then pnpm run build; fi

EXPOSE 4002
CMD ["pnpm","run","start:prod"]
