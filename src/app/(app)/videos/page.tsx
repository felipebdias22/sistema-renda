import { createClient } from "@/lib/supabase/server";
import { VideosBrowser } from "./videos-browser";
import { getVimeoThumbnail } from "@/lib/vimeo";
import type { Nicho, Pais, Video } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const supabase = await createClient();

  const [videosRes, nichosRes, paisesRes] = await Promise.all([
    supabase
      .from("videos")
      .select("*, nicho:nichos(*), pais:paises(*)")
      .eq("ativo", true)
      .order("criado_em", { ascending: false }),
    supabase.from("nichos").select("*").order("nome"),
    supabase.from("paises").select("*").order("nome"),
  ]);

  // Enriquece cada vídeo com a thumbnail oficial do Vimeo (sempre atual)
  const videos = await Promise.all(
    ((videosRes.data as Video[]) ?? []).map(async (v) => ({
      ...v,
      thumb: await getVimeoThumbnail(v.vimeo_url),
    }))
  );

  return (
    <VideosBrowser
      videos={videos}
      nichos={(nichosRes.data as Nicho[]) ?? []}
      paises={(paisesRes.data as Pais[]) ?? []}
    />
  );
}
