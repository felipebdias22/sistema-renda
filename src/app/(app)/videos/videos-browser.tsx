"use client";

import { useMemo, useState } from "react";
import { Play, Search, Heart, SlidersHorizontal, X } from "lucide-react";
import type { Nicho, Pais, Video } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { VimeoPlayer } from "@/components/ui/vimeo-player";
import { vimeoThumb, vimeoId, formatDateBR, cn } from "@/lib/utils";

type Ordem = "recentes" | "antigos" | "az";

export function VideosBrowser({
  videos,
  nichos,
  paises,
}: {
  videos: Video[];
  nichos: Nicho[];
  paises: Pais[];
}) {
  const [busca, setBusca] = useState("");
  const [nicho, setNicho] = useState("");
  const [pais, setPais] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [active, setActive] = useState<Video | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const arr = videos.filter(
      (v) =>
        (!nicho || v.nicho_id === nicho) &&
        (!pais || v.pais_id === pais) &&
        (!termo ||
          v.titulo.toLowerCase().includes(termo) ||
          (v.descricao ?? "").toLowerCase().includes(termo))
    );
    arr.sort((a, b) => {
      if (ordem === "az") return a.titulo.localeCompare(b.titulo);
      const da = new Date(a.criado_em).getTime();
      const db = new Date(b.criado_em).getTime();
      return ordem === "recentes" ? db - da : da - db;
    });
    return arr;
  }, [videos, busca, nicho, pais, ordem]);

  const limpar = () => {
    setBusca("");
    setNicho("");
    setPais("");
    setOrdem("recentes");
  };

  function toggleFav(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Vimeo abre no player do sistema; Facebook/outros abrem em nova aba
  function abrirVideo(v: Video) {
    if (vimeoId(v.vimeo_url)) {
      setActive(v);
    } else {
      window.open(v.vimeo_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-5">
      {/* Barra de busca + ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procure pelos melhores vídeos"
            className="input-field h-12 pl-11"
          />
        </div>
        <button
          onClick={limpar}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-navy-700 bg-navy-850 px-5 text-sm font-semibold text-slate-300 transition hover:text-foreground"
        >
          <X size={16} /> Limpar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <FiltroSelect
          icon
          value={nicho}
          onChange={setNicho}
          placeholder="Nicho: Todos"
          options={[
            { value: "", label: "Nicho: Todos" },
            ...nichos.map((n) => ({ value: n.id, label: n.nome })),
          ]}
        />
        <FiltroSelect
          value={pais}
          onChange={setPais}
          placeholder="País: Todos"
          options={[
            { value: "", label: "País: Todos" },
            ...paises.map((p) => ({ value: p.id, label: p.nome })),
          ]}
        />
        <FiltroSelect
          value={ordem}
          onChange={(v) => setOrdem(v as Ordem)}
          placeholder="Mais Recentes"
          options={[
            { value: "recentes", label: "Mais Recentes" },
            { value: "antigos", label: "Mais Antigos" },
            { value: "az", label: "Ordem A-Z" },
          ]}
        />
      </div>

      {/* Contador */}
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded-lg bg-navy-800 px-2.5 py-1 font-bold text-foreground">
          {filtered.length}
        </span>
        <span className="text-slate-400">
          {filtered.length === 1 ? "vídeo" : "vídeos"}
        </span>
      </div>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          Nenhum vídeo encontrado para esse filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              fav={favs.has(v.id)}
              onToggleFav={(e) => toggleFav(v.id, e)}
              onOpen={() => abrirVideo(v)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.titulo}
      >
        {active && (
          <div>
            <VimeoPlayer url={active.vimeo_url} title={active.titulo} />
            <div className="space-y-2 p-5">
              <div className="flex flex-wrap gap-2">
                {active.nicho?.nome && (
                  <span className="rounded-md bg-navy-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {active.nicho.nome}
                  </span>
                )}
                {active.pais?.nome && (
                  <span className="rounded-md bg-accent-green/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-green">
                    {active.pais.nome}
                  </span>
                )}
              </div>
              {active.descricao && (
                <p className="text-sm leading-relaxed text-slate-300">
                  {active.descricao}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function VideoCard({
  video,
  fav,
  onToggleFav,
  onOpen,
}: {
  video: Video;
  fav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
  onOpen: () => void;
}) {
  const thumb = video.thumb ?? vimeoThumb(video.vimeo_url);

  return (
    <button
      onClick={onOpen}
      className="card group flex flex-col overflow-hidden p-0 text-left transition hover:border-brand/40 hover:shadow-glow"
    >
      {/* Capa */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950">
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={video.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Favoritar */}
        <span
          onClick={onToggleFav}
          role="button"
          aria-label="Favoritar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-navy-950/60 backdrop-blur transition hover:bg-navy-950/90"
        >
          <Heart
            size={17}
            className={cn(
              "transition",
              fav ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
        </span>

        {/* Play no hover */}
        <span className="absolute inset-0 z-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/90 text-white shadow-glow">
            <Play size={22} className="ml-0.5" fill="currentColor" />
          </span>
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-tight">
          {video.titulo}
        </h3>
        <p className="mt-1.5 text-xs text-slate-500">
          {formatDateBR(video.criado_em)}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {video.nicho?.nome && (
            <span className="rounded-md bg-navy-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {video.nicho.nome}
            </span>
          )}
          {video.pais?.nome && (
            <span className="rounded-md bg-accent-green/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-green">
              {video.pais.nome}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function FiltroSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: boolean;
}) {
  return (
    <div className="relative">
      {icon && (
        <SlidersHorizontal
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
        className={cn(
          "h-11 cursor-pointer rounded-xl border border-navy-700 bg-navy-850 pr-9 text-sm font-medium text-slate-200 outline-none transition focus:border-brand/60",
          icon ? "pl-9" : "pl-4"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
