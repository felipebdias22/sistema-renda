import Link from "next/link";
import {
  PlaySquare,
  Bot,
  FileText,
  ImageIcon,
  ArrowRight,
  TrendingUp,
  Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCotacaoDolar, hojeSP, brl, usd, labelMesAno } from "@/lib/cotacao";
import type { Ganho } from "@/lib/types";

const META_MENSAL = 20000;

const QUICK = [
  {
    href: "/videos",
    icon: PlaySquare,
    title: "Banco de Vídeos",
    desc: "Acesse milhares de vídeos virais prontos para uso em suas campanhas.",
    cta: "Explorar",
    color: "text-brand-400",
  },
  {
    href: "/agentes",
    icon: Bot,
    title: "Agentes GPT",
    desc: "Inteligência Artificial treinada especificamente para escalar seus resultados.",
    cta: "Configurar",
    color: "text-accent-green",
  },
  {
    href: "/ia",
    icon: FileText,
    title: "Criar Roteiro",
    desc: "Gere scripts altamente persuasivos e otimizados em segundos com IA.",
    cta: "Gerar agora",
    color: "text-amber-400",
  },
  {
    href: "/ia?tab=imagem",
    icon: ImageIcon,
    title: "Recriar Imagem",
    desc: "Transforme criativos existentes em novas artes originais com nossa IA.",
    cta: "Transformar",
    color: "text-purple-400",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nome =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Aluno";

  const hoje = hojeSP();
  const mesAtual = hoje.slice(0, 7);
  const [{ data }, cotacao] = await Promise.all([
    supabase
      .from("ganhos")
      .select("data, valor_usd, valor_brl")
      .eq("user_id", user!.id),
    getCotacaoDolar(),
  ]);
  const ganhos = (data as Pick<Ganho, "data" | "valor_usd" | "valor_brl">[]) ?? [];
  const mesBRL = ganhos
    .filter((g) => g.data.startsWith(mesAtual))
    .reduce((s, g) => s + Number(g.valor_brl), 0);
  const hojeUSD = ganhos
    .filter((g) => g.data === hoje)
    .reduce((s, g) => s + Number(g.valor_usd), 0);
  const hojeBRL = hojeUSD * cotacao;
  const pct = Math.min(100, Math.round((mesBRL / META_MENSAL) * 100));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Sistema Renda Dupla</h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-accent-green/40 bg-accent-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-green">
            Status: Premium Active
          </span>
          <Bell size={18} className="text-slate-400" />
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Olá, <span className="text-brand-400 capitalize">{nome}!</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Seja bem-vindo ao Sistema Renda Dupla. Aproveite todo o sistema e
          comece a ganhar em dólares com o Facebook!
        </p>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Acesso Rápido</h3>
          <Link
            href="/videos"
            className="text-xs font-semibold text-brand-400 hover:text-brand"
          >
            Ver todos os módulos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK.map(({ href, icon: Icon, title, desc, cta, color }) => (
            <Link
              key={title}
              href={href}
              className="card group flex flex-col p-5 transition hover:border-brand/40 hover:shadow-glow"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 ring-1 ring-navy-700">
                <Icon size={20} className={color} />
              </div>
              <h4 className="text-base font-bold">{title}</h4>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400">
                {desc}
              </p>
              <span
                className={`mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${color}`}
              >
                {cta} <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Link href="/lucros" className="card block p-6 transition hover:border-brand/40">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              Controle de Lucros <TrendingUp size={15} className="text-accent-green" />
            </div>
            <p className="mt-3 label-muted">
              Ganhos de {labelMesAno(mesAtual).split(" ")[0]}
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {brl(mesBRL)}
              <span className="ml-2 align-middle text-xs font-semibold text-brand-400">
                Ver detalhes →
              </span>
            </p>
          </div>
          <div className="min-w-[220px] flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="label-muted">Meta Mensal ({brl(META_MENSAL)})</span>
              <span className="font-bold text-brand-400">{pct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="label-muted">Ganho hoje</p>
                <p className="text-xl font-bold text-accent-green">
                  {usd(hojeUSD)}
                </p>
              </div>
              <p className="text-sm text-slate-400">≈ {brl(hojeBRL)}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
