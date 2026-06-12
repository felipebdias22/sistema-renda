import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, IA_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

const LIMITE_DIARIO = 3;

function hoje() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function getRestantes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from("ia_limite_imagem")
    .select("geracoes_usadas")
    .eq("user_id", userId)
    .eq("data", hoje())
    .maybeSingle();
  const usadas = data?.geracoes_usadas ?? 0;
  return Math.max(0, LIMITE_DIARIO - usadas);
}

// GET → contador restante do dia
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  return NextResponse.json({
    restantes: await getRestantes(supabase, user.id),
    limite: LIMITE_DIARIO,
  });
}

const SYSTEM = `Você é um diretor de arte especialista em criativos virais para Facebook Ads e Reels.
O usuário envia uma imagem (criativo existente). Sua tarefa é "recriar" essa imagem: analise-a em
profundidade e produza uma nova versão original inspirada nela, descrita de forma que possa ser
gerada por uma IA de imagem. Responda SEMPRE e SOMENTE com JSON válido, sem markdown:
{
  "analise": "análise objetiva do criativo original (composição, cores, foco, gatilhos)",
  "prompt": "prompt detalhado em inglês para gerar a nova arte original (estilo, layout, iluminação, copy sugerida)",
  "variacoes": ["3 sugestões curtas de variação para testes A/B"]
}`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  // Verifica limite diário
  const restantes = await getRestantes(supabase, user.id);
  if (restantes <= 0) {
    return NextResponse.json(
      { error: "Limite diário de 3 gerações atingido.", restantes: 0 },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const file = form.get("imagem");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato inválido (use JPG, PNG, WEBP ou GIF)." },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  // Upload do original para o bucket privado imagens-ia/{userId}/...
  const ext = file.type.split("/")[1];
  const path = `${user.id}/${hoje()}-${crypto.randomUUID()}.${ext}`;
  await supabase.storage.from("imagens-ia").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  try {
    const msg = await anthropic.messages.create({
      model: IA_MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Recrie este criativo seguindo o formato JSON especificado.",
            },
          ],
        },
      ],
    });

    const text = (msg.content.find((c) => c.type === "text") as
      | { text: string }
      | undefined)?.text ?? "";
    const result = extractJson(text);
    if (!result) {
      return NextResponse.json(
        { error: "Falha ao interpretar a resposta da IA." },
        { status: 502 }
      );
    }

    // Incrementa o contador (upsert na chave user_id+data)
    const { data: existing } = await supabase
      .from("ia_limite_imagem")
      .select("id, geracoes_usadas")
      .eq("user_id", user.id)
      .eq("data", hoje())
      .maybeSingle();

    if (existing) {
      await supabase
        .from("ia_limite_imagem")
        .update({ geracoes_usadas: existing.geracoes_usadas + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("ia_limite_imagem")
        .insert({ user_id: user.id, data: hoje(), geracoes_usadas: 1 });
    }

    await supabase.from("ia_geracoes").insert({
      user_id: user.id,
      tipo: "imagem",
      input: path,
      output: JSON.stringify(result),
    });

    return NextResponse.json({
      ...result,
      restantes: restantes - 1,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao recriar imagem." },
      { status: 500 }
    );
  }
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    return {
      analise: String(obj.analise ?? ""),
      prompt: String(obj.prompt ?? ""),
      variacoes: Array.isArray(obj.variacoes)
        ? obj.variacoes.map(String)
        : [],
    };
  } catch {
    return null;
  }
}
