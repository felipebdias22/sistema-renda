"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Calendar,
  DollarSign,
  RefreshCcw,
  Flag,
  TrendingUp,
  Trash2,
  ChevronDown,
} from "lucide-react";
import type { Ganho } from "@/lib/types";
import { brl, usd, labelMesAno } from "@/lib/cotacao";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { lancarGanho, excluirGanho } from "./actions";

export function LucrosClient({
  ganhos,
  cotacao,
  hoje,
  mesAtual,
  meta,
}: {
  ganhos: Ganho[];
  cotacao: number;
  hoje: string;
  mesAtual: string;
  meta: number;
}) {
  const stats = useMemo(() => {
    const doMes = ganhos.filter((g) => g.data.startsWith(mesAtual));
    const mesBRL = doMes.reduce((s, g) => s + Number(g.valor_brl), 0);
    const mesUSD = doMes.reduce((s, g) => s + Number(g.valor_usd), 0);
    const totalBRL = ganhos.reduce((s, g) => s + Number(g.valor_brl), 0);

    // Agrupa por mês (YYYY-MM)
    const grupos = new Map<string, Ganho[]>();
    for (const g of ganhos) {
      const k = g.data.slice(0, 7);
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k)!.push(g);
    }
    const meses = Array.from(grupos.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([chave, itens]) => ({
        chave,
        itens,
        totalBRL: itens.reduce((s, g) => s + Number(g.valor_brl), 0),
      }));

    return { mesBRL, mesUSD, totalBRL, meses };
  }, [ganhos, mesAtual]);

  const pct = Math.min(100, Math.round((stats.mesBRL / meta) * 100));
  const falta = Math.max(0, meta - stats.mesBRL);
  const labelAtual = labelMesAno(mesAtual);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Controle de Lucros
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Lance seus ganhos diários em dólar e acompanhe sua meta mensal de
          forma organizada e estratégica.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Calendar}
          tag="Mês Atual"
          label={`Ganhos de ${labelAtual.split(" ")[0]}`}
          value={brl(stats.mesBRL)}
          sub={usd(stats.mesUSD)}
        />
        <MetricCard
          icon={TrendingUp}
          tag="Acumulado"
          label="Total Acumulado (Real)"
          value={brl(stats.totalBRL)}
          accent
        />
        <MetricCard
          icon={RefreshCcw}
          tag="Câmbio"
          label="Cotação (1 USD)"
          value={brl(cotacao)}
        />
        <div className="card flex flex-col justify-between p-4">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-brand-400" />
            <span className="text-sm font-bold">Meta Mensal</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Progresso</span>
              <span className="font-bold text-brand-400">{pct}% atingido</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                Faltam {brl(falta)}
              </span>
              <span className="text-slate-500">Meta: {brl(meta)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        {/* Lançar ganho */}
        <LancarGanho cotacao={cotacao} labelAtual={labelAtual} />

        {/* Histórico */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Histórico de Ganhos</h3>
          </div>

          {stats.meses.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Nenhum ganho lançado ainda. Comece registrando o ganho de hoje!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.meses.map((m, i) => (
                <MesBloco
                  key={m.chave}
                  chave={m.chave}
                  itens={m.itens}
                  totalBRL={m.totalBRL}
                  hoje={hoje}
                  aberto={i === 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  tag,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Calendar;
  tag: string;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 ring-1 ring-navy-700">
          <Icon
            size={17}
            className={accent ? "text-accent-green" : "text-brand-400"}
          />
        </div>
        <span className="rounded bg-navy-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {tag}
        </span>
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-2xl font-extrabold tracking-tight",
          accent && "text-accent-green"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs font-semibold text-slate-500">{sub}</p>}
    </div>
  );
}

function LancarGanho({
  cotacao,
  labelAtual,
}: {
  cotacao: number;
  labelAtual: string;
}) {
  const [valor, setValor] = useState("");
  const [pending, startTransition] = useTransition();

  const num = Number(valor.replace(",", ".")) || 0;
  const convertido = num * cotacao;

  return (
    <div className="card h-fit p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Lançar Ganho do Dia</h3>
        <span className="rounded bg-navy-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {labelAtual}
        </span>
      </div>

      <form
        action={(fd) =>
          startTransition(async () => {
            await lancarGanho(fd);
            setValor("");
          })
        }
        className="space-y-4"
      >
        <div>
          <label className="label-muted">Valor em Dólar ($)</label>
          <p className="mb-2 mt-0.5 text-xs text-slate-500">
            Dólar hoje:{" "}
            <span className="font-semibold text-accent-green">
              {brl(cotacao)}
            </span>
          </p>
          <div className="relative">
            <DollarSign
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              name="valor_usd"
              inputMode="decimal"
              value={valor}
              onChange={(e) =>
                setValor(e.target.value.replace(/[^\d.,]/g, ""))
              }
              placeholder="0,00"
              className="input-field pl-10 text-lg font-bold"
            />
          </div>
        </div>

        <p className="text-sm text-slate-400">
          ↳ Conversão:{" "}
          <span className="font-bold text-brand-400">{brl(convertido)}</span>
        </p>

        <Button
          type="submit"
          disabled={pending || num <= 0}
          className="w-full"
        >
          {pending ? "Lançando..." : "Confirmar Lançamento"}
        </Button>
      </form>
    </div>
  );
}

function MesBloco({
  chave,
  itens,
  totalBRL,
  hoje,
  aberto,
}: {
  chave: string;
  itens: Ganho[];
  totalBRL: number;
  hoje: string;
  aberto: boolean;
}) {
  const [open, setOpen] = useState(aberto);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <Calendar size={14} className="text-brand-400" />
          {labelMesAno(chave)}
        </span>
        <span className="flex items-center gap-3">
          <span className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">
              Total do mês
            </span>
            <span className="text-sm font-bold text-accent-green">
              {brl(totalBRL)}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-slate-500 transition",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-navy-700 px-4 py-3">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-2 text-xs">
            <span className="label-muted">Data</span>
            <span className="label-muted text-right">USD</span>
            <span className="label-muted text-right">Câmbio</span>
            <span className="label-muted text-right">Real</span>

            {itens.map((g) => (
              <Linha
                key={g.id}
                g={g}
                hoje={hoje}
                pending={pending}
                onDelete={() =>
                  startTransition(async () => {
                    await excluirGanho(g.id);
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Linha({
  g,
  hoje,
  pending,
  onDelete,
}: {
  g: Ganho;
  hoje: string;
  pending: boolean;
  onDelete: () => void;
}) {
  const [yyyy, mm, dd] = g.data.split("-");
  const isHoje = g.data === hoje;
  return (
    <>
      <span className="group flex items-center gap-2 font-semibold">
        {dd}/{mm}
        {isHoje && (
          <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-400">
            Hoje
          </span>
        )}
        <button
          onClick={onDelete}
          disabled={pending}
          className="opacity-0 transition group-hover:opacity-100 hover:text-red-400"
          aria-label="Excluir"
        >
          <Trash2 size={13} />
        </button>
      </span>
      <span className="text-right font-medium text-slate-300">
        {usd(Number(g.valor_usd))}
      </span>
      <span className="text-right text-slate-500">
        {brl(Number(g.cotacao))}
      </span>
      <span className="text-right font-bold text-accent-green">
        {brl(Number(g.valor_brl))}
      </span>
    </>
  );
}
