import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  onClick,
  variant = "default",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "error";
}) {
  const isError = variant === "error";
  const cardContent = (
    <>
      {/* Full card hover overlay with rounded corners */}
      <div className={`absolute inset-0 ${isError ? 'bg-gradient-to-br from-error/2 via-error/1 to-destructive/2' : 'bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]`} />
      
      <div className="relative text-center flex flex-col h-full">
        <div className="relative px-4 pt-3 pb-2">
          {/* Gradient border */}
          <div className={`absolute bottom-0 left-0 right-0 h-px ${isError ? 'bg-gradient-to-r from-transparent via-error to-transparent' : 'bg-gradient-to-r from-transparent via-primary to-transparent'}`}></div>
          <div className="flex items-center justify-center gap-2">
            {Icon && (
              <div className={`p-1.5 rounded-lg ${isError ? 'bg-error/10 group-hover:bg-error/20' : 'bg-primary/10 group-hover:bg-primary/20'} transition-colors`}>
                <Icon className={`h-3.5 w-3.5 ${isError ? 'text-error/60 group-hover:text-error' : 'text-primary/60 group-hover:text-primary'} transition-colors`} />
              </div>
            )}
            <CardDescription className={`text-[14px] uppercase tracking-[0.15em] text-muted/70 font-semibold ${isError ? 'group-hover:text-error/70' : 'group-hover:text-primary/70'} transition-colors whitespace-nowrap`}>
              {title}
            </CardDescription>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <CardTitle className={`text-2xl font-bold text-text ${isError ? 'group-hover:text-error' : 'group-hover:text-primary'} transition-colors duration-300 leading-none`}>
            {value}
          </CardTitle>
        </div>
        {description && (
          <div className="relative px-4 pb-3 pt-2">
            {/* Gradient border */}
            <div className={`absolute top-0 left-0 right-0 h-px ${isError ? 'bg-gradient-to-r from-transparent via-error to-transparent' : 'bg-gradient-to-r from-transparent via-primary to-transparent'}`}></div>
            <p className="text-xs text-muted/80 group-hover:text-muted transition-colors">
              {description}
            </p>
          </div>
        )}
      </div>
    </>
  );

  const cardClassName = `group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-md shadow-black/5 transition-all duration-300 ${isError ? 'hover:shadow-lg hover:shadow-error/10 hover:border-error/50' : 'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50'} overflow-hidden`;

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={`${cardClassName} cursor-pointer hover:scale-[1.02]`}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Card 
        className={`${cardClassName} cursor-pointer hover:scale-[1.02]`}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      {cardContent}
    </Card>
  );
}
