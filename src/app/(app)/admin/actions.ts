"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Confirma que o usuário logado é admin (via sessão/cookies) e devolve um
 * cliente de SERVIÇO para as escritas — assim as operações do admin não
 * esbarram no RLS. A autorização é garantida aqui antes de qualquer escrita.
 */
async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as { role?: string } | null)?.role;
  if (!user || role !== "admin") {
    throw new Error("Acesso negado");
  }
  return createServiceClient();
}

function str(v: FormDataEntryValue | null) {
  return (v as string | null)?.toString().trim() ?? "";
}

/* ---------------- NICHOS ---------------- */

export async function saveNicho(formData: FormData) {
  const supabase = await assertAdmin();
  const id = str(formData.get("id"));
  const nome = str(formData.get("nome"));
  if (!nome) return;
  if (id) {
    await supabase.from("nichos").update({ nome }).eq("id", id);
  } else {
    await supabase.from("nichos").insert({ nome });
  }
  revalidatePath("/admin");
}

export async function deleteNicho(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("nichos").delete().eq("id", id);
  revalidatePath("/admin");
}

/* ---------------- PAÍSES ---------------- */

export async function savePais(formData: FormData) {
  const supabase = await assertAdmin();
  const id = str(formData.get("id"));
  const nome = str(formData.get("nome"));
  const codigo = str(formData.get("codigo")).toUpperCase();
  if (!nome || !codigo) return;
  if (id) {
    await supabase.from("paises").update({ nome, codigo }).eq("id", id);
  } else {
    await supabase.from("paises").insert({ nome, codigo });
  }
  revalidatePath("/admin");
}

export async function deletePais(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("paises").delete().eq("id", id);
  revalidatePath("/admin");
}

/* ---------------- VÍDEOS ---------------- */

// Sobe a capa (print) para o bucket e devolve a URL pública. Retorna null se nada enviado.
async function uploadCapa(
  supabase: ReturnType<typeof createServiceClient>,
  formData: FormData
): Promise<string | null> {
  const file = formData.get("capa");
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("capas")
    .upload(path, bytes, { contentType: file.type || "image/jpeg" });
  if (error) return null;
  return supabase.storage.from("capas").getPublicUrl(path).data.publicUrl;
}

export async function saveVideo(formData: FormData) {
  const supabase = await assertAdmin();
  const id = str(formData.get("id"));

  // Capa: prioridade → arquivo enviado > URL colada > capa atual
  let capa_url: string | null = str(formData.get("capa_atual")) || null;
  const capaUrlColada = str(formData.get("capa_url"));
  if (capaUrlColada) capa_url = capaUrlColada;
  const capaUpload = await uploadCapa(supabase, formData);
  if (capaUpload) capa_url = capaUpload;

  const payload = {
    titulo: str(formData.get("titulo")),
    descricao: str(formData.get("descricao")) || null,
    vimeo_url: str(formData.get("vimeo_url")),
    nicho_id: str(formData.get("nicho_id")) || null,
    pais_id: str(formData.get("pais_id")) || null,
    ativo: formData.get("ativo") === "on",
    capa_url,
  };
  if (!payload.titulo || !payload.vimeo_url) return;
  if (id) {
    await supabase.from("videos").update(payload).eq("id", id);
  } else {
    await supabase.from("videos").insert(payload);
  }
  revalidatePath("/admin");
  revalidatePath("/videos");
}

export async function deleteVideo(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("videos").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/videos");
}

/**
 * Importa vários vídeos de uma vez. Cole um link por linha.
 * Aceita também o formato opcional:  Título | https://link
 */
export async function importVideos(formData: FormData) {
  const supabase = await assertAdmin();
  const raw = str(formData.get("links"));
  const nicho_id = str(formData.get("nicho_id")) || null;
  const pais_id = str(formData.get("pais_id")) || null;
  const ativo = formData.get("ativo") === "on";
  const tituloBase = str(formData.get("titulo_base")) || "Vídeo viral";

  const linhas = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes("http"));

  if (linhas.length === 0) return;

  // Continua a numeração de onde parou (não reinicia em #1 numa nova importação)
  let offset = 0;
  const { data: existentes } = await supabase
    .from("videos")
    .select("titulo")
    .ilike("titulo", `${tituloBase} #%`);
  for (const row of existentes ?? []) {
    const m = (row.titulo as string)?.match(/#(\d+)\s*$/);
    if (m) offset = Math.max(offset, parseInt(m[1], 10));
  }

  const rows = linhas.map((linha, i) => {
    let titulo = `${tituloBase} #${offset + i + 1}`;
    let url = linha;
    let capa_url: string | null = null;
    const partes = linha.split("|").map((p) => p.trim());
    if (partes.length >= 2 && /^https?:\/\//i.test(partes[1])) {
      // formato: Título | link [| capa_url]
      titulo = partes[0] || titulo;
      url = partes[1];
      if (partes[2] && /^https?:\/\//i.test(partes[2])) capa_url = partes[2];
    } else {
      const m = linha.match(/https?:\/\/\S+/);
      if (m) url = m[0];
    }
    return {
      titulo,
      descricao: null,
      vimeo_url: url,
      capa_url,
      nicho_id,
      pais_id,
      ativo,
    };
  });

  await supabase.from("videos").insert(rows);
  revalidatePath("/admin");
  revalidatePath("/videos");
}

/**
 * Capas em massa: sobe vários prints de uma vez para um nicho.
 * Casa cada arquivo pelo NÚMERO no nome (1, 2, 3...) com o "#N" do título
 * do vídeo. Se o nome não tiver número, usa a ordem do arquivo como fallback.
 */
export async function importCapas(formData: FormData) {
  const supabase = await assertAdmin();
  const nicho_id = str(formData.get("nicho_id"));
  if (!nicho_id) return;

  const files = formData
    .getAll("capas")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  if (files.length === 0) return;

  const { data: videos } = await supabase
    .from("videos")
    .select("id, titulo")
    .eq("nicho_id", nicho_id);
  if (!videos || videos.length === 0) return;

  // mapa: número do título (#N) -> id do vídeo
  const byNum = new Map<number, string>();
  const ordenados = videos
    .map((v) => {
      const m = (v.titulo as string).match(/#(\d+)\s*$/);
      const n = m ? parseInt(m[1], 10) : NaN;
      if (!isNaN(n)) byNum.set(n, v.id as string);
      return { id: v.id as string, n: isNaN(n) ? Infinity : n };
    })
    .sort((a, b) => a.n - b.n);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const m = file.name.match(/(\d+)/);
    const num = m ? parseInt(m[1], 10) : null;
    const videoId =
      num != null && byNum.has(num) ? byNum.get(num) : ordenados[i]?.id;
    if (!videoId) continue;

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const up = await supabase.storage
      .from("capas")
      .upload(path, bytes, { contentType: file.type || "image/jpeg" });
    if (up.error) continue;
    const url = supabase.storage.from("capas").getPublicUrl(path).data.publicUrl;
    await supabase.from("videos").update({ capa_url: url }).eq("id", videoId);
  }

  revalidatePath("/admin");
  revalidatePath("/videos");
}

/* ---------------- AGENTES ---------------- */

export async function saveAgente(formData: FormData) {
  const supabase = await assertAdmin();
  const id = str(formData.get("id"));
  const payload = {
    nome: str(formData.get("nome")),
    descricao: str(formData.get("descricao")) || null,
    video_tutorial_url: str(formData.get("video_tutorial_url")),
    link_agente: str(formData.get("link_agente")),
    ordem: Number(str(formData.get("ordem")) || 0),
    ativo: formData.get("ativo") === "on",
  };
  if (!payload.nome || !payload.video_tutorial_url || !payload.link_agente)
    return;
  if (id) {
    await supabase.from("agentes").update(payload).eq("id", id);
  } else {
    await supabase.from("agentes").insert(payload);
  }
  revalidatePath("/admin");
  revalidatePath("/agentes");
}

export async function deleteAgente(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("agentes").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/agentes");
}
