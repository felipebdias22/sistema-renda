"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCotacaoDolar, hojeSP } from "@/lib/cotacao";

export async function lancarGanho(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const valorUsd = Number(
    String(formData.get("valor_usd") ?? "")
      .replace(/[^\d.,]/g, "")
      .replace(",", ".")
  );
  if (!valorUsd || valorUsd <= 0) return;

  const cotacao = await getCotacaoDolar();
  const valorBrl = Number((valorUsd * cotacao).toFixed(2));

  await supabase.from("ganhos").insert({
    user_id: user.id,
    data: hojeSP(),
    valor_usd: valorUsd,
    cotacao,
    valor_brl: valorBrl,
  });

  revalidatePath("/lucros");
  revalidatePath("/dashboard");
}

export async function excluirGanho(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  await supabase.from("ganhos").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/lucros");
  revalidatePath("/dashboard");
}
