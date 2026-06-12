# Máquina de Dólar: Facebook — Sistema Renda Dupla

Plataforma de membros (Next.js 14 App Router + Tailwind + Supabase + Anthropic).

## Setup

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e rode o SQL de `supabase/schema.sql`
   no **SQL Editor** (cria tabelas, RLS, bucket `imagens-ia`, policies e seed).

3. No Supabase: **Authentication → Providers → Email** habilitado (email + senha).

4. Copie `.env.local.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ANTHROPIC_API_KEY=...
   ```

5. Rode:
   ```bash
   npm run dev
   ```

## Admin

Defina a role de um usuário como admin (SQL Editor do Supabase):

```sql
update auth.users
  set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
  where email = 'admin@exemplo.com';
```

O usuário precisa relogar para o claim entrar no JWT. O link **Admin** aparece na
sidebar e a rota `/admin` é protegida por middleware + verificação de role.

## Estrutura

- `middleware.ts` — protege todas as rotas; redireciona não autenticados para `/login`,
  e bloqueia `/admin` para não-admins.
- `src/app/login` — login email/senha (Supabase Auth).
- `src/app/(app)/dashboard` — visão geral.
- `src/app/(app)/videos` — banco de vídeos com filtros combinados (nicho + país) e player Vimeo em modal.
- `src/app/(app)/agentes` — agentes GPT com tutorial Vimeo e link externo.
- `src/app/(app)/ia` — abas "Roteiro & Títulos" e "Recriar Imagem".
- `src/app/api/ia/roteiro` — Anthropic `claude-sonnet-4-20250514` → título, descrição, roteiro.
- `src/app/api/ia/imagem` — Anthropic vision → recriação do criativo; limite de 3 gerações/dia.
- `src/app/(app)/admin` — CRUD de vídeos, nichos, países e agentes (Server Actions).

## Modelo de IA

`claude-sonnet-4-20250514` (definido em `src/lib/anthropic.ts`).
