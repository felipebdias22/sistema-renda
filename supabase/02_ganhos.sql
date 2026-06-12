-- =============================================================
-- Controle de Lucros — tabela de ganhos diários (USD → BRL)
-- Rode este SQL no SQL Editor do Supabase.
-- =============================================================

create table if not exists ganhos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  data date not null,
  valor_usd numeric(12,2) not null,
  cotacao numeric(10,4) not null,
  valor_brl numeric(12,2) not null,
  criado_em timestamptz default now()
);

create index if not exists ganhos_user_data_idx on ganhos (user_id, data desc);

alter table ganhos enable row level security;

drop policy if exists "user gerencia seus ganhos" on ganhos;
create policy "user gerencia seus ganhos" on ganhos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
