import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  className,
  children 
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start sm:items-center gap-2 sm:gap-3", className)}>
      {Icon && (
        <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 flex-shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-text">
          {title}
        </h1>
        <p className="text-[10px] leading-tight sm:text-sm text-muted/80 line-clamp-2 sm:truncate">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

