import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-md shadow-black/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 overflow-hidden">
      {/* Full card hover overlay with rounded corners */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
      
      <div className="relative text-center flex flex-col h-full">
        <div className="px-4 pt-3 pb-2 border-b border-surface/20">
          <div className="flex items-center justify-center gap-2">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
            )}
            <CardDescription className="text-[14px] uppercase tracking-[0.15em] text-muted/70 font-semibold group-hover:text-primary/70 transition-colors whitespace-nowrap">
              {title}
            </CardDescription>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <CardTitle className="text-2xl font-bold text-text group-hover:text-primary transition-colors duration-300 leading-none">
            {value}
          </CardTitle>
        </div>
        {description && (
          <div className="px-4 pb-3 pt-2 border-t border-surface/20">
            <p className="text-xs text-muted/80 group-hover:text-muted transition-colors">
              {description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
