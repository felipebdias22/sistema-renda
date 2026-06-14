import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Remove duplicados de uma lista com base numa chave (mantém o primeiro). */
export function uniqueBy<T>(arr: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const k = key(item).trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Converte uma URL do Vimeo em URL embutível no player.
 * Aceita: https://vimeo.com/123456789, /123/hash, ou já um link de player.
 */
export function vimeoEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("player.vimeo.com")) return url;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  if (!match) return url;
  const id = match[1];
  const hash = match[2];
  const base = `https://player.vimeo.com/video/${id}`;
  return hash ? `${base}?h=${hash}` : base;
}

/** Extrai o ID numérico de uma URL do Vimeo. */
export function vimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * Thumbnail (capa) automática do Vimeo via vumbnail.com (serviço gratuito,
 * sem chave). Retorna null se não conseguir extrair o ID.
 */
export function vimeoThumb(url: string): string | null {
  const id = vimeoId(url);
  return id ? `https://vumbnail.com/${id}.jpg` : null;
}

/** Data ISO/timestamp → "DD/MM/AAAA" */
export function formatDateBR(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}
