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

const alvo = (process.argv[2] || "felgabb18@gmail.com").toLowerCase();

// Procura o usuário pelo email (pagina se necessário)
let user = null;
for (let page = 1; page <= 20 && !user; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
  user = data.users.find((u) => u.email?.toLowerCase() === alvo);
  if (data.users.length < 200) break;
}

if (!user) {
  console.error(`✗ Usuário não encontrado: ${alvo}`);
  process.exit(1);
}

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: "admin" },
});

if (error) console.error("Erro:", error.message);
else console.log(`✓ ${alvo} agora é ADMIN. Saia e entre de novo no sistema.`);
