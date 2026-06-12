import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook (postback) da Payt.
 * Configure na Payt a URL:  https://SEU_DOMINIO/api/webhooks/payt?secret=SEU_SEGREDO
 *
 * - Compra aprovada  → cria o aluno e envia e-mail de convite (define a senha)
 * - Reembolso/chargeback → bane o aluno (perde o acesso)
 */

const STATUS_LIBERA = [
  "paid",
  "approved",
  "aprovado",
  "authorized",
  "completed",
  "active",
  "confirmed",
];
const STATUS_REMOVE = [
  "refunded",
  "refund",
  "chargeback",
  "canceled",
  "cancelled",
  "estornado",
  "reembolsado",
  "expired",
  "refused",
];

// procura um valor em vários caminhos possíveis do payload
function pick(obj: any, paths: string[]): string | null {
  for (const path of paths) {
    const val = path
      .split(".")
      .reduce((o, k) => (o == null ? o : o[k]), obj);
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return null;
}

export async function GET() {
  // health check (Payt pode validar a URL com GET)
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  // 1) valida o segredo (query ?secret= ou header)
  const url = new URL(req.url);
  const secret =
    url.searchParams.get("secret") ?? req.headers.get("x-webhook-secret");
  if (
    !process.env.PAYT_WEBHOOK_SECRET ||
    secret !== process.env.PAYT_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // 2) lê o payload (json ou form-urlencoded)
  let body: any = {};
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
      // alguns provedores mandam um campo "payload" com json dentro
      if (typeof body.payload === "string") {
        try {
          body = { ...body, ...JSON.parse(body.payload) };
        } catch {}
      }
    }
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // 3) extrai email, nome e status
  const email = pick(body, [
    "customer.email",
    "client.email",
    "buyer.email",
    "payer.email",
    "customer_email",
    "email",
  ])?.toLowerCase();

  const nome =
    pick(body, [
      "customer.name",
      "client.name",
      "buyer.name",
      "customer_name",
      "name",
    ]) ?? "";

  const statusRaw =
    pick(body, ["status", "order.status", "transaction.status", "payment_status"]) ??
    "";
  const status = statusRaw.toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Email não encontrado no payload" },
      { status: 422 }
    );
  }

  const supabase = createServiceClient();
  const existente = await acharUsuario(supabase, email);

  // 4) decide a ação
  if (STATUS_REMOVE.includes(status)) {
    if (existente) {
      await supabase.auth.admin.updateUserById(existente.id, {
        ban_duration: "876000h", // ~100 anos
      });
    }
    return NextResponse.json({ ok: true, acao: "acesso_removido", email });
  }

  if (STATUS_LIBERA.includes(status)) {
    if (existente) {
      // reativa se estava banido
      await supabase.auth.admin.updateUserById(existente.id, {
        ban_duration: "none",
      });
      return NextResponse.json({ ok: true, acao: "acesso_reativado", email });
    }
    // cria e envia convite por e-mail (aluno define a senha)
    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL ?? url.origin) + "/login";
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name: nome },
      redirectTo,
    });
    if (error) {
      // fallback: cria já confirmado com senha temporária aleatória
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: crypto.randomUUID(),
        user_metadata: { name: nome },
      });
    }
    return NextResponse.json({ ok: true, acao: "acesso_criado", email });
  }

  // status pendente/aguardando pagamento → ignora
  return NextResponse.json({ ok: true, acao: "ignorado", status });
}

async function acharUsuario(
  supabase: ReturnType<typeof createServiceClient>,
  email: string
) {
  for (let page = 1; page <= 30; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) break;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}
