import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Carrega .env.local manualmente
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) =>
  env.split("\n").find((l) => l.startsWith(k + "="))?.slice(k.length + 1).trim();

const supabase = createClient(
  get("NEXT_PUBLIC_SUPABASE_URL"),
  get("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

const NICHOS = [
  "Curiosidades",
  "Tecnologia",
  "Entretenimento",
  "Finanças",
  "Saúde",
  "Receitas",
  "Dicas",
  "Novelas",
  "Artesanato",
  "DIY",
  "Cortes",
  "Relacionamento",
  "Histórias",
  "Personagem UGC",
];

const PAISES = [
  { nome: "Brasil", codigo: "BR" },
  { nome: "EUA", codigo: "US" },
  { nome: "Alemanha", codigo: "DE" },
  { nome: "Itália", codigo: "IT" },
  { nome: "França", codigo: "FR" },
  { nome: "Árabe", codigo: "AR" },
  { nome: "Inglês", codigo: "EN" },
  { nome: "Português", codigo: "PT" },
  { nome: "Espanhol", codigo: "ES" },
];

// Zera (não há vídeos referenciando ainda)
await supabase.from("nichos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
await supabase.from("paises").delete().neq("id", "00000000-0000-0000-0000-000000000000");

const n = await supabase.from("nichos").insert(NICHOS.map((nome) => ({ nome })));
const p = await supabase.from("paises").insert(PAISES);

if (n.error) console.error("Erro nichos:", n.error.message);
if (p.error) console.error("Erro paises:", p.error.message);

const { count: nc } = await supabase.from("nichos").select("*", { count: "exact", head: true });
const { count: pc } = await supabase.from("paises").select("*", { count: "exact", head: true });
console.log(`✓ Nichos: ${nc} | Países: ${pc}`);
