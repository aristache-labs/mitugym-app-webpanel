import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card className="group bg-card/95 backdrop-blur-sm border-surface/30 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/40 hover:scale-[1.02]">
      <CardHeader className="relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardDescription className="relative text-xs uppercase tracking-[0.4em] text-muted/80 font-medium group-hover:text-primary/80 transition-colors">
          {title}
        </CardDescription>
        <CardTitle className="relative text-5xl font-bold bg-gradient-to-br from-text via-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
          {value}
        </CardTitle>
      </CardHeader>
      {description && (
        <CardContent className="pt-0 pb-6">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60" />
            <p className="text-xs text-muted/90 group-hover:text-muted transition-colors">
              {description}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
