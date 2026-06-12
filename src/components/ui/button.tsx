import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white shadow-glow hover:bg-brand-600 active:scale-[0.99]",
        secondary:
          "border border-navy-600 bg-navy-800/70 text-foreground hover:border-brand/50 hover:bg-navy-700",
        ghost: "text-slate-300 hover:bg-navy-800 hover:text-foreground",
        danger:
          "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        green:
          "bg-accent-green text-navy-950 hover:brightness-110 active:scale-[0.99]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
