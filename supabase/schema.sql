-- =============================================================
-- Máquina de Dólar: Facebook — Sistema Renda Dupla
-- Supabase schema
-- =============================================================

-- TABELAS PRINCIPAIS -----------------------------------------

create table if not exists nichos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  criado_em timestamptz default now()
);

create table if not exists paises (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text not null unique,
  criado_em timestamptz default now()
);

-- Garante a trava de unicidade mesmo em tabelas já existentes (sem duplicar)
do $$ begin
  alter table nichos add constraint nichos_nome_unico unique (nome);
exception when duplicate_table then null; when duplicate_object then null; end $$;
do $$ begin
  alter table paises add constraint paises_codigo_unico unique (codigo);
exception when duplicate_table then null; when duplicate_object then null; end $$;

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  vimeo_url text not null,
  nicho_id uuid references nichos(id),
  pais_id uuid references paises(id),
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists agentes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  video_tutorial_url text not null,
  link_agente text not null,
  ativo boolean default true,
  ordem integer default 0,
  criado_em timestamptz default now()
);

create table if not exists ia_geracoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tipo text not null,
  input text,
  output text,
  criado_em timestamptz default now()
);

create table if not exists ia_limite_imagem (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  data date not null,
  geracoes_usadas integer default 0,
  criado_em timestamptz default now(),
  unique(user_id, data)
);

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

-- RLS --------------------------------------------------------

alter table ia_geracoes enable row level security;
alter table ia_limite_imagem enable row level security;
alter table ganhos enable row level security;

drop policy if exists "user gerencia seus ganhos" on ganhos;
create policy "user gerencia seus ganhos" on ganhos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user vê só seus dados" on ia_geracoes;
create policy "user vê só seus dados" on ia_geracoes
  for all using (auth.uid() = user_id);

drop policy if exists "user vê só seu limite" on ia_limite_imagem;
create policy "user vê só seu limite" on ia_limite_imagem
  for all using (auth.uid() = user_id);

-- Conteúdo público (somente leitura para autenticados) -------
alter table nichos enable row level security;
alter table paises enable row level security;
alter table videos enable row level security;
alter table agentes enable row level security;

drop policy if exists "leitura autenticada nichos" on nichos;
create policy "leitura autenticada nichos" on nichos
  for select using (auth.role() = 'authenticated');

drop policy if exists "leitura autenticada paises" on paises;
create policy "leitura autenticada paises" on paises
  for select using (auth.role() = 'authenticated');

drop policy if exists "leitura autenticada videos" on videos;
create policy "leitura autenticada videos" on videos
  for select using (auth.role() = 'authenticated' and ativo = true);

drop policy if exists "leitura autenticada agentes" on agentes;
create policy "leitura autenticada agentes" on agentes
  for select using (auth.role() = 'authenticated' and ativo = true);

-- Admin (role no JWT app_metadata) pode tudo nas tabelas de conteúdo
-- Helper: identifica admin pelo claim app_metadata.role = 'admin'
create or replace function is_admin() returns boolean as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$ language sql stable;

do $$
declare t text;
begin
  foreach t in array array['nichos','paises','videos','agentes'] loop
    execute format('drop policy if exists "admin gerencia %1$s" on %1$s', t);
    execute format(
      'create policy "admin gerencia %1$s" on %1$s for all using (is_admin()) with check (is_admin())',
      t
    );
  end loop;
end $$;

-- STORAGE ----------------------------------------------------
-- Bucket privado para uploads de imagens dos alunos
insert into storage.buckets (id, name, public)
values ('imagens-ia', 'imagens-ia', false)
on conflict (id) do nothing;

drop policy if exists "user gerencia suas imagens" on storage.objects;
create policy "user gerencia suas imagens" on storage.objects
  for all to authenticated
  using (bucket_id = 'imagens-ia' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'imagens-ia' and (storage.foldername(name))[1] = auth.uid()::text);

-- =============================================================
-- ADMIN: defina a role de um usuário (rode no SQL editor)
--   update auth.users
--     set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--     where email = 'admin@exemplo.com';
-- =============================================================

-- SEED (opcional) --------------------------------------------
insert into nichos (nome) values
  ('Curiosidades'), ('Tecnologia'), ('Entretenimento'), ('Finanças'),
  ('Saúde'), ('Receitas'), ('Dicas'), ('Novelas'), ('Artesanato'),
  ('DIY'), ('Cortes'), ('Relacionamento'), ('Histórias'), ('Personagem UGC')
on conflict (nome) do nothing;

insert into paises (nome, codigo) values
  ('Brasil','BR'), ('EUA','US'), ('Alemanha','DE'), ('Itália','IT'),
  ('França','FR'), ('Árabe','AR'), ('Inglês','EN'), ('Português','PT'),
  ('Espanhol','ES')
on conflict (codigo) do nothing;
