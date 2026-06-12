import { createClient } from "@/lib/supabase/server";
import { VideosBrowser } from "./videos-browser";
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

  return (
    <VideosBrowser
      videos={(videosRes.data as Video[]) ?? []}
      nichos={(nichosRes.data as Nicho[]) ?? []}
      paises={(paisesRes.data as Pais[]) ?? []}
    />
  );
}
