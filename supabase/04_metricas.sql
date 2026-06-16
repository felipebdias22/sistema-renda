-- =============================================================
-- Métricas do vídeo: views e engajamento (informados manualmente)
-- Rode no SQL Editor do Supabase. É seguro: "if not exists" nunca dá erro.
-- =============================================================

alter table videos add column if not exists views text;
alter table videos add column if not exists engajamento text;
