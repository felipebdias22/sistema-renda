import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, IA_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

const SYSTEM = `Você é um copywriter especialista em conteúdo viral para Facebook e Reels,
treinado nas metodologias da FB Monetize ("Máquina de Dólar"). A partir de um tema/nicho,
gere conteúdo de altíssima conversão em português do Brasil.

Responda SEMPRE e SOMENTE com um objeto JSON válido, sem markdown, no formato exato:
{
  "titulo": "título curto e magnético (máx 70 caracteres)",
  "descricao": "descrição persuasiva para a publicação (2 a 3 frases, com chamada à ação)",
  "roteiro": "roteiro completo estruturado por blocos de tempo no formato:\\n[0:00 - 0:15] Hook: ...\\n[0:15 - 1:30] Conteúdo: ...\\n[1:30 - 3:00] Transição: ...\\n[3:00 - Fim] CTA: ..."
}`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { tema } = await req.json().catch(() => ({ tema: "" }));
  if (!tema || typeof tema !== "string" || tema.trim().length < 2) {
    return NextResponse.json(
      { error: "Informe um tema ou nicho." },
      { status: 400 }
    );
  }

  try {
    const msg = await anthropic.messages.create({
      model: IA_MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Tema/nicho: "${tema.trim()}". Gere o conteúdo no formato JSON especificado.`,
        },
      ],
    });

    const text =
      msg.content.find((c) => c.type === "text")?.type === "text"
        ? (msg.content[0] as { text: string }).text
        : "";

    const json = extractJson(text);
    if (!json) {
      return NextResponse.json(
        { error: "Falha ao interpretar a resposta da IA." },
        { status: 502 }
      );
    }

    await supabase.from("ia_geracoes").insert({
      user_id: user.id,
      tipo: "roteiro",
      input: tema.trim(),
      output: JSON.stringify(json),
    });

    return NextResponse.json(json);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao gerar conteúdo." },
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
      titulo: String(obj.titulo ?? ""),
      descricao: String(obj.descricao ?? ""),
      roteiro: String(obj.roteiro ?? ""),
    };
  } catch {
    return null;
  }
}
