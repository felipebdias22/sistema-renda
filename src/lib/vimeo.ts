import { vimeoId } from "./utils";

/**
 * Busca a thumbnail OFICIAL do Vimeo via oEmbed (sempre reflete a capa atual
 * do vídeo, na resolução pedida). Cacheada por 1h. Retorna null se falhar —
 * nesse caso o componente cai no fallback (vumbnail).
 */
export async function getVimeoThumbnail(url: string): Promise<string | null> {
  if (!vimeoId(url)) return null;
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
        url
      )}&width=1280`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}
