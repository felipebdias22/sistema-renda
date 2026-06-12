import { LoginForm } from "./login-form";
import { LogoMark } from "@/components/app/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center">
        <LogoMark className="h-20 w-20" />
        <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
          Máquina de Dólar: <span className="text-brand-400">Facebook</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-400">
          Sistema Renda Dupla
        </p>

        <div className="card mt-9 w-full p-6 sm:p-7">
          <LoginForm />
        </div>

        <div className="mt-8 flex items-center gap-6 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span>🛡 Acesso Criptografado</span>
          <span>⚡ Servidor Ultra-Fast</span>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          © 2024 FB Monetize Elite. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
