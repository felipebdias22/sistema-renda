import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { anthropic, IA_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

const SYSTEM = `Você é um estrategista de conteúdo viral da FB Monetize ("Máquina de Dólar").
Analise a OPORTUNIDADE de um vídeo orgânico para o aluno replicar, com base no nicho e no
país/idioma do mercado. Você NÃO assistiu o vídeo — foque na estratégia do nicho e do público.
Responda SEMPRE e SOMENTE com JSON válido, sem markdown, em português do Brasil:
{
  "publico": "quem é o público desse nicho nesse país e o que ele busca (1-2 frases)",
  "porque_converte": "por que esse tipo de conteúdo viraliza/converte nesse mercado (2-3 frases)",
  "gancho": "ideia de gancho (hook) dos primeiros 3 segundos para replicar",
  "como_adaptar": "como o aluno deve adaptar/recriar esse formato (2-3 frases práticas)",
  "cta": "sugestão de chamada para ação"
}`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { videoId } = await req.json().catch(() => ({ videoId: "" }));
  if (!videoId)
    return NextResponse.json({ error: "Vídeo inválido" }, { status: 400 });

  const svc = createServiceClient();

  // 1) Cache global (gerado uma vez por vídeo)
  const { data: cache } = await svc
    .from("ia_geracoes")
    .select("output")
    .eq("tipo", "analise_video")
    .eq("input", videoId)
    .is("user_id", null)
    .maybeSingle();
  if (cache?.output) {
    return NextResponse.json(JSON.parse(cache.output));
  }

  // 2) Busca dados do vídeo
  const { data: video } = await svc
    .from("videos")
    .select("titulo, views, engajamento, nicho:nichos(nome), pais:paises(nome)")
    .eq("id", videoId)
    .maybeSingle();
  if (!video)
    return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 });

  const nicho = (video.nicho as { nome?: string } | null)?.nome ?? "geral";
  const pais = (video.pais as { nome?: string } | null)?.nome ?? "Brasil";
  const views = (video.views as string | null) ?? "";
  const engajamento = (video.engajamento as string | null) ?? "";
  const metricas =
    views || engajamento
      ? `Este vídeo já alcançou ${views || "muitas"} views${
          engajamento ? ` e ${engajamento}` : ""
        }. Comente brevemente o que esse desempenho indica sobre o potencial do formato.`
      : "";

  try {
    const msg = await anthropic.messages.create({
      model: IA_MODEL,
      max_tokens: 900,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Nicho: "${nicho}". País/mercado: "${pais}". Título do vídeo: "${video.titulo}". ${metricas} Gere a análise no formato JSON.`,
        },
      ],
    });

    const text =
      (msg.content.find((c) => c.type === "text") as { text: string } | undefined)
        ?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
      return NextResponse.json(
        { error: "Falha ao gerar análise." },
        { status: 502 }
      );
    const obj = JSON.parse(match[0]);
    const result = {
      publico: String(obj.publico ?? ""),
      porque_converte: String(obj.porque_converte ?? ""),
      gancho: String(obj.gancho ?? ""),
      como_adaptar: String(obj.como_adaptar ?? ""),
      cta: String(obj.cta ?? ""),
    };

    // 3) Salva no cache global
    await svc.from("ia_geracoes").insert({
      user_id: null,
      tipo: "analise_video",
      input: videoId,
      output: JSON.stringify(result),
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao gerar análise." },
      { status: 500 }
    );
  }
}
