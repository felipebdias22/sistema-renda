import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-navy-800 ring-1 ring-brand/30 shadow-glow",
        className
      )}
    >
      <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none">
        <path
          d="M6 24V8l10 7 10-7v16"
          stroke="#5B8DEF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 12v12"
          stroke="#7AA5F5"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
