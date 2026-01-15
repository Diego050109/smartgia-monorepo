FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# Copiamos solo manifests primero (mejor cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY services/api-gateway/package.json services/api-gateway/package.json

# ✅ Instala SOLO lo necesario para api-gateway (incluye devDependencies)
RUN pnpm -w install --filter ./services/api-gateway... --prod=false

# Ahora sí copiamos el código
COPY services/api-gateway services/api-gateway

# Build del servicio
WORKDIR /app/services/api-gateway
RUN pnpm run build

EXPOSE 4000
CMD ["node", "dist/main.js"]
