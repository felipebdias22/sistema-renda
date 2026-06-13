import { createClient } from "@/lib/supabase/server";
import type { Agente } from "@/lib/types";
import { getVimeoThumbnail } from "@/lib/vimeo";
import { AgentesList } from "./agentes-list";

export const dynamic = "force-dynamic";

export default async function AgentesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agentes")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .order("criado_em", { ascending: true });

  // Enriquece com a thumbnail oficial do Vimeo (sempre atual)
  const agentes = await Promise.all(
    ((data as Agente[]) ?? []).map(async (a) => ({
      ...a,
      thumb: await getVimeoThumbnail(a.video_tutorial_url),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-brand/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-400">
            Inteligência Artificial
          </span>
          <span className="rounded-md bg-accent-green/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-green">
            Premium
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Nossos Especialistas GPT
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Acesse agentes de IA treinados especificamente com as metodologias da
          FB Monetize para acelerar seu fluxo de trabalho e maximizar conversões.
        </p>
      </div>

      <AgentesList agentes={agentes} />
    </div>
  );
}
