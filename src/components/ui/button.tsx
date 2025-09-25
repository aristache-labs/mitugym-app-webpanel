"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm border",
  {
    variants: {
      variant: {
        default: "bg-primary text-surface hover:bg-accent border-primary/30 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]",
        secondary: "bg-secondary text-surface hover:bg-accent/80 border-secondary/30 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.02]",
        success: "bg-success text-surface hover:bg-success/80 border-success/30 shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30 hover:scale-[1.02]",
        ghost: "bg-transparent text-text hover:bg-surface/60 border-transparent hover:border-surface/40",
        outline: "border-surface/40 bg-surface/20 text-text hover:bg-primary/10 hover:border-primary/40 hover:text-primary",
        destructive: "bg-error text-surface hover:bg-error/80 border-error/30 shadow-lg shadow-error/20 hover:shadow-xl hover:shadow-error/30 hover:scale-[1.02]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-10",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return <Slot className={cn(buttonVariants({ variant, size, className }))} {...props} />;
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
