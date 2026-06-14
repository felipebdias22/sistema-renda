-- =============================================================
-- Capas personalizadas dos vídeos (print do vídeo)
-- Rode no SQL Editor do Supabase.
-- =============================================================

-- Coluna para a URL da capa
alter table videos add column if not exists capa_url text;

-- Bucket público para as capas (leitura pública; upload é feito pelo
-- servidor com a service role, que ignora as policies)
insert into storage.buckets (id, name, public)
values ('capas', 'capas', true)
on conflict (id) do nothing;

drop policy if exists "capas leitura publica" on storage.objects;
create policy "capas leitura publica" on storage.objects
  for select using (bucket_id = 'capas');
