# =============================================================
# Máquina de Dólar: Facebook — Dockerfile (Next.js 14 standalone)
# Deploy: EasyPanel
# =============================================================

# ---------- 1. Dependências ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- 2. Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Variáveis PÚBLICAS são embutidas no build → precisam estar presentes aqui.
# No EasyPanel, defina-as como "Build Args" (ou Environment) do serviço.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Garante que a pasta public exista (Next a usa nos assets estáticos),
# mesmo que o repositório não tenha enviado uma pasta vazia.
RUN mkdir -p public
RUN npm run build

# ---------- 3. Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Saída standalone: servidor mínimo + assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
