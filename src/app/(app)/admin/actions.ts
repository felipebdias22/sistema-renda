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

export async function saveVideo(formData: FormData) {
  const supabase = await assertAdmin();
  const id = str(formData.get("id"));
  const payload = {
    titulo: str(formData.get("titulo")),
    descricao: str(formData.get("descricao")) || null,
    vimeo_url: str(formData.get("vimeo_url")),
    nicho_id: str(formData.get("nicho_id")) || null,
    pais_id: str(formData.get("pais_id")) || null,
    ativo: formData.get("ativo") === "on",
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
