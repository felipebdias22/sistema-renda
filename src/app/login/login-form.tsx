"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="label-muted">Endereço de e-mail</label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="label-muted">Senha de acesso</label>
          <button
            type="button"
            className="text-xs font-semibold text-brand-400 hover:text-brand"
          >
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field px-10"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label="Mostrar senha"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-navy-600 bg-navy-900 accent-brand"
        />
        Manter conectado neste dispositivo
      </label>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? "Entrando..." : "Entrar na Plataforma"}
        {!loading && <ArrowRight size={18} />}
      </Button>

      <div className="border-t border-navy-700 pt-4 text-center text-sm text-slate-400">
        Ainda não possui acesso?{" "}
        <span className="font-semibold text-brand-400">
          Adquirir Licença Elite
        </span>
      </div>
    </form>
  );
}
