"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Zap, FileText, ImageIcon, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import type { RoteiroResult } from "@/lib/types";

type Tab = "roteiro" | "imagem";

export function IaTools() {
  const params = useSearchParams();
  const initial: Tab = params.get("tab") === "imagem" ? "imagem" : "roteiro";
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-navy-700">
        <TabButton active={tab === "roteiro"} onClick={() => setTab("roteiro")}>
          <FileText size={15} /> Roteiro &amp; Títulos
        </TabButton>
        <TabButton active={tab === "imagem"} onClick={() => setTab("imagem")}>
          <ImageIcon size={15} /> Recriar Imagem
        </TabButton>
      </div>

      <div className="p-5 md:p-6">
        {tab === "roteiro" ? <RoteiroTab /> : <ImagemTab />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition",
        active
          ? "border-b-2 border-brand text-foreground"
          : "text-slate-400 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- Roteiro & Títulos ---------------- */

function RoteiroTab() {
  const [tema, setTema] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoteiroResult | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ia/roteiro")
      .then((r) => r.json())
      .then((d) => setRestantes(d.restantes ?? null))
      .catch(() => {});
  }, []);

  async function gerar() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ia/roteiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro");
      setResult(data);
      if (typeof data.restantes === "number") setRestantes(data.restantes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar.");
    } finally {
      setLoading(false);
    }
  }

  const esgotado = restantes !== null && restantes <= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-navy-700 bg-navy-900/60 px-4 py-3">
        <span className="text-sm text-slate-400">Roteiros restantes hoje</span>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-bold",
            esgotado
              ? "bg-red-500/15 text-red-300"
              : "bg-accent-green/15 text-accent-green"
          )}
        >
          {restantes ?? "—"} / 10
        </span>
      </div>
      <div>
        <label className="label-muted">Entrada do tema</label>
        <textarea
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Descreva seu tema ou nicho aqui..."
          rows={4}
          className="input-field mt-1.5 resize-none"
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={gerar}
            disabled={loading || esgotado || tema.trim().length < 2}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            {loading ? "Gerando..." : "Gerar Conteúdo"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <OutputBox title="Título" copy={result.titulo}>
              <p className="text-sm italic text-slate-200">
                &ldquo;{result.titulo}&rdquo;
              </p>
            </OutputBox>
            <OutputBox title="Descrição" copy={result.descricao}>
              <p className="text-sm leading-relaxed text-slate-300">
                {result.descricao}
              </p>
            </OutputBox>
          </div>
          <OutputBox title="Roteiro Completo" badge="Otimizado" copy={result.roteiro}>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
              {result.roteiro}
            </pre>
          </OutputBox>
        </div>
      )}
    </div>
  );
}

/* ---------------- Recriar Imagem ---------------- */

type ImagemResult = {
  analise: string;
  prompt: string;
  variacoes: string[];
};

function ImagemTab() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [result, setResult] = useState<ImagemResult | null>(null);

  useEffect(() => {
    fetch("/api/ia/imagem")
      .then((r) => r.json())
      .then((d) => setRestantes(d.restantes ?? null))
      .catch(() => {});
  }, []);

  function onPick(f: File | null) {
    setFile(f);
    setResult(null);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function recriar() {
    if (!file) return;
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("imagem", file);
      const res = await fetch("/api/ia/imagem", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro");
      setResult(data);
      if (typeof data.restantes === "number") setRestantes(data.restantes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao recriar.");
    } finally {
      setLoading(false);
    }
  }

  const esgotado = restantes !== null && restantes <= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-navy-700 bg-navy-900/60 px-4 py-3">
        <span className="text-sm text-slate-400">Gerações restantes hoje</span>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-bold",
            esgotado
              ? "bg-red-500/15 text-red-300"
              : "bg-accent-green/15 text-accent-green"
          )}
        >
          {restantes ?? "—"} / 3
        </span>
      </div>

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-navy-700 bg-navy-900/40 px-6 py-10 text-center transition hover:border-brand/50",
          esgotado && "pointer-events-none opacity-50"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="prévia"
            className="max-h-48 rounded-lg object-contain"
          />
        ) : (
          <>
            <Upload size={26} className="text-slate-500" />
            <div>
              <p className="text-sm font-semibold">
                Clique para enviar um criativo
              </p>
              <p className="text-xs text-slate-500">JPG, PNG, WEBP ou GIF</p>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={esgotado}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </label>

      <Button
        onClick={recriar}
        disabled={!file || loading || esgotado}
        className="w-full"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ImageIcon size={16} />
        )}
        {loading ? "Recriando..." : "Recriar Imagem"}
      </Button>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-4">
          <OutputBox title="Análise do criativo" copy={result.analise}>
            <p className="text-sm leading-relaxed text-slate-300">
              {result.analise}
            </p>
          </OutputBox>
          <OutputBox title="Prompt de recriação" badge="Pronto" copy={result.prompt}>
            <p className="text-sm leading-relaxed text-slate-300">
              {result.prompt}
            </p>
          </OutputBox>
          {result.variacoes.length > 0 && (
            <OutputBox
              title="Variações para teste A/B"
              copy={result.variacoes.join("\n")}
            >
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                {result.variacoes.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </OutputBox>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Output box ---------------- */

function OutputBox({
  title,
  badge,
  copy,
  children,
}: {
  title: string;
  badge?: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-bold">{title}</h4>
          {badge && (
            <span className="rounded bg-accent-green/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-green">
              {badge}
            </span>
          )}
        </div>
        <CopyButton text={copy} />
      </div>
      {children}
    </div>
  );
}
