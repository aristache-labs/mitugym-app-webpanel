import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "secondary";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass = {
    default: "bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 transition-all duration-200",
    success: "bg-success/20 text-success border border-success/30 shadow-sm hover:bg-success/30 transition-all duration-200",
    warning: "bg-warning/20 text-warning border border-warning/30 shadow-sm hover:bg-warning/30 transition-all duration-200",
    destructive: "bg-error/20 text-error border border-error/30 shadow-sm hover:bg-error/30 transition-all duration-200",
    outline: "border border-surface/40 bg-surface/20 text-text hover:bg-surface/30 transition-all duration-200",
    secondary: "bg-secondary/20 text-secondary border border-secondary/30 shadow-sm hover:bg-secondary/30 transition-all duration-200",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm",
        variantClass,
        className
      )}
      {...props}
    />
  );
}
