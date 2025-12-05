"use client";

import { Download } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AnimatedExportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  showFullText?: boolean;
}

export function AnimatedExportButton({ 
  className, 
  showFullText = true,
  ...props 
}: AnimatedExportButtonProps) {
  return (
    <button
      className={cn(
        "group relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-2",
        "bg-gradient-to-br from-slate-700/70 via-slate-600/60 to-slate-700/70",
        "hover:from-slate-600/90 hover:via-slate-500/80 hover:to-slate-600/90",
        "text-slate-200 font-medium text-xs sm:text-sm",
        "rounded-2xl backdrop-blur-sm",
        "shadow-lg shadow-slate-900/30 hover:shadow-xl hover:shadow-slate-800/40",
        "transition-all duration-300",
        "overflow-hidden",
        "!border-none !ring-0 !outline-none",
        "active:scale-95",
        className
      )}
      {...props}
    >
      {/* Cloud/Download Icon */}
      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:translate-x-[1.6em]">
        <Download 
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4",
            "transition-all duration-500 ease-in-out",
            "text-slate-400 group-hover:text-white group-hover:scale-110"
          )} 
        />
      </div>
      
      {/* Text */}
      <span className={cn(
        "transition-all duration-500 ease-in-out",
        "group-hover:opacity-0",
        showFullText ? "hidden sm:inline" : "sm:hidden"
      )}>
        {showFullText ? "Export" : "Export"}
      </span>
      
      {/* Mobile text */}
      {showFullText && (
        <span className="sm:hidden transition-all duration-500 ease-in-out group-hover:opacity-0">
          Export
        </span>
      )}
    </button>
  );
}

