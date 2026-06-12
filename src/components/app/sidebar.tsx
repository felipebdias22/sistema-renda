"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  PlaySquare,
  Bot,
  Wrench,
  LineChart,
  ShieldCheck,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/videos", label: "Banco de Vídeos", icon: PlaySquare },
  { href: "/agentes", label: "Agentes GPT", icon: Bot },
  { href: "/ia", label: "IA Americana", icon: Wrench },
  { href: "/lucros", label: "Controle de Lucros", icon: LineChart },
];

export function Sidebar({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nav = isAdmin
    ? [...NAV, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : NAV;

  return (
    <>
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-700 bg-navy-900/90 px-4 py-3 backdrop-blur md:hidden">
        <span className="text-lg font-bold tracking-tight">
          Sistema Renda Dupla
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-300 hover:bg-navy-800"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/70 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-navy-700 bg-navy-900/95 px-5 py-6 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-1">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
            Sistema
            <br />
            Renda
            <br />
            <span className="text-brand-400">Dupla</span>
          </h1>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-850 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-600 text-xs font-bold text-white">
            {email.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Elite Member</p>
            <p className="text-xs font-medium text-accent-green">
              Premium Access
            </p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-navy-800 text-foreground"
                    : "text-slate-400 hover:bg-navy-800/60 hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r bg-brand w-1" />
                )}
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3">
          <button className="flex w-full items-center gap-3 rounded-xl border border-accent-green/40 bg-accent-green/10 px-3 py-3 text-sm font-semibold text-accent-green transition hover:bg-accent-green/20">
            <GraduationCap size={18} />
            ACESSE A ÁREA DE MEMBROS
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-navy-800 hover:text-foreground"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
