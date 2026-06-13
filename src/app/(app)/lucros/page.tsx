import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCotacaoDolar, hojeSP } from "@/lib/cotacao";
import type { Ganho } from "@/lib/types";
import { LucrosClient } from "./lucros-client";

export const dynamic = "force-dynamic";

const META_MENSAL = 20000;

export default async function LucrosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data }, cotacao] = await Promise.all([
    supabase
      .from("ganhos")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false })
      .order("criado_em", { ascending: false }),
    getCotacaoDolar(),
  ]);

  const ganhos = (data as Ganho[]) ?? [];
  const hoje = hojeSP();
  const mesAtual = hoje.slice(0, 7); // YYYY-MM

  return (
    <LucrosClient
      ganhos={ganhos}
      cotacao={cotacao}
      hoje={hoje}
      mesAtual={mesAtual}
      meta={META_MENSAL}
    />
  );
}
