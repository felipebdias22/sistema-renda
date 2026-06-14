import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uniqueBy } from "@/lib/utils";
import type { Agente, Nicho, Pais, Video } from "@/lib/types";
import { AdminPanel } from "./admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as { role?: string } | null)?.role;
  if (!user || role !== "admin") redirect("/dashboard");

  const [videos, nichos, paises, agentes] = await Promise.all([
    supabase
      .from("videos")
      .select("*, nicho:nichos(*), pais:paises(*)")
      .order("criado_em", { ascending: false }),
    supabase.from("nichos").select("*").order("nome"),
    supabase.from("paises").select("*").order("nome"),
    supabase.from("agentes").select("*").order("ordem"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Painel Administrativo
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie vídeos, nichos, países e agentes da plataforma.
        </p>
      </div>
      <AdminPanel
        videos={(videos.data as Video[]) ?? []}
        nichos={uniqueBy((nichos.data as Nicho[]) ?? [], (n) => n.nome)}
        paises={uniqueBy((paises.data as Pais[]) ?? [], (p) => p.codigo)}
        agentes={(agentes.data as Agente[]) ?? []}
      />
    </div>
  );
}
