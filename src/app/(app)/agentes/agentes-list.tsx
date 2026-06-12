import Link from "next/link";
import { Play, Bot, ArrowRight } from "lucide-react";
import type { Agente } from "@/lib/types";
import { vimeoThumb } from "@/lib/utils";

export function AgentesList({ agentes }: { agentes: Agente[] }) {
  if (agentes.length === 0) {
    return (
      <div className="card p-12 text-center text-slate-400">
        Nenhum agente disponível no momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {agentes.map((a) => {
        const thumb = vimeoThumb(a.video_tutorial_url);
        return (
          <Link
            key={a.id}
            href={`/agentes/${a.id}`}
            className="card group flex flex-col overflow-hidden p-0 transition hover:border-brand/40 hover:shadow-glow"
          >
            {/* Thumbnail da aula */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950">
              {thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt={a.nome}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/90 text-white shadow-glow transition group-hover:scale-110">
                  <Play size={22} className="ml-0.5" fill="currentColor" />
                </span>
              </span>
              <span className="absolute left-3 top-3 rounded-md bg-navy-950/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-400 backdrop-blur">
                Agente GPT
              </span>
            </div>

            {/* Conteúdo */}
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 ring-1 ring-navy-700">
                <Bot size={17} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-bold leading-tight">{a.nome}</h3>
              {a.descricao && (
                <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">
                  {a.descricao}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-400">
                Ver aula <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
