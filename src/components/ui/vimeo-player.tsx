import { vimeoEmbedUrl } from "@/lib/utils";

export function VimeoPlayer({
  url,
  title,
}: {
  url: string;
  title?: string;
}) {
  const src = vimeoEmbedUrl(url);
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <iframe
        src={src}
        title={title ?? "Vídeo"}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
