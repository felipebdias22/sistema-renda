import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) =>
  env.split("\n").find((l) => l.startsWith(k + "="))?.slice(k.length + 1).trim();

const supabase = createClient(
  get("NEXT_PUBLIC_SUPABASE_URL"),
  get("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

async function dedup(tabela, chave) {
  const { data, error } = await supabase
    .from(tabela)
    .select("*")
    .order("criado_em", { ascending: true });
  if (error) return console.error(tabela, error.message);

  const vistos = new Set();
  const remover = [];
  for (const row of data) {
    const k = String(row[chave]).trim().toLowerCase();
    if (vistos.has(k)) remover.push(row.id);
    else vistos.add(k);
  }

  if (remover.length) {
    const { error: delErr } = await supabase
      .from(tabela)
      .delete()
      .in("id", remover);
    if (delErr) return console.error(tabela, delErr.message);
  }
  console.log(`✓ ${tabela}: ${vistos.size} únicos, ${remover.length} duplicados removidos`);
}

await dedup("nichos", "nome");
await dedup("paises", "nome");
