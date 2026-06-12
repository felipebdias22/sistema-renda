import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Bot, Sparkles, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Agente } from "@/lib/types";
import { VimeoPlayer } from "@/components/ui/vimeo-player";

export const dynamic = "force-dynamic";

export default async function AgenteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("agentes")
    .select("*")
    .eq("id", id)
    .eq("ativo", true)
    .maybeSingle();

  const agente = data as Agente | null;
  if (!agente) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/agentes"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-foreground"
      >
        <ArrowLeft size={16} /> Voltar para Agentes
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-brand/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-400">
          Aula do Agente
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          {agente.nome}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Coluna principal */}
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <VimeoPlayer url={agente.video_tutorial_url} title={agente.nome} />
          </div>

          {/* Como usar */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-400" />
              <h2 className="text-lg font-bold">Como funciona</h2>
            </div>
            {agente.descricao ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {agente.descricao}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Assista à aula acima para aprender a usar este agente de forma
                automática.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar — acesso ao agente */}
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 ring-1 ring-navy-700">
              <Bot size={20} className="text-brand-400" />
            </div>
            <h3 className="text-base font-bold">Acesse o Agente</h3>
            <p className="mt-1.5 text-sm text-slate-400">
              Abra o agente GPT e comece a usar agora mesmo, seguindo o passo a
              passo da aula.
            </p>
            <a
              href={agente.link_agente}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600"
            >
              <ExternalLink size={16} /> Abrir Agente GPT
            </a>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <PlayCircle size={16} className="text-accent-green" />
              Conteúdo da aula
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-900/50 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-xs font-bold text-brand-400">
                01
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{agente.nome}</p>
                <p className="text-xs text-slate-500">Tutorial completo</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
