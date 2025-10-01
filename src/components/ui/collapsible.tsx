"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function Collapsible({
  title,
  icon,
  badge,
  action,
  defaultOpen = false,
  className,
  headerClassName,
  contentClassName,
  children,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "group relative rounded-[16px] border border-surface/60 bg-card/80 backdrop-blur overflow-hidden",
        "shadow-lg shadow-black/10 transition-all duration-300",
        isOpen && "shadow-xl shadow-primary/15 border-primary/30",
        className
      )}
    >
      {/* Gradient overlay on hover/open */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 transition-opacity duration-300 rounded-[16px] pointer-events-none",
          isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />

      {/* Header */}
      <div className="relative flex items-center gap-2 p-5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex-1 flex items-center justify-between text-left transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg",
            "hover:bg-surface/20 -m-2 p-2",
            headerClassName
          )}
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  isOpen
                    ? "bg-primary/20 text-primary"
                    : "bg-primary/10 text-primary/60 group-hover:bg-primary/15"
                )}
              >
                {icon}
              </div>
            )}
            <div className="flex-1">
              <h3
                className={cn(
                  "text-base font-semibold transition-colors",
                  isOpen ? "text-primary" : "text-text group-hover:text-primary"
                )}
              >
                {title}
              </h3>
            </div>
            {badge && <div className="mr-2">{badge}</div>}
          </div>
          
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-all duration-300",
              isOpen ? "rotate-180 text-primary" : "text-muted/60 group-hover:text-primary"
            )}
          />
        </button>
        
        {/* Action buttons rendered outside of the button */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Gradient divider */}
      {isOpen && (
        <div className="relative h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      )}

      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("p-6 relative", contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

