import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "secondary";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass = {
    default: "bg-primary/20 text-primary",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    destructive: "bg-error/20 text-error",
    outline: "border border-border bg-transparent text-foreground",
    secondary: "bg-muted text-muted-foreground",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        variantClass,
        className
      )}
      {...props}
    />
  );
}
