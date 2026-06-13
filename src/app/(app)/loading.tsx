export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-3">
        <div className="h-7 w-56 rounded-lg bg-navy-800" />
        <div className="h-4 w-80 rounded bg-navy-800/70" />
      </div>

      {/* Barra de filtros / ações */}
      <div className="flex flex-wrap gap-3">
        <div className="h-11 flex-1 rounded-xl bg-navy-800" />
        <div className="h-11 w-28 rounded-xl bg-navy-800" />
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden p-0">
            <div className="aspect-video w-full bg-navy-800" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded bg-navy-800" />
              <div className="h-3 w-1/2 rounded bg-navy-800/70" />
              <div className="flex gap-2 pt-1">
                <div className="h-5 w-16 rounded bg-navy-800/70" />
                <div className="h-5 w-12 rounded bg-navy-800/70" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
