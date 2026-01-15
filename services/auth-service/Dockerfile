FROM node:20-alpine

WORKDIR /app

# pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN pnpm config set node-linker hoisted

# Copiamos todo el monorepo
COPY . .

# Instalamos deps (incluye devDeps para poder compilar)
ENV CI=true
RUN pnpm -w install --frozen-lockfile --prod=false

# Prisma client (auth-service)
WORKDIR /app/services/auth-service
RUN pnpm prisma generate

# ✅ COMPILAR auth-service (esto es lo que te falta)
RUN pnpm run build

EXPOSE 4001

# ✅ Arranca el JS compilado
CMD ["node", "dist/main.js"]
