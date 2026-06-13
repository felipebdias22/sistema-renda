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

# Variáveis PÚBLICAS são embutidas no código durante o build (o Next.js
# "grava" os valores no bundle). A URL e a chave ANON são públicas por
# natureza (expostas no navegador, protegidas por RLS), então ficam aqui
# como padrão para o build sempre ter os valores — mesmo que a plataforma
# não passe build args. Podem ser sobrescritas via --build-arg.
# NUNCA coloque aqui chaves secretas (service_role, Anthropic): essas só em runtime.
ARG NEXT_PUBLIC_SUPABASE_URL=https://jpoxdsitdbaduqxbjjin.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3hkc2l0ZGJhZHVxeGJqamluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTM0OTQsImV4cCI6MjA5Njc2OTQ5NH0.Qp16S-ztWElSqI9oiBXu3iTuEquitWEn0h6Ct7FEhPw
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
